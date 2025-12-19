[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / mapReadable

# Function: mapReadable()

> **mapReadable**\<`A`, `B`\>(`self`, `f`): [`Readable`](../interfaces/Readable.md)\<`B`\>

Defined in: [src/core/Readable.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Readable.ts#L73)

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
