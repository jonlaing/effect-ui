import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide, when } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import { Portal } from "@dom/Portal";
import type { Element } from "@dom/Element";
import { calculatePosition, getTransform } from "../helpers";

/**
 * Context shared between Tooltip parts.
 */
export interface TooltipContext {
  /** Whether the tooltip is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the tooltip */
  readonly open: () => Effect.Effect<void>;
  /** Close the tooltip */
  readonly close: () => Effect.Effect<void>;
  /** Reference to the trigger element */
  readonly triggerRef: Signal<HTMLElement | null>;
  /** Unique ID for the tooltip content */
  readonly contentId: string;
  /** Delay before opening (ms) */
  readonly delayDuration: number;
}

/**
 * Props for Tooltip.Root
 */
export interface TooltipRootProps {
  /** Controlled open state - if provided, component is controlled */
  readonly open?: Signal<boolean>;
  /** Default open state for uncontrolled usage */
  readonly defaultOpen?: boolean;
  /** Delay before showing tooltip in ms (default: 700) */
  readonly delayDuration?: number;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Props for Tooltip.Trigger
 */
export interface TooltipTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Whether the trigger should be a span wrapper (default: true) */
  readonly asChild?: boolean;
}

/**
 * Props for Tooltip.Content
 */
export interface TooltipContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Positioning side relative to trigger (default: "top") */
  readonly side?: Readable.Reactive<"top" | "bottom" | "left" | "right">;
  /** Alignment along the side axis (default: "center") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Shift along the side axis in pixels (default: 0) */
  readonly alignOffset?: Readable.Reactive<number>;
}

/**
 * Effect Context for Tooltip state sharing between parts.
 */
export class TooltipCtx extends Context.Tag("TooltipContext")<
  TooltipCtx,
  TooltipContext
>() {}

/**
 * Root container for a Tooltip. Manages open/closed state and provides
 * context to child components.
 *
 * @example
 * ```ts
 * Tooltip.Root({ delayDuration: 300 }, [
 *   Tooltip.Trigger({}, $.button({}, "Hover me")),
 *   Tooltip.Content({ side: "top" }, "Helpful tooltip text"),
 * ])
 * ```
 */
const Root = (
  props: TooltipRootProps,
  children: Element<never, TooltipCtx> | Element<never, TooltipCtx>[],
): Element =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    const triggerRef = yield* Signal.make<HTMLElement | null>(null);
    const contentId = yield* UniqueId.make("tooltip-content");

    const delayDuration = props.delayDuration ?? 700;

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
      });

    const ctx: TooltipContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      triggerRef,
      contentId,
      delayDuration,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(TooltipCtx, ctx, children),
    );
  });

/**
 * Element that triggers the tooltip on hover/focus.
 * Wraps children in a span for event handling.
 *
 * @example
 * ```ts
 * Tooltip.Trigger({}, $.button({}, "Hover me"))
 * ```
 */
const Trigger = component(
  "TooltipTrigger",
  (props: TooltipTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* TooltipCtx;

      let openTimeoutId: ReturnType<typeof setTimeout> | null = null;

      const handleMouseEnter = () =>
        Effect.sync(() => {
          if (openTimeoutId) clearTimeout(openTimeoutId);
          openTimeoutId = setTimeout(() => {
            Effect.runSync(ctx.open());
          }, ctx.delayDuration);
        });

      const handleMouseLeave = () =>
        Effect.sync(() => {
          if (openTimeoutId) {
            clearTimeout(openTimeoutId);
            openTimeoutId = null;
          }
          Effect.runSync(ctx.close());
        });

      const handleFocus = () => ctx.open();
      const handleBlur = () => ctx.close();

      const trigger = yield* $.span(
        {
          class: props.class,
          "aria-describedby": ctx.isOpen.map((open) =>
            open ? ctx.contentId : undefined,
          ),
          "data-state": ctx.isOpen.map((open) => (open ? "open" : "closed")),
          "data-tooltip-trigger": "",
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onFocus: handleFocus,
          onBlur: handleBlur,
        },
        children ?? [],
      );

      // Store reference to trigger element
      yield* ctx.triggerRef.set(trigger);

      return trigger;
    }),
);

/**
 * Content area for the Tooltip.
 * Renders in a Portal and is positioned relative to the trigger.
 *
 * @example
 * ```ts
 * Tooltip.Content({ side: "top", align: "center" }, "Tooltip text")
 * ```
 */
const Content = component(
  "TooltipContent",
  (props: TooltipContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* TooltipCtx;

      // Normalize positioning props
      const side = Readable.of(props.side ?? "top");
      const align = Readable.of(props.align ?? "center");
      const sideOffset = Readable.of(props.sideOffset ?? 4);
      const alignOffset = Readable.of(props.alignOffset ?? 0);

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
              const currentAlignOffset = yield* alignOffset.get;

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
                  currentAlignOffset,
                );
                const transform = getTransform(currentSide, currentAlign);

                positionStyle = {
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  transform,
                };
              }

              return yield* $.div(
                {
                  id: ctx.contentId,
                  class: props.class,
                  role: "tooltip",
                  "data-state": dataState,
                  "data-side": currentSide,
                  "data-align": currentAlign,
                  "data-tooltip-content": "",
                  style: positionStyle,
                },
                children ?? [],
              );
            }),
          ),
        () => $.div({ style: { display: "none" } }),
      );
    }),
);

/**
 * Headless Tooltip primitive for building accessible hover hints.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Configurable delay before showing
 * - Configurable positioning (side, align, offsets)
 * - Portal rendering (escapes overflow)
 * - ARIA attributes (role="tooltip", aria-describedby)
 * - Data attributes for styling
 * - Shows on hover and focus
 *
 * @example
 * ```ts
 * // Basic usage
 * Tooltip.Root({ delayDuration: 300 }, [
 *   Tooltip.Trigger({}, $.button({}, "Save")),
 *   Tooltip.Content({ side: "top" }, "Save your changes"),
 * ])
 *
 * // Different positions
 * Tooltip.Root({}, [
 *   Tooltip.Trigger({}, $.button({}, "Help")),
 *   Tooltip.Content({ side: "right", align: "start" }, "Click for help"),
 * ])
 * ```
 */
export const Tooltip = {
  Root,
  Trigger,
  Content,
} as const;
