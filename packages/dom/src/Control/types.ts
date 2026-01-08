import type { Readable } from "@effex/core";
import { Element } from "../Element";
import type {
  AnimationOptions,
  ListAnimationOptions,
} from "../Animation/index.js";

/**
 * Configuration for the `when` control flow (DOM-specific with animation support).
 */
export interface WhenConfig<E1 = never, R1 = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<never, never>;
  /** Element to render when condition is true */
  readonly onTrue: () => Element.Element<E1, R1>;
  /** Element to render when condition is false */
  readonly onFalse: () => Element.Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
}

/**
 * A case for pattern matching.
 */
export interface MatchCase<A, E = never, R = never> {
  readonly pattern: A;
  readonly render: () => Element.Element<E, R>;
}

/**
 * Configuration for the `match` control flow (DOM-specific with animation support).
 */
export interface MatchConfig<A, E = never, R = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<never, never>;
  /** Array of pattern-render pairs */
  readonly cases: readonly MatchCase<A, E, R>[];
  /** Optional fallback if no pattern matches */
  readonly fallback?: () => Element.Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
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
  readonly container?: () => Element.Element<never, never>;
  /** Render when Option is Some. Receives unwrapped value as a Readable. */
  readonly onSome: (value: Readable<A>) => Element.Element<E1, R1>;
  /** Render when Option is None */
  readonly onNone: () => Element.Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
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
  readonly container?: () => Element.Element<never, never>;
  /** Render when Either is Right. Receives unwrapped value as a Readable. */
  readonly onRight: (value: Readable<A>) => Element.Element<E1, R1>;
  /** Render when Either is Left. Receives unwrapped error as a Readable. */
  readonly onLeft: (error: Readable<E>) => Element.Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
}

/**
 * Configuration for the `each` control flow (DOM-specific with animation support).
 */
export interface EachConfig<A, E = never, R = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element.Element<never, never>;
  /** Function to extract a unique key from each item */
  readonly key: (item: A) => string;
  /** Function to render each item (receives a Readable for the item) */
  readonly render: (item: Readable<A>) => Element.Element<E, R>;
  /** Optional animation configuration */
  readonly animate?: ListAnimationOptions;
}
