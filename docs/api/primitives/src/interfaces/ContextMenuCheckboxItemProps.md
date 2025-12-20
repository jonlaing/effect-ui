[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ContextMenuCheckboxItemProps

# Interface: ContextMenuCheckboxItemProps

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:104](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L104)

Props for ContextMenu.CheckboxItem

## Properties

### checked?

> `readonly` `optional` **checked**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:110](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L110)

Controlled checked state

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:106](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L106)

Additional class names

***

### defaultChecked?

> `readonly` `optional` **defaultChecked**: `boolean`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:112](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L112)

Default checked state (uncontrolled)

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:108](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L108)

Whether this item is disabled

***

### onCheckedChange()?

> `readonly` `optional` **onCheckedChange**: (`checked`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:114](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L114)

Callback when checked state changes

#### Parameters

##### checked

`boolean`

#### Returns

`Effect`\<`void`\>
