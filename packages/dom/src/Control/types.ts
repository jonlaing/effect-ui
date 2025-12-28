import type { Readable } from "@effex/core";
import type { Element } from "../Element";
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
  readonly container?: () => Element<never, never>;
  /** Element to render when condition is true */
  readonly onTrue: () => Element<E1, R1>;
  /** Element to render when condition is false */
  readonly onFalse: () => Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
}

/**
 * A case for pattern matching.
 */
export interface MatchCase<A, E = never, R = never> {
  readonly pattern: A;
  readonly render: () => Element<E, R>;
}

/**
 * Configuration for the `match` control flow (DOM-specific with animation support).
 */
export interface MatchConfig<A, E = never, R = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element<never, never>;
  /** Array of pattern-render pairs */
  readonly cases: readonly MatchCase<A, E, R>[];
  /** Optional fallback if no pattern matches */
  readonly fallback?: () => Element<E2, R2>;
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
  readonly container?: () => Element<never, never>;
  /** Function to extract a unique key from each item */
  readonly key: (item: A) => string;
  /** Function to render each item (receives a Readable for the item) */
  readonly render: (item: Readable<A>) => Element<E, R>;
  /** Optional animation configuration */
  readonly animate?: ListAnimationOptions;
}
