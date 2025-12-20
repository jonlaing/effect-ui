[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / makeReadable

# Function: makeReadable()

> **makeReadable**\<`A`\>(`get`, `getChanges`): [`Readable`](../interfaces/Readable.md)\<`A`\>

Defined in: [packages/core/src/Readable.ts:96](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L96)

Create a Readable from a getter effect and a changes stream factory.

## Type Parameters

### A

`A`

## Parameters

### get

`Effect`\<`A`\>

Effect that returns the current value

### getChanges

() => `Stream`\<`A`\>

Factory function that returns a stream of changes

## Returns

[`Readable`](../interfaces/Readable.md)\<`A`\>
