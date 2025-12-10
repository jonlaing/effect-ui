import { Effect } from "effect";
import type { AnimationOptions } from "./types";
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
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const {
      enter,
      enterFrom,
      enterTo,
      timeout = DEFAULT_TIMEOUT,
      respectReducedMotion = true,
      onBeforeEnter,
      onEnter,
    } = options;

    // Skip if reduced motion preferred and we respect it
    if (respectReducedMotion && prefersReducedMotion()) {
      yield* runHook(onBeforeEnter, element);
      if (enterTo) addClasses(element, enterTo);
      yield* runHook(onEnter, element);
      return;
    }

    // Skip if no enter animation configured
    if (!enter && !enterFrom) {
      yield* runHook(onBeforeEnter, element);
      if (enterTo) addClasses(element, enterTo);
      yield* runHook(onEnter, element);
      return;
    }

    // Run the animation
    yield* runHook(onBeforeEnter, element);

    // Set up initial state
    if (enterFrom) {
      addClasses(element, enterFrom);
    }
    if (enter) {
      addClasses(element, enter);
    }

    // Force reflow before removing enterFrom
    forceReflow(element);

    // Trigger transition by removing initial state
    if (enterFrom) {
      removeClasses(element, enterFrom);
    }
    if (enterTo) {
      addClasses(element, enterTo);
    }

    // Wait for animation to complete
    yield* waitForAnimationEvent(element, timeout);

    // Cleanup
    if (enter) {
      removeClasses(element, enter);
    }

    yield* runHook(onEnter, element);
  });

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
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const {
      exit,
      exitTo,
      timeout = DEFAULT_TIMEOUT,
      respectReducedMotion = true,
      onBeforeExit,
      onExit,
    } = options;

    // Skip if reduced motion preferred and we respect it
    if (respectReducedMotion && prefersReducedMotion()) {
      yield* runHook(onBeforeExit, element);
      yield* runHook(onExit, element);
      return;
    }

    // Skip if no exit animation configured
    if (!exit && !exitTo) {
      yield* runHook(onBeforeExit, element);
      yield* runHook(onExit, element);
      return;
    }

    // Run the animation
    yield* runHook(onBeforeExit, element);

    // Apply exit classes
    if (exit) {
      addClasses(element, exit);
    }
    if (exitTo) {
      addClasses(element, exitTo);
    }

    // Force reflow to ensure classes take effect
    forceReflow(element);

    // Wait for animation to complete
    yield* waitForAnimationEvent(element, timeout);

    // Cleanup (though element is usually about to be removed)
    if (exit) {
      removeClasses(element, exit);
    }

    yield* runHook(onExit, element);
  });
