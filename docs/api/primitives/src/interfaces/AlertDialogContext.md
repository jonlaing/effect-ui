[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / AlertDialogContext

# Interface: AlertDialogContext

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:18](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L18)

Context shared between AlertDialog parts.

## Properties

### cancelRef

> `readonly` **cancelRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLButtonElement`\>

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:32](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L32)

Ref to cancel button for initial focus

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:24](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L24)

Close the alert dialog

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L30)

Unique ID for the dialog content

***

### descriptionId

> `readonly` **descriptionId**: `string`

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L28)

Unique ID for the dialog description (aria-describedby)

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:20](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L20)

Whether the alert dialog is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:22](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L22)

Open the alert dialog

#### Returns

`Effect`\<`void`\>

***

### titleId

> `readonly` **titleId**: `string`

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L26)

Unique ID for the dialog title (aria-labelledby)
