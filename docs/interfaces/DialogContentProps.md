[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DialogContentProps

# Interface: DialogContentProps

Defined in: [src/primitives/Dialog/Dialog.ts:72](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L72)

Props for Dialog.Content

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Dialog/Dialog.ts:74](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L74)

Additional class names

***

### onEscapeKeyDown()?

> `readonly` `optional` **onEscapeKeyDown**: (`event`) => `Effect`\<`void`\>

Defined in: [src/primitives/Dialog/Dialog.ts:76](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Dialog/Dialog.ts#L76)

Called when Escape key is pressed (before close)

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`Effect`\<`void`\>
