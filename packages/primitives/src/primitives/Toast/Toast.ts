import { Context, Effect, MutableRef } from "effect";

import {
  $,
  Component,
  each,
  Element,
  mergeProps,
  Portal,
  provide,
  Signal,
  type ClassValue,
  type ListAnimationOptions,
  type Readable,
} from "@effex/dom";

import {
  createInitialSwipeState,
  generateToastId,
  getSwipeDirection,
  getSwipeOpacity,
  getSwipeTransform,
  getViewportStyle,
  isSwipeComplete,
  type SwipeDirection,
  type SwipeState,
  type ToastData,
  type ToastOptions,
  type ToastPosition,
  type ToastType,
} from "./helpers.js";

export type {
  ToastPosition,
  ToastType,
  ToastData,
  ToastOptions,
  SwipeDirection,
};

// ============================================================================
// Helpers
// ============================================================================

// ============================================================================
// Context Interfaces
// ============================================================================

/**
 * Global toast context provided by Provider.
 */
export interface ToastContext {
  /** All current toasts */
  readonly toasts: Readable.Readable<readonly ToastData[]>;
  /** Add a new toast, returns its ID */
  readonly add: (options: ToastOptions) => Effect.Effect<string>;
  /** Dismiss a specific toast by ID */
  readonly dismiss: (id: string) => Effect.Effect<void>;
  /** Dismiss all toasts */
  readonly dismissAll: () => Effect.Effect<void>;
  /** Current position */
  readonly position: ToastPosition;
  /** Max visible toasts */
  readonly maxVisible: number;
  /** Default auto-dismiss duration */
  readonly defaultDuration: number;
  /** Swipe threshold in pixels */
  readonly swipeThreshold: number;
  /** Swipe direction */
  readonly swipeDirection: SwipeDirection;
}

/**
 * Per-toast context provided by Root.
 */
export interface ToastItemContext {
  /** This toast's data */
  readonly toast: ToastData;
  /** Dismiss this toast */
  readonly dismiss: () => Effect.Effect<void>;
  /** Pause auto-dismiss timer */
  readonly pauseTimer: () => void;
  /** Resume auto-dismiss timer */
  readonly resumeTimer: () => void;
}

// ============================================================================
// Context Tags
// ============================================================================

export class ToastCtx extends Context.Tag("ToastContext")<
  ToastCtx,
  ToastContext
>() {}

export class ToastItemCtx extends Context.Tag("ToastItemContext")<
  ToastItemCtx,
  ToastItemContext
>() {}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for Toast.Provider
 */
export interface ToastProviderProps {
  /** Position of toast viewport (default: "bottom-right") */
  readonly position?: ToastPosition;
  /** Maximum visible toasts (default: 5) */
  readonly maxVisible?: number;
  /** Default auto-dismiss duration in ms (default: 5000) */
  readonly defaultDuration?: number;
  /** Swipe direction override (default: based on position) */
  readonly swipeDirection?: SwipeDirection;
  /** Swipe threshold in pixels (default: 50) */
  readonly swipeThreshold?: number;
}

/**
 * Toast provider that manages toast state and provides context.
 * Wrap your app with this component.
 */
const Provider = Component.gen(function* (props: ToastProviderProps, children) {
  const position = props.position ?? "bottom-right";
  const maxVisible = props.maxVisible ?? 5;
  const defaultDuration = props.defaultDuration ?? 5000;
  const swipeThreshold = props.swipeThreshold ?? 50;
  const swipeDirection = props.swipeDirection ?? getSwipeDirection(position);

  // Toast state
  const toasts = yield* Signal.Array.make<ToastData>([]);

  // Add a new toast
  const add = (options: ToastOptions): Effect.Effect<string> =>
    Effect.gen(function* () {
      const id = generateToastId();
      const toast: ToastData = {
        ...options,
        id,
        type: options.type ?? "default",
      };
      yield* toasts.push(toast);
      return id;
    });

  // Dismiss a toast
  const dismiss = (id: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      const current = yield* toasts.get;
      const toast = current.find((t) => t.id === id);
      if (toast?.onDismiss) {
        yield* toast.onDismiss();
      }
      yield* toasts.update((items) => items.filter((t) => t.id !== id));
    });

  // Dismiss all toasts
  const dismissAll = (): Effect.Effect<void> =>
    Effect.gen(function* () {
      const current = yield* toasts.get;
      for (const toast of current) {
        yield* toast.onDismiss?.() ?? Effect.void;
      }
      yield* toasts.clear();
    });

  const ctx: ToastContext = {
    toasts,
    add,
    dismiss,
    dismissAll,
    position,
    maxVisible,
    defaultDuration,
    swipeThreshold,
    swipeDirection,
  };

  return yield* $.div(
    { style: { display: "contents" } },
    provide(ToastCtx, ctx, Component.normalizeChildren(children)),
  );
});

/**
 * Props for Toast.Viewport
 */
export interface ToastViewportProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Animation options for toast enter/exit (passed directly to `each`) */
  readonly animate?: ListAnimationOptions;
  /** Hotkey to focus viewport (default: Alt+T) */
  readonly hotkey?: readonly string[];
  /** ARIA label (default: "Notifications") */
  readonly label?: string;
}

/**
 * Toast viewport that renders all visible toasts via Portal.
 * Children are used as a template that's rendered for each toast with ToastItemCtx.
 * When no children are provided, uses a default template.
 */
const Viewport = Component.gen(function* (props: ToastViewportProps, children) {
  const ctx = yield* ToastCtx;
  const viewportRef = yield* Element.ref<HTMLOListElement>();

  const label = props.label ?? "Notifications";
  const hotkey = props.hotkey ?? ["altKey", "KeyT"];

  // Keyboard shortcut to focus viewport
  const handleKeyDown = (e: KeyboardEvent) => {
    const modifierMatch = hotkey.every((key) => {
      if (key === "altKey") return e.altKey;
      if (key === "ctrlKey") return e.ctrlKey;
      if (key === "shiftKey") return e.shiftKey;
      if (key === "metaKey") return e.metaKey;
      return e.code === key;
    });

    if (modifierMatch) {
      e.preventDefault();
      Effect.runPromise(viewportRef.pipe(Element.focus, Effect.ignore));
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  yield* Effect.addFinalizer(() =>
    Effect.sync(() => {
      document.removeEventListener("keydown", handleKeyDown);
    }),
  );

  const viewportStyle = getViewportStyle(ctx.position);
  const providedChildren = Component.normalizeChildren(children);

  // Default template when no children provided
  const defaultTemplate = [
    Root({}, [Title({}), Description({}), Action({}), Close({})]),
  ];

  const template = (
    providedChildren.length > 0 ? providedChildren : defaultTemplate
  ) as Element.Element[];

  // Render toasts using the template
  const toastElements = [
    each(
      ctx.toasts.map((toasts) => toasts.slice(-ctx.maxVisible)),
      {
        container: () =>
          $.ol({
            ref: viewportRef,
            class: props.class,
            style: viewportStyle,
            role: "region",
            "aria-label": label,
            tabIndex: -1,
            "data-toast-viewport": "",
            "data-position": ctx.position,
          }),
        key: (toast: ToastData) => toast.id,
        render: (toastReadable: Readable<ToastData>) =>
          Effect.gen(function* () {
            const toast = yield* toastReadable.get;

            const itemCtx: ToastItemContext = {
              toast,
              dismiss: () => ctx.dismiss(toast.id),
              pauseTimer: () => undefined,
              resumeTimer: () => undefined,
            };

            return yield* $.li(provide(ToastItemCtx, itemCtx, template));
          }),
        animate: props.animate,
      },
    ),
  ];

  return yield* Portal({}, () => $.div(toastElements));
});

/**
 * Props for Toast.Root
 */
export interface ToastRootProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Individual toast container with auto-dismiss and swipe support.
 */
const Root = Component.gen(function* (props: ToastRootProps, children) {
  const ctx = yield* ToastCtx;
  // Get toast from props or from item context (when used as template)
  const parentCtx = yield* ToastItemCtx;
  const toast: ToastData = parentCtx.toast;
  const toastRef = yield* Element.ref<HTMLDivElement>();

  // Timer state
  const duration = toast.duration ?? ctx.defaultDuration;
  const timeoutRef = MutableRef.make<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const remainingRef = MutableRef.make(duration);
  const startTimeRef = MutableRef.make(Date.now());

  // Swipe state
  const swipeState = MutableRef.make<SwipeState>(createInitialSwipeState());
  const isSwiping = yield* Signal.make(false);

  // Dismiss this toast
  const dismiss = (): Effect.Effect<void> => ctx.dismiss(toast.id);

  // Timer functions
  const startTimer = () => {
    const remaining = MutableRef.get(remainingRef);
    if (remaining <= 0) return; // duration 0 means no auto-dismiss

    MutableRef.set(startTimeRef, Date.now());
    const id = setTimeout(() => {
      Effect.runPromise(dismiss());
    }, remaining);
    MutableRef.set(timeoutRef, id);
  };

  const pauseTimer = () => {
    const timeout = MutableRef.get(timeoutRef);
    if (timeout) {
      clearTimeout(timeout);
      MutableRef.set(timeoutRef, null);
      const elapsed = Date.now() - MutableRef.get(startTimeRef);
      MutableRef.update(remainingRef, (r) => Math.max(0, r - elapsed));
    }
  };

  const resumeTimer = () => {
    startTimer();
  };

  // Start timer on mount
  if (duration > 0) {
    startTimer();
  }

  // Cleanup timer on unmount
  yield* Effect.addFinalizer(() =>
    Effect.sync(() => {
      const timeout = MutableRef.get(timeoutRef);
      if (timeout) {
        clearTimeout(timeout);
      }
    }),
  );

  // Swipe handlers
  const handlePointerDown = (e: PointerEvent) =>
    Effect.sync(() => {
      const state = MutableRef.get(swipeState);
      MutableRef.set(swipeState, {
        ...state,
        startX: e.clientX,
        startY: e.clientY,
        deltaX: 0,
        deltaY: 0,
        swiping: true,
      });
      Effect.runSync(isSwiping.set(true));
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    });

  const handlePointerMove = (e: PointerEvent) =>
    Effect.sync(() => {
      const state = MutableRef.get(swipeState);
      if (!state.swiping) return;

      const deltaX = e.clientX - state.startX;
      const deltaY = e.clientY - state.startY;
      MutableRef.set(swipeState, { ...state, deltaX, deltaY });

      // Apply transform for visual feedback
      const el = Element.getUnsafe(toastRef);
      if (el) {
        const transform = getSwipeTransform(
          MutableRef.get(swipeState),
          ctx.swipeDirection,
        );
        const opacity = getSwipeOpacity(
          MutableRef.get(swipeState),
          ctx.swipeDirection,
          ctx.swipeThreshold,
        );
        el.style.transform = transform;
        el.style.opacity = String(opacity);
      }
    });

  const handlePointerUp = (e: PointerEvent) =>
    Effect.gen(function* () {
      const state = MutableRef.get(swipeState);
      if (!state.swiping) return;

      const shouldDismiss = isSwipeComplete(
        state,
        ctx.swipeDirection,
        ctx.swipeThreshold,
      );

      if (shouldDismiss) {
        yield* dismiss();
      } else {
        // Snap back
        const el = Element.getUnsafe(toastRef);
        if (el) {
          el.style.transform = "";
          el.style.opacity = "";
        }
      }

      MutableRef.set(swipeState, createInitialSwipeState());
      yield* isSwiping.set(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    });

  // Hover handlers for pause/resume
  const handleMouseEnter = () =>
    Effect.sync(() => {
      pauseTimer();
    });

  const handleMouseLeave = () =>
    Effect.sync(() => {
      if (duration > 0) {
        resumeTimer();
      }
    });

  // Determine aria-live based on type
  const ariaLive = toast.type === "error" ? "assertive" : "polite";

  return yield* $.div(
    {
      ref: toastRef,
      class: props.class,
      role: "status",
      "aria-live": ariaLive,
      "aria-atomic": "true",
      "data-toast-root": "",
      "data-type": toast.type,
      "data-swipe-direction": ctx.swipeDirection,
      "data-swiping": isSwiping.map((s) => (s ? "" : undefined)),
      style: { pointerEvents: "auto" },
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    Component.normalizeChildren(children as Element.Element<never, never>),
  );
});

/**
 * Props for Toast.Title
 */
export interface ToastTitleProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Toast title text. Renders from itemCtx.toast.title if no children provided.
 */
const Title = Component.gen(function* (props: ToastTitleProps, children) {
  const itemCtx = yield* ToastItemCtx;
  const content = children ?? itemCtx.toast.title ?? "";
  return yield* $.div(
    {
      class: props.class,
      "data-toast-title": "",
    },
    content,
  );
});

/**
 * Props for Toast.Description
 */
export interface ToastDescriptionProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Toast description text. Renders from itemCtx.toast.description if no children provided.
 */
const Description = Component.gen(function* (
  props: ToastDescriptionProps,
  children,
) {
  const itemCtx = yield* ToastItemCtx;
  const content = children ?? itemCtx.toast.description ?? "";
  return yield* $.div(
    {
      class: props.class,
      "data-toast-description": "",
    },
    content,
  );
});

/**
 * Props for Toast.Action
 */
export interface ToastActionProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Alt text for screen readers */
  readonly altText?: string;
}

/**
 * Toast action button. Renders from itemCtx.toast.action if no children provided.
 * Renders nothing if no action exists and no children provided.
 */
const Action = Component.gen(function* (props: ToastActionProps, children) {
  const ctx = yield* ToastItemCtx;
  const content = children ?? ctx.toast.action?.label;

  // If no content (no children and no action), render nothing
  if (!content) {
    return yield* $.span({ style: { display: "none" } }, []);
  }

  // Stop propagation to prevent swipe handler from capturing pointer
  const handlePointerDown = (e: PointerEvent) =>
    Effect.sync(() => {
      e.stopPropagation();
    });

  const handleClick = () =>
    Effect.gen(function* () {
      if (ctx.toast.action?.onClick) {
        yield* ctx.toast.action.onClick();
      }
      yield* ctx.dismiss();
    });

  return yield* $.button(
    {
      class: props.class,
      type: "button",
      "data-toast-action": "",
      onPointerDown: handlePointerDown,
      onClick: handleClick,
    },
    content,
  );
});

/**
 * Props for Toast.Close
 */
export interface ToastCloseProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** ARIA label (default: "Close") */
  readonly "aria-label"?: string;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Toast close/dismiss button. Renders "×" if no children provided.
 */
const Close = Component.gen(function* (props: ToastCloseProps, children) {
  const ctx = yield* ToastItemCtx;

  // Stop propagation to prevent swipe handler from capturing pointer
  const handlePointerDown = (e: PointerEvent) =>
    Effect.sync(() => {
      e.stopPropagation();
    });

  const closeProps = {
    "aria-label": props["aria-label"] ?? "Close",
    "data-toast-close": "",
    onPointerDown: handlePointerDown,
    onClick: ctx.dismiss,
  };

  if (props.asChild && Effect.isEffect(children)) {
    return yield* mergeProps(closeProps, children);
  }

  return yield* $.button(
    { ...closeProps, type: "button", class: props.class },
    children ?? "\u00d7",
  );
});

// ============================================================================
// Export
// ============================================================================

/**
 * Headless Toast primitive for building notification systems.
 *
 * Features:
 * - Multiple positions (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
 * - Auto-dismiss with pause on hover
 * - Swipe to dismiss on touch devices
 * - Configurable max visible toasts
 * - ARIA live regions for accessibility
 * - Action buttons with callbacks
 * - Template-based rendering - components read from ToastItemCtx when no children provided
 *
 * @example
 * ```ts
 * // Wrap app in Provider with custom template
 * Toast.Provider({ position: "bottom-right" }, [
 *   App(),
 *   Toast.Viewport({},
 *     Toast.Root({ class: "toast-root" }, [
 *       Toast.Title({ class: "toast-title" }),
 *       Toast.Description({ class: "toast-description" }),
 *       Toast.Action({ class: "toast-action" }),
 *       Toast.Close({ class: "toast-close" }),
 *     ])
 *   ),
 * ])
 *
 * // In a component, add a toast
 * const ctx = yield* ToastCtx;
 * yield* ctx.add({
 *   title: "Success!",
 *   description: "Your changes have been saved.",
 *   type: "success",
 * });
 * ```
 */
export const Toast = {
  Provider,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
} as const;
