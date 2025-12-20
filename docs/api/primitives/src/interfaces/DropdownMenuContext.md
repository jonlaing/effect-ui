[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DropdownMenuContext

# Interface: DropdownMenuContext

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L26)

Context shared between DropdownMenu parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:32](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L32)

Close the menu

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:38](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L38)

Unique ID for the content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L28)

Whether the menu is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L30)

Open the menu

#### Returns

`Effect`\<`void`\>

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:34](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L34)

Toggle the menu open state

#### Returns

`Effect`\<`void`\>

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:40](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L40)

Unique ID for the trigger

***

### triggerRef

> `readonly` **triggerRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLButtonElement`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:36](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L36)

Reference to the trigger element
