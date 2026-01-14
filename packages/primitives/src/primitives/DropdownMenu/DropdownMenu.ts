import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import type { ClassValue } from "@effex/dom";
import { Readable } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { onClickOutside, createKeyboardNav, mergeProps } from "@effex/dom";
import { Element } from "@effex/dom";
import type { Child } from "@effex/dom";
import type { AnimationOptions } from "@effex/dom";
import type { ElementRef } from "@effex/dom";
import { calculatePosition } from "../helpers";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Context shared between DropdownMenu parts.
 */
export interface DropdownMenuContext {
  /** Whether the menu is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the menu */
  readonly open: () => Effect.Effect<void>;
  /** Close the menu */
  readonly close: () => Effect.Effect<void>;
  /** Toggle the menu open state */
  readonly toggle: () => Effect.Effect<void>;
  /** Reference to the trigger element */
  readonly triggerRef: ElementRef<HTMLButtonElement>;
  /** Reference to the content element */
  readonly contentRef: ElementRef<HTMLDivElement>;
}

/**
 * Context for DropdownMenu.RadioGroup
 */
export interface DropdownMenuRadioGroupContext {
  /** Current selected value */
  readonly value: Readable.Readable<string>;
  /** Set the selected value */
  readonly setValue: (value: string) => Effect.Effect<void>;
}

/**
 * Context for DropdownMenu.Sub
 */
export interface DropdownMenuSubContext {
  /** Whether the submenu is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the submenu */
  readonly open: () => Effect.Effect<void>;
  /** Close the submenu */
  readonly close: () => Effect.Effect<void>;
  /** Cancel any pending close timeout */
  readonly cancelClose: () => void;
  /** Schedule a close with delay */
  readonly scheduleClose: () => void;
  /** Reference to the SubTrigger element */
  readonly triggerRef: ElementRef<HTMLButtonElement>;
  /** Reference to the submenu content element */
  readonly contentRef: ElementRef<HTMLDivElement>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for DropdownMenu state sharing between parts.
 */
export class DropdownMenuCtx extends Context.Tag("DropdownMenuContext")<
  DropdownMenuCtx,
  DropdownMenuContext
>() {}

/**
 * Effect Context for DropdownMenu.Sub state sharing.
 */
export class DropdownMenuSubCtx extends Context.Tag("DropdownMenuSubContext")<
  DropdownMenuSubCtx,
  DropdownMenuSubContext
>() {}

/**
 * Effect Context for DropdownMenu.RadioGroup state sharing.
 */
export class DropdownMenuRadioGroupCtx extends Context.Tag(
  "DropdownMenuRadioGroupContext",
)<DropdownMenuRadioGroupCtx, DropdownMenuRadioGroupContext>() {}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for DropdownMenu.Root
 */
export interface DropdownMenuRootProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Controlled open state */
  readonly open?: Signal<boolean>;
  /** Default open state */
  readonly defaultOpen?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Root container for a DropdownMenu. Manages open/closed state
 * and provides context to child components.
 *
 * @example
 * ```ts
 * DropdownMenu.Root({}, [
 *   DropdownMenu.Trigger({}, "Actions"),
 *   DropdownMenu.Content({}, [
 *     DropdownMenu.Item({ onSelect: () => Effect.log("Edit") }, "Edit"),
 *     DropdownMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: DropdownMenuRootProps,
  children:
    | Element.Element<never, DropdownMenuCtx>
    | Element.Element<never, DropdownMenuCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );

    const triggerRef = yield* Element.ref<HTMLButtonElement>();
    const contentRef = yield* Element.ref<HTMLDivElement>();

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        if ((yield* isOpen.get) && !newValue) {
          // Return focus to trigger when closing
          yield* triggerRef.pipe(Element.focus, Effect.ignore);
        }
        yield* isOpen.set(newValue);
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
      });

    const ctx: DropdownMenuContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      toggle: () =>
        Effect.gen(function* () {
          const current = yield* isOpen.get;
          yield* setOpenState(!current);
        }),
      triggerRef,
      contentRef,
    };

    return yield* $.div(
      { class: props.class },
      provide(DropdownMenuCtx, ctx, children),
    );
  });

/**
 * Props for DropdownMenu.Trigger
 */
export interface DropdownMenuTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether the trigger is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Button that opens/closes the DropdownMenu.
 *
 * @example
 * ```ts
 * DropdownMenu.Trigger({ class: "menu-trigger" }, "Open Menu")
 * ```
 */
const Trigger = (
  props: DropdownMenuTriggerProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DropdownMenuCtx;

    const triggerId = yield* UniqueId.make("menu-trigger");

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);

    const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
    const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    const handleKeyDown = (event: KeyboardEvent) =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        switch (event.key) {
          case "Enter":
          case " ":
            event.preventDefault();
            yield* ctx.toggle();
            break;
          case "ArrowDown":
            event.preventDefault();
            yield* ctx.open();
            // Focus first item after menu opens
            yield* ctx.contentRef.pipe(
              Element.focusFirst("[data-menu-item]:not([data-disabled])"),
              Effect.catchAll(() => Effect.void),
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            yield* ctx.open();
            // Focus last item after menu opens
            yield* ctx.contentRef.pipe(
              Element.focusLast("[data-menu-item]:not([data-disabled])"),
              Effect.catchAll(() => Effect.void),
            );
            break;
        }
      });

    const triggerProps = {
      ref: ctx.triggerRef,
      id: triggerId,
      type: "button" as const,
      "aria-haspopup": "menu" as const,
      "aria-expanded": ariaExpanded,
      "aria-controls": Effect.runSync(
        ctx.contentRef.pipe(
          Element.getId,
          Effect.catchAll(() => Effect.succeed("")),
        ),
      ),
      "data-state": dataState,
      "data-disabled": dataDisabled,
      "data-menu-trigger": "",
      disabled,
      onClick: ctx.toggle,
      onKeyDown: handleKeyDown,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        triggerProps,
        children as Element.Element<never, DropdownMenuCtx>,
      );
    }

    return yield* $.button(
      { ...triggerProps, class: props.class },
      children ?? [],
    );
  });

/**
 * Props for DropdownMenu.Content
 */
export interface DropdownMenuContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Positioning side relative to trigger (default: "bottom") */
  readonly side?: Readable.Reactive<"top" | "bottom" | "left" | "right">;
  /** Alignment along the side axis (default: "start") */
  readonly align?: Readable.Reactive<"start" | "center" | "end">;
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
  /** Render as child element instead of default div */
  readonly asChild?: boolean;
}

/**
 * Content area for the DropdownMenu.
 * Renders in a Portal and is positioned relative to the trigger.
 *
 * @example
 * ```ts
 * DropdownMenu.Content({ side: "bottom", align: "start" }, [
 *   DropdownMenu.Item({}, "Option 1"),
 *   DropdownMenu.Item({}, "Option 2"),
 * ])
 * ```
 */
const Content = (
  props: DropdownMenuContentProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DropdownMenuCtx;

    const contentId = yield* UniqueId.make("menu-content");

    // Normalize positioning props
    const side = Readable.of(props.side ?? "bottom");
    const align = Readable.of(props.align ?? "start");
    const sideOffset = Readable.of(props.sideOffset ?? 4);
    const loop = props.loop ?? true;

    const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

    // Click outside handler
    yield* onClickOutside([ctx.triggerRef, ctx.contentRef], () => ctx.close());

    // Keyboard navigation - created at component level
    const keyboardNav = yield* createKeyboardNav({
      selector: "[data-menu-item]:not([data-disabled])",
      orientation: "vertical",
      loop,
      onActivate: (el) => el.pipe(Element.click, Effect.ignore),
      onEscape: () =>
        ctx
          .close()
          .pipe(
            Effect.andThen(ctx.triggerRef.pipe(Element.focus, Effect.ignore)),
          ),
    });

    const handleKeyDown = (event: KeyboardEvent) =>
      Effect.gen(function* () {
        // Tab closes menu without preventing default
        if (event.key === "Tab") {
          yield* ctx.close();
          return;
        }
        yield* keyboardNav(event);
      });

    // Helper to position the content relative to trigger
    const setPosition = (el: Effect.Effect<HTMLElement>) =>
      Effect.gen(function* () {
        const currentSide = yield* side.get;
        const currentAlign = yield* align.get;
        const currentSideOffset = yield* sideOffset.get;

        const contentRect = yield* el.pipe(Element.getBoundingClientRect);
        const anchorRect = yield* ctx.triggerRef.pipe(
          Element.getBoundingClientRect,
        );

        const { top, left } = calculatePosition(
          anchorRect,
          currentSide,
          currentAlign,
          currentSideOffset,
          0,
          contentRect.width,
          contentRect.height,
        );

        const positionStyle = {
          top: `${top}px`,
          left: `${left}px`,
          minWidth: `${anchorRect.width}px`,
          opacity: "",
          animation: "none",
        };

        return yield* el.pipe(Element.setStyles(positionStyle));
      });

    const contentProps = {
      ref: ctx.contentRef,
      id: contentId,
      role: "menu" as const,
      "aria-labelledby": Effect.runSync(
        ctx.triggerRef.pipe(
          Element.getId,
          Effect.catchAll(() => Effect.succeed("")),
        ),
      ),
      "data-state": dataState,
      "data-side": side,
      "data-align": align,
      "data-menu-content": "",
      tabIndex: -1,
      style: {
        position: "fixed" as const,
        opacity: 0,
      },
      onKeyDown: handleKeyDown,
    };

    const animateConfig = props.animate
      ? {
          ...props.animate,
          onBeforeEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(setPosition, Effect.ignore),
          onEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(
              Element.setStyles({ animation: "" }),
              Element.focusFirst("[data-menu-item]:not([data-disabled])"),
              Element.tapEffect(
                () => props.animate?.onEnter?.(el) ?? Effect.void,
              ),
              Effect.ignore,
            ),
        }
      : {
          onBeforeEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(setPosition, Effect.ignore),
          onEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(
              Element.setStyles({ animation: "" }),
              Element.focusFirst("[data-menu-item]:not([data-disabled])"),
              Effect.ignore,
            ),
        };

    // Portal is always rendered, but the content inside uses `when` for animations.
    return yield* Portal(() =>
      when(ctx.isOpen, {
        onTrue: () =>
          props.asChild && Effect.isEffect(children)
            ? mergeProps(
                contentProps,
                children as Element.Element<never, DropdownMenuCtx>,
              )
            : $.div({ ...contentProps, class: props.class }, children ?? []),
        onFalse: () => $.div({ style: { display: "none" } }),
        animate: animateConfig,
      }),
    );
  });

/**
 * Props for DropdownMenu.Item
 */
export interface DropdownMenuItemProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when item is selected */
  readonly onSelect?: () => Effect.Effect<void>;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * A clickable item within the DropdownMenu.
 *
 * @example
 * ```ts
 * // Default usage - renders a button
 * DropdownMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Edit")
 *
 * // With asChild - renders user's element with injected props
 * DropdownMenu.Item({ asChild: true, onSelect: () => Effect.log("Clicked!") },
 *   $.a({ href: "/edit" }, "Edit")
 * )
 * ```
 */
const Item = (
  props: DropdownMenuItemProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DropdownMenuCtx;

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        yield* props.onSelect?.() ?? Effect.void;

        // Close menu and return focus to trigger
        yield* ctx.close();
        yield* ctx.triggerRef.pipe(Element.focus, Effect.ignore);
      });

    const itemProps = {
      role: "menuitem",
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      tabIndex,
      disabled,
      onClick: handleClick,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        itemProps,
        children as Element.Element<never, DropdownMenuCtx>,
      );
    }

    // When not asChild, child is used as button content
    return yield* $.button(
      { ...itemProps, class: props.class },
      children ?? [],
    );
  });

/**
 * Props for DropdownMenu.Group
 */
export interface DropdownMenuGroupProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default div */
  readonly asChild?: boolean;
}

/**
 * Groups related items together.
 *
 * @example
 * ```ts
 * DropdownMenu.Group({}, [
 *   DropdownMenu.Label({}, "Actions"),
 *   DropdownMenu.Item({}, "Edit"),
 *   DropdownMenu.Item({}, "Delete"),
 * ])
 * ```
 */
const Group = (
  props: DropdownMenuGroupProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const groupProps = {
      role: "group" as const,
      "data-menu-group": "",
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        groupProps,
        children as Element.Element<never, DropdownMenuCtx>,
      );
    }

    return yield* $.div({ ...groupProps, class: props.class }, children ?? []);
  });

/**
 * Props for DropdownMenu.Label
 */
export interface DropdownMenuLabelProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default div */
  readonly asChild?: boolean;
}

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * DropdownMenu.Label({}, "Section Title")
 * ```
 */
const Label = (
  props: DropdownMenuLabelProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const labelProps = {
      "data-menu-label": "",
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        labelProps,
        children as Element.Element<never, DropdownMenuCtx>,
      );
    }

    return yield* $.div({ ...labelProps, class: props.class }, children ?? []);
  });

/**
 * Props for DropdownMenu.Separator
 */
export interface DropdownMenuSeparatorProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default div */
  readonly asChild?: boolean;
}

/**
 * Visual separator between items or groups.
 *
 * @example
 * ```ts
 * DropdownMenu.Separator({})
 * ```
 */
const Separator = (
  props: DropdownMenuSeparatorProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const separatorProps = {
      role: "separator" as const,
      "data-menu-separator": "",
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        separatorProps,
        children as Element.Element<never, DropdownMenuCtx>,
      );
    }

    return yield* $.div({ ...separatorProps, class: props.class });
  });

/**
 * Props for DropdownMenu.CheckboxItem
 */
export interface DropdownMenuCheckboxItemProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Controlled checked state */
  readonly checked?: Signal<boolean>;
  /** Default checked state (uncontrolled) */
  readonly defaultChecked?: boolean;
  /** Callback when checked state changes */
  readonly onCheckedChange?: (checked: boolean) => Effect.Effect<void>;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * A menu item with a checkbox that can be toggled.
 *
 * @example
 * ```ts
 * const showGrid = yield* Signal.make(true);
 * DropdownMenu.CheckboxItem({ checked: showGrid }, "Show Grid")
 * ```
 */
const CheckboxItem = (
  props: DropdownMenuCheckboxItemProps,
  children?:
    | Child<never, DropdownMenuCtx>
    | readonly Child<never, DropdownMenuCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DropdownMenuCtx;

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    const checked = yield* Signal.fromNullable(
      props.checked,
      props.defaultChecked ?? false,
    );

    const dataState = checked.map((c) => (c ? "checked" : "unchecked"));
    const ariaChecked = checked.map((c) => (c ? "true" : "false"));

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        const current = yield* checked.get;
        const newValue = !current;
        yield* checked.set(newValue);
        yield* props.onCheckedChange?.(newValue) ?? Effect.void;

        // Close menu and return focus to trigger
        yield* ctx.close();
        yield* ctx.triggerRef.pipe(Element.focus, Effect.ignore);
      });

    const checkboxItemProps = {
      role: "menuitemcheckbox" as const,
      "aria-checked": ariaChecked,
      "data-state": dataState,
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      "data-menu-checkbox-item": "",
      onClick: handleClick,
      tabIndex,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        checkboxItemProps,
        children as Element.Element<never, DropdownMenuCtx>,
      );
    }

    return yield* $.button(
      { ...checkboxItemProps, class: props.class },
      children ?? [],
    );
  });

/**
 * Props for DropdownMenu.RadioGroup
 */
export interface DropdownMenuRadioGroupProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Controlled value */
  readonly value?: Signal<string>;
  /** Default value (uncontrolled) */
  readonly defaultValue?: string;
  /** Callback when value changes */
  readonly onValueChange?: (value: string) => Effect.Effect<void>;
}

/**
 * Groups radio items together. Only one item can be selected at a time.
 *
 * @example
 * ```ts
 * const sortBy = yield* Signal.make("name");
 * DropdownMenu.RadioGroup({ value: sortBy }, [
 *   DropdownMenu.RadioItem({ value: "name" }, "Name"),
 *   DropdownMenu.RadioItem({ value: "date" }, "Date"),
 *   DropdownMenu.RadioItem({ value: "size" }, "Size"),
 * ])
 * ```
 */
const RadioGroup = (
  props: DropdownMenuRadioGroupProps,
  children: Child<never, DropdownMenuCtx | DropdownMenuRadioGroupCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const value = yield* Signal.fromNullable(
      props.value,
      props.defaultValue ?? "",
    );

    const setValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        yield* props.onValueChange?.(newValue) ?? Effect.void;
      });

    const radioCtx: DropdownMenuRadioGroupContext = {
      value,
      setValue,
    };

    return yield* $.div(
      {
        class: props.class,
        role: "group",
        "data-menu-radio-group": "",
      },
      provide(DropdownMenuRadioGroupCtx, radioCtx, children),
    );
  });

/**
 * Props for DropdownMenu.RadioItem
 */
export interface DropdownMenuRadioItemProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** The value for this radio item */
  readonly value: string;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * A radio item within a RadioGroup. Only one can be selected at a time.
 *
 * @example
 * ```ts
 * DropdownMenu.RadioItem({ value: "option1" }, "Option 1")
 * ```
 */
const RadioItem = (
  props: DropdownMenuRadioItemProps,
  children?:
    | Child<never, DropdownMenuCtx | DropdownMenuRadioGroupCtx>
    | readonly Child<never, DropdownMenuCtx | DropdownMenuRadioGroupCtx>[],
): Element.Element<never, DropdownMenuCtx | DropdownMenuRadioGroupCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DropdownMenuCtx;
    const radioCtx = yield* DropdownMenuRadioGroupCtx;

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    const isChecked = radioCtx.value.map((v) => v === props.value);
    const dataState = isChecked.map((c) => (c ? "checked" : "unchecked"));
    const ariaChecked = isChecked.map((c) => (c ? "true" : "false"));

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        yield* radioCtx.setValue(props.value);

        // Close menu and return focus to trigger
        yield* ctx.close();
        yield* ctx.triggerRef.pipe(Element.focus, Effect.ignore);
      });

    const radioItemProps = {
      role: "menuitemradio" as const,
      "aria-checked": ariaChecked,
      "data-state": dataState,
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      "data-menu-radio-item": "",
      tabIndex,
      onClick: handleClick,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        radioItemProps,
        children as Element.Element<
          never,
          DropdownMenuCtx | DropdownMenuRadioGroupCtx
        >,
      );
    }

    return yield* $.button(
      { ...radioItemProps, class: props.class },
      children ?? [],
    );
  });

/**
 * Props for DropdownMenu.Sub
 */
export interface DropdownMenuSubProps {
  /** Controlled open state */
  readonly open?: Signal<boolean>;
  /** Default open state */
  readonly defaultOpen?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Wrapper for a submenu. Manages open/closed state for the submenu
 * and provides context to SubTrigger and SubContent.
 *
 * @example
 * ```ts
 * DropdownMenu.Sub({}, [
 *   DropdownMenu.SubTrigger({}, "More Options"),
 *   DropdownMenu.SubContent({}, [
 *     DropdownMenu.Item({}, "Sub Option 1"),
 *     DropdownMenu.Item({}, "Sub Option 2"),
 *   ]),
 * ])
 * ```
 */
const Sub = (
  props: DropdownMenuSubProps,
  children: Child<never, DropdownMenuCtx | DropdownMenuSubCtx>[],
): Element.Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );

    const triggerRef = yield* Element.ref<HTMLButtonElement>();
    const contentRef = yield* Element.ref<HTMLDivElement>();

    // Shared close timeout - managed at Sub level so both SubTrigger and SubContent can access it
    let closeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cancelClose = () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
    };

    const scheduleClose = () => {
      cancelClose();
      closeTimeout = setTimeout(() => {
        Effect.runSync(isOpen.set(false));
        if (props.onOpenChange) {
          Effect.runSync(props.onOpenChange(false));
        }
      }, 100);
    };

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        if (newValue) {
          cancelClose(); // Cancel any pending close when opening
        }
        yield* isOpen.set(newValue);
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
      });

    const subCtx: DropdownMenuSubContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      cancelClose,
      scheduleClose,
      triggerRef,
      contentRef,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(DropdownMenuSubCtx, subCtx, children),
    );
  });

/**
 * Props for DropdownMenu.SubTrigger
 */
export interface DropdownMenuSubTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether this trigger is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Trigger for a submenu. Opens the submenu on hover or ArrowRight key.
 *
 * @example
 * ```ts
 * DropdownMenu.SubTrigger({}, "More Options →")
 * ```
 */
const SubTrigger = (
  props: DropdownMenuSubTriggerProps,
  children?:
    | Child<never, DropdownMenuSubCtx>
    | readonly Child<never, DropdownMenuSubCtx>[],
): Element.Element<never, DropdownMenuSubCtx> =>
  Effect.gen(function* () {
    const subCtx = yield* DropdownMenuSubCtx;

    const triggerId = yield* UniqueId.make("submenu-trigger");

    // Normalize disabled prop
    const disabled = Readable.of(props.disabled ?? false);
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMouseEnter = () =>
      Effect.sync(() => {
        subCtx.cancelClose(); // Cancel any pending close from context
        hoverTimeout = setTimeout(() => {
          Effect.runSync(subCtx.open());
        }, 100);
      });

    const handleMouseLeave = () =>
      Effect.sync(() => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        subCtx.scheduleClose(); // Use shared close timeout
      });

    const handleKeyDown = (event: KeyboardEvent) =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;

        if (event.key === "ArrowRight" || event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          yield* subCtx.open();
          // Focus first item in submenu
          yield* subCtx.contentRef.pipe(
            Element.focusFirst("[data-menu-item]:not([data-disabled])"),
            Effect.catchAll(() => Effect.void),
          );
        }
      });

    const handleClick = () =>
      Effect.gen(function* () {
        if (yield* disabled.get) return;
        yield* subCtx.open();
      });

    // Cleanup timeout on unmount
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
      }),
    );

    const subTriggerProps = {
      ref: subCtx.triggerRef,
      id: triggerId,
      role: "menuitem" as const,
      "aria-haspopup": "menu" as const,
      "aria-expanded": subCtx.isOpen.map((open) => (open ? "true" : "false")),
      "aria-controls": Effect.runSync(
        subCtx.contentRef.pipe(
          Element.getId,
          Effect.catchAll(() => Effect.succeed("")),
        ),
      ),
      "data-state": dataState,
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      "data-menu-subtrigger": "",
      tabIndex,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        subTriggerProps,
        children as Element.Element<never, DropdownMenuSubCtx>,
      );
    }

    return yield* $.button(
      { ...subTriggerProps, class: props.class },
      children ?? [],
    );
  });

/**
 * Props for DropdownMenu.SubContent
 */
export interface DropdownMenuSubContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Gap between trigger and content in pixels (default: 0) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
  /** Render as child element instead of default div */
  readonly asChild?: boolean;
}

/**
 * Content area for a submenu. Positioned to the right of SubTrigger.
 *
 * @example
 * ```ts
 * DropdownMenu.SubContent({}, [
 *   DropdownMenu.Item({}, "Sub Option 1"),
 *   DropdownMenu.Item({}, "Sub Option 2"),
 * ])
 * ```
 */
const SubContent = (
  props: DropdownMenuSubContentProps,
  children?:
    | Child<never, DropdownMenuCtx | DropdownMenuSubCtx>
    | readonly Child<never, DropdownMenuCtx | DropdownMenuSubCtx>[],
): Element.Element<never, DropdownMenuCtx | DropdownMenuSubCtx> =>
  Effect.gen(function* () {
    const rootCtx = yield* DropdownMenuCtx;
    const subCtx = yield* DropdownMenuSubCtx;

    const contentId = yield* UniqueId.make("submenu-content");

    // Normalize sideOffset prop
    const sideOffset = Readable.of(props.sideOffset ?? 0);
    const loop = props.loop ?? true;

    const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

    // Mouse enter/leave handlers
    const handleMouseEnter = () =>
      Effect.sync(() => {
        subCtx.cancelClose();
      });

    const handleMouseLeave = (event: MouseEvent) =>
      Effect.sync(() => {
        const contentEl = document.getElementById(contentId);
        const relatedTarget = event.relatedTarget;

        // Don't schedule close if moving to a child element
        if (
          contentEl &&
          relatedTarget instanceof Node &&
          contentEl.contains(relatedTarget)
        ) {
          return;
        }

        // Don't schedule close if moving to a nested submenu content
        if (
          relatedTarget instanceof HTMLElement &&
          (relatedTarget.hasAttribute("data-menu-subcontent") ||
            relatedTarget.closest("[data-menu-subcontent]"))
        ) {
          return;
        }

        subCtx.scheduleClose();
      });

    // Keyboard navigation - created at component level
    const keyboardNav = yield* createKeyboardNav({
      selector: "[data-menu-item]:not([data-disabled])",
      orientation: "vertical",
      loop,
      onActivate: (el) =>
        // Don't activate subtriggers
        Effect.unlessEffect(
          el.pipe(Element.click, Effect.ignore),
          el.pipe(Element.hasAttribute("data-menu-subtrigger")),
        ),
      onEscape: () =>
        subCtx
          .close()
          .pipe(
            Effect.andThen(
              subCtx.triggerRef.pipe(Element.focus, Effect.ignore),
            ),
          ),
    });

    const handleKeyDown = (event: KeyboardEvent) =>
      Effect.gen(function* () {
        // ArrowLeft closes submenu and returns to parent
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          event.stopPropagation();
          yield* subCtx.close();
          yield* subCtx.triggerRef.pipe(Element.focus, Effect.ignore);
          return;
        }

        // Tab closes entire menu tree
        if (event.key === "Tab") {
          yield* subCtx.close();
          yield* rootCtx.close();
          return;
        }

        yield* keyboardNav(event);
      });

    // Helper to position the content relative to trigger
    const setPosition = (el: Effect.Effect<HTMLElement>) =>
      Effect.gen(function* () {
        const currentSideOffset = yield* sideOffset.get;
        const positionStyle = yield* subCtx.triggerRef.pipe(
          Element.getBoundingClientRect,
          Effect.map((rect) => ({
            position: "fixed",
            top: `${rect.top}px`,
            left: `${rect.right + currentSideOffset}px`,
          })),
        );

        return yield* el.pipe(Element.setStyles(positionStyle));
      });

    const subContentProps = {
      id: contentId,
      role: "menu" as const,
      "aria-labelledby": Effect.runSync(
        subCtx.triggerRef.pipe(
          Element.getId,
          Effect.catchAll(() => Effect.succeed("")),
        ),
      ),
      ref: subCtx.contentRef,
      "data-state": dataState,
      "data-side": "right",
      "data-menu-content": "",
      "data-menu-subcontent": "",
      tabIndex: -1,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleKeyDown,
    };

    const animateConfig = props.animate
      ? {
          ...props.animate,
          onBeforeEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(setPosition, Effect.ignore),
          onEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(
              Element.focusFirst("[data-menu-item]:not([data-disabled])"),
              Element.tapEffect(
                () => props.animate?.onEnter?.(el) ?? Effect.void,
              ),
              Effect.ignore,
            ),
        }
      : {
          onBeforeEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(setPosition, Effect.ignore),
          onEnter: (el: Effect.Effect<HTMLElement>) =>
            el.pipe(
              setPosition,
              Element.focusFirst("[data-menu-item]:not([data-disabled])"),
              Effect.ignore,
            ),
        };

    // Portal is always rendered, but the content inside uses `when` for animations.
    return yield* Portal(() =>
      when(subCtx.isOpen, {
        onTrue: () =>
          props.asChild && Effect.isEffect(children)
            ? mergeProps(
                subContentProps,
                children as Element.Element<
                  never,
                  DropdownMenuCtx | DropdownMenuSubCtx
                >,
              )
            : $.div({ ...subContentProps, class: props.class }, children ?? []),
        onFalse: () => $.div({ style: { display: "none" } }),
        animate: animateConfig,
      }),
    );
  });

/**
 * Headless DropdownMenu primitive for building accessible action menus.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Configurable positioning (side, align, offset)
 * - Click outside to close
 * - Escape key to close
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - Portal rendering
 * - ARIA attributes (menu, menuitem)
 * - Data attributes for styling
 * - Groups and labels
 *
 * @example
 * ```ts
 * // Basic usage
 * DropdownMenu.Root({}, [
 *   DropdownMenu.Trigger({}, "Actions"),
 *   DropdownMenu.Content({}, [
 *     DropdownMenu.Item({ onSelect: () => Effect.log("Edit") }, "Edit"),
 *     DropdownMenu.Item({ onSelect: () => Effect.log("Duplicate") }, "Duplicate"),
 *     DropdownMenu.Separator({}),
 *     DropdownMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
 *   ]),
 * ])
 *
 * // With groups
 * DropdownMenu.Root({}, [
 *   DropdownMenu.Trigger({}, "Options"),
 *   DropdownMenu.Content({}, [
 *     DropdownMenu.Group({}, [
 *       DropdownMenu.Label({}, "Edit"),
 *       DropdownMenu.Item({}, "Cut"),
 *       DropdownMenu.Item({}, "Copy"),
 *       DropdownMenu.Item({}, "Paste"),
 *     ]),
 *     DropdownMenu.Separator({}),
 *     DropdownMenu.Group({}, [
 *       DropdownMenu.Label({}, "View"),
 *       DropdownMenu.Item({}, "Zoom In"),
 *       DropdownMenu.Item({}, "Zoom Out"),
 *     ]),
 *   ]),
 * ])
 * ```
 */
export const DropdownMenu = {
  Root,
  Trigger,
  Content,
  Item,
  Group,
  Label,
  Separator,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  Sub,
  SubTrigger,
  SubContent,
} as const;
