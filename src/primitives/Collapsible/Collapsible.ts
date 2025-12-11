import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import { Derived } from "@core/Derived";
import type { Readable } from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { when, provide } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import type { Element } from "@dom/Element";
import type {
  CollapsibleContext,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from "./types";

/**
 * Effect Context for Collapsible state sharing between parts.
 */
class CollapsibleCtx extends Context.Tag("CollapsibleContext")<
  CollapsibleCtx,
  CollapsibleContext
>() {}

/**
 * Button that toggles the Collapsible open/closed state.
 * Includes proper ARIA attributes and keyboard support.
 *
 * @example
 * ```ts
 * Collapsible.Trigger({}, "Show more")
 * Collapsible.Trigger({ as: "div" }, $.span("Custom trigger"))
 * ```
 */
const Trigger = component(
  "CollapsibleTrigger",
  (props: CollapsibleTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* CollapsibleCtx;

      const handleKeyDown = (e: KeyboardEvent) =>
        Effect.suspend(() => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            return ctx.toggle();
          }
          return Effect.void;
        });

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const dataDisabled = ctx.disabled.map((d) => (d ? "" : undefined));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

      if (props.as === "div") {
        return yield* $.div(
          {
            class: props.class,
            role: "button",
            tabIndex: ctx.disabled.map((d) => (d ? -1 : 0)),
            "aria-expanded": ariaExpanded,
            "aria-controls": ctx.contentId,
            "data-state": dataState,
            "data-disabled": dataDisabled,
            onKeyDown: handleKeyDown,
            onClick: ctx.toggle,
          },
          children ?? [],
        );
      }

      // Default: button
      return yield* $.button(
        {
          class: props.class,
          type: "button",
          disabled: ctx.disabled,
          "aria-expanded": ariaExpanded,
          "aria-controls": ctx.contentId,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          onClick: ctx.toggle,
        },
        children ?? [],
      );
    }),
);

/**
 * Content area that shows/hides based on the Collapsible state.
 * Supports animation and force mounting.
 *
 * @example
 * ```ts
 * Collapsible.Content({
 *   animate: { enter: "slide-down", exit: "slide-up" },
 * }, [
 *   $.p("This content can be shown or hidden"),
 * ])
 * ```
 */
const Content = component(
  "CollapsibleContent",
  (props: CollapsibleContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* CollapsibleCtx;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      const renderContent = () =>
        $.div(
          {
            id: ctx.contentId,
            class: props.class,
            role: "region",
            "data-state": dataState,
            hidden: props.forceMount
              ? ctx.isOpen.map((open) => !open)
              : undefined,
          },
          children ?? [],
        );

      if (props.forceMount) {
        return yield* renderContent();
      }

      // Conditional render with animation support
      return yield* when(ctx.isOpen, renderContent, () => $.span(), {
        animate: props.animate,
      });
    }),
);

/**
 * Root container for a Collapsible. Manages open/closed state and provides
 * context to child components.
 *
 * @example
 * ```ts
 * Collapsible.Root({ defaultOpen: false }, [
 *   Collapsible.Trigger({}, "Toggle"),
 *   Collapsible.Content({}, [
 *     $.div("Collapsible content here"),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: CollapsibleRootProps,
  children: Element<never, CollapsibleCtx> | Element<never, CollapsibleCtx>[],
): Element =>
  Effect.gen(function* () {
    // Handle controlled vs uncontrolled state
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    // Handle disabled state
    const disabled: Readable<boolean> =
      typeof props.disabled === "boolean"
        ? yield* Derived.sync([], () => props.disabled as boolean)
        : props.disabled
          ? props.disabled
          : yield* Derived.sync([], () => false);

    const contentId = yield* UniqueId.make("collapsible-content");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        const isDisabled = yield* disabled.get;
        if (isDisabled) return;

        yield* isOpen.set(newValue);

        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
      });

    const toggle = () =>
      Effect.gen(function* () {
        const isDisabled = yield* disabled.get;
        if (isDisabled) return;

        const current = yield* isOpen.get;
        yield* setOpenState(!current);
      });

    const open = () => setOpenState(true);
    const close = () => setOpenState(false);

    const ctxValue: CollapsibleContext = {
      isOpen,
      toggle,
      open,
      close,
      contentId,
      disabled,
    };

    const dataState = isOpen.map((open) => (open ? "open" : "closed"));
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    return yield* $.div(
      {
        "data-state": dataState,
        "data-disabled": dataDisabled,
      },
      provide(CollapsibleCtx, ctxValue, children),
    );
  });

/**
 * Headless Collapsible primitive for building accessible
 * show/hide UI patterns.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Full keyboard support (Enter/Space)
 * - ARIA attributes (aria-expanded, aria-controls)
 * - Animation support via CSS classes
 * - Disabled state
 * - Data attributes for styling ([data-state], [data-disabled])
 *
 * @example
 * ```ts
 * // Basic usage
 * Collapsible.Root({ defaultOpen: false }, [
 *   Collapsible.Trigger({}, "Toggle section"),
 *   Collapsible.Content({}, [
 *     $.div("Hidden content"),
 *   ]),
 * ])
 *
 * // With animation
 * Collapsible.Root({}, [
 *   Collapsible.Trigger({ class: "trigger-btn" }, "Show details"),
 *   Collapsible.Content({
 *     animate: {
 *       enter: "animate-slide-down",
 *       exit: "animate-slide-up",
 *     },
 *   }, [
 *     $.p("Animated content"),
 *   ]),
 * ])
 *
 * // Controlled
 * const isOpen = yield* Signal.make(false)
 * Collapsible.Root({
 *   open: isOpen,
 *   onOpenChange: (open) => Effect.log(`Now ${open ? "open" : "closed"}`),
 * }, [
 *   Collapsible.Trigger({}, "Controlled toggle"),
 *   Collapsible.Content({}, [$.div("Content")]),
 * ])
 * ```
 */
export const Collapsible = {
  Root,
  Trigger,
  Content,
} as const;

export { CollapsibleCtx };
