[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / AsyncState

# Interface: AsyncState\<A, E\>

Defined in: [packages/core/src/Derived/types.ts:18](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Derived/types.ts#L18)

State of an asynchronous derived value.

## Type Parameters

### A

`A`

The type of the successful value

### E

`E` = `never`

The type of the error

## Properties

### error

> `readonly` **error**: `Option`\<`E`\>

Defined in: [packages/core/src/Derived/types.ts:24](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Derived/types.ts#L24)

The most recent error, if any

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [packages/core/src/Derived/types.ts:20](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Derived/types.ts#L20)

Whether a computation is currently in progress

***

### value

> `readonly` **value**: `Option`\<`A`\>

Defined in: [packages/core/src/Derived/types.ts:22](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Derived/types.ts#L22)

The most recent successful value, if any
