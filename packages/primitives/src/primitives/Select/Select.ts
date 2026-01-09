import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import { Derived } from "@effex/dom";
import { Readable } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { component } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { onClickOutside, createKeyboardNav } from "@effex/dom";
import { Element, type ElementRef } from "@effex/dom";
import type { AnimationOptions } from "@effex/dom";
import { calculatePosition } from "../helpers";

/**
 * Context shared between Select parts.
 */
export interface SelectContext {
  /** Whether the select is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Current selected value */
  readonly value: Readable.Readable<string>;
  /** Open the select */
  readonly open: () => Effect.Effect<void>;
  /** Close the select */
  readonly close: () => Effect.Effect<void>;
  /** Toggle the select open state */
  readonly toggle: () => Effect.Effect<void>;
  /** Select a value */
  readonly selectValue: (value: string) => Effect.Effect<void>;
  /** Register an item's display text */
  readonly registerItem: (
    value: string,
    textValue: string,
  ) => Effect.Effect<void>;
  /** Map of value to display text */
  readonly valueLabels: Signal<Map<string, string>>;
  /** Reference to the trigger element */
  readonly triggerRef: ElementRef<HTMLButtonElement>;
  /** Unique ID for the content */
  readonly contentId: string;
  /** Unique ID for the trigger */
  readonly triggerId: string;
  /** Whether the select is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Placeholder text when no value selected */
  readonly placeholder: Readable.Readable<string>;
}

/**
 * Context for Select.Item
 */
export interface SelectItemContext {
  /** The value of this item */
  readonly itemValue: string;
  /** Whether this item is selected */
  readonly isSelected: Readable.Readable<boolean>;
  /** Whether this item is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Register display text for this item (called by ItemText with string children) */
  readonly setTextValue: (text: string) => Effect.Effect<void>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Select state sharing between parts.
 */
export class SelectCtx extends Context.Tag("SelectContext")<
  SelectCtx,
  SelectContext
>() {}

/**
 * Effect Context for Select.Item
 */
export class SelectItemCtx extends Context.Tag("SelectItemContext")<
  SelectItemCtx,
  SelectItemContext
>() {}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for Select.Root
 */
export interface SelectRootProps {
  /** Controlled value */
  readonly value?: Signal<string>;
  /** Default value for uncontrolled usage */
  readonly defaultValue?: string;
  /** Controlled open state */
  readonly open?: Signal<boolean>;
  /** Default open state */
  readonly defaultOpen?: boolean;
  /** Callback when value changes */
  readonly onValueChange?: (value: string) => Effect.Effect<void>;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
  /** Whether the select is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Placeholder text */
  readonly placeholder?: Readable.Reactive<string>;
}

/**
 * Root container for a Select. Manages open/closed state, selected value,
 * and provides context to child components.
 *
 * @example
 * ```ts
 * Select.Root({ placeholder: "Select a fruit" }, [
 *   Select.Trigger({}, [Select.Value({})]),
 *   Select.Content({}, [
 *     Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
 *     Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: SelectRootProps,
  children:
    | Element.Element<never, SelectCtx>
    | Element.Element<never, SelectCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );
    const value = yield* Signal.fromNullable(
      props.value,
      props.defaultValue ?? "",
    );

    const valueLabels = yield* Signal.make<Map<string, string>>(new Map());
    const triggerRef = yield* Element.ref<HTMLButtonElement>();
    const contentId = yield* UniqueId.make("select-content");
    const triggerId = yield* UniqueId.make("select-trigger");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
        if (!newValue) {
          // Return focus to trigger when closing
          yield* triggerRef.pipe(Element.focus, Effect.ignore);
        }
      });

    const selectValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        yield* props.onValueChange?.(newValue) ?? Effect.void;
        yield* setOpenState(false);
      });

    const registerItem = (itemValue: string, textValue: string) =>
      Effect.gen(function* () {
        const currentMap = yield* valueLabels.get;
        const newMap = new Map(currentMap);
        newMap.set(itemValue, textValue);
        yield* valueLabels.set(newMap);
      });

    const disabled = Readable.of(props.disabled ?? false);
    const placeholder = Readable.of(props.placeholder ?? "Select...");

    const ctx: SelectContext = {
      isOpen,
      value,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      toggle: () =>
        Effect.gen(function* () {
          const current = yield* isOpen.get;
          yield* setOpenState(!current);
        }),
      selectValue,
      registerItem,
      valueLabels,
      triggerRef,
      contentId,
      triggerId,
      disabled,
      placeholder,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(SelectCtx, ctx, children),
    );
  });

/**
 * Props for Select.Trigger
 */
export interface SelectTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Button that opens/closes the Select dropdown.
 *
 * @example
 * ```ts
 * Select.Trigger({ class: "select-trigger" }, [
 *   Select.Value({}),
 * ])
 * ```
 */
const Trigger = component(
  "SelectTrigger",
  (props: SelectTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* SelectCtx;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));
      const dataDisabled = ctx.disabled.map((d) => (d ? "" : undefined));

      const handleKeyDown = (event: KeyboardEvent) =>
        Effect.gen(function* () {
          if (yield* ctx.disabled.get) return;

          switch (event.key) {
            case "Enter":
            case " ":
            case "ArrowDown":
            case "ArrowUp":
              event.preventDefault();
              yield* ctx.open();
              break;
          }
        });

      return yield* $.button(
        {
          ref: ctx.triggerRef,
          id: ctx.triggerId,
          class: props.class,
          type: "button",
          role: "combobox",
          "aria-haspopup": "listbox",
          "aria-expanded": ariaExpanded,
          "aria-controls": ctx.contentId,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-select-trigger": "",
          disabled: ctx.disabled,
          onClick: ctx.toggle,
          onKeyDown: handleKeyDown,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for Select.Value
 */
export interface SelectValueProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Placeholder when no value selected */
  readonly placeholder?: Readable.Reactive<string>;
}

/**
 * Displays the selected value's label or placeholder.
 *
 * @example
 * ```ts
 * Select.Value({ placeholder: "Choose..." })
 * ```
 */
const Value = component("SelectValue", (props: SelectValueProps) =>
  Effect.gen(function* () {
    const ctx = yield* SelectCtx;

    // Normalize placeholder prop, falling back to context placeholder
    const placeholderProp = props.placeholder
      ? Readable.of(props.placeholder)
      : ctx.placeholder;

    // Combine value, valueLabels, and placeholder to get display text
    const displayText = yield* Derived.sync(
      [ctx.value, ctx.valueLabels, placeholderProp] as const,
      ([v, labels, placeholder]) => {
        if (!v) return placeholder;
        return labels.get(v) ?? v;
      },
    );
    const isPlaceholder = ctx.value.map((v) => !v);

    return yield* $.span(
      {
        class: props.class,
        "data-select-value": "",
        "data-placeholder": isPlaceholder,
      },
      displayText,
    );
  }),
);

/**
 * Props for Select.Content
 */
export interface SelectContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Positioning side relative to trigger (default: "bottom") */
  readonly side?: Readable.Reactive<"top" | "bottom">;
  /** Alignment along the side axis (default: "start") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Content area for the Select dropdown.
 * Renders in a Portal and is positioned relative to the trigger.
 *
 * @example
 * ```ts
 * Select.Content({ side: "bottom" }, [
 *   Select.Item({ value: "1" }, [Select.ItemText({}, "Option 1")]),
 * ])
 * ```
 */
const Content = component(
  "SelectContent",
  (props: SelectContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* SelectCtx;

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
        triggerEl: HTMLButtonElement | null;
        side: "top" | "bottom";
        align: "start" | "center" | "end";
        sideOffset: number;
      } | null = null;

      // Helper to position and reveal the element
      const positionAndReveal = (el: HTMLElement) => {
        if (positioningContext?.triggerEl) {
          // Measure content dimensions (element is in DOM but hidden)
          const contentRect = el.getBoundingClientRect();

          // Calculate final position using content dimensions
          const anchorRect =
            positioningContext.triggerEl.getBoundingClientRect();
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
              // Get trigger element for positioning (needs sync access for measurement)
              const triggerEl = Element.getUnsafe(ctx.triggerRef);

              // Get current positioning values
              const currentSide = yield* side.get;
              const currentAlign = yield* align.get;
              const currentSideOffset = yield* sideOffset.get;

              const keyboardNav = yield* createKeyboardNav({
                selector: "[data-select-item]:not([data-disabled])",
                orientation: "vertical",
                loop: true,
                onActivate: (el) =>
                  Effect.gen(function* () {
                    const value = el.getAttribute("data-value");
                    if (value) {
                      yield* ctx.selectValue(value);
                    }
                  }),
                onEscape: () =>
                  Effect.gen(function* () {
                    yield* ctx.close();
                    yield* ctx.triggerRef.pipe(Element.focus, Effect.ignore);
                  }),
              });

              const handleKeyDown = (event: KeyboardEvent) =>
                Effect.gen(function* () {
                  // Tab closes select without preventing default
                  if (event.key === "Tab") {
                    yield* ctx.close();
                    return;
                  }
                  yield* keyboardNav(event);
                });

              // Start hidden (opacity: 0) - will be positioned and revealed after DOM insertion
              // Using opacity instead of visibility for better animation compatibility
              // Also suppress any default CSS animations until we're ready
              const contentEl = yield* $.div(
                {
                  id: ctx.contentId,
                  class: props.class,
                  role: "listbox",
                  "aria-labelledby": ctx.triggerId,
                  "data-state": dataState,
                  "data-side": currentSide,
                  "data-select-content": "",
                  tabIndex: -1,
                  style: {
                    position: "fixed",
                    opacity: "0",
                    animation: "none",
                  },
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Click outside handler
              yield* onClickOutside([ctx.triggerRef, contentEl], () =>
                ctx.close(),
              );

              // Store positioning context for onBeforeEnter
              positioningContext = {
                triggerEl,
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
                    Element.focus,
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
                onEnter: (el) => el.pipe(Element.focus),
              },
        }),
      );
    }),
);

/**
 * Props for Select.Item
 */
export interface SelectItemProps {
  /** The value for this item */
  readonly value: string;
  /**
   * Optional display text for this item. Only needed when ItemText has complex children.
   * For simple string children in ItemText, the label is registered automatically.
   */
  readonly textValue?: string;
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * A selectable item within the Select.
 * ItemText with string children will automatically register the display label.
 *
 * @example
 * ```ts
 * // Simple usage - label is registered from ItemText automatically
 * Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")])
 *
 * // With complex children - use textValue for display label
 * Select.Item({ value: "apple", textValue: "Apple" }, [
 *   Select.ItemText({}, [Icon, "Apple"]),
 * ])
 * ```
 */
const Item = (
  props: SelectItemProps,
  children:
    | Element.Element<never, SelectCtx | SelectItemCtx>
    | Element.Element<never, SelectCtx | SelectItemCtx>[],
): Element.Element<never, SelectCtx> =>
  Effect.gen(function* () {
    const ctx = yield* SelectCtx;

    // Register textValue if explicitly provided (as fallback for complex ItemText content).
    // For simple string children in ItemText, it will register automatically.
    if (props.textValue) {
      yield* ctx.registerItem(props.value, props.textValue);
    }

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);

    const isSelected = ctx.value.map((v) => v === props.value);
    const dataState = isSelected.map((selected) =>
      selected ? "checked" : "unchecked",
    );
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    // Create function for ItemText to register string children
    const setTextValue = (text: string) => ctx.registerItem(props.value, text);

    const itemCtx: SelectItemContext = {
      itemValue: props.value,
      isSelected,
      disabled,
      setTextValue,
    };

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;
        yield* ctx.selectValue(props.value);
      });

    return yield* $.div(
      {
        class: props.class,
        role: "option",
        "aria-selected": isSelected.map((s) => (s ? "true" : "false")),
        "data-state": dataState,
        "data-disabled": dataDisabled,
        "data-select-item": "",
        "data-value": props.value,
        tabIndex,
        onClick: handleClick,
      },
      provide(SelectItemCtx, itemCtx, children),
    );
  });

/**
 * Props for Select.ItemText
 */
export interface SelectItemTextProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * The text content of a Select.Item.
 * When children is a string, it automatically registers it as the display label.
 *
 * @example
 * ```ts
 * Select.ItemText({ class: "item-text" }, "Apple")
 * ```
 */
const ItemText = component(
  "SelectItemText",
  (props: SelectItemTextProps, children) =>
    Effect.gen(function* () {
      const itemCtx = yield* SelectItemCtx;

      // If children is a simple string, register it as the display text
      // This allows Select.Value to show the label without needing textValue prop
      if (typeof children === "string") {
        yield* itemCtx.setTextValue(children);
      }

      return yield* $.span(
        {
          class: props.class,
          "data-select-item-text": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for Select.Group
 */
export interface SelectGroupProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Groups related items together.
 *
 * @example
 * ```ts
 * Select.Group({}, [
 *   Select.Label({}, "Fruits"),
 *   Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
 * ])
 * ```
 */
const Group = component("SelectGroup", (props: SelectGroupProps, children) =>
  Effect.gen(function* () {
    return yield* $.div(
      {
        class: props.class,
        role: "group",
        "data-select-group": "",
      },
      children ?? [],
    );
  }),
);

/**
 * Props for Select.Label
 */
export interface SelectLabelProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * Select.Label({}, "Category Name")
 * ```
 */
const Label = component("SelectLabel", (props: SelectLabelProps, children) =>
  Effect.gen(function* () {
    return yield* $.div(
      {
        class: props.class,
        "data-select-label": "",
      },
      children ?? [],
    );
  }),
);

/**
 * Props for Select.Separator
 */
export interface SelectSeparatorProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Visual separator between items or groups.
 *
 * @example
 * ```ts
 * Select.Separator({})
 * ```
 */
const Separator = component("SelectSeparator", (props: SelectSeparatorProps) =>
  Effect.gen(function* () {
    return yield* $.div({
      class: props.class,
      role: "separator",
      "data-select-separator": "",
    });
  }),
);

/**
 * Headless Select primitive for building accessible dropdown selects.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Configurable positioning
 * - Click outside to close
 * - Escape key to close
 * - Keyboard navigation
 * - Portal rendering
 * - ARIA attributes (combobox, listbox, option)
 * - Data attributes for styling
 * - Groups and labels
 * - Automatic label registration from ItemText string children
 *
 * @example
 * ```ts
 * // Basic usage
 * Select.Root({ placeholder: "Select a fruit" }, [
 *   Select.Trigger({}, [Select.Value({})]),
 *   Select.Content({}, [
 *     Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
 *     Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
 *     Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
 *   ]),
 * ])
 *
 * // With groups
 * Select.Root({}, [
 *   Select.Trigger({}, [Select.Value({ placeholder: "Select..." })]),
 *   Select.Content({}, [
 *     Select.Group({}, [
 *       Select.Label({}, "Fruits"),
 *       Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
 *     ]),
 *     Select.Separator({}),
 *     Select.Group({}, [
 *       Select.Label({}, "Vegetables"),
 *       Select.Item({ value: "carrot" }, [Select.ItemText({}, "Carrot")]),
 *     ]),
 *   ]),
 * ])
 * ```
 */
export const Select = {
  Root,
  Trigger,
  Value,
  Content,
  Item,
  ItemText,
  Group,
  Label,
  Separator,
} as const;
