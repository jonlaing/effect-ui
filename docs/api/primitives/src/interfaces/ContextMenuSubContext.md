[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ContextMenuSubContext

# Interface: ContextMenuSubContext

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:156](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L156)

Context for ContextMenu.Sub

## Properties

### cancelClose()

> `readonly` **cancelClose**: () => `void`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:164](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L164)

Cancel any pending close timeout

#### Returns

`void`

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:162](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L162)

Close the submenu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:170](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L170)

Unique ID for the submenu content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:158](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L158)

Whether the submenu is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:160](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L160)

Open the submenu

#### Returns

`Effect`\<`void`\>

***

### scheduleClose()

> `readonly` **scheduleClose**: () => `void`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:166](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L166)

Schedule a close with delay

#### Returns

`void`

***

### triggerEl

> `readonly` **triggerEl**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`HTMLElement` \| `null`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:168](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L168)

Reference to the SubTrigger element

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:172](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L172)

Unique ID for the SubTrigger
