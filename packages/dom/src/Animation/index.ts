import { Effect } from "effect";

import * as Groups from "./groups.js";
import type { MoveDelta, StaggerFunction } from "./types.js";

// Re-export types
export type {
  AnimationEndResult,
  AnimationHook,
  AnimationOptions,
  EnterOnlyAnimationOptions,
  ListAnimationOptions,
  MoveAnimation,
  MoveDelta,
  StaggerFunction,
} from "./types.js";

export type { AnimationGroup } from "./groups.js";

/**
 * FLIP invert helper — the vanilla 2D translate.
 * `(delta) => \`translate(${delta.x}px, ${delta.y}px)\``
 */
const moveTranslate = (delta: MoveDelta): string =>
  `translate(${delta.x}px, ${delta.y}px)`;

/**
 * FLIP invert helper — 3D translate, promotes the element to its own
 * compositor layer for smoother playback on long lists. Preferred default.
 */
const moveTranslate3d = (delta: MoveDelta): string =>
  `translate3d(${delta.x}px, ${delta.y}px, 0)`;

/**
 * FLIP invert helper — vertical-only translate. Good pick for column
 * layouts (checklists, feeds) where horizontal drift would be noise.
 */
const moveTranslateY = (delta: MoveDelta): string => `translateY(${delta.y}px)`;

/**
 * Group choreography primitives — see `./groups.ts` for the full contract.
 * Plus the built-in FLIP invert helpers used with `each({ animate: { move } })`.
 */
export const Animation = {
  group: Groups.group,
  sequence: Groups.sequence,
  parallel: Groups.parallel,
  skip: Groups.skip,
  awaitDone: Groups.awaitDone,
  moveTranslate,
  moveTranslate3d,
  moveTranslateY,
} as const;

// Re-export core functions
export { runEnterAnimation, runExitAnimation } from "./core.js";

// Re-export helpers that might be useful
export {
  prefersReducedMotion,
  waitForAnimationEvent,
  waitForAnimationEnd,
  forceReflow,
} from "./helpers.js";

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
 * @deprecated Compose your own — `(index, total) => easingFn(index / (total - 1)) * totalDurationMs`. Will be removed in a future major.
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
 * @deprecated Use `Effect.delay(effect, ms)` directly. Will be removed in a future major.
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
 * @deprecated Use `Effect.all([...], { concurrency: 1 })` directly. Will be removed in a future major.
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
 * @deprecated Use `Effect.all([...], { concurrency: "unbounded" })` directly. Will be removed in a future major.
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
 *
 * @deprecated Internal helper — no longer part of the public API. Will be removed in a future major.
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
