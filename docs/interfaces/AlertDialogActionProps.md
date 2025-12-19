[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AlertDialogActionProps

# Interface: AlertDialogActionProps

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:93](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L93)

Props for AlertDialog.Action

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:95](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L95)

Additional class names

***

### onClick()?

> `readonly` `optional` **onClick**: () => `Effect`\<`void`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:97](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L97)

Called when action button is clicked (before close)

#### Returns

`Effect`\<`void`\>
