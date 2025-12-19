import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import type { Element } from "@dom/Element";

/**
 * Context shared between Accordion parts.
 */
export interface AccordionContext {
  /** Current open value(s) */
  readonly value: Readable.Readable<string | string[] | null>;
  /** Toggle an item by value */
  readonly toggle: (itemValue: string) => Effect.Effect<void>;
  /** Whether the accordion is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Accordion type */
  readonly type: "single" | "multiple";
  /** Whether single-type accordion can collapse all items */
  readonly collapsible: boolean;
}

/**
 * Context for individual Accordion.Item
 */
export interface AccordionItemContext {
  /** This item's value */
  readonly value: string;
  /** Whether this item is open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Whether this item is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Unique ID for ARIA attributes */
  readonly triggerId: string;
  readonly contentId: string;
}

/**
 * Props for Accordion.Root
 */
export interface AccordionRootProps {
  /**
   * Whether single or multiple items can be open at once.
   * @default "single"
   */
  readonly type?: "single" | "multiple";
  /**
   * Controlled value - string for single, string[] for multiple.
   * If provided, component is controlled.
   */
  readonly value?: Signal<string | null> | Signal<string[]>;
  /**
   * Default value for uncontrolled usage.
   * String for single type, string[] for multiple type.
   */
  readonly defaultValue?: string | string[] | null;
  /** Whether the accordion is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /**
   * When type="single", whether clicking the open item closes it.
   * @default false
   */
  readonly collapsible?: boolean;
  /** Callback when value changes */
  readonly onValueChange?: (
    value: string | string[] | null,
  ) => Effect.Effect<void>;
}

/**
 * Props for Accordion.Item
 */
export interface AccordionItemProps {
  /** Unique value for this item */
  readonly value: string;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * Props for Accordion.Trigger
 */
export interface AccordionTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Props for Accordion.Content
 */
export interface AccordionContentProps {
  /** Additional class names for the outer container */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Effect Context for Accordion state sharing between parts.
 */
export class AccordionCtx extends Context.Tag("AccordionContext")<
  AccordionCtx,
  AccordionContext
>() {}

/**
 * Effect Context for individual Accordion.Item
 */
export class AccordionItemCtx extends Context.Tag("AccordionItemContext")<
  AccordionItemCtx,
  AccordionItemContext
>() {}

/**
 * Root container for an Accordion. Manages open/closed state for all items.
 *
 * @example
 * ```ts
 * // Single mode - only one open at a time
 * Accordion.Root({ type: "single", defaultValue: "item-1" }, [
 *   Accordion.Item({ value: "item-1" }, [...]),
 *   Accordion.Item({ value: "item-2" }, [...]),
 * ])
 *
 * // Multiple mode - any number can be open
 * Accordion.Root({ type: "multiple", defaultValue: ["item-1"] }, [
 *   Accordion.Item({ value: "item-1" }, [...]),
 *   Accordion.Item({ value: "item-2" }, [...]),
 * ])
 * ```
 */
const Root = (
  props: AccordionRootProps,
  children: Element<never, AccordionCtx> | Element<never, AccordionCtx>[],
): Element =>
  Effect.gen(function* () {
    const type = props.type ?? "single";
    const collapsible = props.collapsible ?? false;

    // Handle controlled vs uncontrolled state
    // For single: string | null, for multiple: string[]
    const value: Signal<string | string[] | null> = props.value
      ? (props.value as Signal<string | string[] | null>)
      : yield* Signal.make(
          props.defaultValue ?? (type === "multiple" ? [] : null),
        );

    const disabled: Readable.Readable<boolean> = Readable.of(
      props.disabled ?? false,
    );

    const toggle = (itemValue: string) =>
      Effect.gen(function* () {
        const isDisabled = yield* disabled.get;
        if (isDisabled) return;

        const current = yield* value.get;

        let newValue: string | string[] | null;

        if (type === "single") {
          // Single mode: toggle between this item and null (if collapsible)
          if (current === itemValue) {
            newValue = collapsible ? null : itemValue;
          } else {
            newValue = itemValue;
          }
        } else {
          // Multiple mode: toggle item in array
          const currentArray = (current as string[] | null) ?? [];
          if (currentArray.includes(itemValue)) {
            newValue = currentArray.filter((v) => v !== itemValue);
          } else {
            newValue = [...currentArray, itemValue];
          }
        }

        yield* value.set(newValue);

        if (props.onValueChange) {
          yield* props.onValueChange(newValue);
        }
      });

    const ctxValue: AccordionContext = {
      value,
      toggle,
      disabled,
      type,
      collapsible,
    };

    const dataState = value.map((v) => {
      if (type === "single") {
        return v ? "has-value" : "empty";
      }
      return (v as string[]).length > 0 ? "has-value" : "empty";
    });

    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    return yield* $.div(
      {
        "data-state": dataState,
        "data-disabled": dataDisabled,
        "data-orientation": "vertical",
      },
      provide(AccordionCtx, ctxValue, children),
    );
  });

/**
 * Individual accordion item container.
 *
 * @example
 * ```ts
 * Accordion.Item({ value: "item-1" }, [
 *   Accordion.Trigger({}, "Section 1"),
 *   Accordion.Content({}, [$.p("Content here")]),
 * ])
 * ```
 */
const Item = (
  props: AccordionItemProps,
  children:
    | Element<never, AccordionCtx | AccordionItemCtx>
    | Element<never, AccordionCtx | AccordionItemCtx>[],
): Element<never, AccordionCtx> =>
  Effect.gen(function* () {
    const accordionCtx = yield* AccordionCtx;

    const triggerId = yield* UniqueId.make("accordion-trigger");
    const contentId = yield* UniqueId.make("accordion-content");

    // Derive whether this item is open from accordion value
    const isOpen = accordionCtx.value.map((v) => {
      if (accordionCtx.type === "single") {
        return v === props.value;
      }
      return ((v as string[] | null) ?? []).includes(props.value);
    });

    // Item can be disabled by itself or by parent
    const disabled = accordionCtx.disabled.map(
      (parentDisabled) => parentDisabled || props.disabled === true,
    );

    const itemCtx: AccordionItemContext = {
      value: props.value,
      isOpen,
      disabled,
      triggerId,
      contentId,
    };

    const dataState = isOpen.map((open) => (open ? "open" : "closed"));
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    return yield* $.div(
      {
        "data-state": dataState,
        "data-disabled": dataDisabled,
      },
      provide(AccordionItemCtx, itemCtx, children),
    );
  });

/**
 * Button that toggles the Accordion item open/closed.
 * Includes proper ARIA attributes and keyboard support.
 *
 * @example
 * ```ts
 * Accordion.Trigger({ class: "accordion-trigger" }, "Click to expand")
 * ```
 */
const Trigger = component(
  "AccordionTrigger",
  (props: AccordionTriggerProps, children) =>
    Effect.gen(function* () {
      const accordionCtx = yield* AccordionCtx;
      const itemCtx = yield* AccordionItemCtx;

      const handleClick = () => accordionCtx.toggle(itemCtx.value);

      const handleKeyDown = (e: KeyboardEvent) =>
        Effect.suspend(() => {
          // Arrow key navigation between triggers
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const triggers = document.querySelectorAll(
              "[data-accordion-trigger]",
            );
            const current = e.currentTarget as HTMLElement;
            const index = Array.from(triggers).indexOf(current);
            const nextIndex =
              e.key === "ArrowDown"
                ? (index + 1) % triggers.length
                : (index - 1 + triggers.length) % triggers.length;
            (triggers[nextIndex] as HTMLElement)?.focus();
          } else if (e.key === "Home") {
            e.preventDefault();
            const triggers = document.querySelectorAll(
              "[data-accordion-trigger]",
            );
            (triggers[0] as HTMLElement)?.focus();
          } else if (e.key === "End") {
            e.preventDefault();
            const triggers = document.querySelectorAll(
              "[data-accordion-trigger]",
            );
            (triggers[triggers.length - 1] as HTMLElement)?.focus();
          }
          return Effect.void;
        });

      const dataState = itemCtx.isOpen.map((open) =>
        open ? "open" : "closed",
      );
      const dataDisabled = itemCtx.disabled.map((d) => (d ? "" : undefined));
      const ariaExpanded = itemCtx.isOpen.map((open) =>
        open ? "true" : "false",
      );

      return yield* $.button(
        {
          id: itemCtx.triggerId,
          class: props.class,
          type: "button",
          disabled: itemCtx.disabled,
          "aria-expanded": ariaExpanded,
          "aria-controls": itemCtx.contentId,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-accordion-trigger": "",
          onClick: handleClick,
          onKeyDown: handleKeyDown,
        },
        children ?? [],
      );
    }),
);

/**
 * Content area that shows/hides based on the Accordion item state.
 * Uses CSS grid trick for smooth height animation.
 *
 * @example
 * ```ts
 * Accordion.Content({ class: "accordion-content" }, [
 *   $.p("This content can be shown or hidden"),
 * ])
 * ```
 */
const Content = component(
  "AccordionContent",
  (props: AccordionContentProps, children) =>
    Effect.gen(function* () {
      const itemCtx = yield* AccordionItemCtx;

      const dataState = itemCtx.isOpen.map((open) =>
        open ? "open" : "closed",
      );

      // Outer div uses CSS grid for height animation
      // Inner div wraps children with overflow: hidden for the animation to work
      return yield* $.div(
        {
          id: itemCtx.contentId,
          class: props.class,
          role: "region",
          "aria-labelledby": itemCtx.triggerId,
          "data-state": dataState,
        },
        [$.div({ "data-accordion-inner": "" }, children ?? [])],
      );
    }),
);

/**
 * Headless Accordion primitive for building accessible
 * expandable content sections.
 *
 * Features:
 * - Single or multiple items open at once
 * - Controlled and uncontrolled modes
 * - Full keyboard support (arrows, Home, End)
 * - ARIA attributes (aria-expanded, aria-controls, aria-labelledby)
 * - Disabled state at root or item level
 * - CSS-based animations via data-state
 *
 * @example
 * ```ts
 * // Single mode with collapsible
 * Accordion.Root({ type: "single", collapsible: true }, [
 *   Accordion.Item({ value: "item-1" }, [
 *     Accordion.Trigger({}, "Section 1"),
 *     Accordion.Content({}, [$.p("Content 1")]),
 *   ]),
 *   Accordion.Item({ value: "item-2" }, [
 *     Accordion.Trigger({}, "Section 2"),
 *     Accordion.Content({}, [$.p("Content 2")]),
 *   ]),
 * ])
 *
 * // Multiple mode
 * Accordion.Root({ type: "multiple", defaultValue: ["item-1", "item-2"] }, [
 *   Accordion.Item({ value: "item-1" }, [...]),
 *   Accordion.Item({ value: "item-2" }, [...]),
 *   Accordion.Item({ value: "item-3" }, [...]),
 * ])
 * ```
 */
export const Accordion = {
  Root,
  Item,
  Trigger,
  Content,
} as const;
