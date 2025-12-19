import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide, when } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import { Portal } from "@dom/Portal";
import type { Element, Child } from "@dom/Element";
import { getMenuNavigationState, handleMenuArrowNavigation } from "../helpers";

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
  /** Unique ID for the content */
  readonly contentId: string;
  /** Unique ID for the trigger */
  readonly triggerId: string;
}

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
 * Props for ContextMenu.Trigger
 */
export interface ContextMenuTriggerProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether the trigger is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for ContextMenu.Content
 */
export interface ContextMenuContentProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
}

/**
 * Props for ContextMenu.Item
 */
export interface ContextMenuItemProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
  /** Callback when item is selected */
  readonly onSelect?: () => Effect.Effect<void>;
}

/**
 * Props for ContextMenu.Group
 */
export interface ContextMenuGroupProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Props for ContextMenu.Label
 */
export interface ContextMenuLabelProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Props for ContextMenu.Separator
 */
export interface ContextMenuSeparatorProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Props for ContextMenu.CheckboxItem
 */
export interface ContextMenuCheckboxItemProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
  /** Controlled checked state */
  readonly checked?: Signal<boolean>;
  /** Default checked state (uncontrolled) */
  readonly defaultChecked?: boolean;
  /** Callback when checked state changes */
  readonly onCheckedChange?: (checked: boolean) => Effect.Effect<void>;
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
 * Props for ContextMenu.RadioGroup
 */
export interface ContextMenuRadioGroupProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Controlled value */
  readonly value?: Signal<string>;
  /** Default value (uncontrolled) */
  readonly defaultValue?: string;
  /** Callback when value changes */
  readonly onValueChange?: (value: string) => Effect.Effect<void>;
}

/**
 * Props for ContextMenu.RadioItem
 */
export interface ContextMenuRadioItemProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** The value for this radio item */
  readonly value: string;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
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
  readonly triggerEl: Signal<HTMLElement | null>;
  /** Unique ID for the submenu content */
  readonly contentId: string;
  /** Unique ID for the SubTrigger */
  readonly triggerId: string;
}

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
 * Props for ContextMenu.SubTrigger
 */
export interface ContextMenuSubTriggerProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether this trigger is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for ContextMenu.SubContent
 */
export interface ContextMenuSubContentProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Gap between trigger and content in pixels (default: 0) */
  readonly sideOffset?: number;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
}

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
const Root = (
  props: ContextMenuRootProps,
  children: Element<never, ContextMenuCtx> | Element<never, ContextMenuCtx>[],
): Element =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open ?? (yield* Signal.make(false));
    const position = yield* Signal.make({ x: 0, y: 0 });

    const contentId = yield* UniqueId.make("context-menu-content");
    const triggerId = yield* UniqueId.make("context-menu-trigger");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
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
      contentId,
      triggerId,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(ContextMenuCtx, ctx, children),
    );
  });

/**
 * The area that responds to right-click to open the context menu.
 *
 * @example
 * ```ts
 * ContextMenu.Trigger({}, div({ class: "file-item" }, "document.pdf"))
 * ```
 */
const Trigger = component(
  "ContextMenuTrigger",
  (props: ContextMenuTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ContextMenuCtx;

      const handleContextMenu = (event: MouseEvent) =>
        Effect.gen(function* () {
          if (props.disabled) return;

          event.preventDefault();
          yield* ctx.openAt(event.clientX, event.clientY);
        });

      return yield* $.div(
        {
          id: ctx.triggerId,
          class: props.class,
          "data-disabled": props.disabled ? "" : undefined,
          "data-context-menu-trigger": "",
          onContextMenu: handleContextMenu,
        },
        children ?? [],
      );
    }),
);

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
const Content = component(
  "ContextMenuContent",
  (props: ContextMenuContentProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ContextMenuCtx;

      const loop = props.loop ?? true;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      return yield* when(
        ctx.isOpen,
        () =>
          Portal(() =>
            Effect.gen(function* () {
              const pos = yield* ctx.position.get;

              const positionStyle: Record<string, string> = {
                position: "fixed",
                top: `${pos.y}px`,
                left: `${pos.x}px`,
              };

              const handleKeyDown = (event: KeyboardEvent) =>
                Effect.gen(function* () {
                  const state = getMenuNavigationState(ctx.contentId, loop);

                  // Handle arrow navigation
                  if (handleMenuArrowNavigation(event, state)) {
                    return;
                  }

                  switch (event.key) {
                    case "Enter":
                    case " ":
                      event.preventDefault();
                      if (state.currentItem) {
                        state.currentItem.click();
                      }
                      break;
                    case "Escape":
                      event.preventDefault();
                      event.stopPropagation();
                      yield* ctx.close();
                      break;
                    case "Tab":
                      // Close menu on Tab
                      yield* ctx.close();
                      break;
                  }
                });

              const contentEl = yield* $.div(
                {
                  id: ctx.contentId,
                  class: props.class,
                  role: "menu",
                  "aria-labelledby": ctx.triggerId,
                  "data-state": dataState,
                  "data-menu-content": "",
                  "data-context-menu-content": "",
                  tabIndex: -1,
                  style: positionStyle,
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Click outside handler
              const handleDocumentClick = (e: MouseEvent) => {
                if (contentEl && !contentEl.contains(e.target as Node)) {
                  Effect.runSync(ctx.close());
                }
              };

              // Also close on right-click outside
              const handleDocumentContextMenu = (e: MouseEvent) => {
                if (contentEl && !contentEl.contains(e.target as Node)) {
                  Effect.runSync(ctx.close());
                }
              };

              document.addEventListener("click", handleDocumentClick, true);
              document.addEventListener(
                "contextmenu",
                handleDocumentContextMenu,
                true,
              );

              yield* Effect.addFinalizer(() =>
                Effect.sync(() => {
                  document.removeEventListener(
                    "click",
                    handleDocumentClick,
                    true,
                  );
                  document.removeEventListener(
                    "contextmenu",
                    handleDocumentContextMenu,
                    true,
                  );
                }),
              );

              // Focus first item on open
              const firstItem = contentEl.querySelector(
                "[data-menu-item]:not([data-disabled])",
              ) as HTMLElement;
              if (firstItem) {
                firstItem.focus();
              } else {
                contentEl.focus();
              }

              return contentEl;
            }),
          ),
        () => $.div({ style: { display: "none" } }),
      );
    }),
);

/**
 * A clickable item within the ContextMenu.
 *
 * @example
 * ```ts
 * ContextMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Copy")
 * ```
 */
const Item = component(
  "ContextMenuItem",
  (props: ContextMenuItemProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ContextMenuCtx;

      const handleClick = () =>
        Effect.gen(function* () {
          if (props.disabled) return;

          if (props.onSelect) {
            yield* props.onSelect();
          }

          // Close menu
          yield* ctx.close();
        });

      return yield* $.div(
        {
          class: props.class,
          role: "menuitem",
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-item": "",
          "data-context-menu-item": "",
          tabIndex: props.disabled ? undefined : 0,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

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
const Group = component(
  "ContextMenuGroup",
  (props: ContextMenuGroupProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          role: "group",
          "data-menu-group": "",
          "data-context-menu-group": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Label for a group of items.
 *
 * @example
 * ```ts
 * ContextMenu.Label({}, "Section Title")
 * ```
 */
const Label = component(
  "ContextMenuLabel",
  (props: ContextMenuLabelProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          "data-menu-label": "",
          "data-context-menu-label": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Visual separator between items or groups.
 *
 * @example
 * ```ts
 * ContextMenu.Separator({})
 * ```
 */
const Separator = component(
  "ContextMenuSeparator",
  (props: ContextMenuSeparatorProps) =>
    Effect.gen(function* () {
      return yield* $.div({
        class: props.class,
        role: "separator",
        "data-menu-separator": "",
        "data-context-menu-separator": "",
      });
    }),
);

/**
 * A menu item with a checkbox that can be toggled.
 *
 * @example
 * ```ts
 * const showHidden = yield* Signal.make(false);
 * ContextMenu.CheckboxItem({ checked: showHidden }, "Show Hidden Files")
 * ```
 */
const CheckboxItem = component(
  "ContextMenuCheckboxItem",
  (props: ContextMenuCheckboxItemProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ContextMenuCtx;

      const checked: Signal<boolean> = props.checked
        ? props.checked
        : yield* Signal.make(props.defaultChecked ?? false);

      const dataState = checked.map((c) => (c ? "checked" : "unchecked"));
      const ariaChecked = checked.map((c) => (c ? "true" : "false"));

      const handleClick = () =>
        Effect.gen(function* () {
          if (props.disabled) return;

          const current = yield* checked.get;
          const newValue = !current;
          yield* checked.set(newValue);

          if (props.onCheckedChange) {
            yield* props.onCheckedChange(newValue);
          }

          // Close menu
          yield* ctx.close();
        });

      return yield* $.div(
        {
          class: props.class,
          role: "menuitemcheckbox",
          "aria-checked": ariaChecked,
          "data-state": dataState,
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-item": "",
          "data-menu-checkbox-item": "",
          "data-context-menu-item": "",
          "data-context-menu-checkbox-item": "",
          tabIndex: props.disabled ? undefined : 0,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

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
const RadioGroup = (
  props: ContextMenuRadioGroupProps,
  children: Child<never, ContextMenuCtx | ContextMenuRadioGroupCtx>[],
): Element<never, ContextMenuCtx> =>
  Effect.gen(function* () {
    const value: Signal<string> = props.value
      ? props.value
      : yield* Signal.make(props.defaultValue ?? "");

    const setValue = (newValue: string) =>
      Effect.gen(function* () {
        yield* value.set(newValue);
        if (props.onValueChange) {
          yield* props.onValueChange(newValue);
        }
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
 * A radio item within a RadioGroup. Only one can be selected at a time.
 *
 * @example
 * ```ts
 * ContextMenu.RadioItem({ value: "list" }, "List View")
 * ```
 */
const RadioItem = component(
  "ContextMenuRadioItem",
  (props: ContextMenuRadioItemProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ContextMenuCtx;
      const radioCtx = yield* ContextMenuRadioGroupCtx;

      const isChecked = radioCtx.value.map((v) => v === props.value);
      const dataState = isChecked.map((c) => (c ? "checked" : "unchecked"));
      const ariaChecked = isChecked.map((c) => (c ? "true" : "false"));

      const handleClick = () =>
        Effect.gen(function* () {
          if (props.disabled) return;

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
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-item": "",
          "data-menu-radio-item": "",
          "data-context-menu-item": "",
          "data-context-menu-radio-item": "",
          tabIndex: props.disabled ? undefined : 0,
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

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
const Sub = (
  props: ContextMenuSubProps,
  children: Child<never, ContextMenuCtx | ContextMenuSubCtx>[],
): Element<never, ContextMenuCtx> =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    const triggerEl = yield* Signal.make<HTMLElement | null>(null);
    const contentId = yield* UniqueId.make("context-submenu-content");
    const triggerId = yield* UniqueId.make("context-submenu-trigger");

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
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
      });

    const subCtx: ContextMenuSubContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      cancelClose,
      scheduleClose,
      triggerEl,
      contentId,
      triggerId,
    };

    return yield* $.div(
      { style: { display: "contents" } },
      provide(ContextMenuSubCtx, subCtx, children),
    );
  });

/**
 * Trigger for a submenu. Opens the submenu on hover or ArrowRight key.
 *
 * @example
 * ```ts
 * ContextMenu.SubTrigger({}, "More Options →")
 * ```
 */
const SubTrigger = component(
  "ContextMenuSubTrigger",
  (props: ContextMenuSubTriggerProps, children) =>
    Effect.gen(function* () {
      const subCtx = yield* ContextMenuSubCtx;

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
          if (props.disabled) return;

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
          if (props.disabled) return;
          yield* subCtx.open();
        });

      // Cleanup timeout on unmount
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          if (hoverTimeout) clearTimeout(hoverTimeout);
        }),
      );

      const el = yield* $.div(
        {
          id: subCtx.triggerId,
          class: props.class,
          role: "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": subCtx.isOpen.map((open) =>
            open ? "true" : "false",
          ),
          "aria-controls": subCtx.contentId,
          "data-state": dataState,
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-item": "",
          "data-menu-subtrigger": "",
          "data-context-menu-item": "",
          "data-context-menu-subtrigger": "",
          tabIndex: props.disabled ? undefined : 0,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onKeyDown: handleKeyDown,
          onClick: handleClick,
        },
        children ?? [],
      );

      yield* subCtx.triggerEl.set(el);

      return el;
    }),
);

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
const SubContent = component(
  "ContextMenuSubContent",
  (props: ContextMenuSubContentProps, children) =>
    Effect.gen(function* () {
      const rootCtx = yield* ContextMenuCtx;
      const subCtx = yield* ContextMenuSubCtx;

      const sideOffset = props.sideOffset ?? 0;
      const loop = props.loop ?? true;

      const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

      return yield* when(
        subCtx.isOpen,
        () =>
          Portal(() =>
            Effect.gen(function* () {
              const triggerEl = yield* subCtx.triggerEl.get;

              let positionStyle: Record<string, string> = {
                position: "fixed",
              };

              if (triggerEl) {
                const rect = triggerEl.getBoundingClientRect();
                // Position to the right of the trigger
                positionStyle = {
                  position: "fixed",
                  top: `${rect.top}px`,
                  left: `${rect.right + sideOffset}px`,
                };
              }

              const handleMouseEnter = () =>
                Effect.sync(() => {
                  subCtx.cancelClose();
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

              const handleKeyDown = (event: KeyboardEvent) =>
                Effect.gen(function* () {
                  const state = getMenuNavigationState(subCtx.contentId, loop);

                  // Handle arrow navigation (except ArrowLeft which closes submenu)
                  if (
                    event.key !== "ArrowLeft" &&
                    handleMenuArrowNavigation(event, state)
                  ) {
                    return;
                  }

                  switch (event.key) {
                    case "ArrowLeft":
                      // Close submenu and return focus to SubTrigger
                      event.preventDefault();
                      event.stopPropagation();
                      yield* subCtx.close();
                      {
                        const trigger = yield* subCtx.triggerEl.get;
                        trigger?.focus();
                      }
                      break;
                    case "Enter":
                    case " ":
                      event.preventDefault();
                      if (
                        state.currentItem &&
                        !state.currentItem.hasAttribute("data-menu-subtrigger")
                      ) {
                        state.currentItem.click();
                      }
                      break;
                    case "Escape":
                      event.preventDefault();
                      event.stopPropagation();
                      yield* subCtx.close();
                      {
                        const trigger = yield* subCtx.triggerEl.get;
                        trigger?.focus();
                      }
                      break;
                    case "Tab":
                      // Close entire menu tree on Tab
                      yield* subCtx.close();
                      yield* rootCtx.close();
                      break;
                  }
                });

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
                  "data-context-menu-content": "",
                  "data-context-menu-subcontent": "",
                  tabIndex: -1,
                  style: positionStyle,
                  onMouseEnter: handleMouseEnter,
                  onMouseLeave: handleMouseLeave,
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Focus first item on open
              const firstItem = contentEl.querySelector(
                "[data-menu-item]:not([data-disabled])",
              ) as HTMLElement;
              if (firstItem) {
                firstItem.focus();
              } else {
                contentEl.focus();
              }

              return contentEl;
            }),
          ),
        () => $.div({ style: { display: "none" } }),
      );
    }),
);

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
