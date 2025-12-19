import { Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { component } from "@dom/Component";
import { $ } from "@dom/Element/Element";

/**
 * Props for Switch component.
 */
export interface SwitchProps {
  /**
   * The id attribute for the switch button.
   */
  readonly id?: string;

  /**
   * The controlled checked state. Pass a Signal for controlled mode.
   */
  readonly checked?: Signal<boolean>;

  /**
   * The default checked state for uncontrolled mode.
   * @default false
   */
  readonly defaultChecked?: boolean;

  /**
   * Callback fired when the checked state changes.
   */
  readonly onCheckedChange?: (checked: boolean) => Effect.Effect<void>;

  /**
   * Whether the switch is disabled.
   * @default false
   */
  readonly disabled?: Readable.Reactive<boolean>;

  /**
   * Whether the switch is required in a form context.
   * @default false
   */
  readonly required?: Readable.Reactive<boolean>;

  /**
   * The name attribute for form submission.
   */
  readonly name?: string;

  /**
   * The value attribute for form submission.
   * @default "on"
   */
  readonly value?: string;

  /**
   * CSS class name(s) for styling.
   */
  readonly class?: Readable.Reactive<string>;
}

/**
 * A control that toggles between on and off states.
 *
 * Uses `role="switch"` for proper accessibility semantics.
 * Renders a button with a thumb element for styling.
 *
 * @example
 * ```ts
 * // Uncontrolled
 * Switch({ defaultChecked: false, class: "switch" })
 *
 * // Controlled
 * const enabled = yield* Signal.make(false)
 * Switch({ checked: enabled, class: "switch" })
 *
 * // With callback
 * Switch({
 *   onCheckedChange: (checked) => Effect.log(`Switched: ${checked}`)
 * })
 *
 * // In a form
 * Switch({ name: "notifications", value: "enabled" })
 * ```
 */
export const Switch = component("Switch", (props: SwitchProps) =>
  Effect.gen(function* () {
    const checked: Signal<boolean> = props.checked
      ? props.checked
      : yield* Signal.make(props.defaultChecked ?? false);

    // Normalize props to Readables
    const disabled = Readable.of(props.disabled ?? false);
    const required = Readable.of(props.required ?? false);

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        const newChecked = !(yield* checked.get);
        yield* checked.set(newChecked);

        if (props.onCheckedChange) {
          yield* props.onCheckedChange(newChecked);
        }
      });

    const dataState = checked.map((c) => (c ? "checked" : "unchecked"));
    const ariaChecked = checked.map((c) => (c ? "true" : "false"));
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const ariaRequired = required.map((r) => (r ? "true" : undefined));

    // The thumb is a visual element inside the switch
    const thumb = $.span({ "data-switch-thumb": "" });

    return yield* $.button(
      {
        type: "button",
        role: "switch",
        id: props.id,
        class: props.class,
        disabled,
        "aria-checked": ariaChecked,
        "aria-required": ariaRequired,
        "data-state": dataState,
        "data-disabled": dataDisabled,
        name: props.name,
        value: props.value ?? "on",
        onClick: handleClick,
      },
      [thumb],
    );
  }),
);
