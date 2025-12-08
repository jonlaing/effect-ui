[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AsyncState

# Interface: AsyncState\<A, E\>

Defined in: [src/core/Derived/types.ts:18](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L18)

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

Defined in: [src/core/Derived/types.ts:24](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L24)

The most recent error, if any

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/core/Derived/types.ts:20](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L20)

Whether a computation is currently in progress

***

### value

> `readonly` **value**: `Option`\<`A`\>

Defined in: [src/core/Derived/types.ts:22](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L22)

The most recent successful value, if any
