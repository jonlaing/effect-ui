[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / makeReadable

# Function: makeReadable()

> **makeReadable**\<`A`\>(`get`, `getChanges`): [`Readable`](../interfaces/Readable.md)\<`A`\>

Defined in: [src/core/Readable.ts:50](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Readable.ts#L50)

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
