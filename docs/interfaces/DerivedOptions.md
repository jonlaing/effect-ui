[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DerivedOptions

# Interface: DerivedOptions\<A\>

Defined in: [src/core/Derived/types.ts:8](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Derived/types.ts#L8)

Options for creating a synchronous Derived value.

## Type Parameters

### A

`A`

The type of the derived value

## Properties

### equals()?

> `readonly` `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [src/core/Derived/types.ts:10](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Derived/types.ts#L10)

Custom equality function to determine if the value has changed

#### Parameters

##### a

`A`

##### b

`A`

#### Returns

`boolean`
