import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import type { Element } from "@dom/Element";

/**
 * Context shared between Collapsible parts.
 */
export interface CollapsibleContext {
  /** Whether the collapsible is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Toggle the open state */
  readonly toggle: () => Effect.Effect<void>;
  /** Open the collapsible */
  readonly open: () => Effect.Effect<void>;
  /** Close the collapsible */
  readonly close: () => Effect.Effect<void>;
  /** Unique ID for ARIA attributes */
  readonly contentId: string;
  /** Whether the collapsible is disabled */
  readonly disabled: Readable.Readable<boolean>;
}

/**
 * Props for Collapsible.Root
 */
export interface CollapsibleRootProps {
  /** Controlled open state - if provided, component is controlled */
  readonly open?: Signal<boolean>;
  /** Default open state for uncontrolled usage */
  readonly defaultOpen?: boolean;
  /** Whether the collapsible is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Props for Collapsible.Trigger
 */
export interface CollapsibleTriggerProps {
  /** Element to render as trigger (default: button) */
  readonly as?: "button" | "div";
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Collapsible.Content
 */
export interface CollapsibleContentProps {
  /** Additional class names for the outer container */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Effect Context for Collapsible state sharing between parts.
 */
export class CollapsibleCtx extends Context.Tag("CollapsibleContext")<
  CollapsibleCtx,
  CollapsibleContext
>() {}

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
    const disabled: Readable.Readable<boolean> = Readable.of(
      props.disabled ?? false,
    );

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
 * Uses CSS transitions triggered by data-state attribute.
 *
 * The content is always rendered to the DOM. Animation is controlled by CSS:
 * - `data-state="open"` / `data-state="closed"` triggers CSS transitions
 * - Uses CSS grid trick for smooth height animation without JS measurement
 *
 * @example
 * ```ts
 * Collapsible.Content({ class: "my-content" }, [
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

      // Outer div uses CSS grid for height animation
      // Inner div wraps children with overflow: hidden for the animation to work
      return yield* $.div(
        {
          id: ctx.contentId,
          class: props.class,
          role: "region",
          "data-state": dataState,
        },
        [$.div({ "data-collapsible-inner": "" }, children ?? [])],
      );
    }),
);

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
