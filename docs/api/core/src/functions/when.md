[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / when

# Function: when()

> **when**\<`N`, `E1`, `R1`, `E2`, `R2`\>(`condition`, `onTrue`, `onFalse`): [`Element`](../type-aliases/Element.md)\<`N`, `E1` \| `E2`, `R1` \| `R2`\>

Defined in: [packages/core/src/Control.ts:23](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L23)

Conditionally render one of two elements based on a reactive boolean.

## Type Parameters

### N

`N`

### E1

`E1` = `never`

### R1

`R1` = `never`

### E2

`E2` = `never`

### R2

`R2` = `never`

## Parameters

### condition

[`Readable`](../interfaces/Readable.md)\<`boolean`\>

Reactive boolean value

### onTrue

() => [`Element`](../type-aliases/Element.md)\<`N`, `E1`, `R1`\>

Element to render when true

### onFalse

() => [`Element`](../type-aliases/Element.md)\<`N`, `E2`, `R2`\>

Element to render when false

## Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E1` \| `E2`, `R1` \| `R2`\>

## Example

```ts
const isLoggedIn = yield* Signal.make(false)
when(
  isLoggedIn,
  () => div(["Welcome back!"]),
  () => div(["Please log in"])
)
```
