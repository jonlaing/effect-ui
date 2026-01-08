import { Context, Effect, Stream } from "effect";
import { Signal } from "@effex/dom";
import { Readable } from "@effex/dom";
import { Derived } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { component } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { Ref } from "@effex/dom";
import { onClickOutside } from "@effex/dom";
import { Element } from "@effex/dom";
import type { AnimationOptions } from "@effex/dom";
import { calculatePosition } from "../helpers";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Filter function type for filtering items based on input.
 * @param inputValue - The current input value
 * @param itemTextValue - The text value of the item being filtered
 * @returns true if the item should be shown
 */
export type ComboboxFilterFn = (
  inputValue: string,
  itemTextValue: string,
) => boolean;

/**
 * Default filter function - case-insensitive substring match.
 */
export const defaultFilterFn: ComboboxFilterFn = (inputValue, itemTextValue) =>
  itemTextValue.toLowerCase().includes(inputValue.toLowerCase());

/**
 * Context shared between Combobox parts.
 */
export interface ComboboxContext {
  /** Whether the listbox is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the listbox */
  readonly open: () => Effect.Effect<void>;
  /** Close the listbox */
  readonly close: () => Effect.Effect<void>;

  /** The current input value (what user types) */
  readonly inputValue: Signal<string>;

  /** The selected value (committed selection) */
  readonly value: Readable.Readable<string>;
  /** Select a value */
  readonly selectValue: (value: string) => Effect.Effect<void>;

  /** The currently highlighted item value (keyboard navigation) */
  readonly highlightedValue: Signal<string | null>;
  /** Highlight a specific value */
  readonly highlightValue: (value: string | null) => Effect.Effect<void>;
  /** Highlight the next item */
  readonly highlightNext: () => Effect.Effect<void>;
  /** Highlight the previous item */
  readonly highlightPrev: () => Effect.Effect<void>;
  /** Highlight the first item */
  readonly highlightFirst: () => Effect.Effect<void>;
  /** Highlight the last item */
  readonly highlightLast: () => Effect.Effect<void>;

  /** Register an item */
  readonly registerItem: (
    value: string,
    textValue: string,
    disabled: boolean,
  ) => Effect.Effect<void>;
  /** Unregister an item */
  readonly unregisterItem: (value: string) => Effect.Effect<void>;
  /** Map of registered items */
  readonly items: Signal<Map<string, { textValue: string; disabled: boolean }>>;

  /** Check if an item should be shown based on filter */
  readonly shouldShowItem: (value: string) => Readable.Readable<boolean>;

  /** Unique ID for the content element */
  readonly contentId: string;
  /** Unique ID for the input element */
  readonly inputId: string;
  /** Get the ID for an item by its value */
  readonly getItemId: (value: string) => string;

  /** Reference to the input element */
  readonly inputRef: Ref<HTMLInputElement>;

  /** Whether async loading is in progress */
  readonly isLoading: Readable.Readable<boolean>;

  /** Whether the combobox is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Whether keyboard navigation loops */
  readonly loop: boolean;
}

/**
 * Context for Combobox.Item children.
 */
export interface ComboboxItemContext {
  /** The item's value */
  readonly itemValue: string;
  /** Whether this item is selected */
  readonly isSelected: Readable.Readable<boolean>;
  /** Whether this item is highlighted */
  readonly isHighlighted: Readable.Readable<boolean>;
  /** Whether this item is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Set the text value for this item */
  readonly setTextValue: (text: string) => Effect.Effect<void>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Combobox state sharing between parts.
 */
export class ComboboxCtx extends Context.Tag("ComboboxContext")<
  ComboboxCtx,
  ComboboxContext
>() {}

/**
 * Effect Context for Combobox.Item state sharing.
 */
export class ComboboxItemCtx extends Context.Tag("ComboboxItemContext")<
  ComboboxItemCtx,
  ComboboxItemContext
>() {}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get ordered list of item values from the DOM.
 */
const getItemValues = (contentId: string): string[] => {
  const contentEl = document.getElementById(contentId);
  if (!contentEl) return [];

  const itemEls = Array.from(
    contentEl.querySelectorAll("[data-combobox-item]:not([data-disabled])"),
  ) as HTMLElement[];

  return itemEls
    .map((el) => el.getAttribute("data-value"))
    .filter((v): v is string => v !== null);
};

// ============================================================================
// Components
// ============================================================================

/**
 * Props for Combobox.Root
 */
export interface ComboboxRootProps {
  /** Controlled selected value */
  readonly value?: Signal<string>;
  /** Default selected value (uncontrolled) */
  readonly defaultValue?: string;
  /** Callback when selected value changes */
  readonly onValueChange?: (value: string) => Effect.Effect<void>;

  /** Controlled input value */
  readonly inputValue?: Signal<string>;
  /** Default input value (uncontrolled) */
  readonly defaultInputValue?: string;
  /** Callback when input value changes */
  readonly onInputValueChange?: (value: string) => Effect.Effect<void>;

  /** Controlled open state */
  readonly open?: Signal<boolean>;
  /** Default open state (uncontrolled) */
  readonly defaultOpen?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;

  /** Whether the combobox is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;

  /** Loading state for async operations */
  readonly isLoading?: Readable.Readable<boolean>;

  /**
   * Filter function to determine which items to show.
   * Defaults to case-insensitive substring matching.
   * Set to `null` to disable filtering (for external/async filtering).
   */
  readonly filterFn?: ComboboxFilterFn | null;
}

/**
 * Root container for a Combobox. Manages state and provides context.
 *
 * @example
 * ```ts
 * Combobox.Root({}, [
 *   Combobox.Input({ placeholder: "Search..." }),
 *   Combobox.Content({}, [
 *     Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")]),
 *     Combobox.Item({ value: "banana" }, [Combobox.ItemText({}, "Banana")]),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: ComboboxRootProps,
  children:
    | Element.Element<never, ComboboxCtx>
    | Element.Element<never, ComboboxCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    // State initialization - controlled/uncontrolled pattern
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );
    const value = yield* Signal.fromNullable(
      props.value,
      props.defaultValue ?? "",
    );
    const inputValue = yield* Signal.fromNullable(
      props.inputValue,
      props.defaultInputValue ?? "",
    );

    const highlightedValue = yield* Signal.make<string | null>(null);
    const items = yield* Signal.make<
      Map<string, { textValue: string; disabled: boolean }>
    >(new Map());
    const inputRef = yield* Ref.make<HTMLInputElement>();

    // Generate unique IDs
    const contentId = yield* UniqueId.make("combobox-content");
    const inputId = yield* UniqueId.make("combobox-input");
    const baseItemId = yield* UniqueId.make("combobox-item");

    const loop = props.loop ?? true;
    const disabled = Readable.of(props.disabled ?? false);

    // State change handlers
    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        if (!newValue) {
          yield* highlightedValue.set(null);
          // Return focus to input when closing
          inputRef.current?.focus();
        }
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
      });

    const selectValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        // Update input to show selected text
        const itemMap = yield* items.get;
        const item = itemMap.get(newValue);
        if (item) {
          yield* inputValue.set(item.textValue);
          yield* props.onInputValueChange?.(item.textValue) ?? Effect.void;
        }
        yield* setOpenState(false);
        yield* props.onValueChange?.(newValue) ?? Effect.void;
        // Return focus to input
        const input = inputRef.current;
        input?.focus();
      });

    // Navigation functions
    const highlightNext = () =>
      Effect.gen(function* () {
        const itemValues = getItemValues(contentId);
        if (itemValues.length === 0) return;

        const current = yield* highlightedValue.get;
        const currentIndex = current ? itemValues.indexOf(current) : -1;

        const nextIndex = loop
          ? (currentIndex + 1) % itemValues.length
          : Math.min(itemValues.length - 1, currentIndex + 1);

        yield* highlightedValue.set(itemValues[nextIndex] ?? null);
      });

    const highlightPrev = () =>
      Effect.gen(function* () {
        const itemValues = getItemValues(contentId);
        if (itemValues.length === 0) return;

        const current = yield* highlightedValue.get;
        const currentIndex = current ? itemValues.indexOf(current) : -1;

        const prevIndex = loop
          ? (currentIndex - 1 + itemValues.length) % itemValues.length
          : Math.max(0, currentIndex - 1);

        yield* highlightedValue.set(itemValues[prevIndex] ?? null);
      });

    const highlightFirst = () =>
      Effect.gen(function* () {
        const itemValues = getItemValues(contentId);
        yield* highlightedValue.set(itemValues[0] ?? null);
      });

    const highlightLast = () =>
      Effect.gen(function* () {
        const itemValues = getItemValues(contentId);
        yield* highlightedValue.set(itemValues[itemValues.length - 1] ?? null);
      });

    // Filter function - defaults to case-insensitive substring match
    // Set to null to disable filtering (for external/async filtering)
    const filterFn =
      props.filterFn === null ? null : (props.filterFn ?? defaultFilterFn);

    // Create a function that returns a Readable<boolean> for whether an item should show
    const shouldShowItem = (itemValue: string): Readable.Readable<boolean> => {
      // If filtering is disabled, always show
      if (filterFn === null) {
        return Readable.of(true);
      }

      // Map inputValue to a boolean indicating if this item should show
      // Note: This creates a derived readable that updates when inputValue changes
      return Readable.make(
        Effect.gen(function* () {
          const input = yield* inputValue.get;
          const itemsMap = yield* items.get;
          const item = itemsMap.get(itemValue);
          if (!item) return false;
          // Empty input shows all items
          if (input === "") return true;
          return filterFn(input, item.textValue);
        }),
        () =>
          inputValue.changes.pipe(
            Stream.map(() => true), // Trigger re-evaluation on any change
          ),
      );
    };

    const ctx: ComboboxContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      inputValue,
      value,
      selectValue,
      highlightedValue,
      highlightValue: (v) => highlightedValue.set(v),
      highlightNext,
      highlightPrev,
      highlightFirst,
      highlightLast,
      registerItem: (itemValue, textValue, itemDisabled) =>
        items.update((map) => {
          const newMap = new Map(map);
          newMap.set(itemValue, { textValue, disabled: itemDisabled });
          return newMap;
        }),
      unregisterItem: (itemValue) =>
        items.update((map) => {
          const newMap = new Map(map);
          newMap.delete(itemValue);
          return newMap;
        }),
      items,
      shouldShowItem,
      contentId,
      inputId,
      getItemId: (itemValue) => `${baseItemId}-${itemValue}`,
      inputRef,
      isLoading: props.isLoading ?? Readable.of(false),
      disabled,
      loop,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(ComboboxCtx, ctx, children),
    );
  });

/**
 * Props for Combobox.Input
 */
export interface ComboboxInputProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Placeholder text */
  readonly placeholder?: Readable.Reactive<string>;
  /** Whether the input is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Whether to open on focus (default: true) */
  readonly openOnFocus?: boolean;
}

/**
 * The input field for the Combobox.
 *
 * @example
 * ```ts
 * Combobox.Input({ placeholder: "Search fruits..." })
 * ```
 */
const Input = component(
  "ComboboxInput",
  (props: ComboboxInputProps, _children) =>
    Effect.gen(function* () {
      const ctx = yield* ComboboxCtx;

      const openOnFocus = props.openOnFocus ?? true;
      // Combine context disabled and prop disabled into a single Readable
      const propDisabled = Readable.of(props.disabled ?? false);
      const isDisabled = yield* Derived.sync(
        [ctx.disabled, propDisabled] as const,
        ([ctxD, propD]) => ctxD || propD,
      );

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

      // Derive aria-activedescendant
      const ariaActiveDescendant = Readable.map(ctx.highlightedValue, (hv) =>
        hv ? ctx.getItemId(hv) : undefined,
      );

      const handleInput = (event: InputEvent) =>
        Effect.gen(function* () {
          const target = event.target as HTMLInputElement;
          yield* ctx.inputValue.set(target.value);
          // Open on typing
          yield* ctx.open();
          // Reset highlight when input changes
          yield* ctx.highlightValue(null);
        });

      const handleKeyDown = (event: KeyboardEvent) =>
        Effect.gen(function* () {
          if (yield* isDisabled.get) return;

          const isOpenVal = yield* ctx.isOpen.get;

          switch (event.key) {
            case "ArrowDown":
              event.preventDefault();
              if (!isOpenVal) {
                yield* ctx.open();
                // Delay to allow items to render
                setTimeout(() => {
                  Effect.runSync(ctx.highlightFirst());
                }, 0);
              } else {
                yield* ctx.highlightNext();
              }
              break;

            case "ArrowUp":
              event.preventDefault();
              if (!isOpenVal) {
                yield* ctx.open();
                setTimeout(() => {
                  Effect.runSync(ctx.highlightLast());
                }, 0);
              } else {
                yield* ctx.highlightPrev();
              }
              break;

            case "Home":
              if (isOpenVal) {
                event.preventDefault();
                yield* ctx.highlightFirst();
              }
              break;

            case "End":
              if (isOpenVal) {
                event.preventDefault();
                yield* ctx.highlightLast();
              }
              break;

            case "Enter":
              if (isOpenVal) {
                event.preventDefault();
                const highlighted = yield* ctx.highlightedValue.get;
                if (highlighted) {
                  yield* ctx.selectValue(highlighted);
                }
              }
              break;

            case "Escape":
              if (isOpenVal) {
                event.preventDefault();
                // Restore input to selected value's text
                const selectedValue = yield* ctx.value.get;
                const itemsMap = yield* ctx.items.get;
                const selectedItem = itemsMap.get(selectedValue);
                yield* ctx.inputValue.set(selectedItem?.textValue ?? "");
                yield* ctx.close();
              }
              break;

            case "Tab":
              // Just close, let natural tab behavior happen
              yield* ctx.close();
              break;
          }
        });

      const handleFocus = () =>
        Effect.gen(function* () {
          if (openOnFocus && !(yield* isDisabled.get)) {
            yield* ctx.open();
          }
        });

      // Track blur timeout for cleanup
      let blurTimeout: ReturnType<typeof setTimeout> | null = null;

      const handleBlur = () =>
        Effect.sync(() => {
          // Delay to allow click on item to register
          blurTimeout = setTimeout(() => {
            Effect.runSync(ctx.close());
          }, 150);
        });

      // Cleanup timeout on unmount
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          if (blurTimeout) clearTimeout(blurTimeout);
        }),
      );

      return yield* $.input({
        id: ctx.inputId,
        ref: ctx.inputRef,
        type: "text",
        class: props.class,
        placeholder: props.placeholder,
        disabled: isDisabled,
        role: "combobox",
        "aria-expanded": ariaExpanded,
        "aria-controls": ctx.contentId,
        "aria-autocomplete": "list",
        "aria-activedescendant": ariaActiveDescendant,
        "aria-haspopup": "listbox",
        "data-combobox-input": "",
        "data-state": dataState,
        "data-disabled": isDisabled.map((d) => (d ? "" : undefined)),
        value: ctx.inputValue,
        onInput: handleInput,
        onKeyDown: handleKeyDown,
        onFocus: handleFocus,
        onBlur: handleBlur,
      });
    }),
);

/**
 * Props for Combobox.Content
 */
export interface ComboboxContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Which side to position on (default: "bottom") */
  readonly side?: Readable.Reactive<"top" | "bottom">;
  /** Alignment relative to input (default: "start") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between input and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Content area for the Combobox listbox.
 * Renders in a Portal and is positioned relative to the input.
 *
 * @example
 * ```ts
 * Combobox.Content({}, [
 *   Combobox.Item({ value: "apple" }, "Apple"),
 * ])
 * ```
 */
const Content = component(
  "ComboboxContent",
  (props: ComboboxContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ComboboxCtx;

      // Normalize positioning props
      const side = Readable.of(props.side ?? "bottom");
      const align = Readable.of(props.align ?? "start");
      const sideOffset = Readable.of(props.sideOffset ?? 4);

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      // Portal is always rendered, but the content inside uses `when` for animations.
      // This ensures animations apply to the actual visible content, not a placeholder.
      //
      // We use onBeforeEnter to measure and position the content after DOM insertion
      // but before animation starts. This avoids using CSS transform for positioning,
      // which would conflict with transform-based animations.

      // Positioning context - set in onTrue, used in positionAndReveal
      let positioningContext: {
        inputEl: HTMLInputElement | null;
        side: "top" | "bottom";
        align: "start" | "center" | "end";
        sideOffset: number;
      } | null = null;

      // Helper to position and reveal the element
      const positionAndReveal = (el: HTMLElement) => {
        if (positioningContext?.inputEl) {
          // Measure content dimensions (element is in DOM but hidden)
          const contentRect = el.getBoundingClientRect();

          // Calculate final position using content dimensions
          const anchorRect = positioningContext.inputEl.getBoundingClientRect();
          const { top, left } = calculatePosition(
            anchorRect,
            positioningContext.side,
            positioningContext.align,
            positioningContext.sideOffset,
            0,
            contentRect.width,
            contentRect.height,
          );

          // Apply final position
          el.style.top = `${top}px`;
          el.style.left = `${left}px`;
          el.style.minWidth = `${anchorRect.width}px`;
        }

        // Clean up
        positioningContext = null;

        // Reveal: clear opacity and animation suppression to allow CSS/JS animations
        el.style.opacity = "";
        el.style.animation = "";
      };

      return yield* Portal(() =>
        when(ctx.isOpen, {
          onTrue: () =>
            Effect.gen(function* () {
              const inputEl = ctx.inputRef.current;

              // Get current positioning values
              const currentSide = yield* side.get;
              const currentAlign = yield* align.get;
              const currentSideOffset = yield* sideOffset.get;

              // Start hidden (opacity: 0) - will be positioned and revealed after DOM insertion
              // Using opacity instead of visibility for better animation compatibility
              // Also suppress any default CSS animations until we're ready
              const contentEl = yield* $.div(
                {
                  id: ctx.contentId,
                  class: props.class,
                  role: "listbox",
                  "aria-labelledby": ctx.inputId,
                  "data-combobox-content": "",
                  "data-state": dataState,
                  "data-side": currentSide,
                  "data-align": currentAlign,
                  tabIndex: -1,
                  style: {
                    position: "fixed",
                    opacity: "0",
                    animation: "none",
                  },
                },
                children ?? [],
              );

              // Click outside handler
              yield* onClickOutside([ctx.inputRef, contentEl], () =>
                ctx.close(),
              );

              // Store positioning context for onBeforeEnter
              positioningContext = {
                inputEl,
                side: currentSide,
                align: currentAlign,
                sideOffset: currentSideOffset,
              };

              return contentEl;
            }),
          onFalse: () => $.div({ style: { display: "none" } }),
          animate: props.animate
            ? {
                ...props.animate,
                onBeforeEnter: (el) =>
                  el.pipe(
                    Element.tap(positionAndReveal),
                    Element.tapEffect(
                      () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
                    ),
                  ),
                onEnter: (el) =>
                  el.pipe(
                    // Suppress any default CSS animations after our animation finishes
                    // to prevent them from restarting when the enter class is removed
                    Element.setStyles({ animation: "none" }),
                    Element.tapEffect(
                      () => props.animate?.onEnter?.(el) ?? Effect.void,
                    ),
                  ),
                onBeforeExit: (el) =>
                  el.pipe(
                    // Re-enable animations so exit animation can run
                    Element.setStyles({ animation: "" }),
                    Element.tapEffect(
                      () => props.animate?.onBeforeExit?.(el) ?? Effect.void,
                    ),
                  ),
              }
            : {
                // Minimal animation config just to trigger positioning via onBeforeEnter
                onBeforeEnter: (el) => el.pipe(Element.tap(positionAndReveal)),
              },
        }),
      );
    }),
);

/**
 * Props for Combobox.Item
 */
export interface ComboboxItemProps {
  /** The value for this item */
  readonly value: string;
  /** Text value for display (auto-detected from ItemText if not provided) */
  readonly textValue?: string;
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * An item in the Combobox listbox.
 * Automatically filtered based on the filter function.
 *
 * @example
 * ```ts
 * Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")])
 * ```
 */
const Item = (
  props: ComboboxItemProps,
  children:
    | Element.Element<never, ComboboxCtx | ComboboxItemCtx>
    | Element.Element<never, ComboboxCtx | ComboboxItemCtx>[],
): Element.Element<never, ComboboxCtx> =>
  Effect.gen(function* () {
    const ctx = yield* ComboboxCtx;

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);
    const disabledValue = yield* disabled.get;

    // Text value signal for ItemText to set
    const textValueSignal = yield* Signal.make(props.textValue ?? props.value);

    // Register item on mount (needs to happen before filtering can work)
    const textVal = yield* textValueSignal.get;
    yield* ctx.registerItem(props.value, textVal, disabledValue);

    // Unregister on unmount
    yield* Effect.addFinalizer(() => ctx.unregisterItem(props.value));

    // Get the shouldShow readable for this item
    const shouldShow = ctx.shouldShowItem(props.value);

    const isSelected = Readable.map(ctx.value, (v) => v === props.value);
    const isHighlighted = Readable.map(
      ctx.highlightedValue,
      (v) => v === props.value,
    );

    const dataState = Readable.map(isSelected, (s) =>
      s ? "checked" : "unchecked",
    );
    const ariaSelected = Readable.map(isSelected, (s) =>
      s ? "true" : "false",
    );
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;
        yield* ctx.selectValue(props.value);
      });

    const handleMouseEnter = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;
        yield* ctx.highlightValue(props.value);
      });

    const itemCtx: ComboboxItemContext = {
      itemValue: props.value,
      isSelected,
      isHighlighted,
      disabled,
      setTextValue: (text: string) =>
        Effect.gen(function* () {
          yield* textValueSignal.set(text);
          const currentDisabled = yield* disabled.get;
          yield* ctx.registerItem(props.value, text, currentDisabled);
        }),
    };

    // Conditionally render based on filter
    return yield* when(shouldShow, {
      onTrue: () =>
        $.div(
          {
            id: ctx.getItemId(props.value),
            class: props.class,
            role: "option",
            "aria-selected": ariaSelected,
            "aria-disabled": disabled.map((d) => (d ? "true" : undefined)),
            "data-combobox-item": "",
            "data-value": props.value,
            "data-state": dataState,
            "data-highlighted": Readable.map(isHighlighted, (h) =>
              h ? "" : undefined,
            ),
            "data-disabled": dataDisabled,
            tabIndex: disabled.map((d) => (d ? -1 : 0)),
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
          },
          provide(ComboboxItemCtx, itemCtx, children),
        ),
      onFalse: () => $.div({ style: { display: "none" } }),
      animate: props.animate,
    });
  });

/**
 * Props for Combobox.ItemText
 */
export interface ComboboxItemTextProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Text content for a Combobox item.
 * Automatically registers the text as the item's display value.
 *
 * @example
 * ```ts
 * Combobox.ItemText({}, "Apple")
 * ```
 */
const ItemText = component(
  "ComboboxItemText",
  (props: ComboboxItemTextProps, children) =>
    Effect.gen(function* () {
      const itemCtx = yield* ComboboxItemCtx;

      // Auto-register text value if children is a string
      if (typeof children === "string") {
        yield* itemCtx.setTextValue(children);
      }

      return yield* $.span(
        {
          class: props.class,
          "data-combobox-item-text": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for Combobox.Group
 */
export interface ComboboxGroupProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Groups related items together.
 *
 * @example
 * ```ts
 * Combobox.Group({}, [
 *   Combobox.Label({}, "Fruits"),
 *   Combobox.Item({ value: "apple" }, "Apple"),
 * ])
 * ```
 */
const Group = component(
  "ComboboxGroup",
  (props: ComboboxGroupProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          role: "group",
          "data-combobox-group": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for Combobox.Label
 */
export interface ComboboxLabelProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * Combobox.Label({}, "Fruits")
 * ```
 */
const Label = component(
  "ComboboxLabel",
  (props: ComboboxLabelProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          "data-combobox-label": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for Combobox.Empty
 */
export interface ComboboxEmptyProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Shown when no items match the search.
 * Only renders when not loading and no items are present.
 *
 * @example
 * ```ts
 * Combobox.Empty({}, "No results found")
 * ```
 */
const Empty = component(
  "ComboboxEmpty",
  (props: ComboboxEmptyProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ComboboxCtx;

      // Check if items is empty and not loading
      // We need to derive this from both signals
      const itemsEmpty = Readable.map(
        ctx.items,
        (itemsMap) => itemsMap.size === 0,
      );

      // Combine isEmpty and isLoading into shouldShow
      // Since we can't combine readables directly, we derive in stages
      const shouldShow: Readable.Readable<boolean> = {
        get: Effect.gen(function* () {
          const empty = yield* itemsEmpty.get;
          const loading = yield* ctx.isLoading.get;
          return empty && !loading;
        }),
        changes: itemsEmpty.changes,
        values: itemsEmpty.values,
        map: (f) => Readable.map(itemsEmpty, (empty) => f(empty)),
      };

      return yield* when(shouldShow, {
        onTrue: () =>
          $.div(
            {
              class: props.class,
              "data-combobox-empty": "",
            },
            children ?? [],
          ),
        onFalse: () => $.div({ style: { display: "none" } }),
        animate: props.animate,
      });
    }),
);

/**
 * Props for Combobox.Loading
 */
export interface ComboboxLoadingProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Shown during async loading.
 * Only renders when isLoading is true.
 *
 * @example
 * ```ts
 * Combobox.Loading({}, "Searching...")
 * ```
 */
const Loading = component(
  "ComboboxLoading",
  (props: ComboboxLoadingProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ComboboxCtx;

      return yield* when(ctx.isLoading, {
        onTrue: () =>
          $.div(
            {
              class: props.class,
              "data-combobox-loading": "",
            },
            children ?? [],
          ),
        onFalse: () => $.div({ style: { display: "none" } }),
        animate: props.animate,
      });
    }),
);

/**
 * Headless Combobox/Autocomplete primitive for building accessible search inputs.
 *
 * Features:
 * - Editable input with filtering support
 * - Async data loading with loading states
 * - Full keyboard navigation (Arrow keys, Home, End, Enter, Escape)
 * - WAI-ARIA compliant (combobox, listbox, option roles)
 * - Controlled and uncontrolled modes
 * - Highlight tracking separate from selection
 * - Portal rendering
 * - Data attributes for styling
 *
 * @example
 * ```ts
 * // Basic usage
 * Combobox.Root({}, [
 *   Combobox.Input({ placeholder: "Search fruits..." }),
 *   Combobox.Content({}, [
 *     Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")]),
 *     Combobox.Item({ value: "banana" }, [Combobox.ItemText({}, "Banana")]),
 *     Combobox.Item({ value: "cherry" }, [Combobox.ItemText({}, "Cherry")]),
 *   ]),
 * ])
 *
 * // With async loading
 * const inputValue = yield* Signal.make("");
 * const isLoading = yield* Signal.make(false);
 *
 * Combobox.Root({ inputValue, isLoading }, [
 *   Combobox.Input({ placeholder: "Search..." }),
 *   Combobox.Content({}, [
 *     Combobox.Loading({}, "Searching..."),
 *     Combobox.Empty({}, "No results found"),
 *     // ... dynamically rendered items
 *   ]),
 * ])
 * ```
 */
export const Combobox = {
  Root,
  Input,
  Content,
  Item,
  ItemText,
  Group,
  Label,
  Empty,
  Loading,
} as const;
