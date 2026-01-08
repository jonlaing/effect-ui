import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import { Readable } from "@effex/dom";
import { Ref } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { component } from "@effex/dom";
import { UniqueId } from "@effex/dom";
import { Portal } from "@effex/dom";
import { FocusTrap } from "@effex/dom";
import { ScrollLock } from "@effex/dom";
import type { Element } from "@effex/dom";

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
  readonly cancelRef: Ref<HTMLButtonElement>;
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
const Root = (
  props: AlertDialogRootProps,
  children: Element<never, AlertDialogCtx> | Element<never, AlertDialogCtx>[],
): Element =>
  Effect.gen(function* () {
    // Handle controlled vs uncontrolled state
    const isOpen = yield* Signal.fromNullable(
      props.open,
      props.defaultOpen ?? false,
    );

    const titleId = yield* UniqueId.make("alertdialog-title");
    const descriptionId = yield* UniqueId.make("alertdialog-description");
    const contentId = yield* UniqueId.make("alertdialog-content");
    const cancelRef = yield* Ref.make<HTMLButtonElement>();

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

    return yield* $.div(
      { style: { display: "contents" } },
      provide(AlertDialogCtx, ctx, children),
    );
  });

/**
 * Props for AlertDialog.Trigger
 */
export interface AlertDialogTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Button that opens the AlertDialog.
 */
const Trigger = component(
  "AlertDialogTrigger",
  (props: AlertDialogTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* AlertDialogCtx;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

      return yield* $.button(
        {
          class: props.class,
          type: "button",
          "aria-haspopup": "alertdialog",
          "aria-expanded": ariaExpanded,
          "aria-controls": ctx.contentId,
          "data-state": dataState,
          onClick: ctx.open,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for AlertDialog.Portal
 */
export interface AlertDialogPortalProps {
  /** Target element or selector to render into (default: document.body) */
  readonly target?: HTMLElement | string;
}

/**
 * Renders alert dialog content in a portal outside the normal DOM hierarchy.
 * Only renders when the dialog is open.
 */
const AlertDialogPortal = (
  props: AlertDialogPortalProps,
  children: Element<never, AlertDialogCtx> | Element<never, AlertDialogCtx>[],
): Element<never, AlertDialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* AlertDialogCtx;

    return yield* when(ctx.isOpen, {
      onTrue: () =>
        Portal({ target: props.target }, () =>
          $.div(
            { style: { display: "contents" }, "data-alertdialog-portal": "" },
            provide(AlertDialogCtx, ctx, children),
          ),
        ),
      onFalse: () => $.div({ style: { display: "none" } }),
    });
  });

/**
 * Props for AlertDialog.Overlay
 */
export interface AlertDialogOverlayProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Backdrop overlay for the AlertDialog.
 * Unlike Dialog, clicking the overlay does NOT close the alert dialog.
 */
const Overlay = component(
  "AlertDialogOverlay",
  (props: AlertDialogOverlayProps) =>
    Effect.gen(function* () {
      const ctx = yield* AlertDialogCtx;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));

      return yield* $.div({
        class: props.class,
        "data-state": dataState,
        "data-alertdialog-overlay": "",
        "aria-hidden": "true",
      });
    }),
);

/**
 * Props for AlertDialog.Content
 */
export interface AlertDialogContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
const Content = component(
  "AlertDialogContent",
  (props: AlertDialogContentProps, children) =>
    Effect.gen(function* () {
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
      yield* Effect.sync(() => {
        const cancelButton = ctx.cancelRef.current;
        if (cancelButton) {
          cancelButton.focus();
        } else {
          contentElement.focus();
        }
      });

      return contentElement;
    }),
);

/**
 * Props for AlertDialog.Cancel
 */
export interface AlertDialogCancelProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Cancel button for the AlertDialog.
 * Closes the dialog without taking action.
 * Receives initial focus when the dialog opens.
 */
const Cancel = component(
  "AlertDialogCancel",
  (props: AlertDialogCancelProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* AlertDialogCtx;

      const buttonElement = yield* $.button(
        {
          class: props.class,
          type: "button",
          "data-alertdialog-cancel": "",
          onClick: ctx.close,
        },
        children ?? [],
      );

      // Register this button as the cancel button for initial focus
      ctx.cancelRef.current = buttonElement;

      return buttonElement;
    }),
);

/**
 * Props for AlertDialog.Action
 */
export interface AlertDialogActionProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Called when action button is clicked (before close) */
  readonly onClick?: () => Effect.Effect<void>;
}

/**
 * Action button for the AlertDialog.
 * Executes the action and then closes the dialog.
 */
const Action = component(
  "AlertDialogAction",
  (props: AlertDialogActionProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* AlertDialogCtx;

      const handleClick = () =>
        Effect.gen(function* () {
          yield* props.onClick?.() ?? Effect.void;
          yield* ctx.close();
        });

      return yield* $.button(
        {
          class: props.class,
          type: "button",
          "data-alertdialog-action": "",
          onClick: handleClick,
        },
        children ?? [],
      );
    }),
);

/**
 * Props for AlertDialog.Title
 */
export interface AlertDialogTitleProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Accessible title for the AlertDialog.
 * Connected to the content via aria-labelledby.
 */
const Title = component(
  "AlertDialogTitle",
  (props: AlertDialogTitleProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* AlertDialogCtx;

      return yield* $.h2(
        {
          id: ctx.titleId,
          class: props.class,
          "data-alertdialog-title": "",
        },
        children ?? [],
      );
    }),
);

/**
 * Props for AlertDialog.Description
 */
export interface AlertDialogDescriptionProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Accessible description for the AlertDialog.
 * Connected to the content via aria-describedby.
 */
const Description = component(
  "AlertDialogDescription",
  (props: AlertDialogDescriptionProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* AlertDialogCtx;

      return yield* $.p(
        {
          id: ctx.descriptionId,
          class: props.class,
          "data-alertdialog-description": "",
        },
        children ?? [],
      );
    }),
);

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
