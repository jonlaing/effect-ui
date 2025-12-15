import { Context, Effect } from "effect";
import { Signal } from "@core/Signal";
import * as Readable from "@core/Readable";
import { $ } from "@dom/Element/Element";
import { provide, when } from "@dom/Control";
import { component } from "@dom/Component";
import { UniqueId } from "@dom/UniqueId";
import { Portal } from "@dom/Portal";
import type { Element } from "@dom/Element";
import { calculatePosition, getTransform } from "../helpers";

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
  readonly triggerRef: Signal<HTMLElement | null>;
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
 * Effect Context for DropdownMenu state sharing between parts.
 */
export class DropdownMenuCtx extends Context.Tag("DropdownMenuContext")<
  DropdownMenuCtx,
  DropdownMenuContext
>() {}

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

    const triggerRef = yield* Signal.make<HTMLElement | null>(null);
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

      const button = yield* $.button(
        {
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

      yield* ctx.triggerRef.set(button);

      return button;
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
              const triggerEl = yield* ctx.triggerRef.get;

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
                  const contentEl = document.getElementById(ctx.contentId);
                  if (!contentEl) return;

                  const items = Array.from(
                    contentEl.querySelectorAll(
                      "[data-menu-item]:not([data-disabled])",
                    ),
                  ) as HTMLElement[];

                  if (items.length === 0 && event.key !== "Escape") return;

                  const currentItem = items.find((item) =>
                    item.contains(document.activeElement),
                  );
                  const index = currentItem ? items.indexOf(currentItem) : -1;

                  const nextIndex = loop
                    ? (index + 1) % items.length
                    : Math.min(items.length - 1, index + 1);

                  const prevIndex = loop
                    ? (index - 1 + items.length) % items.length
                    : Math.max(0, index - 1);

                  const trigger = yield* ctx.triggerRef.get;

                  switch (event.key) {
                    case "ArrowDown":
                      event.preventDefault();
                      items[nextIndex]?.focus();
                      break;
                    case "ArrowUp":
                      event.preventDefault();
                      items[prevIndex]?.focus();
                      break;
                    case "Home":
                      event.preventDefault();
                      items[0]?.focus();
                      break;
                    case "End":
                      event.preventDefault();
                      items[items.length - 1]?.focus();
                      break;
                    case "Enter":
                    case " ":
                      event.preventDefault();
                      if (currentItem) {
                        currentItem.click();
                      }
                      break;
                    case "Escape":
                      event.preventDefault();
                      event.stopPropagation();
                      yield* ctx.close();
                      trigger?.focus();
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
          const trigger = yield* ctx.triggerRef.get;
          trigger?.focus();
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
} as const;
