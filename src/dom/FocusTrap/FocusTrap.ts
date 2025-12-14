import { Effect, Scope } from "effect";

/**
 * Selector for focusable elements within a container.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * Options for creating a focus trap.
 */
export interface FocusTrapOptions {
  /** Element to trap focus within */
  readonly container: HTMLElement;
  /** Initial element to focus (default: first focusable element) */
  readonly initialFocus?: HTMLElement | null;
  /** Element to return focus to when deactivated (default: previously focused element) */
  readonly returnFocus?: HTMLElement | null;
}

/**
 * Get all focusable elements within a container.
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.offsetParent !== null, // Element is visible
  );
};

/**
 * Create a focus trap that keeps focus within a container element.
 *
 * The focus trap:
 * - Focuses the first focusable element (or initialFocus) when activated
 * - Cycles focus with Tab/Shift+Tab at boundaries
 * - Restores focus to the previously focused element when deactivated
 * - Automatically cleans up when the scope closes
 *
 * @example
 * ```ts
 * // In a dialog component
 * const element = yield* contentRef.get;
 * yield* FocusTrap.make({
 *   container: element,
 *   returnFocus: triggerElement,
 * });
 * // Focus is now trapped within the dialog
 * // When scope closes, focus returns to triggerElement
 * ```
 */
export const FocusTrap = {
  make: (options: FocusTrapOptions): Effect.Effect<void, never, Scope.Scope> =>
    Effect.gen(function* () {
      const { container, initialFocus, returnFocus } = options;
      const previouslyFocused =
        returnFocus ?? (document.activeElement as HTMLElement | null);

      // Keydown handler to trap Tab key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;

        const focusableElements = getFocusableElements(container);
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      // Focus handler to prevent focus from escaping
      const handleFocusIn = (event: FocusEvent) => {
        if (!container.contains(event.target as Node)) {
          event.stopPropagation();
          const focusableElements = getFocusableElements(container);
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      };

      // Add event listeners
      container.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", handleFocusIn);

      // Focus initial element
      const focusableElements = getFocusableElements(container);
      if (initialFocus && container.contains(initialFocus)) {
        initialFocus.focus();
      } else if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        container.setAttribute("tabindex", "-1");
        container.focus();
      }

      // Cleanup when scope closes
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          container.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("focusin", handleFocusIn);

          // Restore focus to previously focused element
          if (
            previouslyFocused &&
            previouslyFocused !== document.body &&
            document.body.contains(previouslyFocused)
          ) {
            previouslyFocused.focus();
          }
        }),
      );
    }),
};
