import { Duration, Effect, Fiber, Match, Option, Ref } from "effect";

import { Readable } from "@effex/core";

/**
 * Internal state for typeahead functionality.
 */
interface TypeaheadState {
  readonly buffer: Ref.Ref<string>;
  readonly timerFiber: Ref.Ref<Fiber.RuntimeFiber<void, never> | null>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Handle hierarchy navigation (ArrowRight to expand/enter, ArrowLeft to collapse/exit).
 * Used for TreeView-style navigation patterns.
 *
 * @returns true if the event was handled, false otherwise
 */
const handleHierarchyNavigation = (
  e: KeyboardEvent,
  current: HTMLElement,
  items: HTMLElement[],
  hierarchy: HierarchyOptions,
  onFocus:
    | ((el: Effect.Effect<HTMLElement>, index: number) => Effect.Effect<void>)
    | undefined,
): Effect.Effect<boolean> =>
  Effect.gen(function* () {
    const expandKey = "ArrowRight";
    const collapseKey = "ArrowLeft";

    if (e.key === expandKey) {
      if (hierarchy.isExpanded(current)) {
        // Already expanded - move to first child
        const firstChild = hierarchy.getFirstChild(current);
        if (Option.isSome(firstChild)) {
          e.preventDefault();
          firstChild.value.focus({ preventScroll: true });
          const childIndex = items.indexOf(firstChild.value);
          yield* onFocus?.(Effect.succeed(firstChild.value), childIndex) ??
            Effect.void;
          return true;
        }
      } else {
        // Not expanded - expand it
        e.preventDefault();
        yield* hierarchy.onExpand(current);
        return true;
      }
    }

    if (e.key === collapseKey) {
      if (hierarchy.isExpanded(current)) {
        // Expanded - collapse it
        e.preventDefault();
        yield* hierarchy.onCollapse(current);
        return true;
      } else {
        // Not expanded - move to parent
        const parent = hierarchy.getParent(current);
        if (Option.isSome(parent)) {
          e.preventDefault();
          parent.value.focus({ preventScroll: true });
          const parentIndex = items.indexOf(parent.value);
          yield* onFocus?.(Effect.succeed(parent.value), parentIndex) ??
            Effect.void;
          return true;
        }
      }
    }

    return false;
  });

/**
 * Handle standard arrow key navigation (prev/next/Home/End).
 */
const handleStandardNavigation = (
  e: KeyboardEvent,
  items: HTMLElement[],
  index: number,
  prevKey: string,
  nextKey: string,
  loop: boolean,
  onFocus:
    | ((el: Effect.Effect<HTMLElement>, index: number) => Effect.Effect<void>)
    | undefined,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    e.preventDefault();

    const nextIndex = Match.value(e.key).pipe(
      Match.when(prevKey, () =>
        loop
          ? (index - 1 + items.length) % items.length
          : Math.max(0, index - 1),
      ),
      Match.when(nextKey, () =>
        loop
          ? (index + 1) % items.length
          : Math.min(items.length - 1, index + 1),
      ),
      Match.when("Home", () => 0),
      Match.orElse(() => items.length - 1),
    );

    const nextItem = items[nextIndex];
    if (nextItem) {
      nextItem.focus({ preventScroll: true });
      yield* onFocus?.(Effect.succeed(nextItem), nextIndex) ?? Effect.void;
    }
  });

/**
 * Handle typeahead (type-to-search) functionality.
 * Manages a search buffer that accumulates typed characters
 * and auto-clears after a timeout.
 */
const handleTypeahead = (
  e: KeyboardEvent,
  items: HTMLElement[],
  index: number,
  typeahead: TypeaheadOptions,
  state: TypeaheadState,
  timeout: number,
  onFocus:
    | ((el: Effect.Effect<HTMLElement>, index: number) => Effect.Effect<void>)
    | undefined,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    e.preventDefault();

    // Cancel existing timer fiber
    const existingFiber = yield* Ref.get(state.timerFiber);
    if (existingFiber) {
      yield* Fiber.interrupt(existingFiber);
    }

    // Append to buffer
    yield* Ref.update(state.buffer, (b) => b + e.key.toLowerCase());
    const currentBuffer = yield* Ref.get(state.buffer);

    // Start new timer fiber to reset buffer
    const resetFiber = yield* Effect.sleep(Duration.millis(timeout)).pipe(
      Effect.andThen(Ref.set(state.buffer, "")),
      Effect.andThen(Ref.set(state.timerFiber, null)),
      Effect.fork,
    );
    yield* Ref.set(state.timerFiber, resetFiber);

    // Search for match starting from current position
    const searchStart = index === -1 ? 0 : index;
    for (let i = 0; i < items.length; i++) {
      const checkIndex = (searchStart + i) % items.length;
      const item = items[checkIndex];
      const text = typeahead.getText(item).toLowerCase();

      if (text.startsWith(currentBuffer)) {
        item.focus({ preventScroll: true });
        yield* typeahead.onMatch?.(Effect.succeed(item), checkIndex) ??
          Effect.void;
        yield* onFocus?.(Effect.succeed(item), checkIndex) ?? Effect.void;
        return;
      }
    }

    // No match found - if multiple characters, try searching with just the new character
    // This handles the case where user types a new character that doesn't
    // continue the previous search
    if (currentBuffer.length > 1) {
      const singleChar = e.key.toLowerCase();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const text = typeahead.getText(item).toLowerCase();

        if (text.startsWith(singleChar)) {
          yield* Ref.set(state.buffer, singleChar);
          item.focus({ preventScroll: true });
          yield* typeahead.onMatch?.(Effect.succeed(item), i) ?? Effect.void;
          yield* onFocus?.(Effect.succeed(item), i) ?? Effect.void;
          return;
        }
      }
    }
  });

// ============================================================================
// Types
// ============================================================================

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
   * Takes Effect<HTMLElement> to enable use with Element combinators.
   */
  onMatch?: (
    el: Effect.Effect<HTMLElement>,
    index: number,
  ) => Effect.Effect<void>;

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
   * Takes Effect<HTMLElement> to enable use with Element combinators.
   */
  onFocus?: (
    element: Effect.Effect<HTMLElement>,
    index: number,
  ) => Effect.Effect<void>;

  /**
   * Called when Enter or Space is pressed on a focused item.
   * Useful for "manual" activation.
   * Takes Effect<HTMLElement> to enable use with Element combinators.
   */
  onActivate?: (
    element: Effect.Effect<HTMLElement>,
    index: number,
  ) => Effect.Effect<void>;

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
 * - Typeahead search (with Effect-managed state)
 *
 * @param options - Configuration options
 * @returns An Effect that creates a keyboard event handler function
 *
 * @example
 * ```ts
 * // In Tabs component
 * const handleKeyDown = yield* createKeyboardNav({
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
 * const handleKeyDown = yield* createKeyboardNav({
 *   selector: "[data-radio-item]:not([data-disabled])",
 *   orientation: ctx.orientation,
 *   onFocus: (el) => ctx.setValue(el.dataset.value!),
 * });
 * ```
 */
export const createKeyboardNav = (
  options: KeyboardNavOptions,
): Effect.Effect<(e: KeyboardEvent) => Effect.Effect<void>> =>
  Effect.gen(function* () {
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

    const orientationReadable = Readable.normalize(orientation);
    const typeaheadTimeout = typeahead?.timeout ?? 500;

    // Typeahead state using Effect Refs (persists across handler calls)
    const typeaheadState: TypeaheadState | null = typeahead
      ? {
          buffer: yield* Ref.make(""),
          timerFiber: yield* Ref.make<Fiber.RuntimeFiber<void, never> | null>(
            null,
          ),
        }
      : null;

    return (e: KeyboardEvent): Effect.Effect<void> =>
      Effect.gen(function* () {
        // Determine navigation keys based on orientation
        const orient = yield* orientationReadable.get;
        const isHorizontal = orient === "horizontal";
        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
        const navKeys = [prevKey, nextKey, "Home", "End"];

        // Find all navigable items and current focus
        const items = Array.from(
          document.querySelectorAll(selector),
        ) as HTMLElement[];

        if (items.length === 0) return;

        const current = items.find(
          (el) =>
            el === document.activeElement ||
            el.contains(document.activeElement as Node),
        );
        const index = current ? items.indexOf(current) : -1;

        // Handle Escape
        if (e.key === "Escape" && onEscape) {
          e.preventDefault();
          yield* onEscape();
          return;
        }

        // Handle activation (Enter/Space)
        if ((e.key === "Enter" || e.key === " ") && current && onActivate) {
          e.preventDefault();
          yield* onActivate(Effect.succeed(current), index);
          return;
        }

        // Handle hierarchy navigation (TreeView-style expand/collapse)
        if (hierarchy && current) {
          const handled = yield* handleHierarchyNavigation(
            e,
            current,
            items,
            hierarchy,
            onFocus,
          );
          if (handled) return;
        }

        // Handle standard navigation (arrows, Home, End)
        if (navKeys.includes(e.key)) {
          yield* handleStandardNavigation(
            e,
            items,
            index,
            prevKey,
            nextKey,
            loop,
            onFocus,
          );
          return;
        }

        // Handle typeahead (type-to-search)
        if (
          typeahead &&
          typeaheadState &&
          e.key.length === 1 &&
          !e.ctrlKey &&
          !e.metaKey
        ) {
          yield* handleTypeahead(
            e,
            items,
            index,
            typeahead,
            typeaheadState,
            typeaheadTimeout,
            onFocus,
          );
        }
      });
  });
