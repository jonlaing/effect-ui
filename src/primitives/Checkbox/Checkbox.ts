import { Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { component } from "@dom/Component";
import { $ } from "@dom/Element/Element";

/**
 * Checkbox state - can be checked, unchecked, or indeterminate.
 */
export type CheckedState = boolean | "indeterminate";

/**
 * Props for Checkbox component.
 */
export interface CheckboxProps {
  /**
   * The id attribute for the checkbox button.
   */
  readonly id?: string;

  /**
   * The controlled checked state. Pass a Signal for controlled mode.
   */
  readonly checked?: Signal<CheckedState>;

  /**
   * The default checked state for uncontrolled mode.
   * @default false
   */
  readonly defaultChecked?: CheckedState;

  /**
   * Callback fired when the checked state changes.
   */
  readonly onCheckedChange?: (checked: CheckedState) => Effect.Effect<void>;

  /**
   * Whether the checkbox is disabled.
   * @default false
   */
  readonly disabled?: Readable.Reactive<boolean>;

  /**
   * Whether the checkbox is required in a form context.
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
 * A checkbox control with support for checked, unchecked, and indeterminate states.
 *
 * @example
 * ```ts
 * // Uncontrolled
 * Checkbox({ class: "checkbox" })
 *
 * // Controlled
 * const accepted = yield* Signal.make<CheckedState>(false)
 * Checkbox({ checked: accepted, class: "checkbox" })
 *
 * // Indeterminate (for "select all" patterns)
 * const selectAll = yield* Signal.make<CheckedState>("indeterminate")
 * Checkbox({ checked: selectAll, class: "checkbox" })
 *
 * // In a form
 * Checkbox({ name: "terms", required: true })
 * ```
 */
export const Checkbox = component("Checkbox", (props: CheckboxProps) =>
  Effect.gen(function* () {
    const checked: Signal<CheckedState> = props.checked
      ? props.checked
      : yield* Signal.make(props.defaultChecked ?? false);

    // Normalize props to Readables
    const disabled = Readable.of(props.disabled ?? false);
    const required = Readable.of(props.required ?? false);

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        const current = yield* checked.get;
        // Clicking always toggles to checked or unchecked (never to indeterminate)
        const newChecked = current === true ? false : true;
        yield* checked.set(newChecked);

        if (props.onCheckedChange) {
          yield* props.onCheckedChange(newChecked);
        }
      });

    const dataState = checked.map((c) => {
      if (c === "indeterminate") return "indeterminate";
      return c ? "checked" : "unchecked";
    });

    const ariaChecked = checked.map((c) => {
      if (c === "indeterminate") return "mixed";
      return c ? "true" : "false";
    });

    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const ariaRequired = required.map((r) => (r ? "true" : undefined));

    // The indicator shows the check/indeterminate mark
    const indicator = $.span({ "data-checkbox-indicator": "" });

    return yield* $.button(
      {
        type: "button",
        role: "checkbox",
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
      [indicator],
    );
  }),
);
