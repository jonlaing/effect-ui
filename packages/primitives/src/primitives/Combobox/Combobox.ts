import { Effect, Layer } from "effect";

import {
  $,
  Component,
  Derived,
  Element,
  onClickOutside,
  Portal,
  provide,
  Readable,
  Signal,
  UniqueId,
  when,
  type AnimationOptions,
  type ClassValue,
} from "@effex/dom";

import { positionAndReveal } from "./helpers";
import {
  ComboboxContentPositionCtx,
  ComboboxCtx,
  ComboboxItemCtx,
  type ComboboxContext,
  type ComboboxFilterFn,
  type ComboboxItemContext,
} from "./types";

// ============================================================================
// Re-exports
// ============================================================================

export type { ComboboxFilterFn } from "./types";

/**
 * Default filter function - case-insensitive substring match.
 */
export const defaultFilterFn: ComboboxFilterFn = (inputValue, itemTextValue) =>
  itemTextValue.toLowerCase().includes(inputValue.toLowerCase());

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
const Root: Component.Branch<ComboboxRootProps, ComboboxCtx, never> = (
  props,
  children,
) =>
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
    const inputRef = yield* Element.ref<HTMLInputElement>();

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
      filterFn,
      contentId,
      inputId,
      getItemId: (itemValue) => `${baseItemId}-${itemValue}`,
      inputRef,
      isLoading: props.isLoading ?? Readable.of(false),
      disabled,
      loop,
    };

    const childArray = Array.isArray(children) ? children : [children];
    return yield* $.div(
      { style: { display: "contents" } },
      provide(ComboboxCtx, ctx, childArray),
    );
  });

/**
 * Props for Combobox.Input
 */
export interface ComboboxInputProps {
  /** Additional class names */
  readonly class?: ClassValue;
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
const Input: Component.Leaf<ComboboxInputProps, ComboboxCtx> = (props) =>
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
  });

/**
 * Props for Combobox.Content
 */
export interface ComboboxContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
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
const Content: Component.Node<ComboboxContentProps, ComboboxCtx> = (
  props,
  children,
) =>
  Effect.gen(function* () {
    const ctx = yield* ComboboxCtx;
    const contentRef = yield* Element.ref<HTMLDivElement>();

    // Normalize positioning props
    const side = Readable.of(props.side ?? "bottom");
    const align = Readable.of(props.align ?? "start");
    const sideOffset = Readable.of(props.sideOffset ?? 4);

    const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
    const hasPositioned = yield* Signal.make(false);

    // Positioning context for positionAndReveal helper
    const positioningContext = Layer.succeed(ComboboxContentPositionCtx, {
      side,
      align,
      sideOffset,
      hasPositioned,
      setHasPositioned: (bool: boolean) => hasPositioned.set(bool),
    });

    const onBeforeEnter = (el: Effect.Effect<HTMLElement>) =>
      props.animate
        ? el.pipe(
            positionAndReveal,
            Element.tapEffect(
              () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
            ),
            Effect.provide(positioningContext),
            Effect.provideService(ComboboxCtx, ctx),
          )
        : el.pipe(
            positionAndReveal,
            Effect.provide(positioningContext),
            Effect.provideService(ComboboxCtx, ctx),
          );

    const onEnter = (el: Effect.Effect<HTMLElement>) =>
      el.pipe(
        Element.setStyles({ animation: "none" }),
        Element.tapEffect(() => props.animate?.onEnter?.(el) ?? Effect.void),
      );

    const onBeforeExit = (el: Effect.Effect<HTMLElement>) =>
      el.pipe(
        Element.setStyles({ animation: "" }),
        Element.tapEffect(
          () => props.animate?.onBeforeExit?.(el) ?? Effect.void,
        ),
      );

    // Click outside handler
    yield* onClickOutside([ctx.inputRef, contentRef], () => ctx.close());

    return yield* Portal(() =>
      when(ctx.isOpen, {
        onTrue: () =>
          $.div(
            {
              id: ctx.contentId,
              ref: contentRef,
              class: props.class,
              role: "listbox",
              "aria-labelledby": ctx.inputId,
              "data-combobox-content": "",
              "data-state": dataState,
              "data-side": side,
              "data-align": align,
              tabIndex: -1,
              style: {
                position: "fixed",
                opacity: "0",
              },
            },
            children ?? [],
          ),
        onFalse: () => $.div({ style: { display: "none" } }),
        animate: {
          ...(props.animate ?? {}),
          onBeforeEnter,
          onEnter,
          onBeforeExit,
        },
      }),
    );
  });

/**
 * Props for Combobox.Item
 */
export interface ComboboxItemProps {
  /** The value for this item */
  readonly value: string;
  /** Text value for display (auto-detected from ItemText if not provided) */
  readonly textValue?: string;
  /** Additional class names */
  readonly class?: ClassValue;
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
const Item: Component.Branch<
  ComboboxItemProps,
  ComboboxItemCtx,
  ComboboxCtx
> = (props, children) =>
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

    // Compute whether this item should show based on filter
    const shouldShow = ctx.filterFn
      ? yield* Derived.sync(
          [ctx.inputValue, textValueSignal] as const,
          ([input, textValue]) => {
            if (input === "") return true;
            return ctx.filterFn!(input, textValue);
          },
        )
      : Readable.of(true);

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
          provide(
            ComboboxItemCtx,
            itemCtx,
            Array.isArray(children) ? children : [children],
          ),
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
  readonly class?: ClassValue;
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
const ItemText: Component.Node<ComboboxItemTextProps, ComboboxItemCtx> = (
  props,
  children,
) =>
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
  });

/**
 * Props for Combobox.Group
 */
export interface ComboboxGroupProps {
  /** Additional class names */
  readonly class?: ClassValue;
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
const Group: Component.Node<ComboboxGroupProps, ComboboxCtx> = (
  props,
  children,
) =>
  Effect.gen(function* () {
    return yield* $.div(
      {
        class: props.class,
        role: "group",
        "data-combobox-group": "",
      },
      children ?? [],
    );
  });

/**
 * Props for Combobox.Label
 */
export interface ComboboxLabelProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * Combobox.Label({}, "Fruits")
 * ```
 */
const Label: Component.Node<ComboboxLabelProps, ComboboxCtx> = (
  props,
  children,
) =>
  Effect.gen(function* () {
    return yield* $.div(
      {
        class: props.class,
        "data-combobox-label": "",
      },
      children ?? [],
    );
  });

/**
 * Props for Combobox.Empty
 */
export interface ComboboxEmptyProps {
  /** Additional class names */
  readonly class?: ClassValue;
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
const Empty: Component.Node<ComboboxEmptyProps, ComboboxCtx> = (
  props,
  children,
) =>
  Effect.gen(function* () {
    const ctx = yield* ComboboxCtx;

    // Show when items is empty and not loading
    const shouldShow = yield* Derived.sync(
      [ctx.items, ctx.isLoading] as const,
      ([items, loading]) => items.size === 0 && !loading,
    );

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
  });

/**
 * Props for Combobox.Loading
 */
export interface ComboboxLoadingProps {
  /** Additional class names */
  readonly class?: ClassValue;
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
const Loading: Component.Node<ComboboxLoadingProps, ComboboxCtx> = (
  props,
  children,
) =>
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
  });

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
