import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide, when } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import { Portal } from "@dom/Portal";
import { Ref } from "@dom/Ref";
import type { Element } from "@dom/Element";
import { calculatePosition, getTransform } from "../helpers";
import { getMenuNavigationState, handleMenuArrowNavigation } from "./helpers";

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
  readonly triggerRef: Ref<HTMLElement>;
  /** Unique ID for the content */
  readonly contentId: string;
  /** Unique ID for the trigger */
  readonly triggerId: string;
}

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
 * Props for DropdownMenu.Trigger
 */
export interface DropdownMenuTriggerProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether the trigger is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for DropdownMenu.Content
 */
export interface DropdownMenuContentProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Positioning side relative to trigger (default: "bottom") */
  readonly side?: "top" | "bottom" | "left" | "right";
  /** Alignment along the side axis (default: "start") */
  readonly align?: "start" | "center" | "end";
  /** Gap between trigger and content in pixels (default: 4) */
  readonly sideOffset?: number;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
}

/**
 * Props for DropdownMenu.Item
 */
export interface DropdownMenuItemProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
  /** Callback when item is selected */
  readonly onSelect?: () => Effect.Effect<void>;
}

/**
 * Props for DropdownMenu.Group
 */
export interface DropdownMenuGroupProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Props for DropdownMenu.Label
 */
export interface DropdownMenuLabelProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

/**
 * Props for DropdownMenu.Separator
 */
export interface DropdownMenuSeparatorProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
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
  readonly triggerRef: Ref<HTMLElement>;
  /** Unique ID for the submenu content */
  readonly contentId: string;
  /** Unique ID for the SubTrigger */
  readonly triggerId: string;
}

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
 * Props for DropdownMenu.SubTrigger
 */
export interface DropdownMenuSubTriggerProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Whether this trigger is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for DropdownMenu.SubContent
 */
export interface DropdownMenuSubContentProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** Gap between trigger and content in pixels (default: 0) */
  readonly sideOffset?: number;
  /** Whether keyboard navigation loops (default: true) */
  readonly loop?: boolean;
}

/**
 * Props for DropdownMenu.CheckboxItem
 */
export interface DropdownMenuCheckboxItemProps {
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
 * Context for DropdownMenu.RadioGroup
 */
export interface DropdownMenuRadioGroupContext {
  /** Current selected value */
  readonly value: Readable.Readable<string>;
  /** Set the selected value */
  readonly setValue: (value: string) => Effect.Effect<void>;
}

/**
 * Props for DropdownMenu.RadioGroup
 */
export interface DropdownMenuRadioGroupProps {
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
 * Props for DropdownMenu.RadioItem
 */
export interface DropdownMenuRadioItemProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
  /** The value for this radio item */
  readonly value: string;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
}

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
  children: Element<never, DropdownMenuCtx> | Element<never, DropdownMenuCtx>[],
): Element =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    const triggerRef = yield* Ref.make<HTMLElement>();
    const contentId = yield* UniqueId.make("menu-content");
    const triggerId = yield* UniqueId.make("menu-trigger");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
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

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

      const handleKeyDown = (event: KeyboardEvent) =>
        Effect.gen(function* () {
          if (props.disabled) return;

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
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-trigger": "",
          disabled: props.disabled,
          onClick: ctx.toggle,
          onKeyDown: handleKeyDown,
        },
        children ?? [],
      );
    }),
);

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

      const side = props.side ?? "bottom";
      const align = props.align ?? "start";
      const sideOffset = props.sideOffset ?? 4;
      const loop = props.loop ?? true;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      return yield* when(
        ctx.isOpen,
        () =>
          Portal(() =>
            Effect.gen(function* () {
              const triggerEl = ctx.triggerRef.current;

              let positionStyle: Record<string, string> = {
                position: "fixed",
              };

              if (triggerEl) {
                const rect = triggerEl.getBoundingClientRect();
                const { top, left } = calculatePosition(
                  rect,
                  side,
                  align,
                  sideOffset,
                  0,
                );
                const transform = getTransform(side, align);

                positionStyle = {
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  transform,
                  minWidth: `${rect.width}px`,
                };
              }

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
                      ctx.triggerRef.current?.focus();
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
                  "data-side": side,
                  "data-align": align,
                  "data-menu-content": "",
                  tabIndex: -1,
                  style: positionStyle,
                  onKeyDown: handleKeyDown,
                },
                children ?? [],
              );

              // Click outside handler
              const handleDocumentClick = (e: MouseEvent) => {
                const triggerEl = ctx.triggerRef as unknown as {
                  _value: HTMLElement | null;
                };
                const trigger = triggerEl._value;

                if (
                  contentEl &&
                  !contentEl.contains(e.target as Node) &&
                  trigger &&
                  !trigger.contains(e.target as Node)
                ) {
                  Effect.runSync(ctx.close());
                }
              };

              document.addEventListener("click", handleDocumentClick, true);

              yield* Effect.addFinalizer(() =>
                Effect.sync(() => {
                  document.removeEventListener(
                    "click",
                    handleDocumentClick,
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

      const handleClick = () =>
        Effect.gen(function* () {
          if (props.disabled) return;

          if (props.onSelect) {
            yield* props.onSelect();
          }

          // Close menu and return focus to trigger
          yield* ctx.close();
          ctx.triggerRef.current?.focus();
        });

      return yield* $.div(
        {
          class: props.class,
          role: "menuitem",
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-item": "",
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

          // Close menu and return focus to trigger
          yield* ctx.close();
          ctx.triggerRef.current?.focus();
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
  children:
    | Element<never, DropdownMenuCtx | DropdownMenuRadioGroupCtx>
    | Element<never, DropdownMenuCtx | DropdownMenuRadioGroupCtx>[],
): Element<never, DropdownMenuCtx> =>
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

      const isChecked = radioCtx.value.map((v) => v === props.value);
      const dataState = isChecked.map((c) => (c ? "checked" : "unchecked"));
      const ariaChecked = isChecked.map((c) => (c ? "true" : "false"));

      const handleClick = () =>
        Effect.gen(function* () {
          if (props.disabled) return;

          yield* radioCtx.setValue(props.value);

          // Close menu and return focus to trigger
          yield* ctx.close();
          ctx.triggerRef.current?.focus();
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
  children:
    | Element<never, DropdownMenuCtx | DropdownMenuSubCtx>
    | Element<never, DropdownMenuCtx | DropdownMenuSubCtx>[],
): Element<never, DropdownMenuCtx> =>
  Effect.gen(function* () {
    const isOpen: Signal<boolean> = props.open
      ? props.open
      : yield* Signal.make(props.defaultOpen ?? false);

    const triggerRef = yield* Ref.make<HTMLElement>();
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
        if (props.onOpenChange) {
          yield* props.onOpenChange(newValue);
        }
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
          "data-disabled": props.disabled ? "" : undefined,
          "data-menu-item": "",
          "data-menu-subtrigger": "",
          tabIndex: props.disabled ? undefined : 0,
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

      const sideOffset = props.sideOffset ?? 0;
      const loop = props.loop ?? true;

      const dataState = subCtx.isOpen.map((open) => (open ? "open" : "closed"));

      return yield* when(
        subCtx.isOpen,
        () =>
          Portal(() =>
            Effect.gen(function* () {
              const triggerEl = subCtx.triggerRef.current;

              let positionStyle: Record<string, string> = {
                position: "fixed",
              };

              if (triggerEl) {
                const rect = triggerEl.getBoundingClientRect();
                // Position to the right of the trigger
                const { top, left } = calculatePosition(
                  rect,
                  "right",
                  "start",
                  sideOffset,
                  0,
                );
                const transform = getTransform("right", "start");

                positionStyle = {
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  transform,
                };
              }

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
                      subCtx.triggerRef.current?.focus();
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
                      subCtx.triggerRef.current?.focus();
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
