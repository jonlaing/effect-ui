import { Effect } from "effect";
import type { NoSuchElementException } from "effect/Cause";
import { dual } from "effect/Function";

import { toKebabCase } from "../helpers/strings.js";
import {
  AttributeNotFound,
  DataAttributeNotFound,
  getUnsafe,
  makeElementRef,
} from "./ref.js";
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
 * // Pipeable DOM manipulation in animation hooks (data-last)
 * onEnter: (el) => el.pipe(
 *   Element.setStyles({ animation: "none" }),
 *   Element.focus,
 * )
 *
 * // Data-first style
 * Element.setStyles(el, { animation: "none" })
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
 * All helpers support both data-first and data-last (pipeable) styles:
 * ```ts
 * // Data-first
 * Element.setStyles(el, { opacity: "1" })
 *
 * // Data-last (pipeable)
 * el.pipe(Element.setStyles({ opacity: "1" }))
 * ```
 *
 * All helpers use `Effect.tap` internally, preserving the element in the
 * Effect chain for further piping.
 */
export const Element = {
  ref: makeElementRef,
  getUnsafe,

  // ===========================================================================
  // Querying & Traversal
  // ===========================================================================

  getId: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<string, E, R> => Effect.map(self, (el) => el.id),

  /**
   * Get the parent element.
   *
   * @example
   * ```ts
   * el.pipe(Element.getParent)
   * ```
   */
  getParent: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<HTMLElement, E | NoSuchElementException, R> =>
    self.pipe(Effect.flatMap((el) => Effect.fromNullable(el.parentElement))),

  /**
   * Get the bounding client rect of an element.
   *
   * @example
   * ```ts
   * el.pipe(Element.getBoundingClientRect)
   * ```
   */
  getBoundingClientRect: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<DOMRect, E, R> =>
    Effect.map(self, (el) => el.getBoundingClientRect()),

  /**
   * Get the offset height of an element (includes padding and border, excludes margin).
   * This value is affected by CSS constraints like max-height.
   *
   * @example
   * ```ts
   * el.pipe(Element.getOffsetHeight)
   * ```
   */
  getOffsetHeight: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<number, E, R> => Effect.map(self, (el) => el.offsetHeight),

  /**
   * Get the scroll height of an element (full content height, ignoring overflow).
   * Use this to get the natural height of content regardless of CSS constraints.
   *
   * @example
   * ```ts
   * el.pipe(Element.getScrollHeight)
   * ```
   */
  getScrollHeight: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<number, E, R> => Effect.map(self, (el) => el.scrollHeight),

  /**
   * Get the offset width of an element (includes padding and border, excludes margin).
   *
   * @example
   * ```ts
   * el.pipe(Element.getOffsetWidth)
   * ```
   */
  getOffsetWidth: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<number, E, R> => Effect.map(self, (el) => el.offsetWidth),

  /**
   * Get the scroll width of an element (full content width, ignoring overflow).
   *
   * @example
   * ```ts
   * el.pipe(Element.getScrollWidth)
   * ```
   */
  getScrollWidth: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<number, E, R> => Effect.map(self, (el) => el.scrollWidth),

  /**
   * Query for a descendant element matching a selector.
   * Returns the element or fails with NoSuchElementException.
   *
   * @example
   * ```ts
   * el.pipe(Element.querySelector("[data-value]"))
   * ```
   */
  querySelector: dual<
    (
      selector: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<HTMLElement, E | NoSuchElementException, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ) => Effect.Effect<HTMLElement, E | NoSuchElementException, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ): Effect.Effect<HTMLElement, E | NoSuchElementException, R> =>
      Effect.flatMap(self, (el) =>
        Effect.fromNullable(el.querySelector(selector) as HTMLElement | null),
      ),
  ),

  /**
   * Query for all descendant elements matching a selector.
   *
   * @example
   * ```ts
   * el.pipe(Element.querySelectorAll("[data-item]"))
   * ```
   */
  querySelectorAll: dual<
    (
      selector: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<HTMLElement[], E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ) => Effect.Effect<HTMLElement[], E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ): Effect.Effect<HTMLElement[], E, R> =>
      Effect.map(
        self,
        (el) => Array.from(el.querySelectorAll(selector)) as HTMLElement[],
      ),
  ),

  /**
   * Find the closest ancestor (or self) matching a selector.
   * Returns the element or fails with NoSuchElementException.
   *
   * @example
   * ```ts
   * el.pipe(Element.closest("[data-container]"))
   * ```
   */
  closest: dual<
    (
      selector: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<HTMLElement, E | NoSuchElementException, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ) => Effect.Effect<HTMLElement, E | NoSuchElementException, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ): Effect.Effect<HTMLElement, E | NoSuchElementException, R> =>
      Effect.flatMap(self, (el) =>
        Effect.fromNullable(el.closest(selector) as HTMLElement | null),
      ),
  ),

  /**
   * Check if the element matches a selector.
   *
   * @example
   * ```ts
   * el.pipe(Element.matches("[data-active]"))
   * ```
   */
  matches: dual<
    (
      selector: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<boolean, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ) => Effect.Effect<boolean, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ): Effect.Effect<boolean, E, R> =>
      Effect.map(self, (el) => el.matches(selector)),
  ),

  contains: dual<
    (
      element?: Node | null,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<boolean, NoSuchElementException | E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      element?: Node | null,
    ) => Effect.Effect<boolean, NoSuchElementException | E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      element?: Node | null,
    ): Effect.Effect<boolean, NoSuchElementException | E, R> =>
      Effect.flatMap(self, (el) =>
        Effect.fromNullable(element).pipe(
          Effect.map((child) => el.contains(child)),
        ),
      ),
  ),

  // ===========================================================================
  // Styles
  // ===========================================================================

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
  setStyles: dual<
    (
      styles: Record<string, string>,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      styles: Record<string, string>,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      styles: Record<string, string>,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          for (const [property, value] of Object.entries(styles)) {
            if (value === "") {
              el.style.removeProperty(toKebabCase(property));
            } else {
              el.style.setProperty(toKebabCase(property), value);
            }
          }
        }),
      ),
  ),

  /**
   * Set a single CSS style property.
   *
   * @example
   * ```ts
   * el.pipe(Element.setStyle("opacity", "1"))
   * ```
   */
  setStyle: dual<
    (
      property: string,
      value: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      property: string,
      value: string,
    ) => Effect.Effect<A, E, R>
  >(
    3,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      property: string,
      value: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          const kebabProperty = toKebabCase(property);
          if (value === "") {
            el.style.removeProperty(kebabProperty);
          } else {
            el.style.setProperty(kebabProperty, value);
          }
        }),
      ),
  ),

  /**
   * Remove a CSS style property.
   *
   * @example
   * ```ts
   * el.pipe(Element.removeStyle("animation"))
   * ```
   */
  removeStyle: dual<
    (
      property: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      property: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      property: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => el.style.removeProperty(toKebabCase(property))),
      ),
  ),

  // ===========================================================================
  // Classes
  // ===========================================================================

  /**
   * Add one or more CSS classes.
   *
   * @example
   * ```ts
   * el.pipe(Element.addClass("active", "highlighted"))
   * ```
   */
  addClass: dual<
    (
      ...classes: string[]
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      ...classes: string[]
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      ...classes: string[]
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.classList.add(...classes))),
  ),

  /**
   * Remove one or more CSS classes.
   *
   * @example
   * ```ts
   * el.pipe(Element.removeClass("active", "highlighted"))
   * ```
   */
  removeClass: dual<
    (
      ...classes: string[]
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      ...classes: string[]
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      ...classes: string[]
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => el.classList.remove(...classes)),
      ),
  ),

  /**
   * Toggle a CSS class. Optionally force add/remove with second argument.
   *
   * @example
   * ```ts
   * el.pipe(Element.toggleClass("active"))
   * el.pipe(Element.toggleClass("active", true)) // force add
   * ```
   */
  toggleClass: dual<
    (
      className: string,
      force?: boolean,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      className: string,
      force?: boolean,
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      className: string,
      force?: boolean,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => el.classList.toggle(className, force)),
      ),
  ),

  /**
   * Replace one CSS class with another.
   *
   * @example
   * ```ts
   * el.pipe(Element.replaceClass("old-class", "new-class"))
   * ```
   */
  replaceClass: dual<
    (
      oldClass: string,
      newClass: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      oldClass: string,
      newClass: string,
    ) => Effect.Effect<A, E, R>
  >(
    3,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      oldClass: string,
      newClass: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => el.classList.replace(oldClass, newClass)),
      ),
  ),

  // ===========================================================================
  // Attributes
  // ===========================================================================

  hasAttribute: dual<
    (
      name: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<boolean, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
    ) => Effect.Effect<boolean, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
    ): Effect.Effect<boolean, E, R> =>
      Effect.map(self, (el) => el.hasAttribute(name)),
  ),

  /**
   * Set an attribute on the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.setAttribute("aria-expanded", "true"))
   * ```
   */
  setAttribute: dual<
    (
      name: string,
      value: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
      value: string,
    ) => Effect.Effect<A, E, R>
  >(
    3,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
      value: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.setAttribute(name, value))),
  ),

  /**
   * Set multiple attributes on the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.setAttributes({ "aria-expanded": "true", "aria-hidden": "false" }))
   * ```
   */
  setAttributes: dual<
    (
      attrs: Record<string, string>,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      attrs: Record<string, string>,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      attrs: Record<string, string>,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          for (const [name, value] of Object.entries(attrs)) {
            el.setAttribute(name, value);
          }
        }),
      ),
  ),

  /**
   * Remove an attribute from the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.removeAttribute("disabled"))
   * ```
   */
  removeAttribute: dual<
    (
      name: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.removeAttribute(name))),
  ),

  /**
   * Toggle a boolean attribute. Optionally force add/remove with second argument.
   *
   * @example
   * ```ts
   * el.pipe(Element.toggleAttribute("disabled"))
   * el.pipe(Element.toggleAttribute("disabled", false)) // force remove
   * ```
   */
  toggleAttribute: dual<
    (
      name: string,
      force?: boolean,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
      force?: boolean,
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
      force?: boolean,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => el.toggleAttribute(name, force)),
      ),
  ),

  /**
   * Get an attribute value from the element.
   * Fails with AttributeNotFound if the attribute doesn't exist.
   *
   * @example
   * ```ts
   * el.pipe(Element.getAttribute("data-id"))
   * ```
   */
  getAttribute: dual<
    (
      name: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<string, AttributeNotFound | E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
    ) => Effect.Effect<string, AttributeNotFound | E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      name: string,
    ): Effect.Effect<string, AttributeNotFound | E, R> =>
      Effect.flatMap(self, (el) => {
        const value = el.getAttribute(name);
        if (value === null) {
          return Effect.fail(new AttributeNotFound({ attribute: name }));
        }
        return Effect.succeed(value);
      }),
  ),

  // ===========================================================================
  // Data Attributes
  // ===========================================================================

  /**
   * Set a data attribute (dataset property).
   *
   * @example
   * ```ts
   * el.pipe(Element.setData("state", "open")) // sets data-state="open"
   * ```
   */
  setData: dual<
    (
      key: string,
      value: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      key: string,
      value: string,
    ) => Effect.Effect<A, E, R>
  >(
    3,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      key: string,
      value: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => (el.dataset[key] = value))),
  ),

  /**
   * Remove a data attribute.
   *
   * @example
   * ```ts
   * el.pipe(Element.removeData("state")) // removes data-state
   * ```
   */
  removeData: dual<
    (
      key: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      key: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      key: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => delete el.dataset[key])),
  ),

  /**
   * Get a data attribute value.
   * Fails with DataAttributeNotFound if the data attribute doesn't exist.
   *
   * @example
   * ```ts
   * el.pipe(Element.getData("state"))
   * ```
   */
  getData: dual<
    (
      key: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<string, DataAttributeNotFound | E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      key: string,
    ) => Effect.Effect<string, DataAttributeNotFound | E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      key: string,
    ): Effect.Effect<string, DataAttributeNotFound | E, R> =>
      Effect.flatMap(self, (el) => {
        const value = el.dataset[key];
        if (value === undefined) {
          return Effect.fail(new DataAttributeNotFound({ key }));
        }
        return Effect.succeed(value);
      }),
  ),

  // ===========================================================================
  // Content
  // ===========================================================================

  /**
   * Set the text content of an element.
   *
   * @example
   * ```ts
   * el.pipe(Element.setTextContent("Hello, world!"))
   * ```
   */
  setTextContent: dual<
    (
      text: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      text: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      text: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => (el.textContent = text))),
  ),

  /**
   * Set the innerHTML of an element.
   * WARNING: Be careful with untrusted content to avoid XSS.
   *
   * @example
   * ```ts
   * el.pipe(Element.setInnerHTML("<strong>Bold</strong>"))
   * ```
   */
  setInnerHTML: dual<
    (
      html: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      html: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      html: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => (el.innerHTML = html))),
  ),

  // ===========================================================================
  // Properties
  // ===========================================================================

  /**
   * Set a property on the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.setProperty("value", "hello"))
   * ```
   */
  setProperty: dual<
    <K extends keyof HTMLElement>(
      key: K,
      value: HTMLElement[K],
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R, K extends keyof A>(
      self: Effect.Effect<A, E, R>,
      key: K,
      value: A[K],
    ) => Effect.Effect<A, E, R>
  >(
    3,
    <A extends HTMLElement, E, R, K extends keyof A>(
      self: Effect.Effect<A, E, R>,
      key: K,
      value: A[K],
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => (el[key] = value))),
  ),

  // ===========================================================================
  // Focus
  // ===========================================================================

  /**
   * Focus an element without scrolling.
   *
   * @example
   * ```ts
   * el.pipe(Element.focus)
   * ```
   */
  focus: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => el.focus({ preventScroll: true })),
    ),

  /**
   * Focus an element with options.
   *
   * @example
   * ```ts
   * el.pipe(Element.focusWithOptions({ preventScroll: true }))
   * ```
   */
  focusWithOptions: dual<
    (
      options: FocusOptions,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options: FocusOptions,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options: FocusOptions,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.focus(options))),
  ),

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
   * Query for a descendant element and focus it if found, otherwise focus self.
   * Common pattern for menu/dialog components.
   *
   * @example
   * ```ts
   * el.pipe(Element.focusFirst("[data-menu-item]:not([data-disabled])"))
   * ```
   */
  focusFirst: dual<
    (
      selector: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          const first = el.querySelector(selector) as HTMLElement | null;
          if (first) {
            first.focus({ preventScroll: true });
          } else {
            el.focus({ preventScroll: true });
          }
        }),
      ),
  ),

  /**
   * Focus the last matching descendant, or self if none found.
   *
   * @example
   * ```ts
   * el.pipe(Element.focusLast("[data-menu-item]:not([data-disabled])"))
   * ```
   */
  focusLast: dual<
    (
      selector: string,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      selector: string,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => {
          const items = el.querySelectorAll(selector);
          const last = items[items.length - 1] as HTMLElement | undefined;
          if (last) {
            last.focus({ preventScroll: true });
          } else {
            el.focus({ preventScroll: true });
          }
        }),
      ),
  ),

  // ===========================================================================
  // Scrolling
  // ===========================================================================

  /**
   * Scroll an element into view.
   *
   * @example
   * ```ts
   * el.pipe(Element.scrollIntoView({ behavior: "smooth", block: "center" }))
   * ```
   */
  scrollIntoView: dual<
    (
      options?: ScrollIntoViewOptions,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options?: ScrollIntoViewOptions,
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options?: ScrollIntoViewOptions,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.scrollIntoView(options))),
  ),

  /**
   * Scroll to a position within the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.scrollTo({ top: 0, behavior: "smooth" }))
   * ```
   */
  scrollTo: dual<
    (
      options: ScrollToOptions,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options: ScrollToOptions,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options: ScrollToOptions,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.scrollTo(options))),
  ),

  /**
   * Scroll by an amount within the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.scrollBy({ top: 100, behavior: "smooth" }))
   * ```
   */
  scrollBy: dual<
    (
      options: ScrollToOptions,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options: ScrollToOptions,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      options: ScrollToOptions,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.scrollBy(options))),
  ),

  // ===========================================================================
  // Animation
  // ===========================================================================

  /**
   * Animate an element using the Web Animations API.
   * The Effect resolves when the animation finishes, preserving the element for chaining.
   *
   * @example
   * ```ts
   * // Simple pulse animation
   * buttonRef.pipe(
   *   Element.animate(
   *     [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
   *     { duration: 200 }
   *   ),
   * )
   *
   * // Chain actions after animation completes
   * el.pipe(
   *   Element.animate([{ opacity: "0" }, { opacity: "1" }], 300),
   *   Element.focus,
   * )
   * ```
   */
  animate: dual<
    (
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options?: number | KeyframeAnimationOptions,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options?: number | KeyframeAnimationOptions,
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options?: number | KeyframeAnimationOptions,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.promise(() => el.animate(keyframes, options).finished),
      ),
  ),

  // ===========================================================================
  // Events
  // ===========================================================================

  /**
   * Programmatically click the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.click)
   * ```
   */
  click: <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) => Effect.sync(() => el.click())),

  /**
   * Dispatch a custom event on the element.
   *
   * @example
   * ```ts
   * el.pipe(Element.dispatchEvent(new CustomEvent("my-event", { detail: { foo: 1 } })))
   * ```
   */
  dispatchEvent: dual<
    (
      event: Event,
    ) => <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      event: Event,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      event: Event,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => el.dispatchEvent(event))),
  ),

  // ===========================================================================
  // Input-specific
  // ===========================================================================

  /**
   * Select all text in an input or textarea.
   *
   * @example
   * ```ts
   * inputEl.pipe(Element.select)
   * ```
   */
  select: <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) => Effect.sync(() => el.select())),

  /**
   * Set the selection range in an input or textarea.
   *
   * @example
   * ```ts
   * inputEl.pipe(Element.setSelectionRange(0, 5))
   * ```
   */
  setSelectionRange: dual<
    (
      start: number,
      end: number,
      direction?: "forward" | "backward" | "none",
    ) => <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>,
    <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(
      self: Effect.Effect<A, E, R>,
      start: number,
      end: number,
      direction?: "forward" | "backward" | "none",
    ) => Effect.Effect<A, E, R>
  >(
    (args) => Effect.isEffect(args[0]),
    <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(
      self: Effect.Effect<A, E, R>,
      start: number,
      end: number,
      direction?: "forward" | "backward" | "none",
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) =>
        Effect.sync(() => el.setSelectionRange(start, end, direction)),
      ),
  ),

  // ===========================================================================
  // Custom Taps
  // ===========================================================================

  /**
   * Tap into the element to perform a side effect.
   * Useful for custom operations that aren't covered by other helpers.
   *
   * @example
   * ```ts
   * el.pipe(
   *   Element.tap((e) => console.log("Element:", e)),
   *   Element.focus,
   * )
   * ```
   */
  tap: dual<
    <A extends HTMLElement>(
      fn: (el: A) => void,
    ) => <E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      fn: (el: A) => void,
    ) => Effect.Effect<A, E, R>
  >(
    2,
    <A extends HTMLElement, E, R>(
      self: Effect.Effect<A, E, R>,
      fn: (el: A) => void,
    ): Effect.Effect<A, E, R> =>
      Effect.tap(self, (el) => Effect.sync(() => fn(el))),
  ),

  /**
   * Tap into the element with an Effect.
   * Useful for async operations or operations that need Effect context.
   *
   * @example
   * ```ts
   * el.pipe(
   *   Element.tapEffect((e) => logToServer(e.id)),
   *   Element.focus,
   * )
   * ```
   */
  tapEffect: dual<
    <A extends HTMLElement, E2, R2>(
      fn: (el: A) => Effect.Effect<unknown, E2, R2>,
    ) => <E, R>(
      self: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E | E2, R | R2>,
    <A extends HTMLElement, E, R, E2, R2>(
      self: Effect.Effect<A, E, R>,
      fn: (el: A) => Effect.Effect<unknown, E2, R2>,
    ) => Effect.Effect<A, E | E2, R | R2>
  >(
    2,
    <A extends HTMLElement, E, R, E2, R2>(
      self: Effect.Effect<A, E, R>,
      fn: (el: A) => Effect.Effect<unknown, E2, R2>,
    ): Effect.Effect<A, E | E2, R | R2> => Effect.tap(self, fn),
  ),
} as const;
