[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuContext

# Interface: ContextMenuContext

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:19](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L19)

Context shared between ContextMenu parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:25](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L25)

Close the menu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:29](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L29)

Unique ID for the content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:21](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L21)

Whether the menu is currently open

***

### openAt()

> `readonly` **openAt**: (`x`, `y`) => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:23](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L23)

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

> `readonly` **position**: [`SignalType`](../type-aliases/SignalType.md)\<\{ `x`: `number`; `y`: `number`; \}\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:27](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L27)

Current cursor position when menu was opened

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:31](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L31)

Unique ID for the trigger
