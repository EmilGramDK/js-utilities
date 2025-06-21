type Fetcher = <T>(url: string, options?: RequestInit) => Promise<T>;

/**
 * AbortableAPIService is a base class for making API requests with built-in support for aborting requests.
 * It allows you to perform requests with a custom fetch implementation and manage request cancellation.
 * This is particularly useful in scenarios where you want to avoid unnecessary network requests, such as when a user navigates away from a page or component.
 */
export class AbortableAPIService {
  protected fetcher: Fetcher;

  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * Creates an instance of AbortableAPIService.
   * You can optionally provide a custom fetch implementation.
   * If no custom fetcher is provided, it defaults to using the native fetch API.
   *
   * @param customFetcher - Optional custom fetch implementation.
   */
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
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      throw error; // unexpected errors
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
