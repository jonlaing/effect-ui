[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ContextMenuContext

# Interface: ContextMenuContext

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:20](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L20)

Context shared between ContextMenu parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:26](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L26)

Close the menu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:30](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L30)

Unique ID for the content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:22](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L22)

Whether the menu is currently open

***

### openAt()

> `readonly` **openAt**: (`x`, `y`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:24](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L24)

Open the menu at specific coordinates

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`Effect`\<`void`\>

***

### position

> `readonly` **position**: [`Signal`](../../../core/src/interfaces/Signal.md)\<\{ `x`: `number`; `y`: `number`; \}\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:28](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L28)

Current cursor position when menu was opened

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:32](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L32)

Unique ID for the trigger
