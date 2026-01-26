import { Effect, Layer } from "effect";

import {
  $,
  Element,
  mergeProps,
  onClickOutside,
  Portal,
  provide,
  Readable,
  Signal,
  UniqueId,
  when,
  type AnimationOptions,
  type ChildEffect,
  type ClassValue,
} from "@effex/dom";

import { positionAndReveal } from "./helpers";
import {
  PopoverContentPositionCtx,
  PopoverCtx,
  type PopoverContext,
} from "./types";

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
const Root = <E = never, R = never>(
  props: PopoverRootProps,
  children: ChildEffect<E, R | PopoverCtx>,
): Element.Element<HTMLDivElement, E, R> =>
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

    return yield* $.div(
      { style: { display: "contents" } },
      provide(PopoverCtx, ctx, children),
    );
  }) as Element.Element<HTMLDivElement, E, R>;

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
const Trigger = <E = never, R = never>(
  props: PopoverTriggerProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLButtonElement, E, R | PopoverCtx> =>
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
      return yield* mergeProps(
        triggerProps,
        children as Element.Element<HTMLElement | SVGElement, E, R>,
      );
    }

    return yield* $.button(
      { ...triggerProps, type: "button", class: props.class },
      children,
    );
  }) as Element.Element<HTMLButtonElement, E, R | PopoverCtx>;

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
const Anchor = <E = never, R = never>(
  props: PopoverAnchorProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLDivElement, E, R | PopoverCtx> =>
  Effect.gen(function* () {
    const ctx = yield* PopoverCtx;

    return yield* $.div(
      {
        ref: ctx.anchorRef,
        class: props.class,
        "data-popover-anchor": "",
      },
      children,
    );
  }) as Element.Element<HTMLDivElement, E, R | PopoverCtx>;

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
const Content = <E = never, R = never>(
  props: PopoverContentProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLDivElement, E, R | PopoverCtx> =>
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

    const onBeforeEnter = (el: Effect.Effect<HTMLElement | SVGElement>) =>
      (el as Effect.Effect<HTMLElement>).pipe(
        positionAndReveal,
        Element.tapEffect(
          () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
        ),
        Effect.provide(positioningContext),
        Effect.provideService(PopoverCtx, ctx),
      );

    const onEnter = (el: Effect.Effect<HTMLElement | SVGElement>) =>
      el.pipe(
        Element.setStyles({ animation: "none" }),
        Element.focus,
        Element.tapEffect(() => props.animate?.onEnter?.(el) ?? Effect.void),
      );

    const onBeforeExit = (el: Effect.Effect<HTMLElement | SVGElement>) =>
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
            children,
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
  }) as Element.Element<HTMLDivElement, E, R | PopoverCtx>;

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
const Close = <E = never, R = never>(
  props: PopoverCloseProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLButtonElement, E, R | PopoverCtx> =>
  Effect.gen(function* () {
    const ctx = yield* PopoverCtx;

    const closeProps = {
      "data-popover-close": "",
      onClick: ctx.close,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        closeProps,
        children as Element.Element<HTMLElement | SVGElement, E, R>,
      );
    }

    return yield* $.button(
      { ...closeProps, type: "button", class: props.class },
      children,
    );
  }) as Element.Element<HTMLButtonElement, E, R | PopoverCtx>;

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
