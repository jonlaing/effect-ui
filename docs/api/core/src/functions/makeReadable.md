[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / makeReadable

# Function: makeReadable()

> **makeReadable**\<`A`\>(`get`, `getChanges`): [`Readable`](../interfaces/Readable.md)\<`A`\>

Defined in: [packages/core/src/Readable.ts:96](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L96)

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
