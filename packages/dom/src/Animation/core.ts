import { Effect } from "effect";

import * as Element from "../Element/index.js";
import {
  forceReflow,
  parseClasses,
  prefersReducedMotion,
  runHook,
  waitForAnimationEnd,
} from "./helpers.js";
import type { AnimationHook, AnimationOptions } from "./types.js";

const DEFAULT_TIMEOUT = 5000;

/**
 * Internal configuration for running an animation.
 */
interface AnimationConfig {
  /** Which lifecycle this is — surfaced in debug logs so callers can trace enter vs exit */
  readonly kind: "enter" | "exit";
  /** Classes to check - if all are missing, skip animation */
  readonly triggerClasses: readonly (string | undefined)[];
  /** Class to apply even when skipping (for final state) */
  readonly skipFinalClass?: string;
  /** Classes to add before reflow */
  readonly addBeforeReflow: readonly (string | undefined)[];
  /** Classes to remove after reflow (triggers CSS transitions) */
  readonly removeAfterReflow: readonly (string | undefined)[];
  /** Classes to add after reflow */
  readonly addAfterReflow: readonly (string | undefined)[];
  /** Classes to remove after animation completes (cleanup) */
  readonly removeAfterAnimation: readonly (string | undefined)[];
  /** Timeout in milliseconds */
  readonly timeout: number;
  /** Hook to run before animation */
  readonly onBefore?: AnimationHook;
  /** Hook to run after animation */
  readonly onAfter?: AnimationHook;
  /** Whether to respect reduced motion preference */
  readonly respectReducedMotion: boolean;
}

/**
 * Core animation runner that handles the common animation lifecycle.
 */
const runAnimation = <E, R>(
  element: Element.Element<HTMLElement, E, R>,
  config: AnimationConfig,
): Effect.Effect<void, E, R> =>
  Effect.gen(function* () {
    const {
      kind,
      triggerClasses,
      skipFinalClass,
      addBeforeReflow,
      removeAfterReflow,
      addAfterReflow,
      removeAfterAnimation,
      timeout,
      onBefore,
      onAfter,
      respectReducedMotion,
    } = config;

    const shouldSkip =
      (respectReducedMotion && prefersReducedMotion()) ||
      triggerClasses.every((c) => !c);

    if (shouldSkip) {
      yield* Effect.logDebug(`${kind} animation: skipped`, {
        reason:
          respectReducedMotion && prefersReducedMotion()
            ? "reduced-motion"
            : "no-trigger-classes",
      }).pipe(Effect.annotateLogs("subsystem", "effex.animation"));
      yield* runHook(onBefore, element);
      if (skipFinalClass) {
        yield* Element.addClass(element, ...parseClasses(skipFinalClass));
      }
      yield* runHook(onAfter, element);
      return;
    }

    // Run the animation
    yield* Effect.logDebug(`${kind} animation: begin`, {
      addBeforeReflow: addBeforeReflow.filter(Boolean),
      addAfterReflow: addAfterReflow.filter(Boolean),
    }).pipe(Effect.annotateLogs("subsystem", "effex.animation"));

    yield* runHook(onBefore, element);

    // Add classes before reflow
    for (const cls of addBeforeReflow) {
      if (cls) {
        yield* Element.addClass(element, ...parseClasses(cls));
      }
    }

    // Force reflow to ensure classes take effect
    yield* forceReflow(element);

    // Remove/add classes after reflow to trigger transitions
    for (const cls of removeAfterReflow) {
      if (cls) {
        yield* Element.removeClass(element, ...parseClasses(cls));
      }
    }
    for (const cls of addAfterReflow) {
      if (cls) {
        yield* Element.addClass(element, ...parseClasses(cls));
      }
    }

    // Wait for animation to complete
    const outcome = yield* waitForAnimationEnd(element, timeout);

    // Cleanup animation classes
    for (const cls of removeAfterAnimation) {
      if (cls) {
        yield* Element.removeClass(element, ...parseClasses(cls));
      }
    }

    yield* runHook(onAfter, element);

    yield* Effect.logDebug(`${kind} animation: end`, {
      endedBy: outcome.endedBy,
    }).pipe(Effect.annotateLogs("subsystem", "effex.animation"));
  }) as Effect.Effect<void, E, R>;

/**
 * Run an enter animation on an element.
 *
 * Sequence:
 * 1. Call onBeforeEnter hook
 * 2. Add enterFrom classes (if provided)
 * 3. Add enter classes
 * 4. Force reflow
 * 5. Remove enterFrom classes (triggers transition)
 * 6. Add enterTo classes
 * 7. Wait for animation/transition to complete
 * 8. Remove enter classes
 * 9. Call onEnter hook
 */
export const runEnterAnimation = <E, R>(
  element: Element.Element<HTMLElement, E, R>,
  options: AnimationOptions,
): Effect.Effect<void, E, R> => {
  const {
    enter,
    enterFrom,
    enterTo,
    timeout = DEFAULT_TIMEOUT,
    respectReducedMotion = true,
    onBeforeEnter,
    onEnter,
  } = options;

  return runAnimation(element, {
    kind: "enter",
    triggerClasses: [enter, enterFrom],
    skipFinalClass: enterTo,
    addBeforeReflow: [enterFrom, enter],
    removeAfterReflow: [enterFrom],
    addAfterReflow: [enterTo],
    removeAfterAnimation: [enter],
    timeout,
    onBefore: onBeforeEnter,
    onAfter: onEnter,
    respectReducedMotion,
  });
};

/**
 * Run an exit animation on an element.
 *
 * Sequence:
 * 1. Call onBeforeExit hook
 * 2. Add exit classes (starting state + transition)
 * 3. Force reflow
 * 4. Add exitTo classes (triggers transition to target state)
 * 5. Wait for animation/transition to complete
 * 6. Remove exit classes
 * 7. Call onExit hook
 *
 * Note: Element is NOT removed from DOM by this function.
 * The caller is responsible for DOM removal after this completes.
 */
export const runExitAnimation = <E, R>(
  element: Element.Element<HTMLElement, E, R>,
  options: AnimationOptions,
): Effect.Effect<void, E, R> => {
  const {
    exit,
    exitTo,
    timeout = DEFAULT_TIMEOUT,
    respectReducedMotion = true,
    onBeforeExit,
    onExit,
  } = options;

  return runAnimation(element, {
    kind: "exit",
    triggerClasses: [exit, exitTo],
    skipFinalClass: undefined,
    addBeforeReflow: [exit],
    removeAfterReflow: [],
    addAfterReflow: [exitTo],
    removeAfterAnimation: [exit, exitTo],
    timeout,
    onBefore: onBeforeExit,
    onAfter: onExit,
    respectReducedMotion,
  });
};
