[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / DerivedOptions

# Interface: DerivedOptions\<A\>

Defined in: [packages/core/src/Derived/types.ts:8](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Derived/types.ts#L8)

Options for creating a synchronous Derived value.

## Type Parameters

### A

`A`

The type of the derived value

## Properties

### equals()?

> `readonly` `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [packages/core/src/Derived/types.ts:10](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Derived/types.ts#L10)

Custom equality function to determine if the value has changed

#### Parameters

##### a

`A`

##### b

`A`

#### Returns

`boolean`
