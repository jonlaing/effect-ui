import { Context, Effect } from "effect";

import {
  $,
  FocusTrap,
  mergeProps,
  Portal,
  provide,
  ScrollLock,
  Signal,
  UniqueId,
  when,
  type AnimationOptions,
  type ChildEffect,
  type ClassValue,
  type Element,
  type Readable,
} from "@effex/dom";

/**
 * Context shared between Dialog parts.
 */
export interface DialogContext {
  /** Whether the dialog is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the dialog */
  readonly open: () => Effect.Effect<void>;
  /** Close the dialog */
  readonly close: () => Effect.Effect<void>;
  /** Toggle the dialog open state */
  readonly toggle: () => Effect.Effect<void>;
  /** Unique ID for the dialog title (aria-labelledby) */
  readonly titleId: string;
  /** Unique ID for the dialog description (aria-describedby) */
  readonly descriptionId: string;
  /** Unique ID for the dialog content */
  readonly contentId: string;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Dialog state sharing between parts.
 */
export class DialogCtx extends Context.Tag("DialogContext")<
  DialogCtx,
  DialogContext
>() {}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for Dialog.Root
 */
export interface DialogRootProps {
  /** Controlled open state - if provided, component is controlled */
  readonly open?: Signal<boolean>;
  /** Default open state for uncontrolled usage */
  readonly defaultOpen?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Root container for a Dialog. Manages open/closed state and provides
 * context to child components.
 *
 * @example
 * ```ts
 * Dialog.Root({ defaultOpen: false }, collect(
 *   Dialog.Trigger({}, $.of("Open Dialog")),
 *   Dialog.Portal({}, collect(
 *     Dialog.Overlay({ class: "dialog-overlay" }),
 *     Dialog.Content({ class: "dialog-content" }, collect(
 *       Dialog.Title({}, $.of("Dialog Title")),
 *       Dialog.Description({}, $.of("Dialog description")),
 *       Dialog.Close({}, $.of("Close")),
 *     )),
 *   )),
 * ))
 * ```
 */
const Root = <E = never, R = never>(
  props: DialogRootProps,
  children: ChildEffect<E, R | DialogCtx>,
): Element.Element<HTMLDivElement, E, R> =>
  Effect.gen(function* () {
    // Handle controlled vs uncontrolled state
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );

    const titleId = yield* UniqueId.make("dialog-title");
    const descriptionId = yield* UniqueId.make("dialog-description");
    const contentId = yield* UniqueId.make("dialog-content");

    const setOpenState = (newValue: boolean) =>
      Effect.gen(function* () {
        yield* isOpen.set(newValue);
        yield* props.onOpenChange?.(newValue) ?? Effect.void;
      });

    const ctx: DialogContext = {
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      toggle: () =>
        Effect.gen(function* () {
          const current = yield* isOpen.get;
          yield* setOpenState(!current);
        }),
      titleId,
      descriptionId,
      contentId,
    };

    // Use a Fragment (display: contents div) so the dialog doesn't affect layout
    return yield* $.div(
      { style: { display: "contents" } },
      provide(DialogCtx, ctx, children),
    );
  }) as Element.Element<HTMLDivElement, E, R>;

/**
 * Props for Dialog.Trigger
 */
export interface DialogTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Button that opens the Dialog.
 * Includes proper ARIA attributes.
 *
 * @example
 * ```ts
 * Dialog.Trigger({ class: "btn" }, $.of("Open Dialog"))
 * ```
 */
const Trigger = <E = never, R = never>(
  props: DialogTriggerProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLButtonElement, E, R | DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
    const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

    const triggerProps = {
      "aria-haspopup": "dialog" as const,
      "aria-expanded": ariaExpanded,
      "aria-controls": ctx.contentId,
      "data-state": dataState,
      onClick: ctx.open,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        triggerProps,
        children as Element.Element<HTMLElement | SVGElement, E, R>,
      );
    }

    return yield* $.button(
      { ...triggerProps, type: "button", class: props.class },
      children,
    );
  }) as Element.Element<HTMLButtonElement, E, R | DialogCtx>;

/**
 * Props for Dialog.Portal
 */
export interface DialogPortalProps {
  /** Target element or selector to render into (default: document.body) */
  readonly target?: HTMLElement | string;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
  class?: ClassValue;
}

/**
 * Renders dialog content in a portal outside the normal DOM hierarchy.
 * Only renders when the dialog is open.
 *
 * @example
 * ```ts
 * Dialog.Portal({}, collect(
 *   Dialog.Overlay({}),
 *   Dialog.Content({}, [...]),
 * ))
 * ```
 */
const DialogPortal = <E = never, R = never>(
  props: DialogPortalProps,
  children: ChildEffect<E, R | DialogCtx>,
): Element.Element<HTMLDivElement, E, R | DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    // Portal is always rendered, but the content inside uses `when` for animations.
    // This ensures animations apply to the actual visible content, not a placeholder.
    return yield* Portal({ target: props.target }, () =>
      when(ctx.isOpen, {
        onTrue: () =>
          $.div(
            { class: props.class, "data-dialog-portal": "" },
            provide(DialogCtx, ctx, children),
          ),
        onFalse: () => $.div({ style: { display: "none" } }),
        animate: props.animate,
      }),
    );
  }) as Element.Element<HTMLDivElement, E, R | DialogCtx>;

/**
 * Props for Dialog.Overlay
 */
export interface DialogOverlayProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Backdrop overlay for the Dialog.
 * Clicking the overlay closes the dialog.
 *
 * @example
 * ```ts
 * Dialog.Overlay({ class: "dialog-overlay" })
 * ```
 */
const Overlay = (
  props: DialogOverlayProps,
): Element.Element<HTMLDivElement, never, DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

    return yield* $.div({
      class: props.class,
      "data-state": dataState,
      "data-dialog-overlay": "",
      "aria-hidden": "true",
      onClick: ctx.close,
    });
  });

/**
 * Props for Dialog.Content
 */
export interface DialogContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Called when Escape key is pressed (before close) */
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => Effect.Effect<void>;
}

/**
 * Content area for the Dialog.
 * Includes focus trap, scroll lock, and keyboard support.
 *
 * @example
 * ```ts
 * Dialog.Content({ class: "dialog-content" }, collect(
 *   Dialog.Title({}, $.of("Title")),
 *   Dialog.Description({}, $.of("Description")),
 *   // ... content
 *   Dialog.Close({}, $.of("Close")),
 * ))
 * ```
 */
const Content = <E = never, R = never>(
  props: DialogContentProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLDivElement, E, R | DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

    const handleKeyDown = (event: KeyboardEvent) =>
      Effect.gen(function* () {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          yield* props.onEscapeKeyDown?.(event) ?? Effect.void;
          yield* ctx.close();
        }
      });

    const handleClick = (event: MouseEvent) =>
      Effect.sync(() => event.stopPropagation());

    const contentElement = yield* $.div(
      {
        id: ctx.contentId,
        class: props.class,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": ctx.titleId,
        "aria-describedby": ctx.descriptionId,
        "data-state": dataState,
        "data-dialog-content": "",
        tabIndex: -1,
        onKeyDown: handleKeyDown,
        onClick: handleClick,
      },
      children,
    );

    // Setup focus trap and scroll lock
    yield* FocusTrap.make({
      container: contentElement,
      returnFocus: previouslyFocused,
    });
    yield* ScrollLock.lock;

    return contentElement;
  }) as Element.Element<HTMLDivElement, E, R | DialogCtx>;

/**
 * Props for Dialog.Close
 */
export interface DialogCloseProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Button that closes the Dialog.
 *
 * @example
 * ```ts
 * Dialog.Close({ class: "close-btn" }, $.of("Close"))
 * ```
 */
const Close = <E = never, R = never>(
  props: DialogCloseProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLButtonElement, E, R | DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    const closeProps = {
      "data-dialog-close": "",
      onClick: ctx.close,
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        closeProps,
        children as Element.Element<HTMLElement | SVGElement, E, R>,
      );
    }

    return yield* $.button(
      { ...closeProps, type: "button", class: props.class },
      children,
    );
  }) as Element.Element<HTMLButtonElement, E, R | DialogCtx>;

/**
 * Props for Dialog.Title
 */
export interface DialogTitleProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default h2 */
  readonly asChild?: boolean;
}

/**
 * Accessible title for the Dialog.
 * Connected to the content via aria-labelledby.
 *
 * @example
 * ```ts
 * Dialog.Title({ class: "dialog-title" }, $.of("Edit Profile"))
 * ```
 */
const Title = <E = never, R = never>(
  props: DialogTitleProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLHeadingElement, E, R | DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    const titleProps = {
      id: ctx.titleId,
      "data-dialog-title": "",
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        titleProps,
        children as Element.Element<HTMLElement | SVGElement, E, R>,
      );
    }

    return yield* $.h2({ ...titleProps, class: props.class }, children);
  }) as Element.Element<HTMLHeadingElement, E, R | DialogCtx>;

/**
 * Props for Dialog.Description
 */
export interface DialogDescriptionProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default p */
  readonly asChild?: boolean;
}

/**
 * Accessible description for the Dialog.
 * Connected to the content via aria-describedby.
 *
 * @example
 * ```ts
 * Dialog.Description({}, $.of("Make changes to your profile here."))
 * ```
 */
const Description = <E = never, R = never>(
  props: DialogDescriptionProps,
  children: ChildEffect<E, R>,
): Element.Element<HTMLParagraphElement, E, R | DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    const descriptionProps = {
      id: ctx.descriptionId,
      "data-dialog-description": "",
    };

    if (props.asChild && Effect.isEffect(children)) {
      return yield* mergeProps(
        descriptionProps,
        children as Element.Element<HTMLElement | SVGElement, E, R>,
      );
    }

    return yield* $.p({ ...descriptionProps, class: props.class }, children);
  }) as Element.Element<HTMLParagraphElement, E, R | DialogCtx>;

/**
 * Headless Dialog primitive for building accessible modal dialogs.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Focus trapping within dialog
 * - Scroll lock when open
 * - Escape key to close
 * - Click outside (overlay) to close
 * - Full ARIA support
 * - Portal rendering
 * - Data attributes for styling
 *
 * @example
 * ```ts
 * // Basic usage
 * Dialog.Root({ defaultOpen: false }, collect(
 *   Dialog.Trigger({}, $.of("Open")),
 *   Dialog.Portal({}, collect(
 *     Dialog.Overlay({ class: "overlay" }),
 *     Dialog.Content({ class: "content" }, collect(
 *       Dialog.Title({}, $.of("Dialog Title")),
 *       Dialog.Description({}, $.of("Dialog description")),
 *       $.div({ class: "body" },
 *         // Your content here
 *       ),
 *       Dialog.Close({}, $.of("Close")),
 *     )),
 *   )),
 * ))
 *
 * // Controlled
 * const isOpen = yield* Signal.make(false)
 * Dialog.Root({
 *   open: isOpen,
 *   onOpenChange: (open) => Effect.log(`Dialog ${open ? "opened" : "closed"}`),
 * }, [...])
 * ```
 */
export const Dialog = {
  Root,
  Trigger,
  Portal: DialogPortal,
  Overlay,
  Content,
  Close,
  Title,
  Description,
} as const;
