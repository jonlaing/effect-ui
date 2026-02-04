/**
 * Core Element creation and manipulation functions.
 * All DOM operations go through the Renderer for SSR/SSG/hydration support.
 */

import { Effect, Scope, Stream } from "effect";
import { dual } from "effect/Function";

import { Readable, RendererContext } from "@effex/core";

import { bindElementToRef, type ElementRef } from "./ref.js";

// =============================================================================
// Types
// =============================================================================

/**
 * An Element is an Effect that produces an HTML or SVG element.
 * All Element operations are effectful and go through the Renderer.
 */
export type Element<
  A extends HTMLElement | SVGElement = HTMLElement | SVGElement,
  E = never,
  R = never,
> = Effect.Effect<A, E, Scope.Scope | RendererContext | R>;

/**
 * A child that can be appended to an element.
 */
export type ChildNode =
  | string
  | number
  | Readable.Readable<string | number>
  | HTMLElement
  | SVGElement;

/**
 * An effectful child producer.
 */
export type Child<E = never, R = never> = Effect.Effect<
  ChildNode | ChildNode[],
  E,
  R
>;

// =============================================================================
// Constructors
// =============================================================================

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * Create an HTML element.
 */
export const make = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): Element<HTMLElementTagNameMap[K]> =>
  Effect.flatMap(RendererContext, (renderer) =>
    renderer.createNode(tagName),
  ) as Element<HTMLElementTagNameMap[K]>;

/**
 * Create an SVG element.
 */
export const makeSVG = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
): Element<SVGElementTagNameMap[K]> =>
  Effect.flatMap(RendererContext, (renderer) =>
    renderer.createNode(tagName, SVG_NAMESPACE),
  ) as Element<SVGElementTagNameMap[K]>;

/**
 * Lift a value into a Child effect.
 */
export const of = <A extends ChildNode>(
  value: A,
): Effect.Effect<A, never, never> => Effect.succeed(value);

/**
 * An empty child (produces empty array).
 */
export const empty: Child<never, never> = Effect.succeed([]);

// =============================================================================
// Attributes
// =============================================================================

/**
 * Set an attribute on the element.
 */
export const setAttribute: {
  (
    name: string,
    value: string | number | boolean,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
    value: string | number | boolean,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
    value: string | number | boolean,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setAttribute(el, name, String(value));
      return el;
    }) as Element<A, E, R>,
);

/**
 * Remove an attribute from the element.
 */
export const removeAttribute: {
  (
    name: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.removeAttribute(el, name);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Toggle a boolean attribute.
 */
export const toggleAttribute: {
  (
    name: string,
    force?: boolean,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
    force?: boolean,
  ): Element<A, E, R>;
} = dual(
  (args) => Effect.isEffect(args[0]),
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
    force?: boolean,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      if (force === true) {
        const renderer = yield* RendererContext;
        yield* renderer.setAttribute(el, name, "");
      } else if (force === false) {
        const renderer = yield* RendererContext;
        yield* renderer.removeAttribute(el, name);
      } else {
        // Toggle based on current state
        const renderer = yield* RendererContext;
        if (el.hasAttribute(name)) {
          yield* renderer.removeAttribute(el, name);
        } else {
          yield* renderer.setAttribute(el, name, "");
        }
      }
      return el;
    }) as Element<A, E, R>,
);

// =============================================================================
// Classes
// =============================================================================

/**
 * Set the class attribute (replaces existing classes).
 */
export const setClass: {
  (
    className: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    className: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    className: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setAttribute(el, "class", className);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Add one or more classes to the element.
 * Note: Uses direct classList manipulation (client-side only).
 */
export const addClass: {
  (
    ...classes: string[]
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    ...classes: string[]
  ): Element<A, E, R>;
} = dual(
  (args) => Effect.isEffect(args[0]),
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    ...classes: string[]
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => el.classList.add(...classes)),
    ) as Element<A, E, R>,
);

/**
 * Remove one or more classes from the element.
 * Note: Uses direct classList manipulation (client-side only).
 */
export const removeClass: {
  (
    ...classes: string[]
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    ...classes: string[]
  ): Element<A, E, R>;
} = dual(
  (args) => Effect.isEffect(args[0]),
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    ...classes: string[]
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => el.classList.remove(...classes)),
    ) as Element<A, E, R>,
);

/**
 * Toggle a class on the element.
 * Note: Uses direct classList manipulation (client-side only).
 */
export const toggleClass: {
  (
    className: string,
    force?: boolean,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    className: string,
    force?: boolean,
  ): Element<A, E, R>;
} = dual(
  (args) => Effect.isEffect(args[0]),
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    className: string,
    force?: boolean,
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => el.classList.toggle(className, force)),
    ) as Element<A, E, R>,
);

/**
 * Replace one class with another.
 * Note: Uses direct classList manipulation (client-side only).
 */
export const replaceClass: {
  (
    oldClass: string,
    newClass: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    oldClass: string,
    newClass: string,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    oldClass: string,
    newClass: string,
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => el.classList.replace(oldClass, newClass)),
    ) as Element<A, E, R>,
);

// =============================================================================
// Styles
// =============================================================================

/**
 * Set a style property on the element.
 */
export const setStyle: {
  (
    property: string,
    value: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    property: string,
    value: string,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    property: string,
    value: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setStyleProperty(el, property, value);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Remove a style property from the element.
 */
export const removeStyle: {
  (
    property: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    property: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    property: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.removeStyleProperty(el, property);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Set multiple style properties on the element at once.
 * Values can be static strings or Readable<string> for reactive bindings.
 */
export const setStyles: {
  (
    styles: Record<string, string | Readable.Readable<string>>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    styles: Record<string, string | Readable.Readable<string>>,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    styles: Record<string, string | Readable.Readable<string>>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      for (const [property, value] of Object.entries(styles)) {
        if (Readable.isReadable(value)) {
          yield* bindStyle(Effect.succeed(el), property, value);
        } else {
          yield* setStyle(Effect.succeed(el), property, value);
        }
      }
      return el;
    }) as Element<A, E, R>,
);

// =============================================================================
// Data Attributes
// =============================================================================

/**
 * Set a data attribute on the element.
 */
export const setData: {
  (
    key: string,
    value: string,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R>(
    self: Element<A, E, R>,
    key: string,
    value: string,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement, E, R>(
    self: Element<A, E, R>,
    key: string,
    value: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setAttribute(el, `data-${key}`, value);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Remove a data attribute from the element.
 */
export const removeData: {
  (
    key: string,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R>(
    self: Element<A, E, R>,
    key: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement, E, R>(
    self: Element<A, E, R>,
    key: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.removeAttribute(el, `data-${key}`);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Get a data attribute from the element.
 * Works with any Effect that produces an element.
 */
export const getData: {
  (
    key: string,
  ): <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ) => Effect.Effect<string | undefined, E, R>;
  <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
    key: string,
  ): Effect.Effect<string | undefined, E, R>;
} = dual(
  2,
  <A extends HTMLElement, E, R>(
    self: Effect.Effect<A, E, R>,
    key: string,
  ): Effect.Effect<string | undefined, E, R> =>
    Effect.map(self, (el) => el.dataset[key]),
);

// =============================================================================
// Content
// =============================================================================

/**
 * Set the text content of the element.
 */
export const setTextContent: {
  (
    text: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    text: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    text: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setTextContent(el, text);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Set the innerHTML of the element.
 * WARNING: Be careful with untrusted content to avoid XSS.
 */
export const setInnerHTML: {
  (
    html: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    html: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    html: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setInnerHTML(el, html);
      return el;
    }) as Element<A, E, R>,
);

/**
 * Set the value of an input element.
 * Uses setInputValue which preserves cursor position.
 */
export const setInputValue: {
  (
    value: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    value: string,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    value: string,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      yield* renderer.setInputValue(el, value);
      return el;
    }) as Element<A, E, R>,
);

// =============================================================================
// Children
// =============================================================================

/**
 * Append a child to the element.
 */
export const appendChild: {
  <E2, R2>(
    child: Child<E2, R2>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E | E2, R | R2>;
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(
    self: Element<A, E, R>,
    child: Child<E2, R2>,
  ): Element<A, E | E2, R | R2>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(
    self: Element<A, E, R>,
    child: Child<E2, R2>,
  ): Element<A, E | E2, R | R2> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;
      const childValue = yield* child;

      const children = Array.isArray(childValue) ? childValue : [childValue];

      for (const c of children) {
        if (typeof c === "string" || typeof c === "number") {
          const textNode = yield* renderer.createTextNode(String(c));
          yield* renderer.appendChild(el, textNode);
        } else if (Readable.isReadable(c)) {
          // Create a text node and subscribe to changes
          const textNode = yield* renderer.createTextNode("");
          yield* renderer.appendChild(el, textNode);
          const initialValue = yield* c.get;
          yield* renderer.setTextContent(textNode, String(initialValue));
          // Subscribe to changes only (not values - we already set initial)
          const scope = yield* Effect.scope;
          yield* Stream.runForEach(c.changes, (value) =>
            renderer.setTextContent(textNode, String(value)),
          ).pipe(Effect.forkIn(scope));
        } else {
          yield* renderer.appendChild(el, c as Node);
        }
      }

      return el;
    }) as Element<A, E | E2, R | R2>,
);

/**
 * Clear all children from the element.
 */
export const clearChildren: <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>,
) => Element<A, E, R> = <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>,
): Element<A, E, R> =>
  Effect.gen(function* () {
    const el = yield* self;
    const renderer = yield* RendererContext;
    const children = yield* renderer.getChildren(el);
    for (const child of children) {
      yield* renderer.removeChild(el, child);
    }
    return el;
  }) as Element<A, E, R>;

// =============================================================================
// Element Reference
// =============================================================================

/**
 * Bind an ElementRef to this element.
 */
export const setRef: {
  <A extends HTMLElement | SVGElement>(
    ref: ElementRef<A>,
  ): <E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    ref: ElementRef<A>,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    ref: ElementRef<A>,
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => bindElementToRef(ref, el)),
    ) as Element<A, E, R>,
);

// =============================================================================
// Reactive Bindings
// =============================================================================

/**
 * Bind an attribute to a Readable, updating when it changes.
 */
export const bindAttribute: {
  <V>(
    name: string,
    readable: Readable.Readable<V>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R, V>(
    self: Element<A, E, R>,
    name: string,
    readable: Readable.Readable<V>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R, V>(
    self: Element<A, E, R>,
    name: string,
    readable: Readable.Readable<V>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Helper to convert value for setAttribute (preserves null/undefined for removal)
      const toAttrValue = (v: V): unknown => (v == null ? v : String(v));

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.setAttribute(el, name, toAttrValue(initialValue));

      // Subscribe to changes only (not values - we already set initial)
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.setAttribute(el, name, toAttrValue(value)),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

/**
 * Bind a class to a Readable boolean, adding/removing when it changes.
 */
export const bindClass: {
  (
    className: string,
    readable: Readable.Readable<boolean>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    className: string,
    readable: Readable.Readable<boolean>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    className: string,
    readable: Readable.Readable<boolean>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.toggleClass(el, className, initialValue);

      // Subscribe to changes only (not values - we already set initial)
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.toggleClass(el, className, value),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

/**
 * Bind a style property to a Readable, updating when it changes.
 */
export const bindStyle: {
  (
    property: string,
    readable: Readable.Readable<string>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    property: string,
    readable: Readable.Readable<string>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    property: string,
    readable: Readable.Readable<string>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.setStyleProperty(el, property, initialValue);

      // Subscribe to changes only (not values - we already set initial)
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.setStyleProperty(el, property, value),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

/**
 * Bind a data attribute to a Readable, updating when it changes.
 */
export const bindData: {
  (
    key: string,
    readable: Readable.Readable<string>,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R>(
    self: Element<A, E, R>,
    key: string,
    readable: Readable.Readable<string>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement, E, R>(
    self: Element<A, E, R>,
    key: string,
    readable: Readable.Readable<string>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.setAttribute(el, `data-${key}`, initialValue);

      // Subscribe to changes only (not values - we already set initial)
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.setAttribute(el, `data-${key}`, value),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

/**
 * Bind text content to a Readable, updating when it changes.
 */
export const bindTextContent: {
  (
    readable: Readable.Readable<string>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    readable: Readable.Readable<string>,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    readable: Readable.Readable<string>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.setTextContent(el, initialValue);

      // Subscribe to changes only (not values - we already set initial)
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.setTextContent(el, value),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

/**
 * Toggle a class based on a Readable boolean.
 * Alias for bindClass.
 */
export const bindToggleClass = bindClass;

/**
 * Bind a boolean attribute to a Readable, adding/removing when it changes.
 * Unlike bindAttribute which stringifies, this adds the attribute (empty string)
 * when true and removes it when false.
 */
export const bindBooleanAttribute: {
  (
    name: string,
    readable: Readable.Readable<boolean>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
    readable: Readable.Readable<boolean>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    name: string,
    readable: Readable.Readable<boolean>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      const applyValue = (value: boolean) =>
        value
          ? renderer.setAttribute(el, name, "")
          : renderer.removeAttribute(el, name);

      // Set initial value
      const initialValue = yield* readable.get;
      yield* applyValue(initialValue);

      // Subscribe to changes
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, applyValue).pipe(
        Effect.forkIn(scope),
      );

      return el;
    }) as Element<A, E, R>,
);

/**
 * Bind innerHTML to a Readable, updating when it changes.
 */
export const bindInnerHTML: {
  (
    readable: Readable.Readable<string>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    readable: Readable.Readable<string>,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    readable: Readable.Readable<string>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.setInnerHTML(el, initialValue);

      // Subscribe to changes
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.setInnerHTML(el, value),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

/**
 * Bind input value to a Readable, updating when it changes.
 * Uses setInputValue which preserves cursor position.
 */
export const bindInputValue: {
  (
    readable: Readable.Readable<unknown>,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
  ) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    readable: Readable.Readable<unknown>,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    readable: Readable.Readable<unknown>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;
      const renderer = yield* RendererContext;

      // Set initial value
      const initialValue = yield* readable.get;
      yield* renderer.setInputValue(el, String(initialValue));

      // Subscribe to changes
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (value) =>
        renderer.setInputValue(el, String(value)),
      ).pipe(Effect.forkIn(scope));

      return el;
    }) as Element<A, E, R>,
);

// =============================================================================
// Focus
// =============================================================================

/**
 * Focus the element.
 */
export const focus: <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>,
) => Element<A, E, R> = <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>,
): Element<A, E, R> =>
  Effect.tap(self, (el) =>
    Effect.sync(() => el.focus({ preventScroll: true })),
  ) as Element<A, E, R>;

/**
 * Blur (unfocus) the element.
 */
export const blur: <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>,
) => Element<A, E, R> = <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>,
): Element<A, E, R> =>
  Effect.tap(self, (el) => Effect.sync(() => el.blur())) as Element<A, E, R>;

// =============================================================================
// Events
// =============================================================================

/**
 * Add an event listener to the element.
 */
export const on: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;

      // Track if scope is still active to prevent stale handler calls
      let isActive = true;

      const wrappedHandler = (e: Event) => {
        if (isActive) {
          const effect = handler(e as HTMLElementEventMap[K]);
          if (effect && Effect.isEffect(effect)) {
            Effect.runPromise(effect);
          }
        }
      };

      el.addEventListener(event, wrappedHandler);

      // Clean up on scope finalization
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          isActive = false;
          el.removeEventListener(event, wrappedHandler);
        }),
      );

      return el;
    }) as Element<A, E, R>,
);

/**
 * Add a one-time event listener to the element.
 */
export const once: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>,
  ): Element<A, E, R>;
} = dual(
  3,
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>,
  ): Element<A, E, R> =>
    Effect.gen(function* () {
      const el = yield* self;

      // Track if scope is still active to prevent stale handler calls
      let isActive = true;

      const wrappedHandler = (e: Event) => {
        if (isActive) {
          el.removeEventListener(event, wrappedHandler);
          const effect = handler(e as HTMLElementEventMap[K]);
          if (effect && Effect.isEffect(effect)) {
            Effect.runPromise(effect);
          }
        }
      };

      el.addEventListener(event, wrappedHandler);

      // Clean up on scope finalization
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          isActive = false;
          el.removeEventListener(event, wrappedHandler);
        }),
      );

      return el;
    }) as Element<A, E, R>,
);

/**
 * Add an event listener to the element (low-level).
 * Unlike `on`, this doesn't automatically clean up - you must call removeEventListener.
 * Useful for manual event management in Effect.async patterns.
 */
export const addEventListener: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): Element<A, E, R>;
} = dual(
  (args) => Effect.isEffect(args[0]),
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() =>
        el.addEventListener(event, handler as EventListener, options),
      ),
    ) as Element<A, E, R>,
);

/**
 * Remove an event listener from the element.
 * Use with addEventListener for manual event management.
 */
export const removeEventListener: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
  ): Element<A, E, R>;
} = dual(
  (args) => Effect.isEffect(args[0]),
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
  ): Element<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() =>
        el.removeEventListener(event, handler as EventListener),
      ),
    ) as Element<A, E, R>,
);

/**
 * Programmatically click the element.
 */
export const click: <A extends HTMLElement, E, R>(
  self: Element<A, E, R>,
) => Element<A, E, R> = <A extends HTMLElement, E, R>(
  self: Element<A, E, R>,
): Element<A, E, R> =>
  Effect.tap(self, (el) => Effect.sync(() => el.click())) as Element<A, E, R>;

// =============================================================================
// Custom Taps
// =============================================================================

/**
 * Tap into the element to perform a side effect.
 */
export const tap: {
  <A extends HTMLElement | SVGElement>(
    fn: (el: A) => void,
  ): <E, R>(self: Element<A, E, R>) => Element<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    fn: (el: A) => void,
  ): Element<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Element<A, E, R>,
    fn: (el: A) => void,
  ): Element<A, E, R> =>
    Effect.tap(self, (el) => Effect.sync(() => fn(el))) as Element<A, E, R>,
);

/**
 * Tap into the element with an Effect.
 */
export const tapEffect: {
  <A extends HTMLElement | SVGElement, E2, R2>(
    fn: (el: A) => Effect.Effect<unknown, E2, R2>,
  ): <E, R>(self: Element<A, E, R>) => Element<A, E | E2, R | R2>;
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(
    self: Element<A, E, R>,
    fn: (el: A) => Effect.Effect<unknown, E2, R2>,
  ): Element<A, E | E2, R | R2>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(
    self: Element<A, E, R>,
    fn: (el: A) => Effect.Effect<unknown, E2, R2>,
  ): Element<A, E | E2, R | R2> =>
    Effect.tap(self, fn) as Element<A, E | E2, R | R2>,
);

// =============================================================================
// Element Queries
// =============================================================================

/**
 * Get the bounding client rect of the element.
 * Works with any Effect that produces an element.
 */
export const getBoundingClientRect: <A extends HTMLElement | SVGElement, E, R>(
  self: Effect.Effect<A, E, R>,
) => Effect.Effect<DOMRect, E, R> = <A extends HTMLElement | SVGElement, E, R>(
  self: Effect.Effect<A, E, R>,
): Effect.Effect<DOMRect, E, R> =>
  Effect.flatMap(self, (el) => Effect.sync(() => el.getBoundingClientRect()));

/**
 * Get the element's ID attribute.
 * Works with any Effect that produces an element.
 */
export const getId: <A extends HTMLElement | SVGElement, E, R>(
  self: Effect.Effect<A, E, R>,
) => Effect.Effect<string, E, R> = <A extends HTMLElement | SVGElement, E, R>(
  self: Effect.Effect<A, E, R>,
): Effect.Effect<string, E, R> => Effect.map(self, (el) => el.id);

/**
 * Check if the element has a specific attribute.
 * Works with any Effect that produces an element.
 */
export const hasAttribute: {
  (
    name: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ) => Effect.Effect<boolean, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    name: string,
  ): Effect.Effect<boolean, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    name: string,
  ): Effect.Effect<boolean, E, R> =>
    Effect.map(self, (el) => el.hasAttribute(name)),
);

/**
 * Check if an element contains another node.
 * Works with any Effect that produces an element.
 */
export const contains: {
  (
    node: Node,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ) => Effect.Effect<boolean, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    node: Node,
  ): Effect.Effect<boolean, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    node: Node,
  ): Effect.Effect<boolean, E, R> =>
    Effect.map(self, (el) => el.contains(node)),
);

// =============================================================================
// Focus Utilities
// =============================================================================

/**
 * Focus the first element within that matches the selector.
 * Works with any Effect that produces an element.
 */
export const focusFirst: {
  (
    selector: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ) => Effect.Effect<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    selector: string,
  ): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    selector: string,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => {
        const first = el.querySelector<HTMLElement>(selector);
        if (first) {
          first.focus({ preventScroll: true });
        }
      }),
    ),
);

/**
 * Focus the last element within that matches the selector.
 * Works with any Effect that produces an element.
 */
export const focusLast: {
  (
    selector: string,
  ): <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
  ) => Effect.Effect<A, E, R>;
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    selector: string,
  ): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A extends HTMLElement | SVGElement, E, R>(
    self: Effect.Effect<A, E, R>,
    selector: string,
  ): Effect.Effect<A, E, R> =>
    Effect.tap(self, (el) =>
      Effect.sync(() => {
        const all = el.querySelectorAll<HTMLElement>(selector);
        const last = all[all.length - 1];
        if (last) {
          last.focus({ preventScroll: true });
        }
      }),
    ),
);
