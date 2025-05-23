/**
 *
 *
 */

type Fetcher = <T>(url: string, options?: RequestInit) => Promise<T>;

export class AbortableAPIService {
  protected fetcher: Fetcher;

  private abortControllers: Map<string, AbortController> = new Map();

  constructor(customFetcher?: Fetcher) {
    this.fetcher = customFetcher ?? this.defaultFetcher;
  }

  /**
   * Allows you to override the fetch implementation.
   */
  public setFetcher(fetchImpl: Fetcher): void {
    this.fetcher = fetchImpl;
  }

  /**
   * Performs a request using the configured fetcher.
   */
  protected async fetch<T>(key: string, url: string, options: RequestInit = {}): Promise<T> {
    this.abortPreviousRequest(key);

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    try {
      // Inject abort signal
      const mergedOptions = {
        ...options,
        signal: controller.signal,
      };

      return await this.fetcher<T>(url, mergedOptions);
    } finally {
      this.abortControllers.delete(key);
    }
  }

  protected abortRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  protected abortAll(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  private abortPreviousRequest(key: string): void {
    const existing = this.abortControllers.get(key);
    if (existing) {
      existing.abort();
      this.abortControllers.delete(key);
    }
  }

  /**
   * Default fetcher using native fetch (returns JSON)
   */
  private async defaultFetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (response.status === 204) return undefined as unknown as T;

    return await response.json();
  }
}
