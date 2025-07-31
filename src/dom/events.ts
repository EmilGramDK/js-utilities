import { ref } from ".";

type EventCallback = () => void;
type ElementCallbackMap = Map<HTMLElement, EventCallback>;

const eventListenersMap = new Map<string, ElementCallbackMap>();

/**
 * Registers a click event listener on the specified element or selector.
 * @param elementOrSelector - The target element or a CSS selector string.
 * @param callback - The function to call when the element is clicked.
 */
export function onClick(elementOrSelector: HTMLElement | string, callback: EventCallback): void {
  const element = getElement(elementOrSelector);
  const clickMap = getOrCreateEventMap("click");
  clickMap.set(element, callback);
}

/**
 * Removes the click event listener from the specified element or selector.
 * @param elementOrSelector - The target element or a CSS selector string.
 */
export function removeOnClick(elementOrSelector: HTMLElement | string) {
  const element = getElement(elementOrSelector);
  const clickMap = getOrCreateEventMap("click");
  if (clickMap.has(element)) clickMap.delete(element);
}

function getOrCreateEventMap(eventType: string): ElementCallbackMap {
  let elementMap = eventListenersMap.get(eventType);
  if (elementMap) return elementMap;

  elementMap = new Map();
  eventListenersMap.set(eventType, elementMap);

  globalThis.addEventListener(eventType, (event) => {
    const target = event.target as HTMLElement;
    const callback = elementMap?.get(target);
    if (callback) callback();
  });

  return elementMap;
}

function getElement(elementOrSelector: HTMLElement | string): HTMLElement {
  return elementOrSelector instanceof HTMLElement ? elementOrSelector : ref(elementOrSelector);
}
