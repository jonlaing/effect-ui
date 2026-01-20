import { Context, Effect } from "effect";

import {
  $,
  Component,
  Element,
  Portal,
  provide,
  Readable,
  Signal,
  UniqueId,
  when,
  type AnimationOptions,
  type ClassValue,
  type ElementRef,
} from "@effex/dom";

import { calculatePosition } from "../helpers";

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
  readonly triggerRef: ElementRef<HTMLDivElement>;
  /** Unique ID for the tooltip content */
  readonly contentId: string;
  /** Delay before opening (ms) */
  readonly delayDuration: number;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Tooltip state sharing between parts.
 */
export class TooltipCtx extends Context.Tag("TooltipContext")<
  TooltipCtx,
  TooltipContext
>() {}

// ============================================================================
// Components
// ============================================================================

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
const Root = Component.gen(function* (props: TooltipRootProps, children) {
  const isOpen = yield* Signal.fromNullable(
    props.open,
    props.defaultOpen ?? false,
  );

  const triggerRef = yield* Element.ref<HTMLDivElement>();
  const contentId = yield* UniqueId.make("tooltip-content");

  const delayDuration = props.delayDuration ?? 700;

  const setOpenState = (newValue: boolean) =>
    Effect.gen(function* () {
      yield* isOpen.set(newValue);
      yield* props.onOpenChange?.(newValue) ?? Effect.void;
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
    provide(TooltipCtx, ctx, Component.normalizeChildren(children)),
  );
});

/**
 * Props for Tooltip.Trigger
 */
export interface TooltipTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether the trigger should be a span wrapper (default: true) */
  readonly asChild?: boolean;
}

/**
 * Element that triggers the tooltip on hover/focus.
 * Wraps children in a span for event handling.
 *
 * @example
 * ```ts
 * Tooltip.Trigger({}, $.button({}, "Hover me"))
 * ```
 */
const Trigger = Component.gen(function* (props: TooltipTriggerProps, children) {
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

  return yield* $.span(
    {
      ref: ctx.triggerRef,
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
      style: { display: "inline-block" },
    },
    children ?? [],
  );
});

/**
 * Props for Tooltip.Content
 */
export interface TooltipContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Positioning side relative to trigger (default: "top") */
  readonly side?: Readable.Reactive<"top" | "bottom" | "left" | "right">;
  /** Alignment along the side axis (default: "center") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Shift along the side axis in pixels (default: 0) */
  readonly alignOffset?: Readable.Reactive<number>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Content area for the Tooltip.
 * Renders in a Portal and is positioned relative to the trigger.
 *
 * @example
 * ```ts
 * Tooltip.Content({ side: "top", align: "center" }, "Tooltip text")
 * ```
 */
const Content = Component.gen(function* (props: TooltipContentProps, children) {
  const ctx = yield* TooltipCtx;

  // Normalize positioning props
  const side = Readable.of(props.side ?? "top");
  const align = Readable.of(props.align ?? "center");
  const sideOffset = Readable.of(props.sideOffset ?? 4);
  const alignOffset = Readable.of(props.alignOffset ?? 0);

  const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

  // Helper to position the content relative to trigger
  const setPosition = (el: Effect.Effect<HTMLElement>) =>
    Effect.gen(function* () {
      const currentSide = yield* side.get;
      const currentAlign = yield* align.get;
      const currentSideOffset = yield* sideOffset.get;
      const currentAlignOffset = yield* alignOffset.get;

      const contentRect = yield* el.pipe(Element.getBoundingClientRect);

      const positionStyle = yield* ctx.triggerRef.pipe(
        Element.getBoundingClientRect,
        Effect.map((anchorRect) => {
          const { top, left } = calculatePosition(
            anchorRect,
            currentSide,
            currentAlign,
            currentSideOffset,
            currentAlignOffset,
            contentRect.width,
            contentRect.height,
          );

          return {
            top: `${top}px`,
            left: `${left}px`,
            opacity: "",
            animation: "none",
          };
        }),
      );

      return yield* el.pipe(Element.setStyles(positionStyle));
    });

  // Portal is always rendered, but the content inside uses `when` for animations.
  return yield* Portal(() =>
    when(ctx.isOpen, {
      onTrue: () =>
        $.div(
          {
            id: ctx.contentId,
            class: props.class,
            role: "tooltip",
            "data-state": dataState,
            "data-side": side,
            "data-align": align,
            "data-tooltip-content": "",
            style: {
              position: "fixed",
              opacity: "0",
            },
          },
          children ?? [],
        ),
      onFalse: () => $.div({ style: { display: "none" } }),
      animate: props.animate
        ? {
            ...props.animate,
            onBeforeEnter: (el) =>
              el.pipe(
                setPosition,
                Element.tapEffect(
                  () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
                ),
                Effect.ignore,
              ),
            onEnter: (el) =>
              el.pipe(
                Element.setStyles({ animation: "" }),
                Element.tapEffect(
                  () => props.animate?.onEnter?.(el) ?? Effect.void,
                ),
                Effect.ignore,
              ),
            onBeforeExit: (el) =>
              el.pipe(
                Element.setStyles({ animation: "" }),
                Element.tapEffect(
                  () => props.animate?.onBeforeExit?.(el) ?? Effect.void,
                ),
                Effect.ignore,
              ),
          }
        : {
            onBeforeEnter: (el) => el.pipe(setPosition, Effect.ignore),
          },
    }),
  );
});

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
