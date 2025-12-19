import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import { Derived } from "@core/Derived";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide, when } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import { Portal } from "@dom/Portal";
import type { Element } from "@dom/Element";
import { calculatePosition, getTransform } from "../helpers";

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
  readonly triggerRef: Signal<HTMLElement | null>;
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
 * Props for Select.Trigger
 */
export interface SelectTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

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
}

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
 * Props for Select.ItemText
 */
export interface SelectItemTextProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Select.Group
 */
export interface SelectGroupProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Select.Label
 */
export interface SelectLabelProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Select.Separator
 */
export interface SelectSeparatorProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

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
  children: Element<never, SelectCtx> | Element<never, SelectCtx>[],
): Element =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    const value: Signal<string> = props.value
      ? props.value
      : yield* Signal.make(props.defaultValue ?? "");

    const valueLabels = yield* Signal.make<Map<string, string>>(new Map());
    const triggerRef = yield* Signal.make<HTMLElement | null>(null);
    const contentId = yield* UniqueId.make("select-content");
    const triggerId = yield* UniqueId.make("select-trigger");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
      });

    const selectValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        if (props.onValueChange) {
          yield* props.onValueChange(newValue);
        }
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

      const button = yield* $.button(
        {
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

      yield* ctx.triggerRef.set(button);

      return button;
    }),
);

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

      return yield* when(
        ctx.isOpen,
        () =>
          Portal(() =>
            Effect.gen(function* () {
              const triggerEl = yield* ctx.triggerRef.get;

              // Get current positioning values
              const currentSide = yield* side.get;
              const currentAlign = yield* align.get;
              const currentSideOffset = yield* sideOffset.get;

              let positionStyle: Record<string, string> = {
                position: "fixed",
              };

              if (triggerEl) {
                const rect = triggerEl.getBoundingClientRect();
                const { top, left } = calculatePosition(
                  rect,
                  currentSide,
                  currentAlign,
                  currentSideOffset,
                  0,
                );
                const transform = getTransform(currentSide, currentAlign);

                positionStyle = {
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  transform,
                  minWidth: `${rect.width}px`,
                };
              }

              const handleKeyDown = (event: KeyboardEvent) =>
                Effect.gen(function* () {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    yield* ctx.close();
                    // Return focus to trigger
                    const trigger = yield* ctx.triggerRef.get;
                    trigger?.focus();
                  }
                });

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
                  style: positionStyle,
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Click outside handler
              const handleDocumentClick = (e: MouseEvent) => {
                const triggerEl = ctx.triggerRef as unknown as {
                  _value: HTMLElement | null;
                };
                const trigger = triggerEl._value;

                if (
                  contentEl &&
                  !contentEl.contains(e.target as Node) &&
                  trigger &&
                  !trigger.contains(e.target as Node)
                ) {
                  Effect.runSync(ctx.close());
                }
              };

              document.addEventListener("click", handleDocumentClick, true);

              yield* Effect.addFinalizer(() =>
                Effect.sync(() => {
                  document.removeEventListener(
                    "click",
                    handleDocumentClick,
                    true,
                  );
                }),
              );

              contentEl.focus();

              return contentEl;
            }),
          ),
        () => $.div({ style: { display: "none" } }),
      );
    }),
);

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
    | Element<never, SelectCtx | SelectItemCtx>
    | Element<never, SelectCtx | SelectItemCtx>[],
): Element<never, SelectCtx> =>
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

    const handleKeyDown = (event: KeyboardEvent) =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          yield* ctx.selectValue(props.value);
        }
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
        onKeyDown: handleKeyDown,
      },
      provide(SelectItemCtx, itemCtx, children),
    );
  });

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
