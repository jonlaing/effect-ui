import { Context, Effect, Option } from "effect";
import type { SignalArray } from "@effex/dom";
import type { ClassValue } from "@effex/dom";
import { Readable, Signal, UniqueId } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { component, Derived, createKeyboardNav } from "@effex/dom";
import { Element } from "@effex/dom";

// ============================================================================
// Types
// ============================================================================

type Orientation = "horizontal" | "vertical";

/**
 * Context shared between Toolbar parts.
 */
export interface ToolbarContext {
  /** Toolbar orientation (affects keyboard navigation) */
  readonly orientation: Readable.Readable<Orientation>;
  /** Whether the entire toolbar is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Whether keyboard navigation loops */
  readonly loop: boolean;
  /** Roving tabindex state */
  readonly rovingTabIndex: {
    /** Currently active item ID (the one with tabIndex=0) */
    readonly activeId: Signal<string | null>;
    /** Registered item IDs in order */
    readonly items: SignalArray<string>;
  };
}

/**
 * Context for ToggleGroup - manages toggle button groups.
 */
export interface ToolbarToggleGroupContext {
  /** Selection type */
  readonly type: "single" | "multiple";
  /** For single mode */
  readonly singleValue: Signal<string | null>;
  /** For multiple mode */
  readonly multipleValue: SignalArray<string>;
  /** Whether the group is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Toggle a value */
  readonly toggle: (value: string) => Effect.Effect<void>;
  /** Check if a value is selected */
  readonly isSelected: (value: string) => Readable.Readable<boolean>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Toolbar state sharing between parts.
 */
export class ToolbarCtx extends Context.Tag("ToolbarContext")<
  ToolbarCtx,
  ToolbarContext
>() {}

/**
 * Effect Context for ToggleGroup state.
 */
export class ToolbarToggleGroupCtx extends Context.Tag(
  "ToolbarToggleGroupContext",
)<ToolbarToggleGroupCtx, ToolbarToggleGroupContext>() {}

// ============================================================================
// Props
// ============================================================================

export interface ToolbarRootProps {
  /** Toolbar orientation (default: "horizontal") */
  readonly orientation?: Readable.Reactive<Orientation>;
  /** Whether the toolbar is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Accessible label for the toolbar */
  readonly "aria-label"?: string;
  /** ID of element that labels the toolbar */
  readonly "aria-labelledby"?: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

export interface ToolbarButtonProps {
  /** Unique identifier for this button (auto-generated if not provided) */
  readonly id?: string;
  /** Whether the button is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when button is pressed */
  readonly onPress?: () => Effect.Effect<void>;
  /** Additional class names */
  readonly class?: ClassValue;
}

export interface ToolbarToggleItemProps {
  /** Unique identifier for this toggle */
  readonly id?: string;
  /** Controlled pressed state */
  readonly pressed?: Signal<boolean>;
  /** Default pressed state for uncontrolled mode */
  readonly defaultPressed?: boolean;
  /** Callback when pressed state changes */
  readonly onPressedChange?: (pressed: boolean) => Effect.Effect<void>;
  /** Whether the toggle is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Value for ToggleGroup integration */
  readonly value?: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

export interface ToolbarToggleGroupProps {
  /** Selection type (default: "single") */
  readonly type?: "single" | "multiple";
  /** Controlled value for single mode */
  readonly value?: Signal<string | null>;
  /** Default value for single mode */
  readonly defaultValue?: string | null;
  /** Controlled values for multiple mode */
  readonly values?: SignalArray<string>;
  /** Default values for multiple mode */
  readonly defaultValues?: readonly string[];
  /** Callback when selection changes (single mode) */
  readonly onValueChange?: (value: string | null) => Effect.Effect<void>;
  /** Callback when selection changes (multiple mode) */
  readonly onValuesChange?: (values: readonly string[]) => Effect.Effect<void>;
  /** Whether the group is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Accessible label for the group */
  readonly "aria-label"?: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

export interface ToolbarSeparatorProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

export interface ToolbarLinkProps {
  /** Link href */
  readonly href: string;
  /** Unique identifier for this link */
  readonly id?: string;
  /** Whether the link is disabled (prevents navigation) */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Additional class names */
  readonly class?: ClassValue;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Root container for Toolbar. Manages keyboard navigation and provides
 * context to child components.
 */
const Root = (
  props: ToolbarRootProps,
  children:
    | Element.Element<never, ToolbarCtx>
    | Element.Element<never, ToolbarCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    const orientation = Readable.of(props.orientation ?? "horizontal");
    const disabled = Readable.of(props.disabled ?? false);
    const loop = props.loop ?? true;

    const activeId = yield* Signal.make<string | null>(null);
    const items = yield* Signal.Array.make<string>([]);

    const ctx: ToolbarContext = {
      orientation,
      disabled,
      loop,
      rovingTabIndex: { activeId, items },
    };

    const handleKeyDown = yield* createKeyboardNav({
      selector: "[data-toolbar-item]:not([data-disabled])",
      orientation,
      loop,
      onFocus: (el) =>
        el.pipe(Element.getId, Effect.flatMap(activeId.set), Effect.ignore),
    });

    return yield* $.div(
      {
        role: "toolbar",
        "aria-orientation": orientation,
        "aria-label": props["aria-label"],
        "aria-labelledby": props["aria-labelledby"],
        "data-orientation": orientation,
        class: props.class,
        onKeyDown: handleKeyDown,
      },
      provide(ToolbarCtx, ctx, Array.isArray(children) ? children : [children]),
    );
  });

/**
 * A clickable button in the toolbar.
 */
const Button = component(
  "ToolbarButton",
  (props: ToolbarButtonProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ToolbarCtx;
      const id = props.id ?? (yield* UniqueId.make("toolbar-button"));

      // Register on mount
      yield* ctx.rovingTabIndex.items.push(id);

      // Unregister on unmount
      yield* Effect.addFinalizer(() =>
        ctx.rovingTabIndex.items.remove(id).pipe(Effect.orDie),
      );

      // Set as active if first item
      const currentItems = yield* ctx.rovingTabIndex.items.get;
      if (currentItems.length === 1) {
        yield* ctx.rovingTabIndex.activeId.set(id);
      }

      const itemDisabled = Readable.of(props.disabled ?? false);
      const isDisabled = Derived.some([ctx.disabled, itemDisabled]);

      const isActive = ctx.rovingTabIndex.activeId.map(
        (activeId) => activeId === id,
      );

      // Compute tabIndex: active item gets 0, or first item if nothing is active
      const isFirstItem = ctx.rovingTabIndex.items.map(
        (items) => items.length > 0 && items[0] === id,
      );
      const noActiveItem = ctx.rovingTabIndex.activeId.map(
        (activeId) => activeId === null,
      );

      const tabIndex = yield* Derived.sync(
        [isActive, isFirstItem, noActiveItem] as const,
        ([active, isFirst, noActive]) => {
          if (active) return 0;
          if (isFirst && noActive) return 0;
          return -1;
        },
      );

      const dataDisabled = isDisabled.map((d) => (d ? "" : undefined));

      const handleClick = () =>
        Effect.gen(function* () {
          if (yield* isDisabled.get) return;

          yield* ctx.rovingTabIndex.activeId.set(id);
          yield* props.onPress?.() ?? Effect.void;
        });

      const handleFocus = () => ctx.rovingTabIndex.activeId.set(id);

      return yield* $.button(
        {
          id,
          type: "button",
          class: props.class,
          disabled: isDisabled,
          tabIndex,
          "data-toolbar-item": "",
          "data-disabled": dataDisabled,
          onClick: handleClick,
          onFocus: handleFocus,
        },
        children ?? [],
      );
    }),
);

/**
 * A toggle button in the toolbar with on/off state.
 */
const ToggleItem = component(
  "ToolbarToggleItem",
  (props: ToolbarToggleItemProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ToolbarCtx;
      const toggleGroupCtx = yield* Effect.serviceOption(ToolbarToggleGroupCtx);
      const id = props.id ?? (yield* UniqueId.make("toolbar-item"));

      // Register on mount
      yield* ctx.rovingTabIndex.items.push(id);

      // Unregister on unmount
      yield* Effect.addFinalizer(() =>
        ctx.rovingTabIndex.items.remove(id).pipe(Effect.orDie),
      );

      // Set as active if first item
      const currentItems = yield* ctx.rovingTabIndex.items.get;
      if (currentItems.length === 1) {
        yield* ctx.rovingTabIndex.activeId.set(id);
      }

      // Determine if we're in a ToggleGroup or standalone
      const inToggleGroup =
        Option.isSome(toggleGroupCtx) && props.value !== undefined;

      // Pressed state - either from ToggleGroup, controlled, or internal
      const pressed = inToggleGroup
        ? toggleGroupCtx.value.isSelected(props.value)
        : yield* Signal.fromNullable(
            props.pressed,
            props.defaultPressed ?? false,
          );

      const setPressed = (newPressed: boolean): Effect.Effect<void> => {
        if (inToggleGroup) {
          return toggleGroupCtx.value.toggle(props.value!);
        }

        return Effect.gen(function* () {
          yield* (pressed as Signal<boolean>).set(newPressed);
          yield* props.onPressedChange?.(newPressed) ?? Effect.void;
        });
      };

      const itemDisabled = Readable.of(props.disabled ?? false);
      const groupDisabled = inToggleGroup
        ? toggleGroupCtx.value.disabled
        : Readable.of(false);

      const isDisabled = Derived.some([
        ctx.disabled,
        itemDisabled,
        groupDisabled,
      ]);

      const isActive = ctx.rovingTabIndex.activeId.map(
        (activeId) => activeId === id,
      );

      // Compute tabIndex: active item gets 0, or first item if nothing is active
      const isFirstItem = ctx.rovingTabIndex.items.map(
        (items) => items.length > 0 && items[0] === id,
      );
      const noActiveItem = ctx.rovingTabIndex.activeId.map(
        (activeId) => activeId === null,
      );

      const tabIndex = yield* Derived.sync(
        [isActive, isFirstItem, noActiveItem] as const,
        ([active, isFirst, noActive]) =>
          active || (isFirst && noActive) ? 0 : -1,
      );

      const dataState = pressed.map((p) => (p ? "on" : "off"));
      const ariaPressed = pressed.map((p) => (p ? "true" : "false"));
      const dataDisabled = isDisabled.map((d) => (d ? "" : undefined));

      const handleClick = () =>
        Effect.gen(function* () {
          if (yield* isDisabled.get) return;

          yield* ctx.rovingTabIndex.activeId.set(id);

          const currentPressed = yield* pressed.get;
          yield* setPressed(!currentPressed);
        });

      const handleFocus = () => ctx.rovingTabIndex.activeId.set(id);

      return yield* $.button(
        {
          id,
          type: "button",
          class: props.class,
          disabled: isDisabled,
          tabIndex,
          "aria-pressed": ariaPressed,
          "data-toolbar-item": "",
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-value": props.value,
          onClick: handleClick,
          onFocus: handleFocus,
        },
        children ?? [],
      );
    }),
);

/**
 * A group of toggle items where selection is managed together.
 */
const ToggleGroup = (
  props: ToolbarToggleGroupProps,
  children:
    | Element.Element<never, ToolbarCtx | ToolbarToggleGroupCtx>
    | Element.Element<never, ToolbarCtx | ToolbarToggleGroupCtx>[],
): Element.Element<never, ToolbarCtx> =>
  Effect.gen(function* () {
    const type = props.type ?? "single";
    const disabled = Readable.of(props.disabled ?? false);

    // Single mode state
    const singleValue = yield* Signal.fromNullable(
      props.value,
      props.defaultValue ?? null,
    );

    // Multiple mode state
    const multipleValue: SignalArray<string> = props.values
      ? props.values
      : yield* Signal.Array.make(props.defaultValues ?? []);

    const toggle = (value: string) =>
      Effect.gen(function* () {
        if (type === "single") {
          const current = yield* singleValue.get;
          const newValue = current === value ? null : value;

          yield* singleValue.set(newValue);
          yield* props.onValueChange?.(newValue) ?? Effect.void;
        } else {
          const current = yield* multipleValue.get;

          if (current.includes(value)) {
            yield* multipleValue.remove(value);
          } else {
            yield* multipleValue.push(value);
          }

          const updated = yield* multipleValue.get;
          yield* props.onValuesChange?.(updated) ?? Effect.void;
        }
      });

    const isSelected = (value: string): Readable.Readable<boolean> => {
      if (type === "single") {
        return singleValue.map((v) => v === value);
      } else {
        return multipleValue.map((values) => values.includes(value));
      }
    };

    const groupCtx: ToolbarToggleGroupContext = {
      type,
      singleValue,
      multipleValue,
      disabled,
      toggle,
      isSelected,
    };

    const childArray = Array.isArray(children) ? children : [children];
    return yield* $.div(
      {
        role: "group",
        "aria-label": props["aria-label"],
        class: props.class,
      },
      provide(ToolbarToggleGroupCtx, groupCtx, childArray),
    );
  });

/**
 * A visual separator between toolbar items.
 */
const Separator = component(
  "ToolbarSeparator",
  (props: ToolbarSeparatorProps) =>
    Effect.gen(function* () {
      const ctx = yield* ToolbarCtx;

      // Separator orientation is opposite to toolbar orientation
      const separatorOrientation = ctx.orientation.map((o) =>
        o === "horizontal" ? "vertical" : "horizontal",
      );

      return yield* $.div({
        role: "separator",
        "aria-orientation": separatorOrientation,
        "data-orientation": separatorOrientation,
        "data-toolbar-separator": "",
        class: props.class,
      });
    }),
);

/**
 * A link that participates in toolbar navigation.
 */
const Link = component("ToolbarLink", (props: ToolbarLinkProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* ToolbarCtx;
    const id = props.id ?? (yield* UniqueId.make("toolbar-link"));

    // Register on mount
    yield* ctx.rovingTabIndex.items.push(id);

    // Unregister on unmount
    yield* Effect.addFinalizer(() =>
      ctx.rovingTabIndex.items.remove(id).pipe(Effect.orDie),
    );

    // Set as active if first item
    const currentItems = yield* ctx.rovingTabIndex.items.get;
    if (currentItems.length === 1) {
      yield* ctx.rovingTabIndex.activeId.set(id);
    }

    const itemDisabled = Readable.of(props.disabled ?? false);
    const isDisabled = Derived.some([ctx.disabled, itemDisabled]);

    const isActive = ctx.rovingTabIndex.activeId.map(
      (activeId) => activeId === id,
    );

    // Compute tabIndex: active item gets 0, or first item if nothing is active
    const isFirstItem = ctx.rovingTabIndex.items.map(
      (items) => items.length > 0 && items[0] === id,
    );
    const noActiveItem = ctx.rovingTabIndex.activeId.map(
      (activeId) => activeId === null,
    );

    const tabIndex = yield* Derived.sync(
      [isActive, isFirstItem, noActiveItem] as const,
      ([active, isFirst, noActive]) =>
        active || (isFirst && noActive) ? 0 : -1,
    );

    const dataDisabled = isDisabled.map((d) => (d ? "" : undefined));

    const handleClick = (e: MouseEvent) =>
      Effect.gen(function* () {
        if (yield* isDisabled.get) {
          e.preventDefault();
          return;
        }
        yield* ctx.rovingTabIndex.activeId.set(id);
      });

    const handleFocus = () => ctx.rovingTabIndex.activeId.set(id);

    return yield* $.a(
      {
        id,
        href: props.href,
        class: props.class,
        tabIndex,
        "aria-disabled": isDisabled.map((d) => (d ? "true" : undefined)),
        "data-toolbar-item": "",
        "data-disabled": dataDisabled,
        onClick: handleClick,
        onFocus: handleFocus,
      },
      children ?? [],
    );
  }),
);

/**
 * Headless Toolbar primitive for building accessible toolbars.
 *
 * Features:
 * - WAI-ARIA Toolbar pattern compliance
 * - Horizontal and vertical orientations
 * - Full keyboard support (arrow keys, Home, End)
 * - Roving tabindex for proper focus management
 * - Toggle buttons with single or multiple selection
 * - Separators for visual grouping
 * - Links that participate in keyboard navigation
 * - Disabled state support at toolbar, group, and item level
 * - Data attributes for styling
 *
 * @example
 * ```ts
 * // Basic toolbar with buttons
 * Toolbar.Root({ "aria-label": "Formatting" }, [
 *   Toolbar.Button({ onPress: () => Effect.log("Bold") }, "Bold"),
 *   Toolbar.Button({ onPress: () => Effect.log("Italic") }, "Italic"),
 *   Toolbar.Separator({}),
 *   Toolbar.Button({ onPress: () => Effect.log("Link") }, "Link"),
 * ])
 *
 * // With toggle group for alignment
 * Toolbar.Root({ "aria-label": "Text alignment" }, [
 *   Toolbar.ToggleGroup({ type: "single", defaultValue: "left" }, [
 *     Toolbar.ToggleItem({ value: "left" }, "Left"),
 *     Toolbar.ToggleItem({ value: "center" }, "Center"),
 *     Toolbar.ToggleItem({ value: "right" }, "Right"),
 *   ]),
 * ])
 *
 * // Vertical toolbar
 * Toolbar.Root({ orientation: "vertical", "aria-label": "Tools" }, [
 *   Toolbar.Button({}, "Select"),
 *   Toolbar.Button({}, "Draw"),
 *   Toolbar.Button({}, "Erase"),
 * ])
 * ```
 */
export const Toolbar = {
  Root,
  Button,
  ToggleItem,
  ToggleGroup,
  Separator,
  Link,
} as const;
