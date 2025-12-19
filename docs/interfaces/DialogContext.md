[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DialogContext

# Interface: DialogContext

Defined in: [src/primitives/Dialog/Dialog.ts:16](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L16)

Context shared between Dialog parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Dialog/Dialog.ts:22](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L22)

Close the dialog

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/Dialog/Dialog.ts:30](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L30)

Unique ID for the dialog content

***

### descriptionId

> `readonly` **descriptionId**: `string`

Defined in: [src/primitives/Dialog/Dialog.ts:28](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L28)

Unique ID for the dialog description (aria-describedby)

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Dialog/Dialog.ts:18](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L18)

Whether the dialog is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Dialog/Dialog.ts:20](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L20)

Open the dialog

#### Returns

`Effect`\<`void`\>

***

### titleId

> `readonly` **titleId**: `string`

Defined in: [src/primitives/Dialog/Dialog.ts:26](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L26)

Unique ID for the dialog title (aria-labelledby)

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Dialog/Dialog.ts:24](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L24)

Toggle the dialog open state

#### Returns

`Effect`\<`void`\>
