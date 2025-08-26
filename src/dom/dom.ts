import { ref } from "./ref";

export type El = HTMLElement | string;

export function toggleClass(ref: El, className: string) {
  const element = resolveElem(ref);
  element.classList.toggle(className);
}

export function addClass(ref: El, className: string) {
  const element = resolveElem(ref);
  element.classList.add(className);
}

export function removeClass(ref: El, className: string) {
  const element = resolveElem(ref);
  element.classList.remove(className);
}

export function resolveElem(el: El): HTMLElement {
  return el instanceof HTMLElement ? el : ref(el);
}
