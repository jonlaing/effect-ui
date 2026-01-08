import { Context, Effect } from "effect";
import { Signal } from "@effex/dom";
import { Readable } from "@effex/dom";
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
 * Dialog.Root({ defaultOpen: false }, [
 *   Dialog.Trigger({}, "Open Dialog"),
 *   Dialog.Portal({}, [
 *     Dialog.Overlay({ class: "dialog-overlay" }),
 *     Dialog.Content({ class: "dialog-content" }, [
 *       Dialog.Title({}, "Dialog Title"),
 *       Dialog.Description({}, "Dialog description"),
 *       Dialog.Close({}, "Close"),
 *     ]),
 *   ]),
 * ])
 * ```
 */
const Root = (
  props: DialogRootProps,
  children: Element<never, DialogCtx> | Element<never, DialogCtx>[],
): Element =>
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
  });

/**
 * Props for Dialog.Trigger
 */
export interface DialogTriggerProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Button that opens the Dialog.
 * Includes proper ARIA attributes.
 *
 * @example
 * ```ts
 * Dialog.Trigger({ class: "btn" }, "Open Dialog")
 * ```
 */
const Trigger = component(
  "DialogTrigger",
  (props: DialogTriggerProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* DialogCtx;

      const dataState = ctx.isOpen.map((open) => (open ? "open" : "closed"));
      const ariaExpanded = ctx.isOpen.map((open) => (open ? "true" : "false"));

      return yield* $.button(
        {
          class: props.class,
          type: "button",
          "aria-haspopup": "dialog",
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
 * Props for Dialog.Portal
 */
export interface DialogPortalProps {
  /** Target element or selector to render into (default: document.body) */
  readonly target?: HTMLElement | string;
}

/**
 * Renders dialog content in a portal outside the normal DOM hierarchy.
 * Only renders when the dialog is open.
 *
 * @example
 * ```ts
 * Dialog.Portal({}, [
 *   Dialog.Overlay({}),
 *   Dialog.Content({}, [...]),
 * ])
 * ```
 */
const DialogPortal = (
  props: DialogPortalProps,
  children: Element<never, DialogCtx> | Element<never, DialogCtx>[],
): Element<never, DialogCtx> =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    return yield* when(ctx.isOpen, {
      onTrue: () =>
        Portal({ target: props.target }, () =>
          $.div(
            { style: { display: "contents" }, "data-dialog-portal": "" },
            provide(DialogCtx, ctx, children),
          ),
        ),
      onFalse: () => $.div({ style: { display: "none" } }),
    });
  });

/**
 * Props for Dialog.Overlay
 */
export interface DialogOverlayProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
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
const Overlay = component("DialogOverlay", (props: DialogOverlayProps) =>
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
  }),
);

/**
 * Props for Dialog.Content
 */
export interface DialogContentProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /** Called when Escape key is pressed (before close) */
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => Effect.Effect<void>;
}

/**
 * Content area for the Dialog.
 * Includes focus trap, scroll lock, and keyboard support.
 *
 * @example
 * ```ts
 * Dialog.Content({ class: "dialog-content" }, [
 *   Dialog.Title({}, "Title"),
 *   Dialog.Description({}, "Description"),
 *   // ... content
 *   Dialog.Close({}, "Close"),
 * ])
 * ```
 */
const Content = component(
  "DialogContent",
  (props: DialogContentProps, children) =>
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
        children ?? [],
      );

      // Setup focus trap and scroll lock
      yield* FocusTrap.make({
        container: contentElement,
        returnFocus: previouslyFocused,
      });
      yield* ScrollLock.lock;

      return contentElement;
    }),
);

/**
 * Props for Dialog.Close
 */
export interface DialogCloseProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Button that closes the Dialog.
 *
 * @example
 * ```ts
 * Dialog.Close({ class: "close-btn" }, "Close")
 * ```
 */
const Close = component("DialogClose", (props: DialogCloseProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    return yield* $.button(
      {
        class: props.class,
        type: "button",
        "data-dialog-close": "",
        onClick: ctx.close,
      },
      children ?? [],
    );
  }),
);

/**
 * Props for Dialog.Title
 */
export interface DialogTitleProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Accessible title for the Dialog.
 * Connected to the content via aria-labelledby.
 *
 * @example
 * ```ts
 * Dialog.Title({ class: "dialog-title" }, "Edit Profile")
 * ```
 */
const Title = component("DialogTitle", (props: DialogTitleProps, children) =>
  Effect.gen(function* () {
    const ctx = yield* DialogCtx;

    return yield* $.h2(
      {
        id: ctx.titleId,
        class: props.class,
        "data-dialog-title": "",
      },
      children ?? [],
    );
  }),
);

/**
 * Props for Dialog.Description
 */
export interface DialogDescriptionProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Accessible description for the Dialog.
 * Connected to the content via aria-describedby.
 *
 * @example
 * ```ts
 * Dialog.Description({}, "Make changes to your profile here.")
 * ```
 */
const Description = component(
  "DialogDescription",
  (props: DialogDescriptionProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* DialogCtx;

      return yield* $.p(
        {
          id: ctx.descriptionId,
          class: props.class,
          "data-dialog-description": "",
        },
        children ?? [],
      );
    }),
);

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
 * Dialog.Root({ defaultOpen: false }, [
 *   Dialog.Trigger({}, "Open"),
 *   Dialog.Portal({}, [
 *     Dialog.Overlay({ class: "overlay" }),
 *     Dialog.Content({ class: "content" }, [
 *       Dialog.Title({}, "Dialog Title"),
 *       Dialog.Description({}, "Dialog description"),
 *       $.div({ class: "body" }, [
 *         // Your content here
 *       ]),
 *       Dialog.Close({}, "Close"),
 *     ]),
 *   ]),
 * ])
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
