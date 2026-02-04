import type { Effect, Scope } from "effect";

import type { RendererContext } from "@effex/core";

/**
 * Result of waiting for an animation to complete
 */
export type AnimationEndResult =
  | { endedBy: "animation" }
  | { endedBy: "transition" }
  | { endedBy: "timeout" }
  | { endedBy: "skip" };

/**
 * Lifecycle hook that receives an Effect-wrapped HTMLElement for piping.
 * The element is wrapped in Effect.succeed() so Element helpers can be piped.
 *
 * The hook can return an Effect that requires Scope and RendererContext,
 * which are available during component lifecycle.
 *
 * @example
 * ```ts
 * // Pipe Element helpers
 * onEnter: (el) => el.pipe(
 *   Element.setStyles({ animation: "none" }),
 *   Element.focus,
 * )
 *
 * // Or use Effect.gen for complex logic
 * onEnter: (el) => Effect.gen(function* () {
 *   yield* el.pipe(Element.focus);
 *   yield* doSomethingElse();
 * })
 * ```
 */
export type AnimationHook = (
  element: Effect.Effect<HTMLElement>,
) => Effect.Effect<unknown, unknown, Scope.Scope | RendererContext>;

/**
 * Options for enter/exit animations on a single element
 */
export interface AnimationOptions {
  /**
   * CSS class(es) to apply during the enter animation.
   * Multiple classes can be space-separated: "fade-in slide-up"
   */
  enter?: string;

  /**
   * CSS class(es) to apply during the exit animation.
   * Multiple classes can be space-separated: "fade-out slide-down"
   */
  exit?: string;

  /**
   * CSS class(es) for the initial state before enter animation starts.
   * These are removed after the first frame to trigger the transition.
   * Useful for "animate from" states like "opacity-0 translate-y-4"
   */
  enterFrom?: string;

  /**
   * CSS class(es) for the final state after enter animation completes.
   * These persist on the element after animation ends.
   */
  enterTo?: string;

  /**
   * CSS class(es) for the final state after exit animation completes.
   * Applied at the start of exit, removed when element is removed from DOM.
   */
  exitTo?: string;

  /**
   * Maximum time in milliseconds to wait for animation/transition to complete.
   * If exceeded, animation is considered complete.
   * @default 5000
   */
  timeout?: number;

  /**
   * Whether to skip animations when user prefers reduced motion.
   * When true and reduced motion is preferred, animations complete instantly.
   * @default true
   */
  respectReducedMotion?: boolean;

  /**
   * Called before enter animation starts, after element is in DOM
   */
  onBeforeEnter?: AnimationHook;

  /**
   * Called after enter animation completes
   */
  onEnter?: AnimationHook;

  /**
   * Called before exit animation starts
   */
  onBeforeExit?: AnimationHook;

  /**
   * Called after exit animation completes, before element is removed from DOM
   */
  onExit?: AnimationHook;
}

/**
 * Stagger function that calculates delay for each item in a list
 * @param index - Zero-based index of the item
 * @param total - Total number of items being animated
 * @returns Delay in milliseconds
 */
export type StaggerFunction = (index: number, total: number) => number;

/**
 * Options for list animations (used with `each`)
 */
export interface ListAnimationOptions extends AnimationOptions {
  /**
   * Stagger timing for list items.
   * - number: Fixed delay between items in milliseconds
   * - StaggerFunction: Custom function to calculate delay per item
   */
  stagger?: number | StaggerFunction;
}
