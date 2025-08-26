type GlobalStore<T extends Record<string, unknown>> = {
  hasValue<K extends keyof T>(key: K): boolean;
  getValue<K extends keyof T>(key: K): T[K];
  setValue<K extends keyof T>(key: K, value: T[K]): void;
  subscribe<K extends keyof T>(key: K, callback: (value: T[K]) => void): () => void;
  unsubscribe<K extends keyof T>(key: K, callback: (value: T[K]) => void): void;
};

type SubCallback<T> = (value: T) => void;
type SubCallbacks<T> = Set<SubCallback<T>>;
type SubMap<T> = Record<keyof T, SubCallbacks<T[keyof T]>>;

let globalStore: GlobalStore<Record<string, unknown>>;

export const createGlobalStore = <T extends Record<string, unknown>>(
  initialState?: Partial<T>,
): GlobalStore<T> => {
  if (globalStore) throw new Error("Global store already exists.");
  const store: T = (initialState as T) || ({} as T);
  const subscribers: SubMap<T> = {} as SubMap<T>;

  const instance: GlobalStore<T> = {
    hasValue<K extends keyof T>(key: K): boolean {
      return key in store;
    },
    getValue<K extends keyof T>(key: K): T[K] {
      if (!(key in store)) throw new Error(`Key "${String(key)}" does not exist in the store.`);
      return store[key];
    },
    setValue<K extends keyof T>(key: K, value: T[K]): void {
      store[key] = value;
      if (subscribers[key]) {
        subscribers[key].forEach((callback) => callback(value));
      }
    },
    subscribe<K extends keyof T>(key: K, callback: SubCallback<T[K]>): () => void {
      if (!subscribers[key]) {
        subscribers[key] = new Set<SubCallback<T[K]>>() as Set<SubCallback<T[keyof T]>>;
      }
      (subscribers[key] as SubCallbacks<T[K]>).add(callback);
      return () => instance.unsubscribe(key, callback);
    },
    unsubscribe<K extends keyof T>(key: K, callback: SubCallback<T[K]>): void {
      if (subscribers[key]) {
        (subscribers[key] as SubCallbacks<T[K]>).delete(callback);
        if (subscribers[key].size === 0) {
          delete subscribers[key];
        }
      }
    },
  };

  globalStore = instance;
  return instance;
};

export const getGlobalStore = <T extends Record<string, unknown>>(): GlobalStore<T> => {
  if (!globalStore)
    throw new Error("Global store has not been initialized. Please call createGlobalStore first.");
  return globalStore as GlobalStore<T>;
};

export const getStoreValue = <V>(key: string): V => {
  return getGlobalStore<Record<string, unknown>>().getValue(key) as V;
};

export const setStoreValue = <K extends string, V>(key: K, value: V): void => {
  getGlobalStore<Record<string, unknown>>().setValue(key, value);
};

export const hasStoreValue = <K extends string>(key: K): boolean => {
  return getGlobalStore<Record<string, unknown>>().hasValue(key);
};

export const subscribeToStore = <V>(key: string, callback: (value: V) => void): (() => void) => {
  return getGlobalStore<Record<string, unknown>>().subscribe(
    key,
    callback as (value: unknown) => void,
  );
};

export const unsubscribeFromStore = <V>(key: string, callback: (value: V) => void): void => {
  getGlobalStore<Record<string, unknown>>().unsubscribe(key, callback as (value: unknown) => void);
};
