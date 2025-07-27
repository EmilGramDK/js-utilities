type GlobalStore<T extends Record<string, unknown>> = {
  hasValue<K extends keyof T>(key: K): boolean;
  getValue<K extends keyof T>(key: K): T[K];
  setValue<K extends keyof T>(key: K, value: T[K]): void;
};

let globalStore: GlobalStore<Record<string, unknown>>;

export const createGlobalStore = <T extends Record<string, unknown>>(
  initialState?: Partial<T>,
): GlobalStore<T> => {
  if (globalStore) throw new Error("Global store already exists.");
  const store: T = (initialState as T) || ({} as T);

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
