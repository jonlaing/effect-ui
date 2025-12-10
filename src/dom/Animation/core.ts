import { Effect } from "effect";
import type { AnimationHook, AnimationOptions } from "./types";
import {
  addClasses,
  forceReflow,
  prefersReducedMotion,
  removeClasses,
  runHook,
  waitForAnimationEvent,
} from "./helpers";

const DEFAULT_TIMEOUT = 5000;

/**
 * Internal configuration for running an animation.
 */
interface AnimationConfig {
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
const runAnimation = (
  element: HTMLElement,
  config: AnimationConfig,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const {
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
      yield* runHook(onBefore, element);
      if (skipFinalClass) addClasses(element, skipFinalClass);
      yield* runHook(onAfter, element);
      return;
    }

    // Run the animation
    yield* runHook(onBefore, element);

    // Add classes before reflow
    for (const cls of addBeforeReflow) {
      if (cls) addClasses(element, cls);
    }

    // Force reflow to ensure classes take effect
    forceReflow(element);

    // Remove/add classes after reflow to trigger transitions
    for (const cls of removeAfterReflow) {
      if (cls) removeClasses(element, cls);
    }
    for (const cls of addAfterReflow) {
      if (cls) addClasses(element, cls);
    }

    // Wait for animation to complete
    yield* waitForAnimationEvent(element, timeout);

    // Cleanup animation classes
    for (const cls of removeAfterAnimation) {
      if (cls) removeClasses(element, cls);
    }

    yield* runHook(onAfter, element);
  });

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
export const runEnterAnimation = (
  element: HTMLElement,
  options: AnimationOptions,
): Effect.Effect<void> => {
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
 * 2. Add exit classes
 * 3. Add exitTo classes (if provided)
 * 4. Force reflow
 * 5. Wait for animation/transition to complete
 * 6. Remove exit classes
 * 7. Call onExit hook
 *
 * Note: Element is NOT removed from DOM by this function.
 * The caller is responsible for DOM removal after this completes.
 */
export const runExitAnimation = (
  element: HTMLElement,
  options: AnimationOptions,
): Effect.Effect<void> => {
  const {
    exit,
    exitTo,
    timeout = DEFAULT_TIMEOUT,
    respectReducedMotion = true,
    onBeforeExit,
    onExit,
  } = options;

  return runAnimation(element, {
    triggerClasses: [exit, exitTo],
    skipFinalClass: undefined,
    addBeforeReflow: [exit, exitTo],
    removeAfterReflow: [],
    addAfterReflow: [],
    removeAfterAnimation: [exit],
    timeout,
    onBefore: onBeforeExit,
    onAfter: onExit,
    respectReducedMotion,
  });
};
