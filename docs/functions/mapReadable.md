[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / mapReadable

# Function: mapReadable()

> **mapReadable**\<`A`, `B`\>(`self`, `f`): [`Readable`](../interfaces/Readable.md)\<`B`\>

Defined in: [src/core/Readable.ts:46](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Readable.ts#L46)

Transform a Readable's value using a mapping function.

## Type Parameters

### A

`A`

### B

`B`

## Parameters

### self

[`Readable`](../interfaces/Readable.md)\<`A`\>

The readable to transform

### f

(`a`) => `B`

The mapping function

## Returns

[`Readable`](../interfaces/Readable.md)\<`B`\>
