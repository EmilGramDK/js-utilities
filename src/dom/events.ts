import { ref } from ".";

type Callback = () => void;
type CallbackMap = Map<HTMLElement, Callback>;
type El = HTMLElement | string;

const eventListeners = new Map<string, CallbackMap>();

/**
 * ons to an event on the specified element or selector.
 * @param type - The type of event to on to.
 * @param ref - The target element or a CSS selector string.
 * @param callback - The function to call when the event occurs.
 */
export function on(type: string, ref: El, cb: Callback): void {
  const element = getElement(ref);
  const eventMap = getOrCreateEventMap(type);
  eventMap.set(element, cb);
}

/**
 * Unons from an event on the specified element or selector.
 * @param type - The type of event to unon from.
 * @param ref - The target element or a CSS selector string.
 */
export function off(type: string, ref: El): void {
  const element = getElement(ref);
  const eventMap = getOrCreateEventMap(type);
  if (eventMap.has(element)) eventMap.delete(element);
}

function getOrCreateEventMap(type: string): CallbackMap {
  let elementMap = eventListeners.get(type);
  if (elementMap) return elementMap;

  elementMap = new Map();
  eventListeners.set(type, elementMap);

  globalThis.addEventListener(type, (event) => {
    const target = event.target as HTMLElement;
    const callback = elementMap?.get(target);
    if (callback) callback();
  });

  return elementMap;
}

function getElement(el: El): HTMLElement {
  return el instanceof HTMLElement ? el : ref(el);
}

export const onClick = (ref: El, cb: Callback) => on("click", ref, cb);
export const onHover = (ref: El, cb: Callback) => on("mouseover", ref, cb);
export const onFocus = (ref: El, cb: Callback) => on("focus", ref, cb);
export const onBlur = (ref: El, cb: Callback) => on("blur", ref, cb);
export const onInput = (ref: El, cb: Callback) => on("input", ref, cb);
export const onChange = (ref: El, cb: Callback) => on("change", ref, cb);
export const onKeyDown = (ref: El, cb: Callback) => on("keydown", ref, cb);
export const onKeyUp = (ref: El, cb: Callback) => on("keyup", ref, cb);
export const onSubmit = (ref: El, cb: Callback) => on("submit", ref, cb);
export const onResize = (ref: El, cb: Callback) => on("resize", ref, cb);
export const onScroll = (ref: El, cb: Callback) => on("scroll", ref, cb);
export const onTouchStart = (ref: El, cb: Callback) => on("touchstart", ref, cb);
export const onTouchEnd = (ref: El, cb: Callback) => on("touchend", ref, cb);
export const onTouchMove = (ref: El, cb: Callback) => on("touchmove", ref, cb);
export const onMouseDown = (ref: El, cb: Callback) => on("mousedown", ref, cb);
export const onMouseUp = (ref: El, cb: Callback) => on("mouseup", ref, cb);
export const onMouseMove = (ref: El, cb: Callback) => on("mousemove", ref, cb);
export const onContextMenu = (ref: El, cb: Callback) => on("contextmenu", ref, cb);
export const onDragStart = (ref: El, cb: Callback) => on("dragstart", ref, cb);
export const onDragEnd = (ref: El, cb: Callback) => on("dragend", ref, cb);
export const onDragOver = (ref: El, cb: Callback) => on("dragover", ref, cb);
export const onDragEnter = (ref: El, cb: Callback) => on("dragenter", ref, cb);
export const onDragLeave = (ref: El, cb: Callback) => on("dragleave", ref, cb);
export const onDrop = (ref: El, cb: Callback) => on("drop", ref, cb);
export const onCopy = (ref: El, cb: Callback) => on("copy", ref, cb);
export const onCut = (ref: El, cb: Callback) => on("cut", ref, cb);
export const onPaste = (ref: El, cb: Callback) => on("paste", ref, cb);
export const onLoad = (ref: El, cb: Callback) => on("load", ref, cb);
export const onUnload = (ref: El, cb: Callback) => on("unload", ref, cb);
export const onBeforeUnload = (ref: El, cb: Callback) => on("beforeunload", ref, cb);
