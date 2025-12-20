[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / mapReadable

# Function: mapReadable()

> **mapReadable**\<`A`, `B`\>(`self`, `f`): [`Readable`](../interfaces/Readable.md)\<`B`\>

Defined in: [packages/core/src/Readable.ts:119](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L119)

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
