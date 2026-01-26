import { Effect } from "effect";

import type { AnimationEndResult, AnimationHook } from "./types";

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
const parseClasses = (classes: string): string[] =>
  classes
    .split(/\s+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

/**
 * Add CSS classes to an element
 */
export const addClasses = (
  element: HTMLElement | SVGElement,
  classes: string,
): void => {
  const parsed = parseClasses(classes);
  if (parsed.length > 0) {
    element.classList.add(...parsed);
  }
};

/**
 * Remove CSS classes from an element
 */
export const removeClasses = (
  element: HTMLElement | SVGElement,
  classes: string,
): void => {
  const parsed = parseClasses(classes);
  if (parsed.length > 0) {
    element.classList.remove(...parsed);
  }
};

/**
 * Check if element has any active CSS animations or transitions
 */
const hasActiveAnimations = (element: HTMLElement | SVGElement): boolean => {
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
  element: HTMLElement | SVGElement,
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
      const handleTimeout = () => resolve({ endedBy: "timeout" });

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
 * Wraps the element in an Effect so hooks can use pipeable helpers.
 */
export const runHook = (
  hook: AnimationHook | undefined,
  element: HTMLElement | SVGElement,
): Effect.Effect<void> => {
  if (!hook) return Effect.void;

  // Wrap element in Effect so hooks can pipe Element helpers
  return Effect.asVoid(hook(Effect.succeed(element)));
};

/**
 * Force a browser reflow to ensure CSS changes take effect before animation starts
 */
export const forceReflow = (element: HTMLElement | SVGElement): void => {
  // Reading offsetHeight forces the browser to calculate layout
  if (Object.hasOwn(element, "offsetHeight")) {
    void (element as HTMLElement).offsetHeight;
  }
};
