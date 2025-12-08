[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / when

# Function: when()

> **when**\<`E1`, `R1`, `E2`, `R2`\>(`condition`, `onTrue`, `onFalse`): [`Element`](../type-aliases/Element.md)\<`E1` \| `E2`, `R1` \| `R2`\>

Defined in: [src/dom/Control.ts:136](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L136)

Conditionally render one of two elements based on a reactive boolean.

## Type Parameters

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

() => [`Element`](../type-aliases/Element.md)\<`E1`, `R1`\>

Element to render when true

### onFalse

() => [`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

Element to render when false

## Returns

[`Element`](../type-aliases/Element.md)\<`E1` \| `E2`, `R1` \| `R2`\>

## Example

```ts
const isLoggedIn = yield* Signal.make(false)
when(
  isLoggedIn,
  () => div(["Welcome back!"]),
  () => div(["Please log in"])
)
```
