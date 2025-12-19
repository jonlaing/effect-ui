[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DropdownMenuSubContext

# Interface: DropdownMenuSubContext

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:119](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L119)

Context for DropdownMenu.Sub

## Properties

### cancelClose()

> `readonly` **cancelClose**: () => `void`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:127](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L127)

Cancel any pending close timeout

#### Returns

`void`

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:125](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L125)

Close the submenu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:133](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L133)

Unique ID for the submenu content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:121](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L121)

Whether the submenu is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:123](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L123)

Open the submenu

#### Returns

`Effect`\<`void`\>

***

### scheduleClose()

> `readonly` **scheduleClose**: () => `void`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:129](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L129)

Schedule a close with delay

#### Returns

`void`

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:135](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L135)

Unique ID for the SubTrigger

***

### triggerRef

> `readonly` **triggerRef**: [`RefType`](../type-aliases/RefType.md)\<`HTMLDivElement`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:131](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L131)

Reference to the SubTrigger element
