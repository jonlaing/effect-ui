[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DropdownMenuSubContext

# Interface: DropdownMenuSubContext

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:120](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L120)

Context for DropdownMenu.Sub

## Properties

### cancelClose()

> `readonly` **cancelClose**: () => `void`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:128](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L128)

Cancel any pending close timeout

#### Returns

`void`

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:126](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L126)

Close the submenu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:134](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L134)

Unique ID for the submenu content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:122](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L122)

Whether the submenu is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:124](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L124)

Open the submenu

#### Returns

`Effect`\<`void`\>

***

### scheduleClose()

> `readonly` **scheduleClose**: () => `void`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:130](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L130)

Schedule a close with delay

#### Returns

`void`

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:136](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L136)

Unique ID for the SubTrigger

***

### triggerRef

> `readonly` **triggerRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLDivElement`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:132](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L132)

Reference to the SubTrigger element
