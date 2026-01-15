import { Effect } from "effect";

import { $, Component, Readable, Signal, type ClassValue } from "@effex/dom";

/**
 * Props for Toggle.Root component.
 */
export interface ToggleProps {
  /**
   * The id attribute for the toggle button.
   */
  readonly id?: string;

  /**
   * The controlled pressed state. Pass a Signal for controlled mode.
   */
  readonly pressed?: Signal<boolean>;

  /**
   * The default pressed state for uncontrolled mode.
   * @default false
   */
  readonly defaultPressed?: boolean;

  /**
   * Callback fired when the pressed state changes.
   */
  readonly onPressedChange?: (pressed: boolean) => Effect.Effect<void>;

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  readonly disabled?: Readable.Reactive<boolean>;

  /**
   * CSS class name(s) for styling.
   */
  readonly class?: ClassValue;
}

/**
 * A two-state button that can be toggled on or off.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Proper ARIA attributes (aria-pressed)
 * - Disabled state support
 * - CSS styling via data-state attribute
 *
 * @example
 * ```ts
 * // Uncontrolled - manages its own state
 * Toggle({ defaultPressed: false }, "Bold")
 *
 * // Controlled - external state management
 * const isBold = yield* Signal.make(false)
 * Toggle({ pressed: isBold }, "Bold")
 *
 * // With callback
 * Toggle({
 *   defaultPressed: false,
 *   onPressedChange: (pressed) => Effect.log(`Toggled: ${pressed}`)
 * }, "Italic")
 *
 * // Disabled
 * Toggle({ disabled: true }, "Disabled Toggle")
 * ```
 */
export const Toggle = Component.gen(function* (props: ToggleProps, children) {
  // Handle controlled vs uncontrolled state
  const pressed = yield* Signal.fromNullable(
    props.pressed,
    props.defaultPressed ?? false,
  );

  // Normalize disabled to Readable
  const disabled = Readable.of(props.disabled ?? false);

  const handleClick = () =>
    Effect.gen(function* () {
      if (yield* disabled.get) return;

      const newPressed = !(yield* pressed.get);
      yield* pressed.set(newPressed);
      yield* props.onPressedChange?.(newPressed) ?? Effect.void;
    });

  const dataState = pressed.map((p) => (p ? "on" : "off"));
  const ariaPressed = pressed.map((p) => (p ? "true" : "false"));
  const dataDisabled = disabled.map((d) => (d ? "" : undefined));

  return yield* $.button(
    {
      type: "button",
      id: props.id,
      class: props.class,
      disabled,
      "aria-pressed": ariaPressed,
      "data-state": dataState,
      "data-disabled": dataDisabled,
      onClick: handleClick,
    },
    children ?? [],
  );
});
