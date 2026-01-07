import { Effect } from "effect";
import type { Readable } from "@effex/core";
import { Readable as ReadableNS } from "@effex/core";

/**
 * Options for configuring keyboard navigation behavior.
 */
export interface KeyboardNavOptions {
  /**
   * CSS selector for navigable items.
   * Items matching this selector will be included in keyboard navigation.
   * Use `:not([data-disabled])` to exclude disabled items.
   *
   * @example "[data-tabs-trigger]:not([data-disabled])"
   */
  selector: string;

  /**
   * Orientation of the navigation.
   * - "horizontal": ArrowLeft/ArrowRight for prev/next
   * - "vertical": ArrowUp/ArrowDown for prev/next
   *
   * Can be a static value or a Readable for dynamic orientation.
   */
  orientation: Readable.Reactive<"horizontal" | "vertical">;

  /**
   * Whether navigation should wrap around at the ends.
   * @default true
   */
  loop?: boolean;

  /**
   * Called when focus moves to an item.
   * Useful for "automatic" activation where focus also selects.
   */
  onFocus?: (element: HTMLElement, index: number) => Effect.Effect<void>;

  /**
   * Called when Enter or Space is pressed on a focused item.
   * Useful for "manual" activation.
   */
  onActivate?: (element: HTMLElement, index: number) => Effect.Effect<void>;
}

/**
 * Create a keyboard event handler for arrow key navigation.
 *
 * Supports:
 * - Arrow keys for prev/next navigation (direction based on orientation)
 * - Home/End keys to jump to first/last item
 * - Optional looping at ends
 * - Enter/Space for activation
 *
 * @param options - Configuration options
 * @returns A keyboard event handler function
 *
 * @example
 * ```ts
 * // In Tabs component
 * const handleKeyDown = createKeyboardNav({
 *   selector: "[data-tabs-trigger]:not([data-disabled])",
 *   orientation: ctx.orientation,
 *   loop: true,
 *   onFocus: props.activationMode === "automatic"
 *     ? (el) => ctx.setValue(el.dataset.value!)
 *     : undefined,
 *   onActivate: (el) => ctx.setValue(el.dataset.value!),
 * });
 *
 * return yield* $.div({ onKeyDown: handleKeyDown }, children);
 * ```
 *
 * @example
 * ```ts
 * // In RadioGroup component (always selects on focus)
 * const handleKeyDown = createKeyboardNav({
 *   selector: "[data-radio-item]:not([data-disabled])",
 *   orientation: ctx.orientation,
 *   onFocus: (el) => ctx.setValue(el.dataset.value!),
 * });
 * ```
 */
export const createKeyboardNav = (
  options: KeyboardNavOptions,
): ((e: KeyboardEvent) => Effect.Effect<void>) => {
  const { selector, orientation, loop = true, onFocus, onActivate } = options;
  const orientationReadable = ReadableNS.of(orientation);

  return (e: KeyboardEvent): Effect.Effect<void> =>
    Effect.gen(function* () {
      const orient = yield* orientationReadable.get;
      const isHorizontal = orient === "horizontal";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

      const navKeys = [prevKey, nextKey, "Home", "End"];
      const activateKeys = ["Enter", " "];

      if (![...navKeys, ...activateKeys].includes(e.key)) {
        return;
      }

      const items = Array.from(
        document.querySelectorAll(selector),
      ) as HTMLElement[];

      if (items.length === 0) {
        return;
      }

      const current = items.find(
        (el) =>
          el === document.activeElement ||
          el.contains(document.activeElement as Node),
      );
      const index = current ? items.indexOf(current) : -1;

      // Handle activation (Enter/Space)
      if (activateKeys.includes(e.key)) {
        if (current && onActivate) {
          e.preventDefault();
          yield* onActivate(current, index);
        }
        return;
      }

      // Handle navigation
      e.preventDefault();

      let nextIndex: number;
      if (e.key === prevKey) {
        nextIndex = loop
          ? (index - 1 + items.length) % items.length
          : Math.max(0, index - 1);
      } else if (e.key === nextKey) {
        nextIndex = loop
          ? (index + 1) % items.length
          : Math.min(items.length - 1, index + 1);
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else {
        // End
        nextIndex = items.length - 1;
      }

      const nextItem = items[nextIndex];
      if (nextItem) {
        nextItem.focus();
        if (onFocus) {
          yield* onFocus(nextItem, nextIndex);
        }
      }
    });
};
