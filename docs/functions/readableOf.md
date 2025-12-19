[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / readableOf

# Function: readableOf()

> **readableOf**\<`A`\>(`value`): [`Readable`](../interfaces/Readable.md)\<`A`\>

Defined in: [src/core/Readable.ts:42](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Readable.ts#L42)

Create a constant Readable that never changes.
Useful for normalizing `T | Readable<T>` props.

## Type Parameters

### A

`A`

## Parameters

### value

`A` | [`Readable`](../interfaces/Readable.md)\<`A`\>

## Returns

[`Readable`](../interfaces/Readable.md)\<`A`\>

## Example

```ts
const disabled = Readable.of(false)
// disabled.get returns false, disabled.changes is empty

// Normalize a prop that can be static or reactive
const normalized: Readable<boolean> =
  typeof props.disabled === "boolean"
    ? Readable.of(props.disabled)
    : props.disabled ?? Readable.of(false)
```
