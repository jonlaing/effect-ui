import { Effect, Option } from "effect";
import type { Readable } from "@effex/core";
import { Readable as ReadableNS } from "@effex/core";

/**
 * Configuration for typeahead (type-to-search) functionality.
 */
export interface TypeaheadOptions {
  /**
   * Get text content from element for matching.
   * Typically returns the text label of the item.
   *
   * @example (el) => el.textContent ?? ""
   */
  getText: (el: HTMLElement) => string;

  /**
   * Called when typeahead matches an item.
   * The matched item will also receive focus.
   */
  onMatch?: (el: HTMLElement, index: number) => Effect.Effect<void>;

  /**
   * Timeout before resetting the search buffer.
   * @default 500
   */
  timeout?: number;
}

/**
 * Configuration for hierarchical navigation (e.g., TreeView).
 */
export interface HierarchyOptions {
  /**
   * Get the parent item of the current item.
   * Returns None if no parent exists (root level).
   */
  getParent: (el: HTMLElement) => Option.Option<HTMLElement>;

  /**
   * Get the first child item of the current item.
   * Returns None if no children exist.
   */
  getFirstChild: (el: HTMLElement) => Option.Option<HTMLElement>;

  /**
   * Whether the item is currently expanded.
   */
  isExpanded: (el: HTMLElement) => boolean;

  /**
   * Called to expand an item.
   */
  onExpand: (el: HTMLElement) => Effect.Effect<void>;

  /**
   * Called to collapse an item.
   */
  onCollapse: (el: HTMLElement) => Effect.Effect<void>;
}

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

  /**
   * Called when Escape is pressed.
   * Useful for closing menus, dialogs, or canceling operations.
   */
  onEscape?: () => Effect.Effect<void>;

  /**
   * Enable typeahead search (for menus, selects).
   * When enabled, typing characters will search for matching items.
   */
  typeahead?: TypeaheadOptions;

  /**
   * Enable hierarchical navigation (for TreeView).
   * When enabled, ArrowRight expands/enters and ArrowLeft collapses/exits.
   */
  hierarchy?: HierarchyOptions;
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
  const {
    selector,
    orientation,
    loop = true,
    onFocus,
    onActivate,
    onEscape,
    typeahead,
    hierarchy,
  } = options;
  const orientationReadable = ReadableNS.of(orientation);

  // Typeahead state (persists across calls)
  let typeaheadBuffer = "";
  let typeaheadTimer: ReturnType<typeof setTimeout> | null = null;
  const typeaheadTimeout = typeahead?.timeout ?? 500;

  const resetTypeahead = () => {
    typeaheadBuffer = "";
    if (typeaheadTimer) {
      clearTimeout(typeaheadTimer);
      typeaheadTimer = null;
    }
  };

  return (e: KeyboardEvent): Effect.Effect<void> =>
    Effect.gen(function* () {
      const orient = yield* orientationReadable.get;
      const isHorizontal = orient === "horizontal";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

      const navKeys = [prevKey, nextKey, "Home", "End"];
      const activateKeys = ["Enter", " "];

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

      // Handle Escape
      if (e.key === "Escape") {
        if (onEscape) {
          e.preventDefault();
          yield* onEscape();
        }
        return;
      }

      // Handle activation (Enter/Space)
      if (activateKeys.includes(e.key)) {
        if (current && onActivate) {
          e.preventDefault();
          yield* onActivate(current, index);
        }
        return;
      }

      // Handle hierarchy navigation (TreeView-style)
      if (hierarchy && current) {
        // For horizontal orientation: ArrowRight = expand/enter, ArrowLeft = collapse/parent
        // For vertical orientation: same keys but in vertical context
        const expandKey = "ArrowRight";
        const collapseKey = "ArrowLeft";

        if (e.key === expandKey) {
          if (hierarchy.isExpanded(current)) {
            // Already expanded - move to first child
            const firstChild = hierarchy.getFirstChild(current);
            if (Option.isSome(firstChild)) {
              e.preventDefault();
              firstChild.value.focus();
              if (onFocus) {
                const childIndex = items.indexOf(firstChild.value);
                yield* onFocus(firstChild.value, childIndex);
              }
              return;
            }
          } else {
            // Not expanded - expand it
            e.preventDefault();
            yield* hierarchy.onExpand(current);
            return;
          }
        }

        if (e.key === collapseKey) {
          if (hierarchy.isExpanded(current)) {
            // Expanded - collapse it
            e.preventDefault();
            yield* hierarchy.onCollapse(current);
            return;
          } else {
            // Not expanded - move to parent
            const parent = hierarchy.getParent(current);
            if (Option.isSome(parent)) {
              e.preventDefault();
              parent.value.focus();
              if (onFocus) {
                const parentIndex = items.indexOf(parent.value);
                yield* onFocus(parent.value, parentIndex);
              }
              return;
            }
          }
        }
      }

      // Handle standard navigation
      if (navKeys.includes(e.key)) {
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
        return;
      }

      // Handle typeahead
      if (typeahead && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();

        // Reset timer
        if (typeaheadTimer) {
          clearTimeout(typeaheadTimer);
        }

        // Append to buffer
        typeaheadBuffer += e.key.toLowerCase();

        // Set new timer
        typeaheadTimer = setTimeout(resetTypeahead, typeaheadTimeout);

        // Search for match
        const searchStart = index === -1 ? 0 : index;
        for (let i = 0; i < items.length; i++) {
          const checkIndex = (searchStart + i) % items.length;
          const item = items[checkIndex];
          const text = typeahead.getText(item).toLowerCase();

          if (text.startsWith(typeaheadBuffer)) {
            item.focus();
            if (typeahead.onMatch) {
              yield* typeahead.onMatch(item, checkIndex);
            }
            if (onFocus) {
              yield* onFocus(item, checkIndex);
            }
            return;
          }
        }

        // No match found - if single character, try searching from beginning
        // This handles the case where user types a new character that doesn't
        // continue the previous search
        if (typeaheadBuffer.length > 1) {
          const singleChar = e.key.toLowerCase();
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const text = typeahead.getText(item).toLowerCase();

            if (text.startsWith(singleChar)) {
              typeaheadBuffer = singleChar;
              item.focus();
              if (typeahead.onMatch) {
                yield* typeahead.onMatch(item, i);
              }
              if (onFocus) {
                yield* onFocus(item, i);
              }
              return;
            }
          }
        }
      }
    });
};
