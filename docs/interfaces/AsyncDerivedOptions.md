[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / AsyncDerivedOptions

# Interface: AsyncDerivedOptions\<A\>

Defined in: src/Derived.ts:109

Options for creating an asynchronous Derived value.

## Type Parameters

### A

`A`

The type of the derived value

## Properties

### debounceMs?

> `readonly` `optional` **debounceMs**: `number`

Defined in: src/Derived.ts:113

Debounce delay in milliseconds (only used with "debounce" strategy)

***

### equals()?

> `readonly` `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: src/Derived.ts:115

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

Defined in: src/Derived.ts:111

Strategy for handling concurrent computations (default: "abort")
