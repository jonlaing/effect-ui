import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide } from "@dom/Control";
import { component } from "@dom/Component";
import type { Element } from "@dom/Element";

/**
 * Context shared between RadioGroup parts.
 */
export interface RadioGroupContext {
  /** Current selected value */
  readonly value: Readable.Readable<string>;
  /** Set the selected value */
  readonly setValue: (value: string) => Effect.Effect<void>;
  /** Name attribute for form submission */
  readonly name?: string;
  /** Whether the entire group is disabled */
  readonly disabled: boolean;
  /** Whether selection is required */
  readonly required: boolean;
  /** Orientation (affects keyboard navigation) */
  readonly orientation: "horizontal" | "vertical";
  /** Whether keyboard navigation loops */
  readonly loop: boolean;
}

/**
 * Props for RadioGroup.Root
 */
export interface RadioGroupRootProps {
  /** Controlled value - if provided, component is controlled */
  readonly value?: Signal<string>;
  /** Default value for uncontrolled usage */
  readonly defaultValue?: string;
  /** Callback when value changes */
  readonly onValueChange?: (value: string) => Effect.Effect<void>;
  /** Name attribute for form submission */
  readonly name?: string;
  /** Whether the entire group is disabled */
  readonly disabled?: boolean;
  /** Whether selection is required */
  readonly required?: boolean;
  /** Orientation (default: "vertical") */
  readonly orientation?: "horizontal" | "vertical";
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Props for RadioGroup.Item
 */
export interface RadioGroupItemProps {
  /** Unique value for this radio item */
  readonly value: string;
  /** ID for the item (for label association) */
  readonly id?: string;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Effect Context for RadioGroup state sharing between parts.
 */
export class RadioGroupCtx extends Context.Tag("RadioGroupContext")<
  RadioGroupCtx,
  RadioGroupContext
>() {}

/**
 * Root container for RadioGroup. Manages selected value state and provides
 * context to child components. Handles keyboard navigation.
 *
 * @example
 * ```ts
 * RadioGroup.Root({ defaultValue: "comfortable", name: "spacing" }, [
 *   $.div({ class: "radio-item" }, [
 *     RadioGroup.Item({ value: "default", id: "r1" }),
 *     $.label({ for: "r1" }, "Default"),
 *   ]),
 *   $.div({ class: "radio-item" }, [
 *     RadioGroup.Item({ value: "comfortable", id: "r2" }),
 *     $.label({ for: "r2" }, "Comfortable"),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: RadioGroupRootProps,
  children: Element<never, RadioGroupCtx> | Element<never, RadioGroupCtx>[],
): Element =>
  Effect.gen(function* () {
    const value: Signal<string> = props.value
      ? props.value
      : yield* Signal.make(props.defaultValue ?? "");

    const orientation = props.orientation ?? "vertical";
    const loop = props.loop ?? true;
    const disabled = props.disabled ?? false;
    const required = props.required ?? false;

    const setValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        if (props.onValueChange) {
          yield* props.onValueChange(newValue);
        }
      });

    const ctx: RadioGroupContext = {
      value,
      setValue,
      name: props.name,
      disabled,
      required,
      orientation,
      loop,
    };

    const handleKeyDown = (e: KeyboardEvent) =>
      Effect.gen(function* () {
        const isVertical = orientation === "vertical";
        const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
        const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

        if ([prevKey, nextKey, "Home", "End"].includes(e.key)) {
          e.preventDefault();

          const items = Array.from(
            document.querySelectorAll("[data-radio-item]:not([data-disabled])"),
          ) as HTMLElement[];

          if (items.length === 0) return;

          const currentItem = items.find((t) =>
            t.contains(document.activeElement),
          );
          const index = currentItem ? items.indexOf(currentItem) : -1;

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
            nextIndex = items.length - 1;
          }

          const nextItem = items[nextIndex];
          nextItem?.focus();

          // Radio buttons select on focus (standard behavior)
          const itemValue = nextItem?.getAttribute("data-value");
          if (itemValue) {
            yield* setValue(itemValue);
          }
        }
      });

    return yield* $.div(
      {
        class: props.class,
        role: "radiogroup",
        "aria-required": required ? "true" : undefined,
        "aria-orientation": orientation,
        "data-orientation": orientation,
        "data-disabled": disabled ? "" : undefined,
        onKeyDown: handleKeyDown,
      },
      provide(RadioGroupCtx, ctx, children),
    );
  });

/**
 * Individual radio item button. Renders as a button with role="radio".
 * Uses roving tabindex - only the selected item has tabindex=0.
 *
 * @example
 * ```ts
 * $.div({ class: "radio-item" }, [
 *   RadioGroup.Item({ value: "option1", id: "opt1" }),
 *   $.label({ for: "opt1" }, "Option 1"),
 * ])
 * ```
 */
const Item = component(
  "RadioGroupItem",
  (props: RadioGroupItemProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* RadioGroupCtx;

      const isDisabled = ctx.disabled || props.disabled;
      const isChecked = ctx.value.map((v) => v === props.value);
      const dataState = isChecked.map((c) => (c ? "checked" : "unchecked"));
      const ariaChecked = isChecked.map((c) => (c ? "true" : "false"));
      const tabIndex = isChecked.map((c) => (c ? 0 : -1));

      const handleClick = () =>
        Effect.gen(function* () {
          if (isDisabled) return;
          yield* ctx.setValue(props.value);
        });

      const handleKeyDown = (e: KeyboardEvent) =>
        Effect.gen(function* () {
          if (e.key === " ") {
            e.preventDefault();
            if (!isDisabled) {
              yield* ctx.setValue(props.value);
            }
          }
        });

      // Default indicator (visual dot)
      const defaultIndicator = $.span({
        "data-radio-indicator": "",
        "data-state": dataState,
      });

      return yield* $.button(
        {
          type: "button",
          role: "radio",
          id: props.id,
          class: props.class,
          disabled: isDisabled,
          tabIndex,
          "aria-checked": ariaChecked,
          "data-state": dataState,
          "data-value": props.value,
          "data-disabled": isDisabled ? "" : undefined,
          "data-radio-item": "",
          name: ctx.name,
          onClick: handleClick,
          onKeyDown: handleKeyDown,
        },
        children ?? [defaultIndicator],
      );
    }),
);

/**
 * Headless RadioGroup primitive for building accessible radio button groups.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Horizontal and vertical orientations
 * - Full keyboard support (arrows select and focus, Home, End, Space)
 * - ARIA attributes (role, aria-checked, aria-required, aria-orientation)
 * - Roving tabindex for proper focus management
 * - Data attributes for styling
 * - Form integration via name attribute
 *
 * @example
 * ```ts
 * // Basic usage
 * RadioGroup.Root({ defaultValue: "comfortable", name: "spacing" }, [
 *   $.div({ class: "radio-item" }, [
 *     RadioGroup.Item({ value: "default", id: "r1" }),
 *     $.label({ for: "r1" }, "Default"),
 *   ]),
 *   $.div({ class: "radio-item" }, [
 *     RadioGroup.Item({ value: "comfortable", id: "r2" }),
 *     $.label({ for: "r2" }, "Comfortable"),
 *   ]),
 *   $.div({ class: "radio-item" }, [
 *     RadioGroup.Item({ value: "compact", id: "r3" }),
 *     $.label({ for: "r3" }, "Compact"),
 *   ]),
 * ])
 *
 * // Controlled with horizontal orientation
 * const selected = yield* Signal.make("option1")
 * RadioGroup.Root({
 *   value: selected,
 *   orientation: "horizontal",
 *   onValueChange: (v) => Effect.log(`Selected: ${v}`),
 * }, [...])
 * ```
 */
export const RadioGroup = {
  Root,
  Item,
} as const;
