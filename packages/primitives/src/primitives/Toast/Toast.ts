import { Context, Effect, MutableRef } from "effect";
import { Signal } from "@effex/dom";
import { Readable } from "@effex/dom";
import { Ref } from "@effex/dom";
import { $, ol, li, button } from "@effex/dom";
import { provide } from "@effex/dom";
import { each } from "@effex/dom";
import { component } from "@effex/dom";
import { Portal } from "@effex/dom";
import type { Element } from "@effex/dom";
import {
  type ToastPosition,
  type ToastType,
  type ToastData,
  type ToastOptions,
  type SwipeDirection,
  type SwipeState,
  getViewportStyle,
  getSwipeDirection,
  getExitAnimationClass,
  createInitialSwipeState,
  isSwipeComplete,
  getSwipeTransform,
  getSwipeOpacity,
  generateToastId,
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

const normalizeChildren = <T>(children: T | readonly T[] | undefined): T[] => {
  if (!children) return [];
  if (Array.isArray(children)) return children as T[];
  return [children] as T[];
};

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
// Props Interfaces
// ============================================================================

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

export interface ToastViewportProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Hotkey to focus viewport (default: Alt+T) */
  readonly hotkey?: readonly string[];
  /** ARIA label (default: "Notifications") */
  readonly label?: string;
}

export interface ToastRootProps {
  /** The toast data to render */
  readonly toast: ToastData;
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

export interface ToastTitleProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

export interface ToastDescriptionProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

export interface ToastActionProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Alt text for screen readers */
  readonly altText?: string;
}

export interface ToastCloseProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** ARIA label (default: "Close") */
  readonly "aria-label"?: string;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Toast provider that manages toast state and provides context.
 * Wrap your app with this component.
 */
const Provider = (
  props: ToastProviderProps,
  children: Element<never, ToastCtx> | readonly Element<never, ToastCtx>[],
): Element =>
  Effect.gen(function* () {
    const position = props.position ?? "bottom-right";
    const maxVisible = props.maxVisible ?? 5;
    const defaultDuration = props.defaultDuration ?? 5000;
    const swipeThreshold = props.swipeThreshold ?? 50;
    const swipeDirection = props.swipeDirection ?? getSwipeDirection(position);

    // Toast state
    const toasts = yield* Signal.make<readonly ToastData[]>([]);

    // Add a new toast
    const add = (options: ToastOptions): Effect.Effect<string> =>
      Effect.gen(function* () {
        const id = generateToastId();
        const toast: ToastData = {
          ...options,
          id,
          type: options.type ?? "default",
        };
        yield* toasts.update((current) => [...current, toast]);
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
        yield* toasts.update((current) => current.filter((t) => t.id !== id));
      });

    // Dismiss all toasts
    const dismissAll = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        const current = yield* toasts.get;
        for (const toast of current) {
          if (toast.onDismiss) {
            yield* toast.onDismiss();
          }
        }
        yield* toasts.set([]);
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

    const childArray = Array.isArray(children) ? children : [children];

    return yield* $.div(
      { style: { display: "contents" } },
      provide(ToastCtx, ctx, childArray),
    );
  });

// ============================================================================
// Viewport Component
// ============================================================================

/**
 * Toast viewport that renders all visible toasts via Portal.
 * When no children are provided, automatically renders toasts from context.
 */
const Viewport = component(
  "ToastViewport",
  (props: ToastViewportProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ToastCtx;
      const viewportRef = yield* Ref.make<HTMLOListElement>();

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
          viewportRef.current?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          document.removeEventListener("keydown", handleKeyDown);
        }),
      );

      const viewportStyle = getViewportStyle(ctx.position);
      const exitClass = getExitAnimationClass(ctx.position);
      const providedChildren = normalizeChildren(children);

      // Default toast rendering
      const toastElements = [
        each(ctx.toasts.map((toasts) => toasts.slice(-ctx.maxVisible)), {
          key: (toast: ToastData) => toast.id,
          render: (toastReadable: Readable<ToastData>) =>
            Effect.gen(function* () {
              const toast = yield* toastReadable.get;
              const actionButton = toast.action
                ? [Action({}, toast.action.label)]
                : [];

              const itemCtx: ToastItemContext = {
                toast,
                dismiss: () => ctx.dismiss(toast.id),
                pauseTimer: () => {},
                resumeTimer: () => {},
              };

              return yield* $.div(
                { style: { display: "content" } },
                provide(
                  ToastItemCtx,
                  itemCtx,
                  Root({ toast }, [
                    Title({}, toast.title ?? ""),
                    Description({}, toast.description ?? ""),
                    ...actionButton,
                    Close({}, "\u00d7"),
                  ]),
                ),
              );
            }),
          animate: { exit: exitClass },
        }),
      ];

      return yield* Portal({}, () =>
        ol(
          {
            ref: viewportRef,
            class: props.class,
            style: viewportStyle,
            role: "region",
            "aria-label": label,
            tabIndex: -1,
            "data-toast-viewport": "",
            "data-position": ctx.position,
          },
          providedChildren.length > 0 ? providedChildren : toastElements,
        ),
      );
    }),
);

// ============================================================================
// Root Component (Individual Toast)
// ============================================================================

/**
 * Individual toast container with auto-dismiss and swipe support.
 */
const Root = component("ToastRoot", (props: ToastRootProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* ToastCtx;
    const toast = props.toast;
    const toastRef = yield* Ref.make<HTMLLIElement>();

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
        const el = toastRef.current;
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
          const el = toastRef.current;
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

    // Build item context
    const itemCtx: ToastItemContext = {
      toast,
      dismiss,
      pauseTimer,
      resumeTimer,
    };

    // Determine aria-live based on type
    const ariaLive = toast.type === "error" ? "assertive" : "polite";

    return yield* li(
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
      provide(
        ToastItemCtx,
        itemCtx,
        normalizeChildren(children as Element<never, never>),
      ),
    );
  }),
);

// ============================================================================
// Title Component
// ============================================================================

/**
 * Toast title text.
 */
const Title = component("ToastTitle", (props: ToastTitleProps, children) =>
  Effect.gen(function* () {
    return yield* $.div(
      {
        class: props.class,
        "data-toast-title": "",
      },
      children ?? [],
    );
  }),
);

// ============================================================================
// Description Component
// ============================================================================

/**
 * Toast description text.
 */
const Description = component(
  "ToastDescription",
  (props: ToastDescriptionProps, children) =>
    Effect.gen(function* () {
      return yield* $.div(
        {
          class: props.class,
          "data-toast-description": "",
        },
        children ?? [],
      );
    }),
);

// ============================================================================
// Action Component
// ============================================================================

/**
 * Toast action button.
 */
const Action = component("ToastAction", (props: ToastActionProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* ToastItemCtx;

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

    return yield* button(
      {
        class: props.class,
        type: "button",
        "data-toast-action": "",
        onPointerDown: handlePointerDown,
        onClick: handleClick,
      },
      children ?? [],
    );
  }),
);

// ============================================================================
// Close Component
// ============================================================================

/**
 * Toast close/dismiss button.
 */
const Close = component("ToastClose", (props: ToastCloseProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* ToastItemCtx;

    // Stop propagation to prevent swipe handler from capturing pointer
    const handlePointerDown = (e: PointerEvent) =>
      Effect.sync(() => {
        e.stopPropagation();
      });

    return yield* button(
      {
        class: props.class,
        type: "button",
        "aria-label": props["aria-label"] ?? "Close",
        "data-toast-close": "",
        onPointerDown: handlePointerDown,
        onClick: ctx.dismiss,
      },
      children ?? [],
    );
  }),
);

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
 *
 * @example
 * ```ts
 * // Wrap app in Provider
 * Toast.Provider({ position: "bottom-right" }, [
 *   App(),
 *   Toast.Viewport({}),
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
