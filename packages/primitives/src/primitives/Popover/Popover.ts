import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import { Readable } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { component } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { Ref } from "@effex/dom";
import type { Element } from "@effex/dom";
import { calculatePosition, getTransform } from "../helpers";

/**
 * Context shared between Popover parts.
 */
export interface PopoverContext {
  /** Whether the popover is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the popover */
  readonly open: () => Effect.Effect<void>;
  /** Close the popover */
  readonly close: () => Effect.Effect<void>;
  /** Toggle the popover open state */
  readonly toggle: () => Effect.Effect<void>;
  /** Reference to the trigger element */
  readonly triggerRef: Ref<HTMLElement>;
  /** Reference to an optional anchor element */
  readonly anchorRef: Ref<HTMLElement>;
  /** Unique ID for the popover content */
  readonly contentId: string;
}

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
 * Props for Popover.Trigger
 */
export interface PopoverTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Popover.Anchor
 */
export interface PopoverAnchorProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Popover.Content
 */
export interface PopoverContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Positioning side relative to trigger (default: "bottom") */
  readonly side?: Readable.Reactive<"top" | "bottom" | "left" | "right">;
  /** Alignment along the side axis (default: "center") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Shift along the side axis in pixels (default: 0) */
  readonly alignOffset?: Readable.Reactive<number>;
  /** Called when clicking outside */
  readonly onClickOutside?: () => Effect.Effect<void>;
  /** Called when Escape key is pressed */
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => Effect.Effect<void>;
}

/**
 * Props for Popover.Close
 */
export interface PopoverCloseProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Effect Context for Popover state sharing between parts.
 */
export class PopoverCtx extends Context.Tag("PopoverContext")<
  PopoverCtx,
  PopoverContext
>() {}

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
  children: Element<never, PopoverCtx> | Element<never, PopoverCtx>[],
): Element =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    const triggerRef = yield* Ref.make<HTMLElement>();
    const anchorRef = yield* Ref.make<HTMLElement>();
    const contentId = yield* UniqueId.make("popover-content");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
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
  });

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

      return yield* $.button(
        {
          ref: ctx.triggerRef,
          class: props.class,
          type: "button",
          "aria-haspopup": "dialog",
          "aria-expanded": ariaExpanded,
          "aria-controls": ctx.contentId,
          "data-state": dataState,
          "data-popover-trigger": "",
          onClick: ctx.toggle,
        },
        children ?? [],
      );
    }),
);

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

      // Normalize positioning props
      const side = Readable.of(props.side ?? "bottom");
      const align = Readable.of(props.align ?? "center");
      const sideOffset = Readable.of(props.sideOffset ?? 4);
      const alignOffset = Readable.of(props.alignOffset ?? 0);

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      return yield* when(
        ctx.isOpen,
        () =>
          Portal(() =>
            Effect.gen(function* () {
              // Get anchor element (prefer anchorRef, fallback to triggerRef)
              const anchorEl = ctx.anchorRef.current ?? ctx.triggerRef.current;

              // Get current positioning values
              const currentSide = yield* side.get;
              const currentAlign = yield* align.get;
              const currentSideOffset = yield* sideOffset.get;
              const currentAlignOffset = yield* alignOffset.get;

              let positionStyle: Record<string, string> = {
                position: "fixed",
              };

              if (anchorEl) {
                const rect = anchorEl.getBoundingClientRect();
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

              const handleKeyDown = (event: KeyboardEvent) =>
                Effect.gen(function* () {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (props.onEscapeKeyDown) {
                      yield* props.onEscapeKeyDown(event);
                    }
                    yield* ctx.close();
                  }
                });

              const contentEl = yield* $.div(
                {
                  id: ctx.contentId,
                  class: props.class,
                  role: "dialog",
                  "data-state": dataState,
                  "data-side": currentSide,
                  "data-align": currentAlign,
                  "data-popover-content": "",
                  tabIndex: -1,
                  style: positionStyle,
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Click outside handler
              const handleDocumentClick = (e: MouseEvent) => {
                const trigger = ctx.triggerRef.current;

                if (
                  contentEl &&
                  !contentEl.contains(e.target as Node) &&
                  trigger &&
                  !trigger.contains(e.target as Node)
                ) {
                  Effect.runSync(
                    Effect.gen(function* () {
                      if (props.onClickOutside) {
                        yield* props.onClickOutside();
                      }
                      yield* ctx.close();
                    }),
                  );
                }
              };

              // Add click outside listener
              document.addEventListener("click", handleDocumentClick, true);

              // Cleanup listener on unmount
              yield* Effect.addFinalizer(() =>
                Effect.sync(() => {
                  document.removeEventListener(
                    "click",
                    handleDocumentClick,
                    true,
                  );
                }),
              );

              // Focus the content when opened
              contentEl.focus();

              return contentEl;
            }),
          ),
        () => $.div({ style: { display: "none" } }),
      );
    }),
);

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

    return yield* $.button(
      {
        class: props.class,
        type: "button",
        "data-popover-close": "",
        onClick: ctx.close,
      },
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
