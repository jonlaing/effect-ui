[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AlertDialogContext

# Interface: AlertDialogContext

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:17](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L17)

Context shared between AlertDialog parts.

## Properties

### cancelRef

> `readonly` **cancelRef**: [`RefType`](../type-aliases/RefType.md)\<`HTMLButtonElement`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:31](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L31)

Ref to cancel button for initial focus

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:23](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L23)

Close the alert dialog

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:29](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L29)

Unique ID for the dialog content

***

### descriptionId

> `readonly` **descriptionId**: `string`

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:27](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L27)

Unique ID for the dialog description (aria-describedby)

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:19](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L19)

Whether the alert dialog is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:21](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L21)

Open the alert dialog

#### Returns

`Effect`\<`void`\>

***

### titleId

> `readonly` **titleId**: `string`

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:25](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L25)

Unique ID for the dialog title (aria-labelledby)
