import { Context, Effect, MutableRef } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { Ref } from "@core/Ref";
import { $ } from "@dom/Element/Element";
import { provide } from "@dom/Control";
import { component } from "@dom/Component";
import type { Element } from "@dom/Element";
import {
  type SliderValue,
  isRangeValue,
  clampAndSnap,
  valueToPercent,
  enforceRange,
  getRangeStyle,
  getThumbStyle,
} from "./helpers.js";

export type { SliderValue };
export { isRangeValue };

/**
 * Context shared between Slider parts.
 */
export interface SliderContext {
  /** Current value(s) - single number or [min, max] tuple */
  readonly value: Readable.Readable<SliderValue>;
  /** Set the full value */
  readonly setValue: (value: SliderValue) => Effect.Effect<void>;
  /** Update a specific thumb's value (0 for single/min, 1 for max in range) */
  readonly setThumbValue: (index: number, value: number) => Effect.Effect<void>;
  /** Minimum allowed value */
  readonly min: number;
  /** Maximum allowed value */
  readonly max: number;
  /** Step increment */
  readonly step: number;
  /** Large step for PageUp/PageDown */
  readonly largeStep: number;
  /** Orientation */
  readonly orientation: "horizontal" | "vertical";
  /** Whether the slider is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Whether it's a range slider */
  readonly isRange: boolean;
  /** Whether values are inverted */
  readonly inverted: boolean;
  /** Track element ref for position calculations */
  readonly trackRef: Ref<HTMLDivElement>;
  /** Register a thumb (returns its index) */
  readonly registerThumb: () => number;
  /** Convert pointer position to value */
  readonly pointerToValue: (clientX: number, clientY: number) => number;
  /** Get percentage position for a value (0-100) */
  readonly valueToPercent: (value: number) => number;
  /** Start dragging a thumb */
  readonly startDrag: (thumbIndex: number) => Effect.Effect<void>;
  /** Stop dragging */
  readonly stopDrag: () => Effect.Effect<void>;
  /** Currently dragging thumb index (-1 if not dragging) */
  readonly draggingThumb: Readable.Readable<number>;
  /** Minimum steps between thumbs in range mode */
  readonly minStepsBetweenThumbs: number;
  /** Register cleanup function for drag listeners */
  readonly setDragCleanup: (cleanup: (() => void) | null) => void;
}

/**
 * Props for Slider.Root
 */
export interface SliderRootProps {
  /** Controlled value - single number or [min, max] tuple for range */
  readonly value?: Signal<SliderValue>;
  /** Default value for uncontrolled usage (type determines single vs range) */
  readonly defaultValue?: SliderValue;
  /** Callback when value changes during drag */
  readonly onValueChange?: (value: SliderValue) => Effect.Effect<void>;
  /** Callback when dragging ends (value committed) */
  readonly onValueCommit?: (value: SliderValue) => Effect.Effect<void>;
  /** Minimum value (default: 0) */
  readonly min?: number;
  /** Maximum value (default: 100) */
  readonly max?: number;
  /** Step increment (default: 1) */
  readonly step?: number;
  /** Large step for PageUp/PageDown (default: step * 10) */
  readonly largeStep?: number;
  /** Orientation (default: "horizontal") */
  readonly orientation?: "horizontal" | "vertical";
  /** Whether the slider is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Invert the slider direction */
  readonly inverted?: boolean;
  /** Minimum steps between thumbs in range mode (default: 0) */
  readonly minStepsBetweenThumbs?: number;
  /** Name attribute for form submission */
  readonly name?: string;
  /** ARIA label */
  readonly "aria-label"?: string;
  /** ID of labelling element */
  readonly "aria-labelledby"?: string;
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Slider.Track
 */
export interface SliderTrackProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Slider.Range
 */
export interface SliderRangeProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Slider.Thumb
 */
export interface SliderThumbProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** ARIA label for this specific thumb */
  readonly "aria-label"?: string;
  /** ID of element that labels this thumb */
  readonly "aria-labelledby"?: string;
  /** ARIA value text (custom readable value) */
  readonly "aria-valuetext"?: string | ((value: number) => string);
}

// ============================================================================
// Context Tag
// ============================================================================

/**
 * Effect Context for Slider state sharing between parts.
 */
export class SliderCtx extends Context.Tag("SliderContext")<
  SliderCtx,
  SliderContext
>() {}

// ============================================================================
// Root Component
// ============================================================================

/**
 * Root container for Slider. Manages value state and provides context.
 */
const Root = (
  props: SliderRootProps,
  children: Element<never, SliderCtx> | Element<never, SliderCtx>[],
): Element =>
  Effect.gen(function* () {
    // Defaults
    const min = props.min ?? 0;
    const max = props.max ?? 100;
    const step = props.step ?? 1;
    const largeStep = props.largeStep ?? Math.max(step * 10, (max - min) / 10);
    const orientation = props.orientation ?? "horizontal";
    const disabled = Readable.of(props.disabled ?? false);
    const inverted = props.inverted ?? false;
    const minStepsBetweenThumbs = props.minStepsBetweenThumbs ?? 0;

    // Create or use controlled value signal
    const defaultVal = props.defaultValue ?? min;
    const value: Signal<SliderValue> = props.value
      ? props.value
      : yield* Signal.make(defaultVal);

    // Determine if range mode from initial value (check controlled value first)
    const initialValue = yield* value.get;
    const isRange = Array.isArray(initialValue);

    // Track ref for position calculations
    const trackRef = yield* Ref.make<HTMLDivElement>();

    // Dragging state
    const draggingThumb = yield* Signal.make<number>(-1);

    // Track cleanup functions for document listeners (to clean up on unmount)
    const dragCleanup = MutableRef.make<(() => void) | null>(null);

    // Thumb registration counter
    const thumbCount = MutableRef.make(0);

    // Convert pointer position to value
    const pointerToValue = (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) return min;

      const rect = track.getBoundingClientRect();
      let percent: number;

      if (orientation === "horizontal") {
        percent = (clientX - rect.left) / rect.width;
        if (inverted) percent = 1 - percent;
      } else {
        // Vertical: bottom is min, top is max
        percent = (rect.bottom - clientY) / rect.height;
        if (inverted) percent = 1 - percent;
      }

      percent = Math.max(0, Math.min(1, percent));
      return clampAndSnap(min + percent * (max - min), min, max, step);
    };

    // Set value with callbacks
    const setValue = (newValue: SliderValue) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        if (props.onValueChange) {
          yield* props.onValueChange(newValue);
        }
      });

    // Set specific thumb value
    const setThumbValue = (index: number, newVal: number) =>
      Effect.gen(function* () {
        const current = yield* value.get;
        const clamped = clampAndSnap(newVal, min, max, step);

        if (isRangeValue(current)) {
          const newRange: [number, number] =
            index === 0 ? [clamped, current[1]] : [current[0], clamped];
          const minGap = minStepsBetweenThumbs * step;
          yield* setValue(enforceRange(newRange, index, minGap));
        } else {
          yield* setValue(clamped);
        }
      });

    // Register thumb
    const registerThumb = (): number => {
      const index = MutableRef.get(thumbCount);
      MutableRef.update(thumbCount, (n) => n + 1);
      return index;
    };

    // Start drag
    const startDrag = (thumbIndex: number) => draggingThumb.set(thumbIndex);

    // Stop drag
    const stopDrag = () =>
      Effect.gen(function* () {
        const idx = yield* draggingThumb.get;
        if (idx >= 0) {
          yield* draggingThumb.set(-1);
          if (props.onValueCommit) {
            const currentValue = yield* value.get;
            yield* props.onValueCommit(currentValue);
          }
        }
      });

    // Set drag cleanup function
    const setDragCleanup = (cleanup: (() => void) | null) => {
      MutableRef.set(dragCleanup, cleanup);
    };

    // Build context
    const ctx: SliderContext = {
      value,
      setValue,
      setThumbValue,
      min,
      max,
      step,
      largeStep,
      orientation,
      disabled,
      isRange,
      inverted,
      trackRef,
      registerThumb,
      pointerToValue,
      valueToPercent: (val: number) => valueToPercent(val, min, max),
      startDrag,
      stopDrag,
      draggingThumb,
      minStepsBetweenThumbs,
      setDragCleanup,
    };

    // Clean up drag listeners on unmount
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        const cleanup = MutableRef.get(dragCleanup);
        if (cleanup) {
          cleanup();
          MutableRef.set(dragCleanup, null);
        }
      }),
    );

    // Hidden input for form submission (if name is provided)
    const hiddenInput = props.name
      ? $.input({
          type: "hidden",
          name: props.name,
          value: value.map((v) =>
            isRangeValue(v) ? `${v[0]},${v[1]}` : String(v),
          ),
        })
      : null;

    return yield* $.div(
      {
        class: props.class,
        style: { position: "relative" },
        "data-slider-root": "",
        "data-orientation": orientation,
        "data-disabled": disabled ? "" : undefined,
        "aria-label": props["aria-label"],
        "aria-labelledby": props["aria-labelledby"],
      },
      [
        ...(hiddenInput ? [hiddenInput] : []),
        ...provide(SliderCtx, ctx, children),
      ],
    );
  });

// ============================================================================
// Track Component
// ============================================================================

/**
 * The track area of the slider. Clickable to jump thumb to position.
 */
const Track = component("SliderTrack", (props: SliderTrackProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* SliderCtx;

    // Handle pointer down on track - jump to position and start drag
    const handlePointerDown = (e: PointerEvent) =>
      Effect.gen(function* () {
        if (ctx.disabled) return;

        e.preventDefault();
        const newValue = ctx.pointerToValue(e.clientX, e.clientY);

        // Determine which thumb to move
        let thumbIndex = 0;
        if (ctx.isRange) {
          const current = yield* ctx.value.get;
          if (isRangeValue(current)) {
            const [minVal, maxVal] = current;
            const distToMin = Math.abs(newValue - minVal);
            const distToMax = Math.abs(newValue - maxVal);
            thumbIndex = distToMin <= distToMax ? 0 : 1;
          }
        }

        // Use setThumbValue for consistency (handles clamping/snapping)
        yield* ctx.setThumbValue(thumbIndex, newValue);
        yield* ctx.startDrag(thumbIndex);

        // Focus the thumb for keyboard accessibility
        const thumbEl = ctx.trackRef.current?.parentElement?.querySelector(
          `[data-slider-thumb][data-thumb-index="${thumbIndex}"]`,
        ) as HTMLElement | null;
        thumbEl?.focus();

        // Setup document-level tracking
        yield* setupDragTracking(ctx, e.pointerId);
      });

    return yield* $.div(
      {
        ref: ctx.trackRef,
        class: props.class,
        "data-slider-track": "",
        "data-orientation": ctx.orientation,
        "data-disabled": ctx.disabled ? "" : undefined,
        onPointerDown: handlePointerDown,
        style: { position: "relative", touchAction: "none" },
      },
      children ?? [],
    );
  }),
);

// ============================================================================
// Range Component
// ============================================================================

/**
 * Visual fill between min and value (or between thumbs in range mode).
 */
const Range = component("SliderRange", (props: SliderRangeProps) =>
  Effect.gen(function* () {
    const ctx = yield* SliderCtx;

    // Compute range style based on value(s)
    const rangeStyle = ctx.value.map((val): Record<string, string> => {
      if (isRangeValue(val)) {
        const [minVal, maxVal] = val;
        const startPercent = ctx.valueToPercent(minVal);
        const endPercent = ctx.valueToPercent(maxVal);
        return getRangeStyle(
          ctx.orientation,
          ctx.inverted,
          startPercent,
          endPercent,
        );
      } else {
        // Single value - range from 0 to current
        const percent = ctx.valueToPercent(val);
        return getRangeStyle(ctx.orientation, ctx.inverted, 0, percent);
      }
    });

    return yield* $.div({
      class: props.class,
      style: rangeStyle,
      "data-slider-range": "",
    });
  }),
);

// ============================================================================
// Thumb Component
// ============================================================================

/**
 * Draggable thumb handle. Has role="slider" with ARIA attributes.
 */
const Thumb = component("SliderThumb", (props: SliderThumbProps) =>
  Effect.gen(function* () {
    const ctx = yield* SliderCtx;

    // Register this thumb and get its index
    const thumbIndex = ctx.registerThumb();

    // Get this thumb's value
    const thumbValue = ctx.value.map((val) =>
      isRangeValue(val) ? (val[thumbIndex] ?? val[0]) : val,
    );

    // Dragging state for this thumb
    const isDragging = ctx.draggingThumb.map((idx) => idx === thumbIndex);

    // ARIA value text - only set if explicitly provided (aria-valuenow is sufficient otherwise)
    const ariaValueText =
      props["aria-valuetext"] !== undefined
        ? thumbValue.map((val) => {
            if (typeof props["aria-valuetext"] === "function") {
              return props["aria-valuetext"](val);
            }
            return props["aria-valuetext"] as string;
          })
        : undefined;

    // Handle pointer down on thumb
    const handlePointerDown = (e: PointerEvent) =>
      Effect.gen(function* () {
        if (ctx.disabled) return;
        e.preventDefault();
        e.stopPropagation();

        yield* ctx.startDrag(thumbIndex);
        yield* setupDragTracking(ctx, e.pointerId);

        // Focus the thumb
        (e.currentTarget as HTMLElement).focus();
      });

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) =>
      Effect.gen(function* () {
        if (ctx.disabled) return;

        const currentValue = yield* thumbValue.get;
        let newValue: number | null = null;

        const isHorizontal = ctx.orientation === "horizontal";
        // Arrow key mapping depends on orientation and inversion
        const decreaseKey = isHorizontal
          ? ctx.inverted
            ? "ArrowRight"
            : "ArrowLeft"
          : ctx.inverted
            ? "ArrowUp"
            : "ArrowDown";
        const increaseKey = isHorizontal
          ? ctx.inverted
            ? "ArrowLeft"
            : "ArrowRight"
          : ctx.inverted
            ? "ArrowDown"
            : "ArrowUp";

        switch (e.key) {
          case decreaseKey:
            e.preventDefault();
            newValue = currentValue - ctx.step;
            break;
          case increaseKey:
            e.preventDefault();
            newValue = currentValue + ctx.step;
            break;
          case "PageDown":
            e.preventDefault();
            newValue = currentValue - ctx.largeStep;
            break;
          case "PageUp":
            e.preventDefault();
            newValue = currentValue + ctx.largeStep;
            break;
          case "Home":
            e.preventDefault();
            newValue = ctx.min;
            break;
          case "End":
            e.preventDefault();
            newValue = ctx.max;
            break;
        }

        if (newValue !== null) {
          yield* ctx.setThumbValue(thumbIndex, newValue);
        }
      });

    // Compute thumb position style
    const thumbStyle = thumbValue.map((val): Record<string, string> => {
      const percent = ctx.valueToPercent(val);
      return getThumbStyle(ctx.orientation, ctx.inverted, percent);
    });

    return yield* $.div(
      {
        class: props.class,
        style: thumbStyle,
        role: "slider",
        tabIndex: ctx.disabled ? undefined : 0,
        "aria-valuenow": thumbValue,
        "aria-valuemin": ctx.min,
        "aria-valuemax": ctx.max,
        "aria-valuetext": ariaValueText,
        "aria-orientation": ctx.orientation,
        "aria-disabled": ctx.disabled ? "true" : undefined,
        "aria-label": props["aria-label"],
        "aria-labelledby": props["aria-labelledby"],
        "data-slider-thumb": "",
        "data-disabled": ctx.disabled ? "" : undefined,
        "data-dragging": isDragging.map((d) => (d ? "" : undefined)),
        "data-thumb-index": thumbIndex,
        onPointerDown: handlePointerDown,
        onKeyDown: handleKeyDown,
      },
      [],
    );
  }),
);

// ============================================================================
// Drag Tracking Helper
// ============================================================================

/**
 * Setup document-level pointer tracking for drag operations.
 */
const setupDragTracking = (
  ctx: SliderContext,
  pointerId: number,
): Effect.Effect<void> =>
  Effect.sync(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;

      Effect.runSync(
        Effect.gen(function* () {
          const thumbIndex = yield* ctx.draggingThumb.get;
          if (thumbIndex < 0) return;

          e.preventDefault();
          const newValue = ctx.pointerToValue(e.clientX, e.clientY);
          yield* ctx.setThumbValue(thumbIndex, newValue);
        }),
      );
    };

    const cleanup = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      ctx.setDragCleanup(null);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;

      Effect.runSync(ctx.stopDrag());
      cleanup();
    };

    // Add document listeners
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    // Register cleanup for unmount scenario
    ctx.setDragCleanup(cleanup);
  });

// ============================================================================
// Export
// ============================================================================

/**
 * Headless Slider primitive for building accessible range input controls.
 *
 * Features:
 * - Single value or range (two thumbs) modes
 * - Horizontal and vertical orientations
 * - Click on track to jump position
 * - Full keyboard support (arrows, PageUp/Down, Home/End)
 * - ARIA slider attributes
 * - Data attributes for styling
 * - Controlled and uncontrolled modes
 *
 * @example
 * ```ts
 * // Single value slider
 * Slider.Root({ defaultValue: 50, min: 0, max: 100 }, [
 *   Slider.Track({ class: "slider-track" }, [
 *     Slider.Range({ class: "slider-range" }),
 *   ]),
 *   Slider.Thumb({ class: "slider-thumb", "aria-label": "Volume" }),
 * ])
 *
 * // Range slider (two thumbs)
 * Slider.Root({ defaultValue: [200, 800], min: 0, max: 1000 }, [
 *   Slider.Track({ class: "slider-track" }, [
 *     Slider.Range({ class: "slider-range" }),
 *   ]),
 *   Slider.Thumb({ "aria-label": "Min price" }),
 *   Slider.Thumb({ "aria-label": "Max price" }),
 * ])
 * ```
 */
export const Slider = {
  Root,
  Track,
  Range,
  Thumb,
} as const;
