[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / VirtualListRefType

# Interface: VirtualListRefType

Defined in: [packages/dom/src/VirtualList/types.ts:36](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/types.ts#L36)

A reference to virtual list controls that may not be available yet.

## Properties

### \_deferred

> `readonly` **\_deferred**: `Deferred`\<[`VirtualListControl`](VirtualListControl.md)\>

Defined in: [packages/dom/src/VirtualList/types.ts:44](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/types.ts#L44)

Internal deferred for awaiting

***

### \_set()

> `readonly` **\_set**: (`control`) => `void`

Defined in: [packages/dom/src/VirtualList/types.ts:42](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/types.ts#L42)

Internal setter - do not use directly

#### Parameters

##### control

[`VirtualListControl`](VirtualListControl.md)

#### Returns

`void`

***

### current

> `readonly` **current**: [`VirtualListControl`](VirtualListControl.md) \| `null`

Defined in: [packages/dom/src/VirtualList/types.ts:38](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/types.ts#L38)

The current control interface, or null if not yet mounted

***

### ready

> `readonly` **ready**: `Effect`\<[`VirtualListControl`](VirtualListControl.md)\>

Defined in: [packages/dom/src/VirtualList/types.ts:40](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/types.ts#L40)

Effect that resolves when the control interface is available
