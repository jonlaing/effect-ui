[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AsyncDerivedOptions

# Interface: AsyncDerivedOptions\<A\>

Defined in: [src/core/Derived/types.ts:39](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Derived/types.ts#L39)

Options for creating an asynchronous Derived value.

## Type Parameters

### A

`A`

The type of the derived value

## Properties

### debounceMs?

> `readonly` `optional` **debounceMs**: `number`

Defined in: [src/core/Derived/types.ts:43](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Derived/types.ts#L43)

Debounce delay in milliseconds (only used with "debounce" strategy)

***

### equals()?

> `readonly` `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [src/core/Derived/types.ts:45](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Derived/types.ts#L45)

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

Defined in: [src/core/Derived/types.ts:41](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Derived/types.ts#L41)

Strategy for handling concurrent computations (default: "abort")
