/**
 * Helper functions and types for Toast component.
 */

import type { Effect } from "effect";

// ============================================================================
// Types
// ============================================================================

/**
 * Available toast positions.
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Toast type/variant for styling.
 */
export type ToastType = "default" | "success" | "error" | "warning" | "info";

/**
 * Swipe direction for dismissing toasts.
 */
export type SwipeDirection = "left" | "right" | "up" | "down";

/**
 * Toast data stored in the provider.
 */
export interface ToastData {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly type: ToastType;
  readonly duration?: number; // ms, undefined = use default, 0 = no auto-dismiss
  readonly action?: {
    readonly label: string;
    readonly onClick: () => Effect.Effect<void>;
  };
  readonly onDismiss?: () => Effect.Effect<void>;
}

/**
 * Options for creating a new toast (id is auto-generated, type defaults to "default").
 */
export interface ToastOptions {
  readonly title?: string;
  readonly description?: string;
  readonly type?: ToastType;
  readonly duration?: number;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => Effect.Effect<void>;
  };
  readonly onDismiss?: () => Effect.Effect<void>;
}

// ============================================================================
// Position Styles
// ============================================================================

/**
 * Get CSS styles for viewport positioning.
 */
export const getViewportStyle = (
  position: ToastPosition,
): Record<string, string> => {
  const base: Record<string, string> = {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    margin: "0",
    listStyle: "none",
    zIndex: "9999",
    outline: "none",
    maxHeight: "100vh",
    pointerEvents: "none",
  };

  switch (position) {
    case "top-left":
      return { ...base, top: "0", left: "0" };
    case "top-center":
      return { ...base, top: "0", left: "50%", transform: "translateX(-50%)" };
    case "top-right":
      return { ...base, top: "0", right: "0" };
    case "bottom-left":
      return {
        ...base,
        bottom: "0",
        left: "0",
        flexDirection: "column-reverse",
      };
    case "bottom-center":
      return {
        ...base,
        bottom: "0",
        left: "50%",
        transform: "translateX(-50%)",
        flexDirection: "column-reverse",
      };
    case "bottom-right":
      return {
        ...base,
        bottom: "0",
        right: "0",
        flexDirection: "column-reverse",
      };
  }
};

/**
 * Get the natural swipe direction based on toast position.
 */
export const getSwipeDirection = (position: ToastPosition): SwipeDirection => {
  if (position.includes("left")) return "left";
  if (position.includes("right")) return "right";
  // For center positions, swipe right by default
  return "right";
};

// ============================================================================
// Swipe Detection
// ============================================================================

export interface SwipeState {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  swiping: boolean;
}

export const createInitialSwipeState = (): SwipeState => ({
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  swiping: false,
});

/**
 * Calculate if swipe threshold has been reached.
 */
export const isSwipeComplete = (
  state: SwipeState,
  direction: SwipeDirection,
  threshold: number,
): boolean => {
  const delta =
    direction === "left" || direction === "right" ? state.deltaX : state.deltaY;

  switch (direction) {
    case "left":
      return delta < -threshold;
    case "right":
      return delta > threshold;
    case "up":
      return delta < -threshold;
    case "down":
      return delta > threshold;
  }
};

/**
 * Get transform style for swipe feedback.
 */
export const getSwipeTransform = (
  state: SwipeState,
  direction: SwipeDirection,
): string => {
  if (!state.swiping) return "";

  if (direction === "left" || direction === "right") {
    return `translateX(${state.deltaX}px)`;
  }
  return `translateY(${state.deltaY}px)`;
};

/**
 * Get opacity based on swipe progress.
 */
export const getSwipeOpacity = (
  state: SwipeState,
  direction: SwipeDirection,
  threshold: number,
): number => {
  if (!state.swiping) return 1;

  const delta =
    direction === "left" || direction === "right"
      ? Math.abs(state.deltaX)
      : Math.abs(state.deltaY);

  // Start fading after 50% of threshold
  const fadeStart = threshold * 0.5;
  if (delta < fadeStart) return 1;

  const fadeProgress = (delta - fadeStart) / (threshold - fadeStart);
  return Math.max(0, 1 - fadeProgress * 0.5);
};

// ============================================================================
// ID Generation
// ============================================================================

let toastIdCounter = 0;

/**
 * Generate a unique toast ID.
 */
export const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}`;
};
