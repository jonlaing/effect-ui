[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AlertDialog

# Variable: AlertDialog

> `const` **AlertDialog**: `object`

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:437](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L437)

Headless AlertDialog primitive for building accessible confirmation dialogs.

Unlike regular Dialog, AlertDialog:
- Uses role="alertdialog" for screen reader announcement
- Cannot be dismissed by clicking overlay (requires explicit action)
- Has Cancel and Action buttons (not just Close)
- Focuses the Cancel button by default (least destructive action)

## Type Declaration

### Action

> **Action**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogAction"`, [`AlertDialogActionProps`](../interfaces/AlertDialogActionProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Action button for the AlertDialog.
Executes the action and then closes the dialog.

### Cancel

> **Cancel**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogCancel"`, [`AlertDialogCancelProps`](../interfaces/AlertDialogCancelProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Cancel button for the AlertDialog.
Closes the dialog without taking action.
Receives initial focus when the dialog opens.

### Content

> **Content**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogContent"`, [`AlertDialogContentProps`](../interfaces/AlertDialogContentProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Content area for the AlertDialog.
Includes focus trap, scroll lock, and keyboard support.
Initial focus goes to the Cancel button.

### Description

> **Description**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogDescription"`, [`AlertDialogDescriptionProps`](../interfaces/AlertDialogDescriptionProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Accessible description for the AlertDialog.
Connected to the content via aria-describedby.

### Overlay

> **Overlay**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogOverlay"`, [`AlertDialogOverlayProps`](../interfaces/AlertDialogOverlayProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Backdrop overlay for the AlertDialog.
Unlike Dialog, clicking the overlay does NOT close the alert dialog.

### Portal()

> `readonly` **Portal**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\> = `AlertDialogPortal`

Renders alert dialog content in a portal outside the normal DOM hierarchy.
Only renders when the dialog is open.

#### Parameters

##### props

[`AlertDialogPortalProps`](../interfaces/AlertDialogPortalProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

Root container for an AlertDialog. Manages open/closed state and provides
context to child components.

#### Parameters

##### props

[`AlertDialogRootProps`](../interfaces/AlertDialogRootProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

### Title

> **Title**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogTitle"`, [`AlertDialogTitleProps`](../interfaces/AlertDialogTitleProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Accessible title for the AlertDialog.
Connected to the content via aria-labelledby.

### Trigger

> **Trigger**: [`Component`](../type-aliases/Component.md)\<`"AlertDialogTrigger"`, [`AlertDialogTriggerProps`](../interfaces/AlertDialogTriggerProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Button that opens the AlertDialog.

## Example

```ts
AlertDialog.Root({ defaultOpen: false }, [
  AlertDialog.Trigger({}, "Delete"),
  AlertDialog.Portal({}, [
    AlertDialog.Overlay({ class: "overlay" }),
    AlertDialog.Content({ class: "content" }, [
      AlertDialog.Title({}, "Are you sure?"),
      AlertDialog.Description({}, "This action cannot be undone."),
      $.div({ class: "buttons" }, [
        AlertDialog.Cancel({}, "Cancel"),
        AlertDialog.Action({ onClick: () => deleteItem() }, "Delete"),
      ]),
    ]),
  ]),
])
```
