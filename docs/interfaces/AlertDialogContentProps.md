[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AlertDialogContentProps

# Interface: AlertDialogContentProps

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L73)

Props for AlertDialog.Content

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:75](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L75)

Additional class names

***

### closeOnEscape?

> `readonly` `optional` **closeOnEscape**: `boolean`

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:79](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L79)

Whether to close on Escape key (default: true)

***

### onEscapeKeyDown()?

> `readonly` `optional` **onEscapeKeyDown**: (`event`) => `Effect`\<`void`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:77](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L77)

Called when Escape key is pressed (before close)

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`Effect`\<`void`\>
