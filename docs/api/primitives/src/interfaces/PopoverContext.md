[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / PopoverContext

# Interface: PopoverContext

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:17](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L17)

Context shared between Popover parts.

## Properties

### anchorRef

> `readonly` **anchorRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLElement`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:29](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L29)

Reference to an optional anchor element

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:23](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L23)

Close the popover

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:31](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L31)

Unique ID for the popover content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:19](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L19)

Whether the popover is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:21](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L21)

Open the popover

#### Returns

`Effect`\<`void`\>

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:25](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L25)

Toggle the popover open state

#### Returns

`Effect`\<`void`\>

***

### triggerRef

> `readonly` **triggerRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLElement`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:27](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L27)

Reference to the trigger element
