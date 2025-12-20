[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Dialog

# Variable: Dialog

> `const` **Dialog**: `object`

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:444](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Dialog/Dialog.ts#L444)

Headless Dialog primitive for building accessible modal dialogs.

Features:
- Controlled and uncontrolled modes
- Focus trapping within dialog
- Scroll lock when open
- Escape key to close
- Click outside (overlay) to close
- Full ARIA support
- Portal rendering
- Data attributes for styling

## Type Declaration

### Close

> **Close**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DialogClose"`, [`DialogCloseProps`](../interfaces/DialogCloseProps.md), `never`, [`DialogCtx`](../classes/DialogCtx.md)\>

Button that closes the Dialog.

#### Example

```ts
Dialog.Close({ class: "close-btn" }, "Close")
```

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DialogContent"`, [`DialogContentProps`](../interfaces/DialogContentProps.md), `never`, [`DialogCtx`](../classes/DialogCtx.md)\>

Content area for the Dialog.
Includes focus trap, scroll lock, and keyboard support.

#### Example

```ts
Dialog.Content({ class: "dialog-content" }, [
  Dialog.Title({}, "Title"),
  Dialog.Description({}, "Description"),
  // ... content
  Dialog.Close({}, "Close"),
])
```

### Description

> **Description**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DialogDescription"`, [`DialogDescriptionProps`](../interfaces/DialogDescriptionProps.md), `never`, [`DialogCtx`](../classes/DialogCtx.md)\>

Accessible description for the Dialog.
Connected to the content via aria-describedby.

#### Example

```ts
Dialog.Description({}, "Make changes to your profile here.")
```

### Overlay

> **Overlay**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DialogOverlay"`, [`DialogOverlayProps`](../interfaces/DialogOverlayProps.md), `never`, [`DialogCtx`](../classes/DialogCtx.md)\>

Backdrop overlay for the Dialog.
Clicking the overlay closes the dialog.

#### Example

```ts
Dialog.Overlay({ class: "dialog-overlay" })
```

### Portal()

> `readonly` **Portal**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DialogCtx`](../classes/DialogCtx.md)\> = `DialogPortal`

Renders dialog content in a portal outside the normal DOM hierarchy.
Only renders when the dialog is open.

#### Parameters

##### props

[`DialogPortalProps`](../interfaces/DialogPortalProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DialogCtx`](../classes/DialogCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DialogCtx`](../classes/DialogCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DialogCtx`](../classes/DialogCtx.md)\>

#### Example

```ts
Dialog.Portal({}, [
  Dialog.Overlay({}),
  Dialog.Content({}, [...]),
])
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a Dialog. Manages open/closed state and provides
context to child components.

#### Parameters

##### props

[`DialogRootProps`](../interfaces/DialogRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DialogCtx`](../classes/DialogCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DialogCtx`](../classes/DialogCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
Dialog.Root({ defaultOpen: false }, [
  Dialog.Trigger({}, "Open Dialog"),
  Dialog.Portal({}, [
    Dialog.Overlay({ class: "dialog-overlay" }),
    Dialog.Content({ class: "dialog-content" }, [
      Dialog.Title({}, "Dialog Title"),
      Dialog.Description({}, "Dialog description"),
      Dialog.Close({}, "Close"),
    ]),
  ]),
])
```

### Title

> **Title**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DialogTitle"`, [`DialogTitleProps`](../interfaces/DialogTitleProps.md), `never`, [`DialogCtx`](../classes/DialogCtx.md)\>

Accessible title for the Dialog.
Connected to the content via aria-labelledby.

#### Example

```ts
Dialog.Title({ class: "dialog-title" }, "Edit Profile")
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DialogTrigger"`, [`DialogTriggerProps`](../interfaces/DialogTriggerProps.md), `never`, [`DialogCtx`](../classes/DialogCtx.md)\>

Button that opens the Dialog.
Includes proper ARIA attributes.

#### Example

```ts
Dialog.Trigger({ class: "btn" }, "Open Dialog")
```

## Example

```ts
// Basic usage
Dialog.Root({ defaultOpen: false }, [
  Dialog.Trigger({}, "Open"),
  Dialog.Portal({}, [
    Dialog.Overlay({ class: "overlay" }),
    Dialog.Content({ class: "content" }, [
      Dialog.Title({}, "Dialog Title"),
      Dialog.Description({}, "Dialog description"),
      $.div({ class: "body" }, [
        // Your content here
      ]),
      Dialog.Close({}, "Close"),
    ]),
  ]),
])

// Controlled
const isOpen = yield* Signal.make(false)
Dialog.Root({
  open: isOpen,
  onOpenChange: (open) => Effect.log(`Dialog ${open ? "opened" : "closed"}`),
}, [...])
```
