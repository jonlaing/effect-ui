[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DialogContext

# Interface: DialogContext

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:17](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L17)

Context shared between Dialog parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:23](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L23)

Close the dialog

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:31](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L31)

Unique ID for the dialog content

***

### descriptionId

> `readonly` **descriptionId**: `string`

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:29](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L29)

Unique ID for the dialog description (aria-describedby)

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:19](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L19)

Whether the dialog is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:21](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L21)

Open the dialog

#### Returns

`Effect`\<`void`\>

***

### titleId

> `readonly` **titleId**: `string`

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:27](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L27)

Unique ID for the dialog title (aria-labelledby)

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Dialog/Dialog.ts:25](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Dialog/Dialog.ts#L25)

Toggle the dialog open state

#### Returns

`Effect`\<`void`\>
