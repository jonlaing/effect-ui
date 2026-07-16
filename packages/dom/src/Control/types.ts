import type { Readable } from "@effex/core";

import type {
  AnimationOptions,
  EnterOnlyAnimationOptions,
  ListAnimationOptions,
} from "../Animation/index.js";
import type * as Element from "../Element/index.js";

/**
 * Configuration for the `when` control flow (DOM-specific with animation support).
 */
export interface WhenConfig<E1 = never, R1 = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /** Element to render when condition is true */
  readonly onTrue: () => Element.Element<HTMLElement | SVGElement, E1, R1>;
  /** Element to render when condition is false */
  readonly onFalse: () => Element.Element<HTMLElement | SVGElement, E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
  /**
   * Re-animate the SSR/SSG-rendered branch on hydration. See {@link EachConfig.intro}
   * for the full contract and FOUC caveat.
   */
  readonly intro?: boolean;
}

/**
 * A case for pattern matching.
 */
export interface MatchCase<A, E = never, R = never> {
  readonly pattern: A;
  readonly render: () => Element.Element<HTMLElement | SVGElement, E, R>;
}

/**
 * Configuration for the `match` control flow (DOM-specific with animation support).
 */
export interface MatchConfig<A, E = never, R = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /** Array of pattern-render pairs */
  readonly cases: readonly MatchCase<A, E, R>[];
  /** Optional fallback if no pattern matches */
  readonly fallback?: () => Element.Element<HTMLElement | SVGElement, E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
  /**
   * Re-animate the SSR/SSG-rendered case on hydration. See {@link EachConfig.intro}
   * for the full contract and FOUC caveat.
   */
  readonly intro?: boolean;
  /**
   * Optional function to extract the pattern from the value for matching.
   * Use this when the value contains additional information for change detection
   * (like a path) but the pattern matching should use a subset (like route name).
   *
   * @example
   * ```ts
   * match(routeWithPath, {
   *   cases: [{ pattern: "users", render: () => UsersPage() }],
   *   extractPattern: (value) => value?.split("::")[0], // "users::/users/1" -> "users"
   * })
   * ```
   */
  readonly extractPattern?: (value: A) => unknown;
}

/**
 * Configuration for `matchOption` control flow.
 */
export interface MatchOptionConfig<
  A,
  E1 = never,
  R1 = never,
  E2 = never,
  R2 = never,
> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /** Render when Option is Some. Receives unwrapped value as a Readable. */
  readonly onSome: (
    value: Readable<A>,
  ) => Element.Element<HTMLElement | SVGElement, E1, R1>;
  /** Render when Option is None */
  readonly onNone: () => Element.Element<HTMLElement | SVGElement, E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
  /**
   * Re-animate the SSR/SSG-rendered branch on hydration. See {@link EachConfig.intro}
   * for the full contract and FOUC caveat.
   */
  readonly intro?: boolean;
}

/**
 * Configuration for `matchEither` control flow.
 */
export interface MatchEitherConfig<
  A,
  E,
  E1 = never,
  R1 = never,
  E2 = never,
  R2 = never,
> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /** Render when Either is Right. Receives unwrapped value as a Readable. */
  readonly onRight: (
    value: Readable<A>,
  ) => Element.Element<HTMLElement | SVGElement, E1, R1>;
  /** Render when Either is Left. Receives unwrapped error as a Readable. */
  readonly onLeft: (
    error: Readable<E>,
  ) => Element.Element<HTMLElement | SVGElement, E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
  /**
   * Re-animate the SSR/SSG-rendered branch on hydration. See {@link EachConfig.intro}
   * for the full contract and FOUC caveat.
   */
  readonly intro?: boolean;
}

/**
 * Configuration for `animated` — a mount-once wrapper for a single element
 * that applies enter animations on mount (or on hydration when `intro` is
 * set) and can be sequenced across siblings via `animate.group`.
 *
 * Only supports enter-related animation options because the element is
 * never removed; the type surface makes that explicit via {@link
 * EnterOnlyAnimationOptions}. Group membership lives inside `animate.group`
 * (same shape as `each`/`when`/`match`) so a pure-CSS element that only
 * wants to sequence writes `{ animate: { group: g0 } }`.
 */
export interface AnimatedConfig {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /** Enter-lifecycle animation options (no exit). */
  readonly animate?: EnterOnlyAnimationOptions;
  /**
   * Re-animate this element's SSR/SSG-rendered content on hydration. See
   * {@link EachConfig.intro} for the full contract and FOUC caveat.
   */
  readonly intro?: boolean;
}

/**
 * Configuration for the `each` control flow (DOM-specific with animation support).
 */
export interface EachConfig<A, E = never, R = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /** Function to extract a unique key from each item */
  readonly key: (item: A) => string;
  /**
   * Function to render each item.
   * @param item - Readable for the item data (updates when item changes)
   * @param index - Readable for the item's position (updates when items reorder)
   */
  readonly render: (
    item: Readable<A>,
    index: Readable<number>,
  ) => Element.Element<HTMLElement | SVGElement, E, R>;
  /** Optional animation configuration */
  readonly animate?: ListAnimationOptions;
  /**
   * Re-animate SSR/SSG-rendered items on hydration. By default `each` attaches
   * handlers to pre-existing DOM without re-running enter animations (right
   * default for content lists — you don't want every feed re-animating on
   * every page load). Set `intro: true` for decorative sequences (headline
   * letter cascades, opening scenes) where the animation *is* the point and
   * skipping it on hydration defeats the purpose.
   *
   * @remarks
   * There's a brief visual flash between the SSR paint and hydration
   * applying the `enterFrom` state. To eliminate it, hide the container in
   * CSS until hydration completes (e.g. `visibility: hidden` on a class
   * you toggle from your client entry). A first-class FOUC-prevention
   * mechanism is planned for a follow-up.
   *
   * Respects `prefers-reduced-motion` via `runEnterAnimation`.
   */
  readonly intro?: boolean;
}

/**
 * Helper type to extract values from an array of Readables.
 * `[Readable<A>, Readable<B>]` -> `[A, B]`
 */
type ExtractReadableValue<T extends Readable<unknown>> =
  T extends Readable<infer V> ? V : never;

/**
 * Configuration for the `redraw` control flow (DOM-specific).
 *
 * Unlike other control functions, `redraw` completely recreates its content
 * whenever any of the input Readables change. The render callback must not
 * return errors and can only require Scope and RendererContext (which are
 * provided automatically).
 */
export interface RedrawConfig<T extends Readable<unknown>> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<
    HTMLElement | SVGElement,
    never,
    never
  >;
  /**
   * Function to render the content. Called with current values from all
   * Readables whenever any of them change.
   */
  readonly render: (
    values: ExtractReadableValue<T>,
  ) => Element.Element<HTMLElement | SVGElement, never, never>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
  /**
   * Re-animate the SSR/SSG-rendered element on hydration. See {@link EachConfig.intro}
   * for the full contract and FOUC caveat.
   */
  readonly intro?: boolean;
}
