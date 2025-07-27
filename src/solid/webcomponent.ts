import { customElement as solidCustomElement, type ComponentType } from "solid-element";
import { noShadowDOM } from "solid-element";

/**
 * @description Registers a Solid.js component as a custom web component.
 * This will allow the component to be used as a custom HTML element in the DOM.
 * @param tag - The name of the custom element.
 * @param Component - The Solid.js component to be used as the custom element.
 * @param isolate - If true, the component will be isolated in its own shadow DOM.
 */
export function webComponent<T extends object>(
  tag: string,
  Component: ComponentType<T>,
  isolate = false,
): void {
  solidCustomElement(tag, () => {
    if (!isolate) noShadowDOM();
    return Component;
  });
}
