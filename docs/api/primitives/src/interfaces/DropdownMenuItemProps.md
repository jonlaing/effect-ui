[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DropdownMenuItemProps

# Interface: DropdownMenuItemProps

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:84](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L84)

Props for DropdownMenu.Item

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:86](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L86)

Additional class names

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:88](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L88)

Whether this item is disabled

***

### onSelect()?

> `readonly` `optional` **onSelect**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:90](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L90)

Callback when item is selected

#### Returns

`Effect`\<`void`\>
