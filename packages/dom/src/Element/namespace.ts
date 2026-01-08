import { Effect } from "effect";
import type { Element as ElementType } from "./types.js";

/**
 * Element namespace providing the Element type and pipeable DOM manipulation utilities.
 *
 * @example
 * ```ts
 * import { Element } from "@effex/dom";
 *
 * // The Element type
 * const MyComponent: Element.Element<never, SomeContext> = ...
 *
 * // Pipeable DOM manipulation in animation hooks
 * onEnter: (el) => el.pipe(
 *   Element.setStyles({ animation: "none" }),
 *   Element.focus,
 * )
 * ```
 */
export declare namespace Element {
  /**
   * A DOM element wrapped in an Effect with scope management.
   * This is the DOM-specialized version that returns HTMLElement.
   *
   * @template E - The error type (defaults to never for infallible elements)
   * @template R - The requirements/context type (defaults to never for no requirements)
   */
  export type Element<E = never, R = never> = ElementType<E, R>;
}

/**
 * Element utilities - pipeable DOM manipulation helpers.
 *
 * All helpers use `Effect.tap` internally, preserving the element in the
 * Effect chain for further piping.
 */
export const Element = {
  /**
   * Set multiple CSS styles on an element.
   * Empty string values remove the property.
   *
   * @example
   * ```ts
   * el.pipe(
   *   Element.setStyles({ opacity: "1", animation: "none" }),
   *   Element.setStyles({ animation: "" }), // removes animation
   * )
   * ```
   */
  setStyles:
    (styles: Record<string, string>) =>
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          for (const [property, value] of Object.entries(styles)) {
            if (value === "") {
              el.style.removeProperty(property);
            } else {
              el.style.setProperty(property, value);
            }
          }
        }),
      ),

  /**
   * Focus an element.
   *
   * @example
   * ```ts
   * el.pipe(Element.focus)
   * ```
   */
  focus: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) => Effect.sync(() => el.focus())),

  /**
   * Blur (unfocus) an element.
   *
   * @example
   * ```ts
   * el.pipe(Element.blur)
   * ```
   */
  blur: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) => Effect.sync(() => el.blur())),

  /**
   * Scroll an element into view.
   *
   * @example
   * ```ts
   * el.pipe(Element.scrollIntoView({ behavior: "smooth", block: "center" }))
   * ```
   */
  scrollIntoView:
    (options?: ScrollIntoViewOptions) =>
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.scrollIntoView(options))),

  /**
   * Tap into the element to perform a side effect.
   * Useful for custom operations that aren't covered by other helpers.
   *
   * @example
   * ```ts
   * el.pipe(
   *   Element.tap((el) => console.log("Element:", el)),
   *   Element.focus,
   * )
   * ```
   */
  tap:
    <A extends HTMLElement>(fn: (el: A) => void) =>
    <E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => fn(el))),

  /**
   * Tap into the element with an Effect.
   * Useful for async operations or operations that need Effect context.
   *
   * @example
   * ```ts
   * el.pipe(
   *   Element.tapEffect((el) => logToServer(el.id)),
   *   Element.focus,
   * )
   * ```
   */
  tapEffect:
    <A extends HTMLElement, E2, R2>(
      fn: (el: A) => Effect.Effect<unknown, E2, R2>,
    ) =>
    <E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, R | R2> =>
      Effect.tap(self, fn),

  /**
   * Query for a descendant element and focus it if found, otherwise focus self.
   * Common pattern for menu/dialog components.
   *
   * @example
   * ```ts
   * el.pipe(Element.focusFirst("[data-menu-item]:not([data-disabled])"))
   * ```
   */
  focusFirst:
    (selector: string) =>
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          const first = el.querySelector(selector) as HTMLElement | null;
          if (first) {
            first.focus();
          } else {
            el.focus();
          }
        }),
      ),
} as const;
