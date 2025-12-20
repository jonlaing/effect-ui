[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / AlertDialog

# Variable: AlertDialog

> `const` **AlertDialog**: `object`

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:437](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L437)

Headless AlertDialog primitive for building accessible confirmation dialogs.

Unlike regular Dialog, AlertDialog:
- Uses role="alertdialog" for screen reader announcement
- Cannot be dismissed by clicking overlay (requires explicit action)
- Has Cancel and Action buttons (not just Close)
- Focuses the Cancel button by default (least destructive action)

## Type Declaration

### Action

> **Action**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogAction"`, [`AlertDialogActionProps`](../interfaces/AlertDialogActionProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Action button for the AlertDialog.
Executes the action and then closes the dialog.

### Cancel

> **Cancel**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogCancel"`, [`AlertDialogCancelProps`](../interfaces/AlertDialogCancelProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Cancel button for the AlertDialog.
Closes the dialog without taking action.
Receives initial focus when the dialog opens.

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogContent"`, [`AlertDialogContentProps`](../interfaces/AlertDialogContentProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Content area for the AlertDialog.
Includes focus trap, scroll lock, and keyboard support.
Initial focus goes to the Cancel button.

### Description

> **Description**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogDescription"`, [`AlertDialogDescriptionProps`](../interfaces/AlertDialogDescriptionProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Accessible description for the AlertDialog.
Connected to the content via aria-describedby.

### Overlay

> **Overlay**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogOverlay"`, [`AlertDialogOverlayProps`](../interfaces/AlertDialogOverlayProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Backdrop overlay for the AlertDialog.
Unlike Dialog, clicking the overlay does NOT close the alert dialog.

### Portal()

> `readonly` **Portal**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\> = `AlertDialogPortal`

Renders alert dialog content in a portal outside the normal DOM hierarchy.
Only renders when the dialog is open.

#### Parameters

##### props

[`AlertDialogPortalProps`](../interfaces/AlertDialogPortalProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for an AlertDialog. Manages open/closed state and provides
context to child components.

#### Parameters

##### props

[`AlertDialogRootProps`](../interfaces/AlertDialogRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

### Title

> **Title**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogTitle"`, [`AlertDialogTitleProps`](../interfaces/AlertDialogTitleProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

Accessible title for the AlertDialog.
Connected to the content via aria-labelledby.

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AlertDialogTrigger"`, [`AlertDialogTriggerProps`](../interfaces/AlertDialogTriggerProps.md), `never`, [`AlertDialogCtx`](../classes/AlertDialogCtx.md)\>

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
