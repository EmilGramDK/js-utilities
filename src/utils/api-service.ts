/**
 *
 *
 */
export class AbortableAPIService {
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * Performs a fetch request with auto-managed abort controller.
   * @param key Unique key for tracking/canceling the request.
   * @param url Full URL to fetch.
   * @param options Fetch options (method, headers, body, etc.)
   */
  protected async fetch<T>(key: string, url: string, options: RequestInit = {}): Promise<T> {
    this.abortPreviousRequest(key);

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      this.abortControllers.delete(key); // Clean up
    }
  }

  /**
   * Manually abort a request by key.
   */
  protected abortRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  /**
   * Abort all active requests.
   */
  protected abortAll(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  /**
   * Internal: abort previous request with the same key if it exists.
   */
  private abortPreviousRequest(key: string): void {
    const existing = this.abortControllers.get(key);
    if (existing) {
      existing.abort();
      this.abortControllers.delete(key);
    }
  }
}
