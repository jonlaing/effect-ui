import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import type { ClassValue } from "@effex/dom";
import { Readable } from "@effex/dom";
import { Derived } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { component } from "@effex/dom";
import { createKeyboardNav } from "@effex/dom";
import { Element } from "@effex/dom";

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
  readonly disabled: Readable.Readable<boolean>;
  /** Whether selection is required */
  readonly required: Readable.Readable<boolean>;
  /** Orientation (affects keyboard navigation) */
  readonly orientation: Readable.Readable<"horizontal" | "vertical">;
  /** Whether keyboard navigation loops */
  readonly loop: boolean;
}

/**
 * Effect Context for RadioGroup state sharing between parts.
 */
export class RadioGroupCtx extends Context.Tag("RadioGroupContext")<
  RadioGroupCtx,
  RadioGroupContext
>() {}

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
  readonly disabled?: Readable.Reactive<boolean>;
  /** Whether selection is required */
  readonly required?: Readable.Reactive<boolean>;
  /** Orientation (default: "vertical") */
  readonly orientation?: Readable.Reactive<"horizontal" | "vertical">;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Additional class names */
  readonly class?: ClassValue;
}

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
  children:
    | Element.Element<never, RadioGroupCtx>
    | Element.Element<never, RadioGroupCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    const value = yield* Signal.fromNullable(
      props.value,
      props.defaultValue ?? "",
    );

    // Normalize props to Readables
    const orientation = Readable.of(props.orientation ?? "vertical");
    const loop = props.loop ?? true;
    const disabled = Readable.of(props.disabled ?? false);
    const required = Readable.of(props.required ?? false);

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

    const setValueFromElement = (el: Effect.Effect<HTMLElement>) =>
      el.pipe(
        Element.getData("value"),
        Effect.flatMap(setValue),
        Effect.ignore,
      );

    // Radio buttons always select on focus (standard behavior)
    const handleKeyDown = yield* createKeyboardNav({
      selector: "[data-radio-item]:not([data-disabled])",
      orientation,
      loop,
      onFocus: setValueFromElement,
      onActivate: setValueFromElement, // Space also selects
    });

    const ariaRequired = required.map((r) => (r ? "true" : undefined));
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    return yield* $.div(
      {
        class: props.class,
        role: "radiogroup",
        "aria-required": ariaRequired,
        "aria-orientation": orientation,
        "data-orientation": orientation,
        "data-disabled": dataDisabled,
        onKeyDown: handleKeyDown,
      },
      provide(
        RadioGroupCtx,
        ctx,
        Array.isArray(children) ? children : [children],
      ),
    );
  });

/**
 * Props for RadioGroup.Item
 */
export interface RadioGroupItemProps {
  /** Unique value for this radio item */
  readonly value: string;
  /** ID for the item (for label association) */
  readonly id?: string;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Additional class names */
  readonly class?: ClassValue;
}

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

      // Normalize item's disabled prop and combine with context disabled
      const itemDisabled = Readable.of(props.disabled ?? false);
      const isDisabled = yield* Derived.sync(
        [ctx.disabled, itemDisabled],
        ([ctxDisabled, propDisabled]) => ctxDisabled || propDisabled,
      );

      const isChecked = ctx.value.map((v) => v === props.value);
      const dataState = isChecked.map((c) => (c ? "checked" : "unchecked"));
      const ariaChecked = isChecked.map((c) => (c ? "true" : "false"));
      const tabIndex = isChecked.map((c) => (c ? 0 : -1));
      const dataDisabled = isDisabled.map((d) => (d ? "" : undefined));

      const handleClick = () =>
        Effect.gen(function* () {
          if (yield* isDisabled.get) return;
          yield* ctx.setValue(props.value);
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
          "data-disabled": dataDisabled,
          "data-radio-item": "",
          name: ctx.name,
          onClick: handleClick,
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
