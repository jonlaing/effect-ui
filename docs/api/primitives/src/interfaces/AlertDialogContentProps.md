[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / AlertDialogContentProps

# Interface: AlertDialogContentProps

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:74](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L74)

Props for AlertDialog.Content

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:76](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L76)

Additional class names

***

### closeOnEscape?

> `readonly` `optional` **closeOnEscape**: `boolean`

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:80](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L80)

Whether to close on Escape key (default: true)

***

### onEscapeKeyDown()?

> `readonly` `optional` **onEscapeKeyDown**: (`event`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/AlertDialog/AlertDialog.ts:78](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/AlertDialog/AlertDialog.ts#L78)

Called when Escape key is pressed (before close)

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`Effect`\<`void`\>
