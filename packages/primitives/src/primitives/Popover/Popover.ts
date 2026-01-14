import { Effect, Layer } from "effect";
import { Signal } from "@effex/dom";
import type { ClassValue } from "@effex/dom";
import { Readable } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { component } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { onClickOutside } from "@effex/dom";
import { Element } from "@effex/dom";
import { mergeProps } from "@effex/dom";
import type { AnimationOptions } from "@effex/dom";
import {
  type PopoverContext,
  PopoverCtx,
  PopoverContentPositionCtx,
} from "./types";
import { positionAndReveal } from "./helpers";

// ============================================================================
// Components
// ============================================================================

/**
 * Props for Popover.Root
 */
export interface PopoverRootProps {
  /** Controlled open state - if provided, component is controlled */
  readonly open?: Signal<boolean>;
  /** Default open state for uncontrolled usage */
  readonly defaultOpen?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Root container for a Popover. Manages open/closed state and provides
 * context to child components.
 *
 * @example
 * ```ts
 * Popover.Root({ defaultOpen: false }, [
 *   Popover.Trigger({}, "Open"),
 *   Popover.Content({ side: "bottom" }, [
 *     $.p("Popover content"),
 *     Popover.Close({}, "Close"),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: PopoverRootProps,
  children:
    | Element.Element<never, PopoverCtx>
    | Element.Element<never, PopoverCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );

    const triggerRef = yield* Element.ref<HTMLButtonElement>();
    const anchorRef = yield* Element.ref<HTMLDivElement>();
    const contentId = yield* UniqueId.make("popover-content");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        if ((yield* isOpen.get) && !newValue) {
          // Return focus to trigger when closing
          yield* triggerRef.pipe(Element.focus, Effect.ignore);
        }
        yield* isOpen.set(newValue);
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
      });

    const ctx: PopoverContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      toggle: () =>
        Effect.gen(function* () {
          const current = yield* isOpen.get;
          yield* setOpenState(!current);
        }),
      triggerRef,
      anchorRef,
      contentId,
    };

    const childArray = Array.isArray(children) ? children : [children];
    return yield* $.div(
      { style: { display: "contents" } },
      provide(PopoverCtx, ctx, childArray),
    );
  });

/**
 * Props for Popover.Trigger
 */
export interface PopoverTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Button that toggles the Popover open/closed.
 * Also serves as the default anchor for positioning.
 *
 * @example
 * ```ts
 * Popover.Trigger({ class: "btn" }, "Open Popover")
 * ```
 */
const Trigger = component(
  "PopoverTrigger",
  (props: PopoverTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* PopoverCtx;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

      const triggerProps = {
        ref: ctx.triggerRef,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": ariaExpanded,
        "aria-controls": ctx.contentId,
        "data-state": dataState,
        "data-popover-trigger": "",
        onClick: ctx.toggle,
      };

      if (props.asChild && Effect.isEffect(children)) {
        return yield* mergeProps(triggerProps, children);
      }

      return yield* $.button(
        { ...triggerProps, type: "button", class: props.class },
        children ?? [],
      );
    }),
);

/**
 * Props for Popover.Anchor
 */
export interface PopoverAnchorProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Optional anchor element for positioning.
 * Use this when the popover should be positioned relative to a different
 * element than the trigger.
 *
 * @example
 * ```ts
 * Popover.Anchor({ class: "anchor-area" }, [
 *   // Content that the popover positions relative to
 * ])
 * ```
 */
const Anchor = component(
  "PopoverAnchor",
  (props: PopoverAnchorProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* PopoverCtx;

      return yield* $.div(
        {
          ref: ctx.anchorRef,
          class: props.class,
          "data-popover-anchor": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for Popover.Content
 */
export interface PopoverContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Positioning side relative to trigger (default: "bottom") */
  readonly side?: Readable.Reactive<"top" | "bottom" | "left" | "right">;
  /** Alignment along the side axis (default: "center") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Shift along the side axis in pixels (default: 0) */
  readonly alignOffset?: Readable.Reactive<number>;
  /** Called when Escape key is pressed */
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => Effect.Effect<void>;
  /** Called when clicking outside the popover */
  readonly onClickOutside?: () => Effect.Effect<void>;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Content area for the Popover.
 * Renders in a Portal and is positioned relative to the trigger/anchor.
 *
 * @example
 * ```ts
 * Popover.Content({ side: "bottom", align: "start" }, [
 *   $.div({ class: "popover-body" }, [
 *     $.p("Some popover content"),
 *   ]),
 *   Popover.Close({}, "Close"),
 * ])
 * ```
 */
const Content = component(
  "PopoverContent",
  (props: PopoverContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* PopoverCtx;
      const contentRef = yield* Element.ref<HTMLDivElement>();

      // Normalize positioning props
      const side = Readable.of(props.side ?? "bottom");
      const align = Readable.of(props.align ?? "center");
      const sideOffset = Readable.of(props.sideOffset ?? 4);
      const alignOffset = Readable.of(props.alignOffset ?? 0);

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const hasPositioned = yield* Signal.make(false);

      // Portal is always rendered, but the content inside uses `when` for animations.
      // This ensures animations apply to the actual visible content, not a placeholder.
      //
      // We use onBeforeEnter to measure and position the content after DOM insertion
      // but before animation starts. This avoids using CSS transform for positioning,
      // which would conflict with transform-based animations.

      // Positioning context - set in onTrue, used in positionAndReveal
      const positioningContext = Layer.succeed(PopoverContentPositionCtx, {
        side,
        align,
        sideOffset,
        alignOffset,
        hasPositioned,
        setHasPositioned: (bool: boolean) => hasPositioned.set(bool),
      });

      const handleKeyDown = (event: KeyboardEvent) =>
        Effect.gen(function* () {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            yield* props.onEscapeKeyDown?.(event) ?? Effect.void;
            yield* ctx.close();
          }
        });

      const onBeforeEnter = (el: Effect.Effect<HTMLElement>) =>
        props.animate
          ? el.pipe(
              positionAndReveal,
              Element.tapEffect(
                () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
              ),
              Effect.provide(positioningContext),
              Effect.provideService(PopoverCtx, ctx),
            )
          : el.pipe(
              positionAndReveal,
              Effect.provide(positioningContext),
              Effect.provideService(PopoverCtx, ctx),
            );

      const onEnter = (el: Effect.Effect<HTMLElement>) =>
        el.pipe(
          Element.setStyles({ animation: "none" }),
          Element.focus,
          Element.tapEffect(() => props.animate?.onEnter?.(el) ?? Effect.void),
        );

      const onBeforeExit = (el: Effect.Effect<HTMLElement>) =>
        el.pipe(
          Element.setStyles({ animation: "" }),
          Element.tapEffect(
            () => props.animate?.onBeforeExit?.(el) ?? Effect.void,
          ),
        );

      // Click outside handler
      yield* onClickOutside([ctx.triggerRef, contentRef], () =>
        Effect.gen(function* () {
          yield* ctx.close();
          yield* props.onClickOutside?.() ?? Effect.void;
        }),
      );

      return yield* Portal(() =>
        when(ctx.isOpen, {
          onTrue: () =>
            // Start hidden (opacity: 0) - will be positioned and revealed after DOM insertion
            // Also suppress any default CSS animations until we're ready
            $.div(
              {
                id: ctx.contentId,
                ref: contentRef,
                class: props.class,
                role: "dialog",
                "data-state": dataState,
                "data-side": side,
                "data-align": align,
                "data-popover-content": "",
                tabIndex: -1,
                style: {
                  position: "fixed",
                  opacity: "0",
                },
                onKeyDown: handleKeyDown,
              },
              children ?? [],
            ),
          onFalse: () => $.div({ style: { display: "none" } }),
          animate: {
            ...(props.animate ?? {}),
            onBeforeEnter,
            onEnter,
            onBeforeExit,
          },
        }),
      );
    }),
);

/**
 * Props for Popover.Close
 */
export interface PopoverCloseProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Button that closes the Popover.
 *
 * @example
 * ```ts
 * Popover.Close({ class: "close-btn" }, "Close")
 * ```
 */
const Close = component("PopoverClose", (props: PopoverCloseProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* PopoverCtx;

    const closeProps = {
      "data-popover-close": "",
      onClick: ctx.close,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(closeProps, children);
    }

    return yield* $.button(
      { ...closeProps, type: "button", class: props.class },
      children ?? [],
    );
  }),
);

/**
 * Headless Popover primitive for building accessible floating content.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Configurable positioning (side, align, offsets)
 * - Click outside to close
 * - Escape key to close
 * - Portal rendering (escapes overflow)
 * - ARIA attributes
 * - Data attributes for styling
 *
 * @example
 * ```ts
 * // Basic usage
 * Popover.Root({ defaultOpen: false }, [
 *   Popover.Trigger({ class: "btn" }, "Open"),
 *   Popover.Content({ side: "bottom", align: "start" }, [
 *     $.div({ class: "popover-body" }, [
 *       $.p("Popover content here"),
 *     ]),
 *     Popover.Close({}, "Close"),
 *   ]),
 * ])
 *
 * // Controlled with custom anchor
 * const isOpen = yield* Signal.make(false)
 * Popover.Root({ open: isOpen }, [
 *   Popover.Anchor({ class: "anchor" }, [$.span("Anchor point")]),
 *   Popover.Trigger({}, "Toggle"),
 *   Popover.Content({ side: "right" }, [...]),
 * ])
 * ```
 */
export const Popover = {
  Root,
  Trigger,
  Anchor,
  Content,
  Close,
} as const;
