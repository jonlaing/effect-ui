[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ContextMenuItemProps

# Interface: ContextMenuItemProps

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:68](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L68)

Props for ContextMenu.Item

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:70](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L70)

Additional class names

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:72](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L72)

Whether this item is disabled

***

### onSelect()?

> `readonly` `optional` **onSelect**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:74](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L74)

Callback when item is selected

#### Returns

`Effect`\<`void`\>
