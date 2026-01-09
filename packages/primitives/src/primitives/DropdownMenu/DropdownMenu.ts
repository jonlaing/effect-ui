import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import { Readable } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { component } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { onClickOutside, createKeyboardNav } from "@effex/dom";
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
  /** Unique ID for the content */
  readonly contentId: string;
  /** Unique ID for the trigger */
  readonly triggerId: string;
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
  readonly triggerRef: ElementRef<HTMLDivElement>;
  /** Unique ID for the submenu content */
  readonly contentId: string;
  /** Unique ID for the SubTrigger */
  readonly triggerId: string;
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
    const contentId = yield* UniqueId.make("menu-content");
    const triggerId = yield* UniqueId.make("menu-trigger");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
        if (!newValue) {
          // Return focus to trigger when closing
          yield* triggerRef.pipe(Element.focus, Effect.ignore);
        }
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
      contentId,
      triggerId,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(DropdownMenuCtx, ctx, children),
    );
  });

/**
 * Props for DropdownMenu.Trigger
 */
export interface DropdownMenuTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Whether the trigger is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * Button that opens/closes the DropdownMenu.
 *
 * @example
 * ```ts
 * DropdownMenu.Trigger({ class: "menu-trigger" }, "Open Menu")
 * ```
 */
const Trigger = component(
  "DropdownMenuTrigger",
  (props: DropdownMenuTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* DropdownMenuCtx;

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
              setTimeout(() => {
                const content = document.getElementById(ctx.contentId);
                const firstItem = content?.querySelector(
                  "[data-menu-item]:not([data-disabled])",
                ) as HTMLElement;
                firstItem?.focus();
              }, 0);
              break;
            case "ArrowUp":
              event.preventDefault();
              yield* ctx.open();
              // Focus last item after menu opens
              setTimeout(() => {
                const content = document.getElementById(ctx.contentId);
                const items = content?.querySelectorAll(
                  "[data-menu-item]:not([data-disabled])",
                );
                const lastItem = items?.[items.length - 1] as HTMLElement;
                lastItem?.focus();
              }, 0);
              break;
          }
        });

      return yield* $.button(
        {
          ref: ctx.triggerRef,
          id: ctx.triggerId,
          class: props.class,
          type: "button",
          "aria-haspopup": "menu",
          "aria-expanded": ariaExpanded,
          "aria-controls": ctx.contentId,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-menu-trigger": "",
          disabled,
          onClick: ctx.toggle,
          onKeyDown: handleKeyDown,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for DropdownMenu.Content
 */
export interface DropdownMenuContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
const Content = component(
  "DropdownMenuContent",
  (props: DropdownMenuContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* DropdownMenuCtx;

      // Normalize positioning props
      const side = Readable.of(props.side ?? "bottom");
      const align = Readable.of(props.align ?? "start");
      const sideOffset = Readable.of(props.sideOffset ?? 4);
      const loop = props.loop ?? true;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      // Portal is always rendered, but the content inside uses `when` for animations.
      // This ensures animations apply to the actual visible content, not a placeholder.
      //
      // We use onBeforeEnter to measure and position the content after DOM insertion
      // but before animation starts. This avoids using CSS transform for positioning,
      // which would conflict with transform-based animations.

      // Positioning context - set in onTrue, used in positionAndReveal
      let positioningContext: {
        triggerEl: HTMLButtonElement | null;
        side: "top" | "bottom" | "left" | "right";
        align: "start" | "center" | "end";
        sideOffset: number;
      } | null = null;

      // Helper to position and reveal the element
      const positionAndReveal = (el: HTMLElement) => {
        if (positioningContext?.triggerEl) {
          // Measure content dimensions (element is in DOM but hidden)
          const contentRect = el.getBoundingClientRect();

          // Calculate final position using content dimensions
          const anchorRect =
            positioningContext.triggerEl.getBoundingClientRect();
          const { top, left } = calculatePosition(
            anchorRect,
            positioningContext.side,
            positioningContext.align,
            positioningContext.sideOffset,
            0,
            contentRect.width,
            contentRect.height,
          );

          // Apply final position
          el.style.top = `${top}px`;
          el.style.left = `${left}px`;
          el.style.minWidth = `${anchorRect.width}px`;
        }

        // Clean up
        positioningContext = null;

        // Reveal: clear opacity and animation suppression to allow CSS/JS animations
        el.style.opacity = "";
        el.style.animation = "";
      };

      return yield* Portal(() =>
        when(ctx.isOpen, {
          onTrue: () =>
            Effect.gen(function* () {
              const triggerEl = Element.getUnsafe(ctx.triggerRef);

              // Get current positioning values
              const currentSide = yield* side.get;
              const currentAlign = yield* align.get;
              const currentSideOffset = yield* sideOffset.get;

              const keyboardNav = yield* createKeyboardNav({
                selector: "[data-menu-item]:not([data-disabled])",
                orientation: "vertical",
                loop,
                onActivate: (el) => Effect.sync(() => el.click()),
                onEscape: () =>
                  Effect.gen(function* () {
                    yield* ctx.close();
                    yield* ctx.triggerRef.pipe(Element.focus, Effect.ignore);
                  }),
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

              // Start hidden (opacity: 0) - will be positioned and revealed after DOM insertion
              // Using opacity instead of visibility for better animation compatibility
              // Also suppress any default CSS animations until we're ready
              const contentEl = yield* $.div(
                {
                  id: ctx.contentId,
                  class: props.class,
                  role: "menu",
                  "aria-labelledby": ctx.triggerId,
                  "data-state": dataState,
                  "data-side": currentSide,
                  "data-align": currentAlign,
                  "data-menu-content": "",
                  tabIndex: -1,
                  style: {
                    position: "fixed",
                    opacity: "0",
                    animation: "none",
                  },
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Click outside handler
              yield* onClickOutside([ctx.triggerRef, contentEl], () =>
                ctx.close(),
              );

              // Store positioning context for onBeforeEnter
              positioningContext = {
                triggerEl,
                side: currentSide,
                align: currentAlign,
                sideOffset: currentSideOffset,
              };

              return contentEl;
            }),
          onFalse: () => $.div({ style: { display: "none" } }),
          animate: props.animate
            ? {
                ...props.animate,
                onBeforeEnter: (el) =>
                  el.pipe(
                    Element.tap(positionAndReveal),
                    Element.tapEffect(
                      () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
                    ),
                  ),
                onEnter: (el) =>
                  el.pipe(
                    // Suppress any default CSS animations after our animation finishes
                    // to prevent them from restarting when the enter class is removed
                    Element.setStyles({ animation: "none" }),
                    // Focus first item on open
                    Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                    Element.tapEffect(
                      () => props.animate?.onEnter?.(el) ?? Effect.void,
                    ),
                  ),
                onBeforeExit: (el) =>
                  el.pipe(
                    // Re-enable animations so exit animation can run
                    Element.setStyles({ animation: "" }),
                    Element.tapEffect(
                      () => props.animate?.onBeforeExit?.(el) ?? Effect.void,
                    ),
                  ),
              }
            : {
                // Minimal animation config just to trigger positioning via onBeforeEnter
                onBeforeEnter: (el) => el.pipe(Element.tap(positionAndReveal)),
                // Focus first item on open
                onEnter: (el) =>
                  el.pipe(
                    Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                  ),
              },
        }),
      );
    }),
);

/**
 * Props for DropdownMenu.Item
 */
export interface DropdownMenuItemProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when item is selected */
  readonly onSelect?: () => Effect.Effect<void>;
}

/**
 * A clickable item within the DropdownMenu.
 *
 * @example
 * ```ts
 * DropdownMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Edit")
 * ```
 */
const Item = component(
  "DropdownMenuItem",
  (props: DropdownMenuItemProps, children) =>
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

      return yield* $.div(
        {
          class: props.class,
          role: "menuitem",
          "data-disabled": dataDisabled,
          "data-menu-item": "",
          tabIndex,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for DropdownMenu.Group
 */
export interface DropdownMenuGroupProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
const Group = component(
  "DropdownMenuGroup",
  (props: DropdownMenuGroupProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          role: "group",
          "data-menu-group": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for DropdownMenu.Label
 */
export interface DropdownMenuLabelProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * DropdownMenu.Label({}, "Section Title")
 * ```
 */
const Label = component(
  "DropdownMenuLabel",
  (props: DropdownMenuLabelProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          "data-menu-label": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for DropdownMenu.Separator
 */
export interface DropdownMenuSeparatorProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Visual separator between items or groups.
 *
 * @example
 * ```ts
 * DropdownMenu.Separator({})
 * ```
 */
const Separator = component(
  "DropdownMenuSeparator",
  (props: DropdownMenuSeparatorProps) =>
    Effect.gen(function* () {
      return yield* $.div({
        class: props.class,
        role: "separator",
        "data-menu-separator": "",
      });
    }),
);

/**
 * Props for DropdownMenu.CheckboxItem
 */
export interface DropdownMenuCheckboxItemProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
 * const showGrid = yield* Signal.make(true);
 * DropdownMenu.CheckboxItem({ checked: showGrid }, "Show Grid")
 * ```
 */
const CheckboxItem = component(
  "DropdownMenuCheckboxItem",
  (props: DropdownMenuCheckboxItemProps, children) =>
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

      return yield* $.div(
        {
          class: props.class,
          role: "menuitemcheckbox",
          "aria-checked": ariaChecked,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-menu-item": "",
          "data-menu-checkbox-item": "",
          tabIndex,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for DropdownMenu.RadioGroup
 */
export interface DropdownMenuRadioGroupProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
  readonly class?: Readable.Reactive<string>;
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
 * DropdownMenu.RadioItem({ value: "option1" }, "Option 1")
 * ```
 */
const RadioItem = component(
  "DropdownMenuRadioItem",
  (props: DropdownMenuRadioItemProps, children) =>
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

      return yield* $.div(
        {
          class: props.class,
          role: "menuitemradio",
          "aria-checked": ariaChecked,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-menu-item": "",
          "data-menu-radio-item": "",
          tabIndex,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

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

    const triggerRef = yield* Element.ref<HTMLDivElement>();
    const contentId = yield* UniqueId.make("submenu-content");
    const triggerId = yield* UniqueId.make("submenu-trigger");

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
      contentId,
      triggerId,
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
  readonly class?: Readable.Reactive<string>;
  /** Whether this trigger is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
}

/**
 * Trigger for a submenu. Opens the submenu on hover or ArrowRight key.
 *
 * @example
 * ```ts
 * DropdownMenu.SubTrigger({}, "More Options →")
 * ```
 */
const SubTrigger = component(
  "DropdownMenuSubTrigger",
  (props: DropdownMenuSubTriggerProps, children) =>
    Effect.gen(function* () {
      const subCtx = yield* DropdownMenuSubCtx;

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
            setTimeout(() => {
              const content = document.getElementById(subCtx.contentId);
              const firstItem = content?.querySelector(
                "[data-menu-item]:not([data-disabled])",
              ) as HTMLElement;
              firstItem?.focus();
            }, 0);
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

      return yield* $.div(
        {
          ref: subCtx.triggerRef,
          id: subCtx.triggerId,
          class: props.class,
          role: "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": subCtx.isOpen.map((open) =>
            open ? "true" : "false",
          ),
          "aria-controls": subCtx.contentId,
          "data-state": dataState,
          "data-disabled": dataDisabled,
          "data-menu-item": "",
          "data-menu-subtrigger": "",
          tabIndex,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onKeyDown: handleKeyDown,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for DropdownMenu.SubContent
 */
export interface DropdownMenuSubContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
 * DropdownMenu.SubContent({}, [
 *   DropdownMenu.Item({}, "Sub Option 1"),
 *   DropdownMenu.Item({}, "Sub Option 2"),
 * ])
 * ```
 */
const SubContent = component(
  "DropdownMenuSubContent",
  (props: DropdownMenuSubContentProps, children) =>
    Effect.gen(function* () {
      const rootCtx = yield* DropdownMenuCtx;
      const subCtx = yield* DropdownMenuSubCtx;

      // Normalize sideOffset prop
      const sideOffset = Readable.of(props.sideOffset ?? 0);
      const loop = props.loop ?? true;

      const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

      // Portal is always rendered, but the content inside uses `when` for animations.
      // This ensures animations apply to the actual visible content, not a placeholder.
      //
      // We use onBeforeEnter to measure and position the content after DOM insertion
      // but before animation starts. This avoids using CSS transform for positioning,
      // which would conflict with transform-based animations.

      // Positioning context - set in onTrue, used in positionAndReveal
      let positioningContext: {
        triggerEl: HTMLDivElement | null;
        sideOffset: number;
      } | null = null;

      // Helper to position and reveal the element
      const positionAndReveal = (el: HTMLElement) => {
        if (positioningContext?.triggerEl) {
          // Measure content dimensions (element is in DOM but hidden)
          const contentRect = el.getBoundingClientRect();

          // Calculate final position using content dimensions
          const anchorRect =
            positioningContext.triggerEl.getBoundingClientRect();
          const { top, left } = calculatePosition(
            anchorRect,
            "right",
            "start",
            positioningContext.sideOffset,
            0,
            contentRect.width,
            contentRect.height,
          );

          // Apply final position
          el.style.top = `${top}px`;
          el.style.left = `${left}px`;
        }

        // Clean up
        positioningContext = null;

        // Reveal: clear opacity and animation suppression to allow CSS/JS animations
        el.style.opacity = "";
        el.style.animation = "";
      };

      return yield* Portal(() =>
        when(subCtx.isOpen, {
          onTrue: () =>
            Effect.gen(function* () {
              const triggerEl = Element.getUnsafe(subCtx.triggerRef);

              // Get current sideOffset value
              const currentSideOffset = yield* sideOffset.get;

              const handleMouseEnter = () =>
                Effect.sync(() => {
                  subCtx.cancelClose(); // Cancel shared close timeout
                });

              const handleMouseLeave = (event: MouseEvent) =>
                Effect.sync(() => {
                  const contentEl = document.getElementById(subCtx.contentId);
                  const relatedTarget = event.relatedTarget;

                  // Don't schedule close if moving to a child element
                  if (
                    contentEl &&
                    relatedTarget instanceof Node &&
                    contentEl.contains(relatedTarget)
                  ) {
                    return;
                  }

                  // Don't schedule close if moving to a nested submenu content (rendered via Portal)
                  if (
                    relatedTarget instanceof HTMLElement &&
                    (relatedTarget.hasAttribute("data-menu-subcontent") ||
                      relatedTarget.closest("[data-menu-subcontent]"))
                  ) {
                    return;
                  }

                  subCtx.scheduleClose(); // Use shared close timeout
                });

              const keyboardNav = yield* createKeyboardNav({
                selector: "[data-menu-item]:not([data-disabled])",
                orientation: "vertical",
                loop,
                onActivate: (el) =>
                  Effect.sync(() => {
                    // Don't activate subtriggers (they open on ArrowRight/Enter via their own handler)
                    if (!el.hasAttribute("data-menu-subtrigger")) {
                      el.click();
                    }
                  }),
                onEscape: () =>
                  Effect.gen(function* () {
                    yield* subCtx.close();
                    yield* subCtx.triggerRef.pipe(Element.focus, Effect.ignore);
                  }),
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

              // Start hidden (opacity: 0) - will be positioned and revealed after DOM insertion
              // Using opacity instead of visibility for better animation compatibility
              // Also suppress any default CSS animations until we're ready
              const contentEl = yield* $.div(
                {
                  id: subCtx.contentId,
                  class: props.class,
                  role: "menu",
                  "aria-labelledby": subCtx.triggerId,
                  "data-state": dataState,
                  "data-side": "right",
                  "data-menu-content": "",
                  "data-menu-subcontent": "",
                  tabIndex: -1,
                  style: {
                    position: "fixed",
                    opacity: "0",
                    animation: "none",
                  },
                  onMouseEnter: handleMouseEnter,
                  onMouseLeave: handleMouseLeave,
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Store positioning context for onBeforeEnter
              positioningContext = {
                triggerEl,
                sideOffset: currentSideOffset,
              };

              return contentEl;
            }),
          onFalse: () => $.div({ style: { display: "none" } }),
          animate: props.animate
            ? {
                ...props.animate,
                onBeforeEnter: (el) =>
                  el.pipe(
                    Element.tap(positionAndReveal),
                    Element.tapEffect(
                      () => props.animate?.onBeforeEnter?.(el) ?? Effect.void,
                    ),
                  ),
                onEnter: (el) =>
                  el.pipe(
                    // Suppress any default CSS animations after our animation finishes
                    // to prevent them from restarting when the enter class is removed
                    Element.setStyles({ animation: "none" }),
                    // Focus first item on open
                    Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                    Element.tapEffect(
                      () => props.animate?.onEnter?.(el) ?? Effect.void,
                    ),
                  ),
                onBeforeExit: (el) =>
                  el.pipe(
                    // Re-enable animations so exit animation can run
                    Element.setStyles({ animation: "" }),
                    Element.tapEffect(
                      () => props.animate?.onBeforeExit?.(el) ?? Effect.void,
                    ),
                  ),
              }
            : {
                // Minimal animation config just to trigger positioning via onBeforeEnter
                onBeforeEnter: (el) => el.pipe(Element.tap(positionAndReveal)),
                // Focus first item on open
                onEnter: (el) =>
                  el.pipe(
                    Element.focusFirst("[data-menu-item]:not([data-disabled])"),
                  ),
              },
        }),
      );
    }),
);

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
