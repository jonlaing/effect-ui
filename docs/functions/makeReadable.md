[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / makeReadable

# Function: makeReadable()

> **makeReadable**\<`A`\>(`get`, `getChanges`): [`Readable`](../interfaces/Readable.md)\<`A`\>

Defined in: [src/core/Readable.ts:23](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Readable.ts#L23)

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
