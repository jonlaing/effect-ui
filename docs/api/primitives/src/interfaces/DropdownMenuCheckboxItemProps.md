[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DropdownMenuCheckboxItemProps

# Interface: DropdownMenuCheckboxItemProps

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:176](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L176)

Props for DropdownMenu.CheckboxItem

## Properties

### checked?

> `readonly` `optional` **checked**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:182](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L182)

Controlled checked state

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:178](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L178)

Additional class names

***

### defaultChecked?

> `readonly` `optional` **defaultChecked**: `boolean`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:184](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L184)

Default checked state (uncontrolled)

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:180](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L180)

Whether this item is disabled

***

### onCheckedChange()?

> `readonly` `optional` **onCheckedChange**: (`checked`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:186](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L186)

Callback when checked state changes

#### Parameters

##### checked

`boolean`

#### Returns

`Effect`\<`void`\>
