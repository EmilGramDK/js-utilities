import { resolveElem, type El } from "./dom";

type Callback = (event: Event | CustomEvent) => void;
type CallbackMap = Map<HTMLElement, Callback>;

const eventListeners = new Map<string, CallbackMap>();

/**
 * Subscribes to an event on the specified element or selector.
 * @param type - The type of event to on to.
 * @param ref - The target element or a CSS selector string.
 * @param callback - The function to call when the event occurs.
 */
export function on(type: string, ref: El, cb: Callback): void {
  const element = resolveElem(ref);
  const eventMap = getOrCreateEventMap(type);
  eventMap.set(element, cb);
}

/**
 * Unsubscribes from an event on the specified element or selector.
 * @param type - The type of event to unon from.
 * @param ref - The target element or a CSS selector string.
 */
export function off(type: string, ref: El): void {
  const element = resolveElem(ref);
  const eventMap = getOrCreateEventMap(type);
  if (eventMap.has(element)) eventMap.delete(element);
}

function getOrCreateEventMap(type: string): CallbackMap {
  let callbackMap = eventListeners.get(type);
  if (callbackMap) return callbackMap;

  callbackMap = new Map();
  eventListeners.set(type, callbackMap);

  globalThis.addEventListener(type, (event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    for (const [element, callback] of callbackMap) {
      if (element.contains(target)) {
        callback(event);
        break; // Stop after the first match
      }
    }
  });

  return callbackMap;
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
