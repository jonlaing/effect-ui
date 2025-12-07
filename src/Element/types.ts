import type { Effect, Scope } from "effect";
import type { Readable } from "../Readable.js";

/**
 * A DOM element wrapped in an Effect with scope management.
 *
 * @example
 * ```ts
 * const myButton: Element = button({ class: "primary" }, ["Click me"])
 * ```
 */
export type Element = Effect.Effect<HTMLElement, never, Scope.Scope>;

/**
 * Valid child types for an element: strings, numbers, elements, reactive values, or arrays thereof.
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
export type Child =
  | string
  | number
  | Element
  | Readable<string>
  | Readable<number>
  | readonly Child[];

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
) => Effect.Effect<void, never> | void;

/** Valid values for inline styles: static or reactive strings/numbers. */
export type StyleValue = string | number | Readable<string> | Readable<number>;

/**
 * Base attributes available on all elements.
 *
 * @example
 * ```ts
 * // Static class
 * div({ class: "container" }, [...])
 *
 * // Reactive class
 * const isActive = yield* Signal.make(false)
 * div({ class: isActive.map(a => a ? "active" : "inactive") }, [...])
 *
 * // Static styles
 * div({ style: { color: "red", "font-size": "16px" } }, [...])
 *
 * // Reactive styles
 * const width = yield* Signal.make(100)
 * div({ style: { width: width.map(w => `${w}px`) } }, [...])
 * ```
 */
export interface BaseAttributes {
  /** CSS class name(s) */
  readonly class?: string | Readable<string>;
  /** Inline styles as a record of property-value pairs */
  readonly style?:
    | Record<string, StyleValue>
    | Readable<Record<string, string>>;
  /** Element ID */
  readonly id?: string;
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
}

/**
 * Full HTML attributes for a specific element type, including base, events, and element-specific attributes.
 * @template K - The HTML element tag name
 */
export type HTMLAttributes<K extends keyof HTMLElementTagNameMap> =
  BaseAttributes &
    EventAttributes & {
      readonly [P in keyof HTMLElementTagNameMap[K]]?: HTMLElementTagNameMap[K][P] extends string
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
 * @template K - The HTML element tag name
 */
export type ElementFactory<K extends keyof HTMLElementTagNameMap> = {
  (
    attrs: HTMLAttributes<K>,
    children: readonly Child[],
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (
    attrs: HTMLAttributes<K>,
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (
    children: readonly Child[],
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (child: Child): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
};
