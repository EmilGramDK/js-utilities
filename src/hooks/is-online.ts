/**
 * useIsOnline
 * @returns A hook that provides the current online status and a method to subscribe to changes in the online status.
 */
export const useIsOnline = () => {
  const onlineStatus = OnlineStatus.getInstance();
  return {
    isOnline: onlineStatus.getCurrentStatus(),
    subscribe: (callback: OnlineStatusCallback) => {
      return onlineStatus.subscribe(callback);
    },
    destroy: () => {
      onlineStatus.destroy();
    },
  };
};

type OnlineStatusCallback = (isOnline: boolean) => void;

export class OnlineStatus {
  private static instance: OnlineStatus;
  private subscribers: Set<OnlineStatusCallback> = new Set();

  private constructor() {
    globalThis.addEventListener("online", this.notifySubscribers);
    globalThis.addEventListener("offline", this.notifySubscribers);
  }

  public static getInstance(): OnlineStatus {
    if (!OnlineStatus.instance) {
      OnlineStatus.instance = new OnlineStatus();
    }
    return OnlineStatus.instance;
  }

  public subscribe(callback: OnlineStatusCallback): () => void {
    this.subscribers.add(callback);
    // Immediately call the callback with current status
    callback(navigator.onLine);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public getCurrentStatus(): boolean {
    return navigator.onLine;
  }

  private notifySubscribers = () => {
    const isOnline = navigator.onLine;
    for (const callback of this.subscribers) {
      callback(isOnline);
    }
  };

  public destroy(): void {
    globalThis.removeEventListener("online", this.notifySubscribers);
    globalThis.removeEventListener("offline", this.notifySubscribers);
    this.subscribers.clear();
  }
}
