import { Context, Effect } from "effect";

import {
  $,
  Component,
  createKeyboardNav,
  Element,
  onClickOutside,
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

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Context shared between ContextMenu parts.
 */
export interface ContextMenuContext {
  /** Whether the menu is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the menu at specific coordinates */
  readonly openAt: (x: number, y: number) => Effect.Effect<void>;
  /** Close the menu */
  readonly close: () => Effect.Effect<void>;
  /** Current cursor position when menu was opened */
  readonly position: Signal<{ x: number; y: number }>;
  readonly contentRef: ElementRef<HTMLDivElement>;
}

/**
 * Context for ContextMenu.RadioGroup
 */
export interface ContextMenuRadioGroupContext {
  /** Current selected value */
  readonly value: Readable.Readable<string>;
  /** Set the selected value */
  readonly setValue: (value: string) => Effect.Effect<void>;
}

/**
 * Context for ContextMenu.Sub
 */
export interface ContextMenuSubContext {
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
  readonly triggerRef: ElementRef<HTMLDivElement>;
  readonly contentRef: ElementRef<HTMLDivElement>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for ContextMenu state sharing between parts.
 */
export class ContextMenuCtx extends Context.Tag("ContextMenuContext")<
  ContextMenuCtx,
  ContextMenuContext
>() {}

/**
 * Effect Context for ContextMenu.Sub state sharing.
 */
export class ContextMenuSubCtx extends Context.Tag("ContextMenuSubContext")<
  ContextMenuSubCtx,
  ContextMenuSubContext
>() {}

/**
 * Effect Context for ContextMenu.RadioGroup state sharing.
 */
export class ContextMenuRadioGroupCtx extends Context.Tag(
  "ContextMenuRadioGroupContext",
)<ContextMenuRadioGroupCtx, ContextMenuRadioGroupContext>() {}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for ContextMenu.Root
 */
export interface ContextMenuRootProps {
  /** Controlled open state */
  readonly open?: Signal<boolean>;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Root container for a ContextMenu. Manages open/closed state
 * and provides context to child components.
 *
 * @example
 * ```ts
 * ContextMenu.Root({}, [
 *   ContextMenu.Trigger({}, div({ class: "right-click-area" }, "Right click here")),
 *   ContextMenu.Content({}, [
 *     ContextMenu.Item({ onSelect: () => Effect.log("Copy") }, "Copy"),
 *     ContextMenu.Item({ onSelect: () => Effect.log("Paste") }, "Paste"),
 *   ]),
 * ])
 * ```
 */
const Root = Component.gen(function* (props: ContextMenuRootProps, children) {
  const isOpen = yield* Signal.fromNullable(props.open, false);
  const position = yield* Signal.make({ x: 0, y: 0 });

  const contentRef = yield* Element.ref<HTMLDivElement>();

  const setOpenState = (newValue: boolean) =>
    Effect.gen(function* () {
      yield* isOpen.set(newValue);
      yield* props.onOpenChange?.(newValue) ?? Effect.void;
    });

  const ctx: ContextMenuContext = {
    isOpen,
    openAt: (x: number, y: number) =>
      Effect.gen(function* () {
        yield* position.set({ x, y });
        yield* setOpenState(true);
      }),
    close: () => setOpenState(false),
    position,
    contentRef,
  };

  return yield* $.div(
    { style: { display: "contents" } },
    provide(ContextMenuCtx, ctx, Component.normalizeChildren(children)),
  );
});

/**
 * Props for ContextMenu.Trigger
 */
export interface ContextMenuTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether the trigger is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * The area that responds to right-click to open the context menu.
 *
 * @example
 * ```ts
 * ContextMenu.Trigger({}, div({ class: "file-item" }, "document.pdf"))
 * ```
 */
const Trigger = Component.gen(function* (
  props: ContextMenuTriggerProps,
  children,
) {
  const ctx = yield* ContextMenuCtx;
  const triggerId = yield* UniqueId.make("context-menu-trigger");

  // Normalize disabled prop
  const disabled = Readable.of(props.disabled ?? false);
  const dataDisabled = disabled.map((d) => (d ? "" : undefined));

  const handleContextMenu = (event: MouseEvent) =>
    Effect.gen(function* () {
      if (yield* disabled.get) return;

      event.preventDefault();
      yield* ctx.openAt(event.clientX, event.clientY);
    });

  return yield* $.div(
    {
      id: triggerId,
      class: props.class,
      "data-disabled": dataDisabled,
      "data-context-menu-trigger": "",
      onContextMenu: handleContextMenu,
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.Content
 */
export interface ContextMenuContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Content area for the ContextMenu.
 * Renders in a Portal and is positioned at the cursor location.
 *
 * @example
 * ```ts
 * ContextMenu.Content({}, [
 *   ContextMenu.Item({}, "Option 1"),
 *   ContextMenu.Item({}, "Option 2"),
 * ])
 * ```
 */
const Content = Component.gen(function* (
  props: ContextMenuContentProps,
  children,
) {
  const ctx = yield* ContextMenuCtx;

  const id = yield* UniqueId.make("context-menu-content");

  const loop = props.loop ?? true;

  const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

  const handleDocumentContextMenu = (e: MouseEvent) =>
    ctx.contentRef.pipe(
      () => ctx.close(),
      Effect.unlessEffect(Element.contains(ctx.contentRef, e.target as Node)),
    );

  const keyboardNav = yield* createKeyboardNav({
    selector: "[data-menu-item]:not([data-disabled])",
    orientation: "vertical",
    loop,
    onActivate: (el) => el.pipe(Element.click, Effect.ignore),
    onEscape: () => ctx.close(),
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

  yield* onClickOutside([ctx.contentRef], () => ctx.close());

  const setPosition = (el: Effect.Effect<HTMLElement>) =>
    Effect.gen(function* () {
      const pos = yield* ctx.position.get;

      return yield* el.pipe(
        Element.setStyles({ top: `${pos.y}px`, left: `${pos.x}px` }),
      );
    });

  document.addEventListener("contextmenu", handleDocumentContextMenu, true);

  yield* Effect.addFinalizer(() =>
    Effect.sync(() => {
      document.removeEventListener(
        "contextmenu",
        handleDocumentContextMenu,
        true,
      );
    }),
  );

  // Portal is always rendered, but the content inside uses `when` for animations.
  // This ensures animations apply to the actual visible content, not a placeholder.
  return yield* Portal(() =>
    when(ctx.isOpen, {
      onTrue: () =>
        Effect.gen(function* () {
          return yield* $.div(
            {
              id,
              class: props.class,
              ref: ctx.contentRef,
              role: "menu",
              "aria-labelledby": Effect.runSync(
                Element.getId(ctx.contentRef).pipe(
                  Effect.catchAll(() => Effect.succeed("")),
                ),
              ),
              "data-state": dataState,
              "data-menu-content": "",
              "data-context-menu-content": "",
              tabIndex: -1,
              style: {
                position: "fixed",
              },
              onKeyDown: handleKeyDown,
            },
            children ?? [],
          );
        }),
      onFalse: () => $.div({ style: { display: "none" } }),
      animate: props.animate
        ? {
            ...props.animate,
            onEnter: (el) =>
              el.pipe(
                setPosition,
                Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                Element.tapEffect(
                  () => props.animate?.onEnter?.(el) ?? Effect.void,
                ),
              ),
          }
        : {
            onEnter: (el) =>
              el.pipe(
                setPosition,
                Element.focusFirst("[data-menu-item]:not([data-disabled])"),
              ),
          },
    }),
  );
});

/**
 * Props for ContextMenu.Item
 */
export interface ContextMenuItemProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when item is selected */
  readonly onSelect?: () => Effect.Effect<void>;
}

/**
 * A clickable item within the ContextMenu.
 *
 * @example
 * ```ts
 * ContextMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Copy")
 * ```
 */
const Item = Component.gen(function* (props: ContextMenuItemProps, children) {
  const ctx = yield* ContextMenuCtx;

  // Normalize disabled prop
  const disabled = Readable.of(props.disabled ?? false);
  const dataDisabled = disabled.map((d) => (d ? "" : undefined));
  const tabIndex = disabled.map((d) => (d ? -1 : 0));

  const handleClick = () =>
    Effect.gen(function* () {
      if (yield* disabled.get) return;

      yield* props.onSelect?.() ?? Effect.void;

      // Close menu
      yield* ctx.close();
    });

  return yield* $.div(
    {
      class: props.class,
      role: "menuitem",
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      "data-context-menu-item": "",
      tabIndex,
      onClick: handleClick,
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.Group
 */
export interface ContextMenuGroupProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Groups related items together.
 *
 * @example
 * ```ts
 * ContextMenu.Group({}, [
 *   ContextMenu.Label({}, "Edit"),
 *   ContextMenu.Item({}, "Cut"),
 *   ContextMenu.Item({}, "Copy"),
 * ])
 * ```
 */
const Group = Component.gen(function* (props: ContextMenuGroupProps, children) {
  return yield* $.div(
    {
      class: props.class,
      role: "group",
      "data-menu-group": "",
      "data-context-menu-group": "",
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.Label
 */
export interface ContextMenuLabelProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * ContextMenu.Label({}, "Section Title")
 * ```
 */
const Label = Component.gen(function* (props: ContextMenuLabelProps, children) {
  return yield* $.div(
    {
      class: props.class,
      "data-menu-label": "",
      "data-context-menu-label": "",
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.Separator
 */
export interface ContextMenuSeparatorProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Visual separator between items or groups.
 *
 * @example
 * ```ts
 * ContextMenu.Separator({})
 * ```
 */
const Separator = Component.gen(function* (props: ContextMenuSeparatorProps) {
  return yield* $.div({
    class: props.class,
    role: "separator",
    "data-menu-separator": "",
    "data-context-menu-separator": "",
  });
});

/**
 * Props for ContextMenu.CheckboxItem
 */
export interface ContextMenuCheckboxItemProps {
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
}

/**
 * A menu item with a checkbox that can be toggled.
 *
 * @example
 * ```ts
 * const showHidden = yield* Signal.make(false);
 * ContextMenu.CheckboxItem({ checked: showHidden }, "Show Hidden Files")
 * ```
 */
const CheckboxItem = Component.gen(function* (
  props: ContextMenuCheckboxItemProps,
  children,
) {
  const ctx = yield* ContextMenuCtx;

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

      // Close menu
      yield* ctx.close();
    });

  return yield* $.div(
    {
      class: props.class,
      role: "menuitemcheckbox",
      "aria-checked": ariaChecked,
      "data-state": dataState,
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      "data-menu-checkbox-item": "",
      "data-context-menu-item": "",
      "data-context-menu-checkbox-item": "",
      tabIndex,
      onClick: handleClick,
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.RadioGroup
 */
export interface ContextMenuRadioGroupProps {
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
 * const viewMode = yield* Signal.make("list");
 * ContextMenu.RadioGroup({ value: viewMode }, [
 *   ContextMenu.RadioItem({ value: "list" }, "List"),
 *   ContextMenu.RadioItem({ value: "grid" }, "Grid"),
 * ])
 * ```
 */
const RadioGroup = Component.gen(function* (
  props: ContextMenuRadioGroupProps,
  children,
) {
  const value = yield* Signal.fromNullable(
    props.value,
    props.defaultValue ?? "",
  );

  const setValue = (newValue: string) =>
    Effect.gen(function* () {
      yield* value.set(newValue);
      yield* props.onValueChange?.(newValue) ?? Effect.void;
    });

  const radioCtx: ContextMenuRadioGroupContext = {
    value,
    setValue,
  };

  return yield* $.div(
    {
      class: props.class,
      role: "group",
      "data-menu-radio-group": "",
      "data-context-menu-radio-group": "",
    },
    provide(ContextMenuRadioGroupCtx, radioCtx, children),
  );
});

/**
 * Props for ContextMenu.RadioItem
 */
export interface ContextMenuRadioItemProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** The value for this radio item */
  readonly value: string;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * A radio item within a RadioGroup. Only one can be selected at a time.
 *
 * @example
 * ```ts
 * ContextMenu.RadioItem({ value: "list" }, "List View")
 * ```
 */
const RadioItem = Component.gen(function* (
  props: ContextMenuRadioItemProps,
  children,
) {
  const ctx = yield* ContextMenuCtx;
  const radioCtx = yield* ContextMenuRadioGroupCtx;

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

      // Close menu
      yield* ctx.close();
    });

  return yield* $.div(
    {
      class: props.class,
      role: "menuitemradio",
      "aria-checked": ariaChecked,
      "data-state": dataState,
      "data-disabled": dataDisabled,
      "data-menu-item": "",
      "data-menu-radio-item": "",
      "data-context-menu-item": "",
      "data-context-menu-radio-item": "",
      tabIndex,
      onClick: handleClick,
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.Sub
 */
export interface ContextMenuSubProps {
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
 * ContextMenu.Sub({}, [
 *   ContextMenu.SubTrigger({}, "More Options"),
 *   ContextMenu.SubContent({}, [
 *     ContextMenu.Item({}, "Sub Option 1"),
 *     ContextMenu.Item({}, "Sub Option 2"),
 *   ]),
 * ])
 * ```
 */
const Sub = Component.gen(function* (props: ContextMenuSubProps, children) {
  const isOpen = yield* Signal.fromNullable(
    props.open,
    props.defaultOpen ?? false,
  );

  const triggerRef = yield* Element.ref<HTMLDivElement>();
  const contentRef = yield* Element.ref<HTMLDivElement>();

  // Shared close timeout
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
        cancelClose();
      }
      yield* isOpen.set(newValue);
      yield* props.onOpenChange?.(newValue) ?? Effect.void;
    });

  const subCtx: ContextMenuSubContext = {
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
    provide(ContextMenuSubCtx, subCtx, children),
  );
});

/**
 * Props for ContextMenu.SubTrigger
 */
export interface ContextMenuSubTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Whether this trigger is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * Trigger for a submenu. Opens the submenu on hover or ArrowRight key.
 *
 * @example
 * ```ts
 * ContextMenu.SubTrigger({}, "More Options →")
 * ```
 */
const SubTrigger = Component.gen(function* (
  props: ContextMenuSubTriggerProps,
  children,
) {
  const subCtx = yield* ContextMenuSubCtx;

  const triggerId = yield* UniqueId.make("context-submenu-trigger");

  // Normalize disabled prop
  const disabled = Readable.of(props.disabled ?? false);
  const dataDisabled = disabled.map((d) => (d ? "" : undefined));
  const tabIndex = disabled.map((d) => (d ? -1 : 0));

  const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleMouseEnter = () =>
    Effect.sync(() => {
      subCtx.cancelClose();
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
      subCtx.scheduleClose();
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
          Effect.ignore,
        );
        return;
      }
    });

  const handleClick = () =>
    Effect.gen(function* () {
      if (yield* disabled.get) return;
      yield* subCtx.open();
    });

  return yield* $.div(
    {
      ref: subCtx.triggerRef,
      id: triggerId,
      class: props.class,
      role: "menuitem",
      "aria-haspopup": "menu",
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
      "data-context-menu-item": "",
      "data-context-menu-subtrigger": "",
      tabIndex,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
    },
    children ?? [],
  );
});

/**
 * Props for ContextMenu.SubContent
 */
export interface ContextMenuSubContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Gap between trigger and content in pixels (default: 0) */
  readonly sideOffset?: Readable.Reactive<number>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Content area for a submenu. Positioned to the right of SubTrigger.
 *
 * @example
 * ```ts
 * ContextMenu.SubContent({}, [
 *   ContextMenu.Item({}, "Sub Option 1"),
 *   ContextMenu.Item({}, "Sub Option 2"),
 * ])
 * ```
 */
const SubContent = Component.gen(function* (
  props: ContextMenuSubContentProps,
  children,
) {
  const rootCtx = yield* ContextMenuCtx;
  const subCtx = yield* ContextMenuSubCtx;

  const contentId = yield* UniqueId.make("context-submenu-content");

  // Normalize sideOffset prop
  const sideOffset = Readable.of(props.sideOffset ?? 0);
  const loop = props.loop ?? true;

  const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

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
      subCtx.close().pipe(
        Effect.andThen(
          subCtx.triggerRef.pipe(
            Element.focus,
            Effect.catchAll(() => Effect.void),
          ),
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
        yield* subCtx.triggerRef.pipe(
          Element.focus,
          Effect.catchAll(() => Effect.void),
        );
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

  // Portal is always rendered, but the content inside uses `when` for animations.
  // This ensures animations apply to the actual visible content, not a placeholder.
  return yield* Portal(() =>
    when(subCtx.isOpen, {
      onTrue: () =>
        $.div(
          {
            id: contentId,
            class: props.class,
            role: "menu",
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
            "data-context-menu-content": "",
            "data-context-menu-subcontent": "",
            tabIndex: -1,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onKeyDown: handleKeyDown,
          },
          children ?? [],
        ),

      onFalse: () => $.div({ style: { display: "none" } }),
      animate: props.animate
        ? {
            ...props.animate,
            onEnter: (el) =>
              el.pipe(
                setPosition,
                Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                Element.tapEffect(
                  () => props.animate?.onEnter?.(el) ?? Effect.void,
                ),
                Effect.ignore,
              ),
          }
        : {
            // Focus first item on open
            onEnter: (el) =>
              el.pipe(
                setPosition,
                Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                Effect.ignore,
              ),
          },
    }),
  );
});

/**
 * Headless ContextMenu primitive for building accessible context menus.
 *
 * Features:
 * - Right-click to open at cursor position
 * - Controlled and uncontrolled modes
 * - Click outside to close
 * - Escape key to close
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - Portal rendering
 * - ARIA attributes (menu, menuitem)
 * - Data attributes for styling
 * - Groups and labels
 * - Checkbox and radio items
 * - Nested submenus
 *
 * @example
 * ```ts
 * ContextMenu.Root({}, [
 *   ContextMenu.Trigger({}, div({ class: "file-item" }, "document.pdf")),
 *   ContextMenu.Content({}, [
 *     ContextMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
 *     ContextMenu.Item({ onSelect: () => Effect.log("Copy") }, "Copy"),
 *     ContextMenu.Separator({}),
 *     ContextMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
 *   ]),
 * ])
 * ```
 */
export const ContextMenu = {
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
