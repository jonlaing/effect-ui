[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuSubContext

# Interface: ContextMenuSubContext

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:155](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L155)

Context for ContextMenu.Sub

## Properties

### cancelClose()

> `readonly` **cancelClose**: () => `void`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:163](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L163)

Cancel any pending close timeout

#### Returns

`void`

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:161](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L161)

Close the submenu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:169](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L169)

Unique ID for the submenu content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:157](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L157)

Whether the submenu is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:159](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L159)

Open the submenu

#### Returns

`Effect`\<`void`\>

***

### scheduleClose()

> `readonly` **scheduleClose**: () => `void`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:165](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L165)

Schedule a close with delay

#### Returns

`void`

***

### triggerEl

> `readonly` **triggerEl**: [`SignalType`](../type-aliases/SignalType.md)\<`HTMLElement` \| `null`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:167](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L167)

Reference to the SubTrigger element

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:171](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L171)

Unique ID for the SubTrigger
