import { Effect, Scope } from "effect";

/**
 * Get the width of the scrollbar to prevent layout shift when hiding overflow.
 */
const getScrollbarWidth = (): number => {
  // Create a temporary element to measure scrollbar width
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
};

/**
 * Check if the document body is currently scrollable.
 */
const isBodyScrollable = (): boolean => {
  return document.body.scrollHeight > window.innerHeight;
};

/**
 * ScrollLock utility for preventing body scroll.
 *
 * Used by dialogs, modals, and other overlay components to prevent
 * the background from scrolling while the overlay is open.
 *
 * Features:
 * - Prevents body scroll by setting overflow: hidden
 * - Accounts for scrollbar width to prevent layout shift
 * - Automatically restores original styles when scope closes
 *
 * @example
 * ```ts
 * // In a dialog component
 * yield* ScrollLock.lock;
 * // Body scroll is now prevented
 * // When scope closes, scroll is automatically restored
 * ```
 */
export const ScrollLock = {
  /**
   * Lock body scroll. Automatically unlocks when scope closes.
   */
  lock: Effect.gen(function* () {
    // Save current styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = isBodyScrollable() ? getScrollbarWidth() : 0;

    // Apply lock styles
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Restore when scope closes
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }),
    );
  }) as Effect.Effect<void, never, Scope.Scope>,
};
