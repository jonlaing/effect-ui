import { Context, Effect, MutableRef } from "effect";

import {
  $,
  Component,
  Element,
  li,
  ol,
  provide,
  Reaction,
  Readable,
  Signal,
  UniqueId,
  type ClassValue,
  type ElementRef,
} from "@effex/dom";

// ============================================================================
// Types
// ============================================================================

export type NavigationMenuOrientation = "horizontal" | "vertical";

// ============================================================================
// Context Interfaces
// ============================================================================

/**
 * Context shared between NavigationMenu parts.
 */
export interface NavigationMenuContext {
  /** Currently active/open item ID */
  readonly activeItem: Readable.Readable<string | null>;
  /** Set the active item */
  readonly setActiveItem: (id: string | null) => Effect.Effect<void>;
  /** Schedule opening an item with delay */
  readonly scheduleOpen: (id: string) => void;
  /** Schedule closing with delay */
  readonly scheduleClose: () => void;
  /** Cancel any pending open */
  readonly cancelOpen: () => void;
  /** Cancel any pending close */
  readonly cancelClose: () => void;
  /** Menu orientation */
  readonly orientation: Readable.Readable<NavigationMenuOrientation>;
  /** Reference to viewport element */
  readonly viewportRef: ElementRef<HTMLDivElement>;
  /** Map of item IDs to their trigger refs */
  readonly triggerRefs: Map<string, ElementRef<HTMLButtonElement>>;
}

/**
 * Context for individual navigation menu items.
 */
export interface NavigationMenuItemContext {
  /** Unique ID for this item */
  readonly itemId: string;
  /** Whether this item is currently active */
  readonly isActive: Readable.Readable<boolean>;
  /** Reference to the trigger button */
  readonly triggerRef: ElementRef<HTMLButtonElement>;
  /** Content ID for ARIA */
  readonly contentId: string;
}

// ============================================================================
// Context Tags
// ============================================================================

export class NavigationMenuCtx extends Context.Tag("NavigationMenuContext")<
  NavigationMenuCtx,
  NavigationMenuContext
>() {}

export class NavigationMenuItemCtx extends Context.Tag(
  "NavigationMenuItemContext",
)<NavigationMenuItemCtx, NavigationMenuItemContext>() {}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for NavigationMenu.Root
 */
export interface NavigationMenuRootProps {
  /** Default active item value */
  readonly defaultValue?: string;
  /** Controlled active item value */
  readonly value?: Signal<string | null>;
  /** Callback when active item changes */
  readonly onValueChange?: (value: string | null) => Effect.Effect<void>;
  /** Menu orientation (can be reactive for responsive layouts) */
  readonly orientation?: Readable.Reactive<NavigationMenuOrientation>;
  /** Delay before opening (ms) */
  readonly delayDuration?: number;
  /** Reduced delay after first interaction (ms) */
  readonly skipDelayDuration?: number;
  /** Additional class names */
  readonly class?: ClassValue;
  /** ARIA label for the navigation */
  readonly "aria-label"?: string;
}

/**
 * Root container for NavigationMenu. Manages active state and provides context.
 */
const Root = Component.gen(function* (
  props: NavigationMenuRootProps,
  children,
) {
  const orientation = Readable.of(props.orientation ?? "horizontal");
  const delayDuration = props.delayDuration ?? 200;
  const skipDelayDuration = props.skipDelayDuration ?? 300;

  // Active item state
  const activeItem = yield* Signal.fromNullable(
    props.value,
    props.defaultValue ?? null,
  );

  // Refs and maps
  const viewportRef = yield* Element.ref<HTMLDivElement>();
  const triggerRefs = new Map<string, ElementRef<HTMLButtonElement>>();

  // Delay state
  const hasInteracted = MutableRef.make(false);
  const openTimeout = MutableRef.make<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const closeTimeout = MutableRef.make<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const cancelOpen = () => {
    const timeout = MutableRef.get(openTimeout);
    if (timeout) {
      clearTimeout(timeout);
      MutableRef.set(openTimeout, null);
    }
  };

  const cancelClose = () => {
    const timeout = MutableRef.get(closeTimeout);
    if (timeout) {
      clearTimeout(timeout);
      MutableRef.set(closeTimeout, null);
    }
  };

  const setActiveItem = (id: string | null) =>
    Effect.gen(function* () {
      yield* activeItem.set(id);
      yield* props.onValueChange?.(id) ?? Effect.void;
    });

  const scheduleOpen = (id: string) => {
    cancelClose();
    const delay = MutableRef.get(hasInteracted)
      ? skipDelayDuration
      : delayDuration;
    const timeout = setTimeout(() => {
      Effect.runSync(setActiveItem(id));
    }, delay);
    MutableRef.set(openTimeout, timeout);
    MutableRef.set(hasInteracted, true);
  };

  const scheduleClose = () => {
    cancelOpen();
    const timeout = setTimeout(() => {
      Effect.runSync(setActiveItem(null));
    }, delayDuration);
    MutableRef.set(closeTimeout, timeout);
  };

  // Cleanup timeouts on unmount
  yield* Effect.addFinalizer(() =>
    Effect.sync(() => {
      cancelOpen();
      cancelClose();
    }),
  );

  const ctx: NavigationMenuContext = {
    activeItem,
    setActiveItem,
    scheduleOpen,
    scheduleClose,
    cancelOpen,
    cancelClose,
    orientation,
    viewportRef,
    triggerRefs,
  };

  return yield* $.nav(
    {
      class: props.class,
      "aria-label": props["aria-label"] ?? "Main",
      "data-navigationmenu-root": "",
      "data-orientation": orientation,
    },
    provide(NavigationMenuCtx, ctx, Component.normalizeChildren(children)),
  );
});

/**
 * Props for NavigationMenu.List
 */
export interface NavigationMenuListProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Container for navigation menu items.
 */
const List = Component.gen(function* (
  props: NavigationMenuListProps,
  children,
) {
  const ctx = yield* NavigationMenuCtx;

  const handleKeyDown = (event: KeyboardEvent) =>
    Effect.gen(function* () {
      const triggerRefs = Array.from(ctx.triggerRefs.values());

      // Find current index by checking each element
      let currentIndex = -1;
      for (let i = 0; i < triggerRefs.length; i++) {
        if (Element.getUnsafe(triggerRefs[i]) === document.activeElement) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex === -1) return;

      const currentOrientation = yield* ctx.orientation.get;
      const isHorizontal = currentOrientation === "horizontal";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

      if (event.key === prevKey) {
        event.preventDefault();
        const prevIndex =
          currentIndex === 0 ? triggerRefs.length - 1 : currentIndex - 1;
        yield* triggerRefs[prevIndex].pipe(Element.focus, Effect.ignore);
      } else if (event.key === nextKey) {
        event.preventDefault();
        const nextIndex =
          currentIndex === triggerRefs.length - 1 ? 0 : currentIndex + 1;
        yield* triggerRefs[nextIndex].pipe(Element.focus, Effect.ignore);
      }
    });

  return yield* ol(
    {
      class: props.class,
      role: "menubar",
      "aria-orientation": ctx.orientation,
      "data-navigationmenu-list": "",
      "data-orientation": ctx.orientation,
      onKeyDown: handleKeyDown,
    },
    children ?? [],
  );
});

/**
 * Props for NavigationMenu.Item
 */
export interface NavigationMenuItemProps {
  /** Unique value identifying this item */
  readonly value: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Wrapper for a navigation menu item (trigger + content).
 */
const Item = Component.gen(function* (
  props: NavigationMenuItemProps,
  children,
) {
  const ctx = yield* NavigationMenuCtx;
  const triggerRef = yield* Element.ref<HTMLButtonElement>();
  const contentId = yield* UniqueId.make("navigationmenu-content");

  const isActive = ctx.activeItem.map((active) => active === props.value);

  const itemCtx: NavigationMenuItemContext = {
    itemId: props.value,
    isActive,
    triggerRef,
    contentId,
  };

  return yield* li(
    {
      class: props.class,
      "data-navigationmenu-item": "",
    },
    provide(NavigationMenuItemCtx, itemCtx, children),
  );
});

/**
 * Props for NavigationMenu.Trigger
 */
export interface NavigationMenuTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Button that opens the navigation menu content.
 */
const Trigger = Component.gen(function* (
  props: NavigationMenuTriggerProps,
  children,
) {
  const ctx = yield* NavigationMenuCtx;
  const itemCtx = yield* NavigationMenuItemCtx;

  const dataState = itemCtx.isActive.map((active) =>
    active ? "open" : "closed",
  );
  const ariaExpanded = itemCtx.isActive.map((active) =>
    active ? "true" : "false",
  );

  const handleMouseEnter = () =>
    Effect.sync(() => {
      ctx.scheduleOpen(itemCtx.itemId);
    });

  const handleMouseLeave = () =>
    Effect.sync(() => {
      ctx.scheduleClose();
    });

  const handleClick = () => ctx.setActiveItem(itemCtx.itemId);

  const handleKeyDown = (event: KeyboardEvent) =>
    Effect.gen(function* () {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const current = yield* ctx.activeItem.get;
        if (current === itemCtx.itemId) {
          yield* ctx.setActiveItem(null);
        } else {
          yield* ctx.setActiveItem(itemCtx.itemId);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        yield* ctx.setActiveItem(itemCtx.itemId);
        // Focus first focusable element in content
        const content = document.getElementById(itemCtx.contentId);
        if (content) {
          const focusable = content.querySelector<HTMLElement>(
            'a, button, input, [tabindex]:not([tabindex="-1"])',
          );
          focusable?.focus({ preventScroll: true });
        }
      }
    });

  // Register trigger ref before rendering
  ctx.triggerRefs.set(itemCtx.itemId, itemCtx.triggerRef);

  // Cleanup on unmount
  yield* Effect.addFinalizer(() =>
    Effect.sync(() => {
      ctx.triggerRefs.delete(itemCtx.itemId);
    }),
  );

  return yield* $.button(
    {
      ref: itemCtx.triggerRef,
      class: props.class,
      type: "button",
      "aria-expanded": ariaExpanded,
      "aria-controls": itemCtx.contentId,
      "aria-haspopup": "menu",
      "data-navigationmenu-trigger": "",
      "data-state": dataState,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    },
    children ?? [],
  );
});

/**
 * Props for NavigationMenu.Content
 */
export interface NavigationMenuContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Called when Escape key is pressed */
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => Effect.Effect<void>;
}

/**
 * Content panel that appears when the trigger is activated.
 * Renders inside Item but positions itself absolutely to appear below the menu.
 */
const Content = Component.gen(function* (
  props: NavigationMenuContentProps,
  children,
) {
  const ctx = yield* NavigationMenuCtx;
  const itemCtx = yield* NavigationMenuItemCtx;

  const dataState = itemCtx.isActive.map((active) =>
    active ? "open" : "closed",
  );

  const handleMouseEnter = () =>
    Effect.sync(() => {
      ctx.cancelClose();
    });

  const handleMouseLeave = () =>
    Effect.sync(() => {
      ctx.scheduleClose();
    });

  const handleKeyDown = (event: KeyboardEvent) =>
    Effect.gen(function* () {
      if (event.key === "Escape") {
        event.preventDefault();
        yield* props.onEscapeKeyDown?.(event) ?? Effect.void;
        yield* ctx.setActiveItem(null);
        // Return focus to trigger
        const triggerRef = ctx.triggerRefs.get(itemCtx.itemId);
        if (triggerRef) {
          yield* triggerRef.pipe(Element.focus, Effect.ignore);
        }
      }
    });

  return yield* $.div(
    {
      id: itemCtx.contentId,
      class: props.class,
      "data-navigationmenu-content": "",
      "data-state": dataState,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleKeyDown,
    },
    children ?? [],
  );
});

/**
 * Props for NavigationMenu.Viewport
 */
export interface NavigationMenuViewportProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Viewport is a positioning reference for Content elements.
 * Content elements position themselves relative to this container.
 * Note: This component is optional - Content will still work without it,
 * but Viewport provides a consistent positioning anchor.
 */
const Viewport = Component.gen(function* (props: NavigationMenuViewportProps) {
  const ctx = yield* NavigationMenuCtx;

  const dataState = ctx.activeItem.map((item) =>
    item !== null ? "open" : "closed",
  );

  return yield* $.div({
    ref: ctx.viewportRef,
    class: props.class,
    "data-navigationmenu-viewport": "",
    "data-state": dataState,
  });
});

/**
 * Props for NavigationMenu.Indicator
 */
export interface NavigationMenuIndicatorProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Visual indicator that follows the active trigger.
 */
const Indicator = Component.gen(function* (
  props: NavigationMenuIndicatorProps,
) {
  const ctx = yield* NavigationMenuCtx;
  const indicatorRef = yield* Element.ref<HTMLDivElement>();

  const updateIndicatorPositionEffect = (activeId: string | null) =>
    Effect.gen(function* () {
      const triggerRef = ctx.triggerRefs.get(activeId ?? "");

      if (!triggerRef) {
        return yield* Effect.fail("No active trigger found");
      }

      const triggerRect = yield* triggerRef.pipe(Element.getBoundingClientRect);
      const rootElement = yield* Element.getParent(indicatorRef);
      const rootRect = rootElement.getBoundingClientRect();

      return yield* indicatorRef.pipe(
        Element.setStyles({
          opacity: "1",
          width: `${triggerRect.width}px`,
          transform: `translateX(${triggerRect.left - rootRect.left}px)`,
        }),
      );
    }).pipe(
      Effect.catchAll(() =>
        indicatorRef.pipe(Element.setStyles({ opacity: "0" })),
      ),
      Effect.ignore,
    );

  // Update position when active item changes
  yield* Reaction.make([ctx.activeItem], ([activeId]) =>
    updateIndicatorPositionEffect(activeId),
  );

  const hasActiveItem = ctx.activeItem.map((item) => item !== null);

  return yield* $.div({
    ref: indicatorRef,
    class: props.class,
    "data-navigationmenu-indicator": "",
    "data-state": hasActiveItem.map((active) =>
      active ? "visible" : "hidden",
    ),
    style: {
      position: "absolute",
      transition: "transform 0.2s ease, width 0.2s ease, opacity 0.2s ease",
    },
  });
});

// ============================================================================
// Export
// ============================================================================

/**
 * Headless NavigationMenu primitive for building accessible navigation.
 *
 * Features:
 * - Horizontal or vertical orientation
 * - Hover delays to prevent accidental open/close
 * - Keyboard navigation between items
 * - Shared viewport for content display
 * - Animated indicator that follows active trigger
 *
 * @example
 * ```ts
 * NavigationMenu.Root({ delayDuration: 200 }, [
 *   NavigationMenu.List({}, [
 *     NavigationMenu.Item({ value: "products" }, [
 *       NavigationMenu.Trigger({}, "Products"),
 *       NavigationMenu.Content({}, [
 *         Link({ href: "/products/software" }, "Software"),
 *         Link({ href: "/products/hardware" }, "Hardware"),
 *       ]),
 *     ]),
 *     NavigationMenu.Item({ value: "about" }, [
 *       NavigationMenu.Trigger({}, "About"),
 *       NavigationMenu.Content({}, [
 *         Link({ href: "/about/team" }, "Team"),
 *         Link({ href: "/about/careers" }, "Careers"),
 *       ]),
 *     ]),
 *   ]),
 *   NavigationMenu.Viewport({}),
 *   NavigationMenu.Indicator({}),
 * ])
 * ```
 */
export const NavigationMenu = {
  Root,
  List,
  Item,
  Trigger,
  Content,
  Viewport,
  Indicator,
} as const;
