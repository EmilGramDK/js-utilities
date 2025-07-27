const elementCache: Record<string, HTMLElement> = {};

/**
 * Retrieves a DOM element matching the given CSS selector.
 *
 * This function caches the element after the first lookup to improve performance
 * on repeated queries. It will return the cached element on subsequent calls.
 *
 * @template T - The specific HTMLElement type to return (e.g., HTMLDivElement, HTMLInputElement).
 * @param {string} selector - A CSS selector string used to query the element from the DOM.
 * @param {boolean} [throwError=true] - Whether to throw an error if the element is not found.
 *                                      If set to false and the element isn't found, `undefined` is returned.
 * @returns {(T | undefined)} - The matching element, cast to the specified type, or `undefined` if not found and `throwError` is false.
 *
 * @example
 * const button = ref<HTMLButtonElement>('#submit'); // throws if not found
 * const optionalDiv = ref<HTMLDivElement>('#optional', false); // returns undefined if not found
 */
export function ref<T extends HTMLElement>(selector: string, throwError?: true): T;
export function ref<T extends HTMLElement>(selector: string, throwError: false): T | undefined;
export function ref<T extends HTMLElement>(
  selector: string,
  throwError: boolean = true,
): T | undefined {
  const element = getRef<T>(selector);
  if (element) return element;
  if (!throwError) return undefined;
  throw new Error(`Element not found: ${selector}`);
}

/**
 * Retrieves all DOM elements matching the given CSS selector.
 * @param {string} selector - A CSS selector string used to query the elements from the DOM.
 * @returns {T[]} - An array of matching elements, cast to the specified type.
 */
export function refs<T extends HTMLElement>(selector: string): Array<T> {
  const elements = document.querySelectorAll<T>(selector);
  return [...elements];
}

export function getRef<T extends HTMLElement>(selector: string): T | undefined {
  if (elementCache[selector]) return elementCache[selector] as T;
  const element = document.querySelector<T>(selector);
  if (!element) return undefined;
  elementCache[selector] = element;
  return element as T;
}

export function createOrGetRef<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement = document.body,
): T {
  const element = getRef<T>(selector);
  if (element) return element;

  const tag = selector.startsWith("#") || selector.startsWith(".") ? "div" : selector;
  const id = selector.startsWith("#") ? selector.slice(1) : "";
  const className = selector.startsWith(".") ? selector.slice(1) : "";

  const newElement = document.createElement(tag);
  newElement.id = id;
  newElement.className = className;
  parent.append(newElement);
  elementCache[selector] = newElement;
  return newElement as T;
}

export function removeRef(selector: string): void {
  const element = getRef(selector);
  if (!element) return;
  element.remove();
  delete elementCache[selector];
}

export function removeRefs(selector: string): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => element.remove());
}

export function removeCachedRef(selector: string): void {
  if (!elementCache[selector]) return;
  delete elementCache[selector];
}

export function hasCachedRef(selector: string): boolean {
  return !!elementCache[selector];
}

export function clearRefCache(): void {
  for (const key of Object.keys(elementCache)) delete elementCache[key];
}
