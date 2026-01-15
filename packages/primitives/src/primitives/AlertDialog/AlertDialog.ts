import { Array, Context, Effect } from "effect";

import {
  $,
  Component,
  Element,
  FocusTrap,
  mergeProps,
  Portal,
  provide,
  Readable,
  ScrollLock,
  Signal,
  UniqueId,
  when,
  type AnimationOptions,
  type ClassValue,
  type ElementRef,
} from "@effex/dom";

/**
 * Context shared between AlertDialog parts.
 */
export interface AlertDialogContext {
  /** Whether the alert dialog is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the alert dialog */
  readonly open: () => Effect.Effect<void>;
  /** Close the alert dialog */
  readonly close: () => Effect.Effect<void>;
  /** Unique ID for the dialog title (aria-labelledby) */
  readonly titleId: string;
  /** Unique ID for the dialog description (aria-describedby) */
  readonly descriptionId: string;
  /** Unique ID for the dialog content */
  readonly contentId: string;
  /** Ref to cancel button for initial focus */
  readonly cancelRef: ElementRef<HTMLButtonElement>;
}

/**
 * Effect Context for AlertDialog state sharing between parts.
 */
export class AlertDialogCtx extends Context.Tag("AlertDialogContext")<
  AlertDialogCtx,
  AlertDialogContext
>() {}

/**
 * Props for AlertDialog.Root
 */
export interface AlertDialogRootProps {
  /** Controlled open state - if provided, component is controlled */
  readonly open?: Signal<boolean>;
  /** Default open state for uncontrolled usage */
  readonly defaultOpen?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => Effect.Effect<void>;
}

/**
 * Root container for an AlertDialog. Manages open/closed state and provides
 * context to child components.
 */
const Root = Component.gen(function* (props: AlertDialogRootProps, children) {
  // Handle controlled vs uncontrolled state
  const isOpen = yield* Signal.fromNullable(
    props.open,
    props.defaultOpen ?? false,
  );

  const titleId = yield* UniqueId.make("alertdialog-title");
  const descriptionId = yield* UniqueId.make("alertdialog-description");
  const contentId = yield* UniqueId.make("alertdialog-content");
  const cancelRef = yield* Element.ref<HTMLButtonElement>();

  const setOpenState = (newValue: boolean) =>
    Effect.gen(function* () {
      yield* isOpen.set(newValue);
      yield* props.onOpenChange?.(newValue) ?? Effect.void;
    });

  const ctx: AlertDialogContext = {
    isOpen,
    open: () => setOpenState(true),
    close: () => setOpenState(false),
    titleId,
    descriptionId,
    contentId,
    cancelRef,
  };

  const childArray = Array.isArray(children)
    ? children
    : children
      ? [children]
      : [];
  return yield* $.div(
    { style: { display: "contents" } },
    provide(AlertDialogCtx, ctx, childArray),
  );
});

/**
 * Props for AlertDialog.Trigger
 */
export interface AlertDialogTriggerProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Button that opens the AlertDialog.
 */
const Trigger = Component.gen(function* (
  props: AlertDialogTriggerProps,
  children,
) {
  const ctx = yield* AlertDialogCtx;

  const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
  const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

  const triggerProps = {
    "aria-haspopup": "alertdialog" as const,
    "aria-expanded": ariaExpanded,
    "aria-controls": ctx.contentId,
    "data-state": dataState,
    onClick: ctx.open,
  };

  if (props.asChild && Effect.isEffect(children)) {
    return yield* mergeProps(triggerProps, children);
  }

  return yield* $.button(
    { ...triggerProps, type: "button", class: props.class },
    children ?? [],
  );
});

/**
 * Props for AlertDialog.Portal
 */
export interface AlertDialogPortalProps {
  /** Target element or selector to render into (default: document.body) */
  readonly target?: HTMLElement | string;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Renders alert dialog content in a portal outside the normal DOM hierarchy.
 * Only renders when the dialog is open.
 */
const AlertDialogPortal = Component.gen(function* (
  props: AlertDialogPortalProps,
  children,
) {
  const ctx = yield* AlertDialogCtx;

  // Portal is always rendered, but the content inside uses `when` for animations.
  // This ensures animations apply to the actual visible content, not a placeholder.
  const childArray = Array.isArray(children)
    ? children
    : children
      ? [children]
      : [];
  return yield* Portal({ target: props.target }, () =>
    when(ctx.isOpen, {
      onTrue: () =>
        $.div(
          { style: { display: "contents" }, "data-alertdialog-portal": "" },
          provide(AlertDialogCtx, ctx, childArray),
        ),
      onFalse: () => $.div({ style: { display: "none" } }),
      animate: props.animate,
    }),
  );
});

/**
 * Props for AlertDialog.Overlay
 */
export interface AlertDialogOverlayProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Backdrop overlay for the AlertDialog.
 * Unlike Dialog, clicking the overlay does NOT close the alert dialog.
 */
const Overlay = Component.gen(function* (props: AlertDialogOverlayProps) {
  const ctx = yield* AlertDialogCtx;

  const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

  return yield* $.div({
    class: props.class,
    "data-state": dataState,
    "data-alertdialog-overlay": "",
    "aria-hidden": "true",
  });
});

/**
 * Props for AlertDialog.Content
 */
export interface AlertDialogContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Called when Escape key is pressed (before close) */
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => Effect.Effect<void>;
  /** Whether to close on Escape key (default: true) */
  readonly closeOnEscape?: boolean;
}

/**
 * Content area for the AlertDialog.
 * Includes focus trap, scroll lock, and keyboard support.
 * Initial focus goes to the Cancel button.
 */
const Content = Component.gen(function* (
  props: AlertDialogContentProps,
  children,
) {
  const ctx = yield* AlertDialogCtx;
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const closeOnEscape = props.closeOnEscape ?? true;

  const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

  const handleKeyDown = (event: KeyboardEvent) =>
    Effect.gen(function* () {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        yield* props.onEscapeKeyDown?.(event) ?? Effect.void;
        if (closeOnEscape) {
          yield* ctx.close();
        }
      }
    });

  const handleClick = (event: MouseEvent) =>
    Effect.sync(() => event.stopPropagation());

  const contentElement = yield* $.div(
    {
      id: ctx.contentId,
      class: props.class,
      role: "alertdialog",
      "aria-modal": "true",
      "aria-labelledby": ctx.titleId,
      "aria-describedby": ctx.descriptionId,
      "data-state": dataState,
      "data-alertdialog-content": "",
      tabIndex: -1,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
    },
    children ?? [],
  );

  // Setup focus trap and scroll lock
  yield* FocusTrap.make({
    container: contentElement,
    returnFocus: previouslyFocused,
  });
  yield* ScrollLock.lock;

  // Focus the cancel button if available, otherwise focus content
  yield* ctx.cancelRef.pipe(
    Element.focus,
    Effect.catchAll(() =>
      Effect.sync(() => contentElement.focus({ preventScroll: true })),
    ),
  );

  return contentElement;
});

/**
 * Props for AlertDialog.Cancel
 */
export interface AlertDialogCancelProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Cancel button for the AlertDialog.
 * Closes the dialog without taking action.
 * Receives initial focus when the dialog opens.
 */
const Cancel = Component.gen(function* (
  props: AlertDialogCancelProps,
  children,
) {
  const ctx = yield* AlertDialogCtx;

  const cancelProps = {
    ref: ctx.cancelRef,
    "data-alertdialog-cancel": "",
    onClick: ctx.close,
  };

  if (props.asChild && Effect.isEffect(children)) {
    return yield* mergeProps(cancelProps, children);
  }

  return yield* $.button(
    { ...cancelProps, type: "button", class: props.class },
    children ?? [],
  );
});

/**
 * Props for AlertDialog.Action
 */
export interface AlertDialogActionProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Called when action button is clicked (before close) */
  readonly onClick?: () => Effect.Effect<void>;
  /** Render as child element instead of default button */
  readonly asChild?: boolean;
}

/**
 * Action button for the AlertDialog.
 * Executes the action and then closes the dialog.
 */
const Action = Component.gen(function* (
  props: AlertDialogActionProps,
  children,
) {
  const ctx = yield* AlertDialogCtx;

  const handleClick = () =>
    Effect.gen(function* () {
      yield* props.onClick?.() ?? Effect.void;
      yield* ctx.close();
    });

  const actionProps = {
    "data-alertdialog-action": "",
    onClick: handleClick,
  };

  if (props.asChild && Effect.isEffect(children)) {
    return yield* mergeProps(actionProps, children);
  }

  return yield* $.button(
    { ...actionProps, type: "button", class: props.class },
    children ?? [],
  );
});

/**
 * Props for AlertDialog.Title
 */
export interface AlertDialogTitleProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default h2 */
  readonly asChild?: boolean;
}

/**
 * Accessible title for the AlertDialog.
 * Connected to the content via aria-labelledby.
 */
const Title = Component.gen(function* (props: AlertDialogTitleProps, children) {
  const ctx = yield* AlertDialogCtx;

  const titleProps = {
    id: ctx.titleId,
    "data-alertdialog-title": "",
  };

  if (props.asChild && Effect.isEffect(children)) {
    return yield* mergeProps(titleProps, children);
  }

  return yield* $.h2({ ...titleProps, class: props.class }, children ?? []);
});

/**
 * Props for AlertDialog.Description
 */
export interface AlertDialogDescriptionProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Render as child element instead of default p */
  readonly asChild?: boolean;
}

/**
 * Accessible description for the AlertDialog.
 * Connected to the content via aria-describedby.
 */
const Description = Component.gen(function* (
  props: AlertDialogDescriptionProps,
  children,
) {
  const ctx = yield* AlertDialogCtx;

  const descriptionProps = {
    id: ctx.descriptionId,
    "data-alertdialog-description": "",
  };

  if (props.asChild && Effect.isEffect(children)) {
    return yield* mergeProps(descriptionProps, children);
  }

  return yield* $.p(
    { ...descriptionProps, class: props.class },
    children ?? [],
  );
});

/**
 * Headless AlertDialog primitive for building accessible confirmation dialogs.
 *
 * Unlike regular Dialog, AlertDialog:
 * - Uses role="alertdialog" for screen reader announcement
 * - Cannot be dismissed by clicking overlay (requires explicit action)
 * - Has Cancel and Action buttons (not just Close)
 * - Focuses the Cancel button by default (least destructive action)
 *
 * @example
 * ```ts
 * AlertDialog.Root({ defaultOpen: false }, [
 *   AlertDialog.Trigger({}, "Delete"),
 *   AlertDialog.Portal({}, [
 *     AlertDialog.Overlay({ class: "overlay" }),
 *     AlertDialog.Content({ class: "content" }, [
 *       AlertDialog.Title({}, "Are you sure?"),
 *       AlertDialog.Description({}, "This action cannot be undone."),
 *       $.div({ class: "buttons" }, [
 *         AlertDialog.Cancel({}, "Cancel"),
 *         AlertDialog.Action({ onClick: () => deleteItem() }, "Delete"),
 *       ]),
 *     ]),
 *   ]),
 * ])
 * ```
 */
export const AlertDialog = {
  Root,
  Trigger,
  Portal: AlertDialogPortal,
  Overlay,
  Content,
  Cancel,
  Action,
  Title,
  Description,
} as const;
