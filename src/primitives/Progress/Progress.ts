import { Context, Effect } from "effect";
import * as Readable from "@core/Readable";
import { Derived } from "@core/Derived";
import { $ } from "@dom/Element/Element";
import { provide } from "@dom/Control";
import { component } from "@dom/Component";
import type { Element, Child } from "@dom/Element";

// ============================================================================
// Types
// ============================================================================

export type ProgressState = "loading" | "complete" | "indeterminate";

// ============================================================================
// Context Interface
// ============================================================================

export interface ProgressContext {
  /** Current value (null = indeterminate) */
  readonly value: Readable.Readable<number | null>;
  /** Maximum value */
  readonly max: number;
  /** Progress as percentage (0-100) */
  readonly percentage: Readable.Readable<number>;
}

// ============================================================================
// Context Tag
// ============================================================================

export class ProgressCtx extends Context.Tag("ProgressContext")<
  ProgressCtx,
  ProgressContext
>() {}

// ============================================================================
// Props Interfaces
// ============================================================================

export interface ProgressRootProps {
  /** Current progress value (null = indeterminate) */
  readonly value?: number | Readable.Readable<number | null> | null;
  /** Maximum value (default: 100) */
  readonly max?: number;
  /** Custom label for screen readers */
  readonly getValueLabel?: (value: number, max: number) => string;
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

export interface ProgressIndicatorProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

// ============================================================================
// Root Component
// ============================================================================

const Root = (
  props: ProgressRootProps,
  children: Child<never, ProgressCtx> | readonly Child<never, ProgressCtx>[],
): Element =>
  Effect.gen(function* () {
    const max = props.max ?? 100;

    // Normalize value to Readable
    const value: Readable.Readable<number | null> = Readable.of(
      props.value ?? null,
    );

    // Calculate percentage
    const percentage: Readable.Readable<number> = yield* Derived.sync(
      [value],
      ([v]) => {
        if (v === null) return 0;
        return Math.min(100, Math.max(0, (v / max) * 100));
      },
    );

    // Calculate state
    const state: Readable.Readable<ProgressState> = yield* Derived.sync(
      [value],
      ([v]) => {
        if (v === null) return "indeterminate";
        if (v >= max) return "complete";
        return "loading";
      },
    );

    // ARIA attributes
    const ariaValueNow = value.map((v) => (v === null ? undefined : String(v)));

    const ariaValueText = value.map((v) => {
      if (v === null) return undefined;
      if (props.getValueLabel) {
        return props.getValueLabel(v, max);
      }
      return `${Math.round((v / max) * 100)}%`;
    });

    const dataValue = value.map((v) => (v === null ? undefined : String(v)));

    const ctx: ProgressContext = {
      value,
      max,
      percentage,
    };

    return yield* $.div(
      {
        class: props.class,
        role: "progressbar",
        "aria-valuenow": ariaValueNow,
        "aria-valuemin": "0",
        "aria-valuemax": String(max),
        "aria-valuetext": ariaValueText,
        "data-progress-root": "",
        "data-state": state,
        "data-value": dataValue,
        "data-max": String(max),
      },
      provide(ProgressCtx, ctx, children),
    );
  });

// ============================================================================
// Indicator Component
// ============================================================================

const Indicator = component(
  "ProgressIndicator",
  (props: ProgressIndicatorProps) =>
    Effect.gen(function* () {
      const ctx = yield* ProgressCtx;

      // Style for the indicator - uses translateX for the progress effect
      const indicatorStyle = ctx.percentage.map((pct) => ({
        transform: `translateX(-${100 - pct}%)`,
      }));

      return yield* $.div({
        class: props.class,
        "data-progress-indicator": "",
        style: indicatorStyle,
      });
    }),
);

// ============================================================================
// Export
// ============================================================================

/**
 * Headless Progress primitive for building progress bars.
 *
 * Features:
 * - Determinate and indeterminate states
 * - Full ARIA accessibility support
 * - Custom value labels for screen readers
 * - Reactive value updates
 *
 * @example
 * ```ts
 * // Determinate progress
 * Progress.Root({ value: 60, max: 100 }, [
 *   Progress.Indicator({})
 * ])
 *
 * // Indeterminate (loading)
 * Progress.Root({ value: null }, [
 *   Progress.Indicator({})
 * ])
 *
 * // With reactive value
 * const progress = yield* Signal.make(0)
 * Progress.Root({ value: progress }, [
 *   Progress.Indicator({})
 * ])
 * ```
 */
export const Progress = {
  Root,
  Indicator,
} as const;
