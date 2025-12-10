import { Effect } from "effect";
import type { StaggerFunction } from "./types";

// Re-export types
export type {
  AnimationEndResult,
  AnimationHook,
  AnimationOptions,
  ControlAnimationOptions,
  ListAnimationOptions,
  ListControlAnimationOptions,
  StaggerFunction,
} from "./types";

// Re-export core functions
export { runEnterAnimation, runExitAnimation } from "./core";

// Re-export helpers that might be useful
export { prefersReducedMotion } from "./helpers";

// --- Stagger Utilities ---

/**
 * Create a linear stagger function with fixed delay between items.
 *
 * @example
 * ```ts
 * each(items, keyFn, render, {
 *   animate: {
 *     enter: "fade-in",
 *     stagger: stagger(50)  // 0ms, 50ms, 100ms, 150ms...
 *   }
 * })
 * ```
 */
export const stagger = (delayMs: number): StaggerFunction => {
  return (index: number, _: number) => index * delayMs;
};

/**
 * Create a stagger function that animates from the center outward.
 * Items in the middle animate first, edges animate last.
 *
 * @example
 * ```ts
 * each(items, keyFn, render, {
 *   animate: {
 *     enter: "scale-in",
 *     stagger: staggerFromCenter(30)
 *   }
 * })
 * ```
 */
export const staggerFromCenter = (delayMs: number): StaggerFunction => {
  return (index: number, total: number) => {
    const center = (total - 1) / 2;
    const distanceFromCenter = Math.abs(index - center);
    return distanceFromCenter * delayMs;
  };
};

/**
 * Create a stagger function with easing applied to the delay curve.
 * Useful for creating more natural-feeling staggered animations.
 *
 * @param totalDurationMs - Total duration for all staggers to complete
 * @param easingFn - Easing function (0-1 input, 0-1 output)
 *
 * @example
 * ```ts
 * // Ease-out: items near the end have smaller delays between them
 * const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
 *
 * each(items, keyFn, render, {
 *   animate: {
 *     enter: "slide-in",
 *     stagger: staggerEased(500, easeOut)
 *   }
 * })
 * ```
 */
export const staggerEased = (
  totalDurationMs: number,
  easingFn: (t: number) => number,
): StaggerFunction => {
  return (index: number, total: number) => {
    if (total <= 1) return 0;
    const progress = index / (total - 1);
    return easingFn(progress) * totalDurationMs;
  };
};

// --- Timing Utilities ---

/**
 * Add a delay before running an effect.
 *
 * @example
 * ```ts
 * yield* delay(200, runEnterAnimation(element, options))
 * ```
 */
export const delay = <A, E, R>(
  ms: number,
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => Effect.delay(effect, ms);

/**
 * Run multiple animation effects in sequence.
 *
 * @example
 * ```ts
 * yield* sequence(
 *   runExitAnimation(oldElement, options),
 *   runEnterAnimation(newElement, options)
 * )
 * ```
 */
export const sequence = <A, E, R>(
  ...effects: Effect.Effect<A, E, R>[]
): Effect.Effect<A[], E, R> => Effect.all(effects, { concurrency: 1 });

/**
 * Run multiple animation effects in parallel.
 *
 * @example
 * ```ts
 * yield* parallel(
 *   runExitAnimation(element1, options),
 *   runExitAnimation(element2, options),
 *   runExitAnimation(element3, options)
 * )
 * ```
 */
export const parallel = <A, E, R>(
  ...effects: Effect.Effect<A, E, R>[]
): Effect.Effect<A[], E, R> =>
  Effect.all(effects, { concurrency: "unbounded" });

/**
 * Calculate stagger delay for a given index.
 * Handles both numeric values and stagger functions.
 */
export const calculateStaggerDelay = (
  stagger: number | StaggerFunction | undefined,
  index: number,
  total: number,
): number => {
  if (stagger === undefined) return 0;
  if (typeof stagger === "number") return index * stagger;
  return stagger(index, total);
};
