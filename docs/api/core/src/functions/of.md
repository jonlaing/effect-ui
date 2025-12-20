[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / of

# Function: of()

> **of**\<`A`\>(`value`): [`Readable`](../interfaces/Readable.md)\<`A`\>

Defined in: [packages/core/src/Readable.ts:88](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L88)

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
