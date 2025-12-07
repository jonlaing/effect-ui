[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / AsyncState

# Interface: AsyncState\<A, E\>

Defined in: src/Derived.ts:88

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

Defined in: src/Derived.ts:94

The most recent error, if any

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: src/Derived.ts:90

Whether a computation is currently in progress

***

### value

> `readonly` **value**: `Option`\<`A`\>

Defined in: src/Derived.ts:92

The most recent successful value, if any
