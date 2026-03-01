import { Effect } from "effect";

import * as Element from "../Element";
import type { AnimationEndResult, AnimationHook } from "./types.js";

const DEFAULT_TIMEOUT = 5000;

/**
 * Check if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Parse space-separated class string into array
 */
export const parseClasses = (classes: string): string[] =>
  classes
    .split(/\s+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

/**
 * Check if element has any active CSS animations or transitions
 */
const hasActiveAnimations = (element: HTMLElement): boolean => {
  const style = getComputedStyle(element);

  // Check for CSS animations
  const animationName = style.animationName;
  const hasAnimation = Boolean(animationName && animationName !== "none");

  // Check for CSS transitions
  const transitionDuration = style.transitionDuration;
  const hasTransition = Boolean(
    transitionDuration &&
    transitionDuration !== "0s" &&
    transitionDuration !== "0ms",
  );

  return hasAnimation || hasTransition;
};

/**
 * Wait for animation or transition to complete on an element.
 * Returns immediately if no animation/transition is detected.
 */
export const waitForAnimationEvent = (
  element: HTMLElement,
  timeout: number = DEFAULT_TIMEOUT,
): Effect.Effect<AnimationEndResult> =>
  Effect.async<AnimationEndResult>((resume) => {
    // Check if we should skip (no animations detected)
    // Use requestAnimationFrame to ensure styles have been applied
    const rafId = requestAnimationFrame(() => {
      if (!hasActiveAnimations(element)) {
        resume(Effect.succeed({ endedBy: "skip" }));
        return;
      }

      let resolved = false;

      const cleanup = () => {
        element.removeEventListener("animationend", handleAnimationEnd);
        element.removeEventListener("transitionend", handleTransitionEnd);
        clearTimeout(timeoutId);
      };

      const resolve = (result: AnimationEndResult) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resume(Effect.succeed(result));
      };

      const handleAnimationEnd = () => resolve({ endedBy: "animation" });
      const handleTransitionEnd = () => resolve({ endedBy: "transition" });
      const handleTimeout = () => {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[effex] Animation timeout reached. The transitionend/animationend event " +
              "did not fire. This usually means your CSS classes are missing the " +
              "transition property. With Tailwind, ensure you have BOTH transition-* " +
              "(e.g., transition-opacity) AND duration-* (e.g., duration-150). " +
              "You may also need the ! prefix for specificity (e.g., !opacity-100).",
            element,
          );
        }
        resolve({ endedBy: "timeout" });
      };

      element.addEventListener("animationend", handleAnimationEnd, {
        once: true,
      });
      element.addEventListener("transitionend", handleTransitionEnd, {
        once: true,
      });

      const timeoutId = setTimeout(handleTimeout, timeout);
    });

    // Return cleanup function for Effect cancellation
    return Effect.sync(() => {
      cancelAnimationFrame(rafId);
    });
  });

/**
 * Execute an animation lifecycle hook.
 * The element is passed directly so hooks can use Element combinators.
 */
export const runHook = <E, R>(
  hook: AnimationHook | undefined,
  element: Element.Element<HTMLElement, E, R>,
): Effect.Effect<void, E, R> => {
  if (!hook) return Effect.void as Effect.Effect<void, E, R>;

  // Pass element directly - hooks can pipe Element combinators
  // Cast needed because AnimationHook has simpler type signature
  return Effect.asVoid(
    hook(element as unknown as Effect.Effect<HTMLElement>),
  ) as Effect.Effect<void, E, R>;
};

/**
 * Force a browser reflow to ensure CSS changes take effect before animation starts.
 * Uses tap to access the raw element and trigger layout calculation.
 */
export const forceReflow = <E, R>(
  element: Element.Element<HTMLElement, E, R>,
): Effect.Effect<void, E, R> =>
  Effect.asVoid(
    Element.tap(element, (el: HTMLElement) => {
      // Reading offsetHeight forces the browser to calculate layout
      void el.offsetHeight;
    }),
  ) as Effect.Effect<void, E, R>;

/**
 * Wait for animation or transition to complete on an Element.
 * This is the Element-based version of waitForAnimationEvent.
 */
export const waitForAnimationEnd = <E, R>(
  element: Element.Element<HTMLElement, E, R>,
  timeout: number = DEFAULT_TIMEOUT,
): Effect.Effect<AnimationEndResult, E, R> =>
  Effect.flatMap(element, (el) =>
    waitForAnimationEvent(el, timeout),
  ) as Effect.Effect<AnimationEndResult, E, R>;
