import type { Effect, Scope } from "effect";
import type { Readable } from "@core/Readable";
import type { Ref } from "@dom/Ref";

/**
 * A DOM element wrapped in an Effect with scope management.
 * @template E - The error type (defaults to never for infallible elements)
 * @template R - The requirements/context type (defaults to never for no requirements)
 *
 * @example
 * ```ts
 * const myButton: Element = button({ className: "primary" }, ["Click me"])
 *
 * // Component that can fail
 * const UserProfile: Element<UserNotFoundError> = Effect.gen(function* () {
 *   const user = yield* fetchUser(userId)
 *   return yield* div([user.name])
 * })
 *
 * // Component with requirements
 * const NavLink: Element<never, RouterContext> = Effect.gen(function* () {
 *   const router = yield* RouterContext
 *   return yield* button({ onClick: () => router.push("/") }, "Home")
 * })
 * ```
 */
export type Element<E = never, R = never> = Effect.Effect<
  HTMLElement,
  E,
  Scope.Scope | R
>;

/**
 * Valid child types for an element: strings, numbers, elements, reactive values, or arrays thereof.
 * @template E - The error type for child elements
 * @template R - The requirements/context type for child elements
 *
 * @example
 * ```ts
 * // Static text
 * div(["Hello, world!"])
 *
 * // Reactive text
 * const count = yield* Signal.make(0)
 * div([count])  // Updates automatically when count changes
 *
 * // Nested elements
 * div([
 *   h1(["Title"]),
 *   p(["Content"])
 * ])
 * ```
 */
export type Child<E = never, R = never> =
  | string
  | number
  | Element<E, R>
  | Readable<string>
  | Readable<number>
  | readonly Child<E, R>[];

/**
 * Handler for DOM events that can optionally return an Effect.
 * @template E - The specific Event type
 *
 * @example
 * ```ts
 * // Synchronous handler
 * button({
 *   onClick: (e) => console.log("clicked", e.target)
 * }, ["Click"])
 *
 * // Effect-based handler
 * button({
 *   onClick: (e) => Effect.log(`Clicked at ${e.clientX}, ${e.clientY}`)
 * }, ["Click"])
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
 * div({ class: "container" }, [...])
 *
 * // Array of classes (great for Tailwind)
 * div({ class: ["flex", "items-center", "gap-4"] }, [...])
 *
 * // Reactive class
 * const isActive = yield* Signal.make(false)
 * div({ class: isActive.map(a => a ? "active" : "inactive") }, [...])
 *
 * // Mixed array with reactive items
 * const variant = yield* Signal.make("primary")
 * div({ class: ["btn", variant.map(v => `btn-${v}`), "rounded"] }, [...])
 *
 * // Reactive array of classes
 * const classes = yield* Signal.make(["btn", "btn-primary"])
 * div({ class: classes }, [...])
 *
 * // Static styles
 * div({ style: { color: "red", "font-size": "16px" } }, [...])
 *
 * // Reactive styles
 * const width = yield* Signal.make(100)
 * div({ style: { width: width.map(w => `${w}px`) } }, [...])
 *
 * // Data attributes
 * div({ "data-state": "open", "data-testid": "my-div" }, [...])
 *
 * // Reactive data attributes
 * const state = yield* Signal.make("closed")
 * div({ "data-state": state }, [...])
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
  readonly ref?: Ref<T>;
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
 * Keys that are valid attributes for an element (excluding methods and handled keys).
 */
type ElementAttributeKeys<K extends keyof HTMLElementTagNameMap> = Exclude<
  NonFunctionPropertyKeys<HTMLElementTagNameMap[K]>,
  ExcludedKeys
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
 * Factory function for creating a specific HTML element type.
 * Supports multiple call signatures for convenience.
 * The error and requirements types are inferred from children.
 * @template K - The HTML element tag name
 */
export type ElementFactory<K extends keyof HTMLElementTagNameMap> = {
  // (attrs, children[])
  <E = never, R = never>(
    attrs: HTMLAttributes<K>,
    children: readonly Child<E, R>[],
  ): Effect.Effect<HTMLElementTagNameMap[K], E, Scope.Scope | R>;
  // (attrs, singleChild)
  <E = never, R = never>(
    attrs: HTMLAttributes<K>,
    child: Child<E, R>,
  ): Effect.Effect<HTMLElementTagNameMap[K], E, Scope.Scope | R>;
  // (attrs)
  (
    attrs: HTMLAttributes<K>,
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  // (children[])
  <E = never, R = never>(
    children: readonly Child<E, R>[],
  ): Effect.Effect<HTMLElementTagNameMap[K], E, Scope.Scope | R>;
  // (singleChild)
  <E = never, R = never>(
    child: Child<E, R>,
  ): Effect.Effect<HTMLElementTagNameMap[K], E, Scope.Scope | R>;
  // ()
  (): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
};
