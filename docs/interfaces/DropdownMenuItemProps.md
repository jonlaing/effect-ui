[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DropdownMenuItemProps

# Interface: DropdownMenuItemProps

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:83](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L83)

Props for DropdownMenu.Item

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:85](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L85)

Additional class names

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:87](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L87)

Whether this item is disabled

***

### onSelect()?

> `readonly` `optional` **onSelect**: () => `Effect`\<`void`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:89](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L89)

Callback when item is selected

#### Returns

`Effect`\<`void`\>
