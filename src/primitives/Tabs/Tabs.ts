import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide, when } from "@dom/Control";
import { component } from "@dom/Component";
import type { Element } from "@dom/Element";

/**
 * Context shared between Tabs parts.
 */
export interface TabsContext {
  /** Current active tab value */
  readonly value: Readable.Readable<string>;
  /** Set the active tab */
  readonly setValue: (value: string) => Effect.Effect<void>;
  /** Tab orientation (affects keyboard navigation) */
  readonly orientation: "horizontal" | "vertical";
  /** Activation mode: automatic (focus selects) or manual (Enter/Space to select) */
  readonly activationMode: "automatic" | "manual";
}

/**
 * Props for Tabs.Root
 */
export interface TabsRootProps {
  /** Controlled value - if provided, component is controlled */
  readonly value?: Signal<string>;
  /** Default value for uncontrolled usage */
  readonly defaultValue?: string;
  /** Callback when value changes */
  readonly onValueChange?: (value: string) => Effect.Effect<void>;
  /** Tab orientation (default: "horizontal") */
  readonly orientation?: "horizontal" | "vertical";
  /** Activation mode (default: "automatic") */
  readonly activationMode?: "automatic" | "manual";
}

/**
 * Props for Tabs.List
 */
export interface TabsListProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
}

/**
 * Props for Tabs.Trigger
 */
export interface TabsTriggerProps {
  /** Unique value for this tab */
  readonly value: string;
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether this tab is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for Tabs.Content
 */
export interface TabsContentProps {
  /** Value matching the corresponding Trigger */
  readonly value: string;
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Force mount even when inactive (default: false) */
  readonly forceMount?: boolean;
}

/**
 * Effect Context for Tabs state sharing between parts.
 */
export class TabsCtx extends Context.Tag("TabsContext")<
  TabsCtx,
  TabsContext
>() {}

/**
 * Root container for Tabs. Manages active tab state and provides
 * context to child components.
 *
 * @example
 * ```ts
 * Tabs.Root({ defaultValue: "tab1" }, [
 *   Tabs.List({}, [
 *     Tabs.Trigger({ value: "tab1" }, "Tab 1"),
 *     Tabs.Trigger({ value: "tab2" }, "Tab 2"),
 *   ]),
 *   Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
 *   Tabs.Content({ value: "tab2" }, [$.p("Content 2")]),
 * ])
 * ```
 */
const Root = (
  props: TabsRootProps,
  children: Element<never, TabsCtx> | Element<never, TabsCtx>[],
): Element =>
  Effect.gen(function* () {
    const value: Signal<string> = props.value
      ? props.value
      : yield* Signal.make(props.defaultValue ?? "");

    const orientation = props.orientation ?? "horizontal";
    const activationMode = props.activationMode ?? "automatic";

    const setValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        if (props.onValueChange) {
          yield* props.onValueChange(newValue);
        }
      });

    const ctx: TabsContext = {
      value,
      setValue,
      orientation,
      activationMode,
    };

    return yield* $.div(
      { "data-orientation": orientation },
      provide(TabsCtx, ctx, children),
    );
  });

/**
 * Container for tab triggers. Handles keyboard navigation.
 *
 * @example
 * ```ts
 * Tabs.List({ class: "tabs-list" }, [
 *   Tabs.Trigger({ value: "tab1" }, "Tab 1"),
 *   Tabs.Trigger({ value: "tab2" }, "Tab 2"),
 * ])
 * ```
 */
const List = component("TabsList", (props: TabsListProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* TabsCtx;
    const loop = props.loop ?? true;

    const handleKeyDown = (e: KeyboardEvent) =>
      Effect.gen(function* () {
        const isHorizontal = ctx.orientation === "horizontal";
        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

        if ([prevKey, nextKey, "Home", "End"].includes(e.key)) {
          e.preventDefault();

          const triggers = Array.from(
            document.querySelectorAll(
              "[data-tabs-trigger]:not([data-disabled])",
            ),
          ) as HTMLElement[];

          if (triggers.length === 0) return;

          const currentTrigger = triggers.find((t) =>
            t.contains(document.activeElement),
          );
          const index = currentTrigger ? triggers.indexOf(currentTrigger) : -1;

          let nextIndex: number;
          if (e.key === prevKey) {
            nextIndex = loop
              ? (index - 1 + triggers.length) % triggers.length
              : Math.max(0, index - 1);
          } else if (e.key === nextKey) {
            nextIndex = loop
              ? (index + 1) % triggers.length
              : Math.min(triggers.length - 1, index + 1);
          } else if (e.key === "Home") {
            nextIndex = 0;
          } else {
            nextIndex = triggers.length - 1;
          }

          triggers[nextIndex]?.focus();

          if (ctx.activationMode === "automatic") {
            const tabValue = triggers[nextIndex]?.getAttribute("data-value");
            if (tabValue) {
              yield* ctx.setValue(tabValue);
            }
          }
        }
      });

    return yield* $.div(
      {
        class: props.class,
        role: "tablist",
        "aria-orientation": ctx.orientation,
        "data-orientation": ctx.orientation,
        onKeyDown: handleKeyDown,
      },
      children ?? [],
    );
  }),
);

/**
 * Tab trigger button. Activates its corresponding content panel.
 *
 * @example
 * ```ts
 * Tabs.Trigger({ value: "tab1", class: "tab-trigger" }, "Account")
 * ```
 */
const Trigger = component("TabsTrigger", (props: TabsTriggerProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* TabsCtx;

    const isSelected = ctx.value.map((v) => v === props.value);
    const dataState = isSelected.map((s) => (s ? "active" : "inactive"));
    const ariaSelected = isSelected.map((s) => (s ? "true" : "false"));
    const tabIndex = isSelected.map((s) => (s ? 0 : -1));

    const handleClick = () => ctx.setValue(props.value);

    const handleKeyDown = (e: KeyboardEvent) =>
      Effect.gen(function* () {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          yield* ctx.setValue(props.value);
        }
      });

    return yield* $.button(
      {
        id: `tabs-trigger-${props.value}`,
        class: props.class,
        type: "button",
        role: "tab",
        disabled: props.disabled,
        tabIndex,
        "aria-selected": ariaSelected,
        "aria-controls": `tabs-content-${props.value}`,
        "data-state": dataState,
        "data-value": props.value,
        "data-disabled": props.disabled ? "" : undefined,
        "data-tabs-trigger": "",
        onClick: handleClick,
        onKeyDown: ctx.activationMode === "manual" ? handleKeyDown : undefined,
      },
      children ?? [],
    );
  }),
);

/**
 * Content panel associated with a tab trigger.
 * Only visible when its corresponding trigger is active.
 *
 * @example
 * ```ts
 * Tabs.Content({ value: "tab1" }, [
 *   $.p("This is the content for tab 1"),
 * ])
 * ```
 */
const Content = component("TabsContent", (props: TabsContentProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* TabsCtx;

    const isSelected = ctx.value.map((v) => v === props.value);
    const dataState = isSelected.map((s) => (s ? "active" : "inactive"));

    if (props.forceMount) {
      // Always render, use hidden attribute
      return yield* $.div(
        {
          id: `tabs-content-${props.value}`,
          class: props.class,
          role: "tabpanel",
          tabIndex: 0,
          "aria-labelledby": `tabs-trigger-${props.value}`,
          "data-state": dataState,
          hidden: isSelected.map((s) => !s),
        },
        children ?? [],
      );
    }

    // Conditional render using when
    return yield* when(
      isSelected,
      () =>
        $.div(
          {
            id: `tabs-content-${props.value}`,
            class: props.class,
            role: "tabpanel",
            tabIndex: 0,
            "aria-labelledby": `tabs-trigger-${props.value}`,
            "data-state": "active",
          },
          children ?? [],
        ),
      () => $.div({ style: { display: "none" } }),
    );
  }),
);

/**
 * Headless Tabs primitive for building accessible tabbed interfaces.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Horizontal and vertical orientations
 * - Automatic or manual activation
 * - Full keyboard support (arrows, Home, End)
 * - ARIA attributes (role, aria-selected, aria-controls, aria-labelledby)
 * - Roving tabindex for proper focus management
 * - Conditional rendering or force mount option
 * - Data attributes for styling
 *
 * @example
 * ```ts
 * // Basic usage
 * Tabs.Root({ defaultValue: "account" }, [
 *   Tabs.List({ class: "tabs-list" }, [
 *     Tabs.Trigger({ value: "account" }, "Account"),
 *     Tabs.Trigger({ value: "password" }, "Password"),
 *     Tabs.Trigger({ value: "settings", disabled: true }, "Settings"),
 *   ]),
 *   Tabs.Content({ value: "account" }, [
 *     $.h3("Account Settings"),
 *     $.p("Manage your account details here."),
 *   ]),
 *   Tabs.Content({ value: "password" }, [
 *     $.h3("Password"),
 *     $.p("Change your password here."),
 *   ]),
 *   Tabs.Content({ value: "settings" }, [
 *     $.h3("Settings"),
 *     $.p("This tab is disabled."),
 *   ]),
 * ])
 *
 * // Controlled with vertical orientation
 * const activeTab = yield* Signal.make("tab1")
 * Tabs.Root({
 *   value: activeTab,
 *   orientation: "vertical",
 *   onValueChange: (v) => Effect.log(`Tab changed to ${v}`),
 * }, [...])
 * ```
 */
export const Tabs = {
  Root,
  List,
  Trigger,
  Content,
} as const;
