[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / AsyncDerivedOptions

# Interface: AsyncDerivedOptions\<A\>

Defined in: [packages/core/src/Derived/types.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Derived/types.ts#L39)

Options for creating an asynchronous Derived value.

## Type Parameters

### A

`A`

The type of the derived value

## Properties

### debounceMs?

> `readonly` `optional` **debounceMs**: `number`

Defined in: [packages/core/src/Derived/types.ts:43](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Derived/types.ts#L43)

Debounce delay in milliseconds (only used with "debounce" strategy)

***

### equals()?

> `readonly` `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [packages/core/src/Derived/types.ts:45](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Derived/types.ts#L45)

Custom equality function to determine if the value has changed

#### Parameters

##### a

`A`

##### b

`A`

#### Returns

`boolean`

***

### strategy?

> `readonly` `optional` **strategy**: [`AsyncStrategy`](../type-aliases/AsyncStrategy.md)

Defined in: [packages/core/src/Derived/types.ts:41](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Derived/types.ts#L41)

Strategy for handling concurrent computations (default: "abort")
