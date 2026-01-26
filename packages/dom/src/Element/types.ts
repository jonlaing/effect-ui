import type { Effect } from "effect";

import type { Element as CoreElement, Readable } from "@effex/core";

import type { ElementRef } from "./ref.js";

/**
 * Handler for DOM events that can optionally return an Effect.
 * @template E - The specific Event type
 *
 * @example
 * ```ts
 * // Synchronous handler
 * button({
 *   onClick: (e) => console.log("clicked", e.target)
 * }, $.of("Click"))
 *
 * // Effect-based handler
 * button({
 *   onClick: (e) => Effect.log(`Clicked at ${e.clientX}, ${e.clientY}`)
 * }, $.of("Click"))
 * ```
 */
export type EventHandler<E extends Event> = (
  event: E,
) => Effect.Effect<void, never>;

/** Valid values for inline styles: static or reactive strings/numbers. */
export type StyleValue = string | number | Readable<string> | Readable<number>;

/** Individual class item: string or reactive string */
export type ClassItem = string | Readable<string>;

/** Valid class value types: string, array of class items, or reactive versions */
export type ClassValue =
  | string
  | readonly ClassItem[]
  | Readable<string>
  | Readable<readonly string[]>;

/** Data attribute value: string, boolean, number, or reactive versions */
export type DataAttributeValue =
  | string
  | boolean
  | number
  | undefined
  | Readable<string>
  | Readable<boolean>
  | Readable<number>
  | Readable<string | undefined>;

/** Data attributes interface allowing any data-* attribute */
export interface DataAttributes {
  readonly [key: `data-${string}`]: DataAttributeValue;
}

/** ARIA attribute value: string, boolean, number, or reactive versions */
export type AriaAttributeValue =
  | string
  | boolean
  | number
  | undefined
  | Readable<string>
  | Readable<boolean>
  | Readable<number>
  | Readable<string | undefined>;

/** ARIA attributes interface allowing any aria-* attribute */
export interface AriaAttributes {
  readonly [key: `aria-${string}`]: AriaAttributeValue;
}

/**
 * Base attributes available on all elements.
 *
 * @example
 * ```ts
 * // Static class
 * div({ class: "container" }, $.of("content"))
 *
 * // Array of classes (great for Tailwind)
 * div({ class: ["flex", "items-center", "gap-4"] }, $.of("content"))
 *
 * // Reactive class
 * const isActive = yield* Signal.make(false)
 * div({ class: isActive.map(a => a ? "active" : "inactive") }, $.of("content"))
 *
 * // Mixed array with reactive items
 * const variant = yield* Signal.make("primary")
 * div({ class: ["btn", variant.map(v => `btn-${v}`), "rounded"] }, $.of("content"))
 *
 * // Reactive array of classes
 * const classes = yield* Signal.make(["btn", "btn-primary"])
 * div({ class: classes }, $.of("content"))
 *
 * // Static styles
 * div({ style: { color: "red", "font-size": "16px" } }, $.of("content"))
 *
 * // Reactive styles
 * const width = yield* Signal.make(100)
 * div({ style: { width: width.map(w => `${w}px`) } }, $.of("content"))
 *
 * // Data attributes
 * div({ "data-state": "open", "data-testid": "my-div" }, $.of("content"))
 *
 * // Reactive data attributes
 * const state = yield* Signal.make("closed")
 * div({ "data-state": state }, $.of("content"))
 * ```
 */
export interface BaseAttributes<T extends HTMLElement>
  extends DataAttributes, AriaAttributes {
  /** CSS class name(s) - can be a string, array of strings, or reactive versions */
  readonly class?: ClassValue;
  /** Inline styles as a record of property-value pairs */
  readonly style?:
    | Record<string, StyleValue>
    | Readable<Record<string, string>>;
  /** Element ID */
  readonly id?: string;
  /** ARIA role attribute */
  readonly role?: string | Readable<string>;
  /**
   * Reference to this element. Pass an ElementRef created by Element.ref().
   *
   * @example
   * ```ts
   * const myRef = yield* Element.ref<HTMLDivElement>();
   * return yield* $.div({ ref: myRef }, $.of("content"));
   * ```
   */
  readonly ref?: ElementRef<T>;
  /**
   * Set the element's innerHTML directly. Useful for rendering HTML strings
   * from markdown parsers, rich text editors, or sanitized user content.
   *
   * Note: No automatic sanitization - use DOMPurify or similar if rendering untrusted content.
   *
   * @example
   * ```ts
   * // Static HTML
   * $.div({ innerHTML: "<strong>Bold</strong> text" })
   *
   * // Reactive markdown rendering
   * const markdown = yield* Signal.make("# Hello");
   * $.div({ innerHTML: markdown.map(md => marked.parse(md)) })
   * ```
   */
  readonly innerHTML?: string | Readable<string>;
}

/**
 * Common DOM event handler attributes.
 */
export interface EventAttributes {
  readonly onClick?: EventHandler<MouseEvent>;
  readonly onInput?: EventHandler<InputEvent>;
  readonly onChange?: EventHandler<Event>;
  readonly onSubmit?: EventHandler<SubmitEvent>;
  readonly onKeyDown?: EventHandler<KeyboardEvent>;
  readonly onKeyUp?: EventHandler<KeyboardEvent>;
  readonly onFocus?: EventHandler<FocusEvent>;
  readonly onBlur?: EventHandler<FocusEvent>;
  readonly onMouseEnter?: EventHandler<MouseEvent>;
  readonly onMouseLeave?: EventHandler<MouseEvent>;
  readonly onContextMenu?: EventHandler<MouseEvent>;
  readonly onPointerDown?: EventHandler<PointerEvent>;
  readonly onPointerUp?: EventHandler<PointerEvent>;
  readonly onPointerMove?: EventHandler<PointerEvent>;
}

/** Keys to exclude from the mapped element attributes (handled by BaseAttributes/EventAttributes) */
type ExcludedKeys =
  | "style"
  | "class"
  | "className" // Exclude the DOM property name too
  | "htmlFor" // We use HTML attribute name "for" instead
  | "id"
  | "role" // Handled by BaseAttributes
  | "innerHTML" // Handled by BaseAttributes
  | "onclick"
  | "oninput"
  | "onchange"
  | "onsubmit"
  | "onkeydown"
  | "onkeyup"
  | "onfocus"
  | "onblur"
  | "onmouseenter"
  | "onmouseleave"
  | "oncontextmenu"
  | "onpointerdown"
  | "onpointerup"
  | "onpointermove";

/**
 * Helper type to extract only non-function property keys from a type.
 * This filters out methods like toString, normalize, click, focus, etc.
 */
type NonFunctionPropertyKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];

/**
 * HTML attribute aliases - maps HTML attribute names to their DOM property equivalents.
 * These provide friendlier attribute names that match HTML rather than DOM API.
 */
type HTMLAttributeAliases<K extends keyof HTMLElementTagNameMap> =
  K extends "label"
    ? {
        /** The id of the form element this label is associated with */
        readonly for?: string | Readable<string>;
      }
    : object;

/**
 * Filter out index signature types from a union of keys.
 * Index signatures appear as the full `string` or `number` type, while actual
 * property names are string/number literal types.
 */
type ExcludeIndexSignature<T> = T extends string
  ? string extends T
    ? never // This is the string index signature type
    : T
  : T extends number
    ? number extends T
      ? never // This is the number index signature type
      : T
    : T;

/**
 * Keys that are valid attributes for an element (excluding methods, handled keys, and index signatures).
 */
type ElementAttributeKeys<K extends keyof HTMLElementTagNameMap> =
  ExcludeIndexSignature<
    Exclude<NonFunctionPropertyKeys<HTMLElementTagNameMap[K]>, ExcludedKeys>
  >;

/**
 * Full HTML attributes for a specific element type, including base, events, and element-specific attributes.
 * @template K - The HTML element tag name
 */
export type HTMLAttributes<K extends keyof HTMLElementTagNameMap> =
  BaseAttributes<HTMLElementTagNameMap[K]> &
    EventAttributes &
    HTMLAttributeAliases<K> & {
      readonly [P in ElementAttributeKeys<K>]?: HTMLElementTagNameMap[K][P] extends string
        ? string | Readable<string>
        : HTMLElementTagNameMap[K][P] extends number
          ? number | Readable<number>
          : HTMLElementTagNameMap[K][P] extends boolean
            ? boolean | Readable<boolean>
            : never;
    };

/**
 * Base attributes available on all SVG elements.
 */
export interface SVGBaseAttributes<T extends SVGElement>
  extends DataAttributes, AriaAttributes {
  /** CSS class name(s) */
  readonly class?: ClassValue;
  /** Inline styles */
  readonly style?:
    | Record<string, StyleValue>
    | Readable<Record<string, string>>;
  /** Element ID */
  readonly id?: string;
  /** ARIA role attribute */
  readonly role?: string | Readable<string>;
  /** Reference to this element. Pass an ElementRef created by Element.ref(). */
  readonly ref?: ElementRef<T>;
}

/**
 * Keys that are valid attributes for an SVG element.
 */
type SVGElementAttributeKeys<K extends keyof SVGElementTagNameMap> = Exclude<
  NonFunctionPropertyKeys<SVGElementTagNameMap[K]>,
  ExcludedKeys
>;

/**
 * Full SVG attributes for a specific element type.
 * @template K - The SVG element tag name
 */
export type SVGAttributes<K extends keyof SVGElementTagNameMap> =
  SVGBaseAttributes<SVGElementTagNameMap[K]> &
    EventAttributes & {
      readonly [P in SVGElementAttributeKeys<K>]?: SVGElementTagNameMap[K][P] extends string
        ? string | Readable<string>
        : SVGElementTagNameMap[K][P] extends number
          ? number | Readable<number>
          : SVGElementTagNameMap[K][P] extends boolean
            ? boolean | Readable<boolean>
            : never;
    };

/**
 * A DOM element wrapped in an Effect with scope management.
 * This is the DOM-specialized version for HTML and SVG elements.
 *
 * @template A - The specific element type (e.g., HTMLDivElement, SVGSVGElement)
 * @template E - The error type (defaults to never for infallible elements)
 * @template R - The requirements/context type (defaults to never for no requirements)
 *
 * @example
 * ```ts
 * // Simple element
 * const myButton: Element<HTMLButtonElement> = button({ class: "primary" }, $.of("Click me"))
 *
 * // Function that can fail
 * const UserProfile = <E, R>(children: ChildEffect<E, R>) =>
 *   Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* div({}, collect($.of(user.name), children))
 *   })
 *
 * // Function with context requirements
 * const NavLink = () =>
 *   Effect.gen(function* () {
 *     const router = yield* RouterContext
 *     return yield* button({ onClick: () => router.push("/") }, $.of("Home"))
 *   })
 * ```
 */
export type Element<
  A extends HTMLElement | SVGElement,
  E = never,
  R = never,
> = CoreElement<A, E, R>;

/**
 * Primitive child node types that can be rendered directly.
 * These are the raw values that elements can contain.
 */
export type ChildNode =
  | string
  | number
  | Readable<string>
  | Readable<number>
  | HTMLElement
  | SVGElement;

/**
 * An Effect that produces child nodes. This is the standard way to pass
 * children to element factories. Use `$.of()` to lift primitives and
 * `collect()` to combine multiple children.
 *
 * @template E - Error type from child effects
 * @template R - Context requirements from child effects
 *
 * @example
 * ```ts
 * // Single child with $.of()
 * div({}, $.of("Hello"))
 *
 * // Multiple children with collect()
 * div({}, collect(
 *   $.of("Hello"),
 *   span({}, $.of("World")),
 *   someComponentWithEffects
 * ))
 *
 * // Generic function that accepts children
 * const Card = <E, R>(props: CardProps, children: ChildEffect<E, R>) =>
 *   Effect.gen(function* () {
 *     return yield* div({ class: "card" }, children)
 *   })
 * ```
 */
export type ChildEffect<E = never, R = never> = Effect.Effect<
  ChildNode | ChildNode[],
  E,
  R
>;

/**
 * Factory function for creating a specific HTML element type.
 * Supports multiple call signatures for convenience.
 * The error and requirements types are inferred from children.
 * @template K - The HTML element tag name
 */
export type ElementFactory<K extends keyof HTMLElementTagNameMap> = {
  <E = never, R = never>(
    attrs: HTMLAttributes<K>,
    children: ChildEffect<E, R>,
  ): Element<HTMLElementTagNameMap[K], E, R>;
  (attrs: HTMLAttributes<K>): Element<HTMLElementTagNameMap[K], never, never>;
  <E = never, R = never>(
    children: ChildEffect<E, R>,
  ): Element<HTMLElementTagNameMap[K], E, R>;
  (): Element<HTMLElementTagNameMap[K], never, never>;
};

/**
 * Factory function for creating a specific SVG element type.
 * @template K - The SVG element tag name
 */
export type SVGElementFactory<K extends keyof SVGElementTagNameMap> = {
  <E = never, R = never>(
    attrs: SVGAttributes<K>,
    children: ChildEffect<E, R>,
  ): Element<SVGElementTagNameMap[K], E, R>;
  (attrs: SVGAttributes<K>): Element<SVGElementTagNameMap[K], never, never>;
  <E = never, R = never>(
    child: ChildEffect<E, R>,
  ): Element<SVGElementTagNameMap[K], E, R>;
  (): Element<SVGElementTagNameMap[K], never, never>;
};
