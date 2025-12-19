[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / when

# Function: when()

> **when**\<`E1`, `R1`, `E2`, `R2`\>(`condition`, `onTrue`, `onFalse`, `options?`): [`Element`](../type-aliases/Element.md)\<`E1` \| `E2`, `R1` \| `R2`\>

Defined in: [src/dom/Control.ts:380](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L380)

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

### options?

[`ControlAnimationOptions`](../interfaces/ControlAnimationOptions.md)

Optional animation configuration

## Returns

[`Element`](../type-aliases/Element.md)\<`E1` \| `E2`, `R1` \| `R2`\>

## Examples

```ts
const isLoggedIn = yield* Signal.make(false)
when(
  isLoggedIn,
  () => div(["Welcome back!"]),
  () => div(["Please log in"])
)
```

```ts
// With animations
when(
  isVisible,
  () => Modal(),
  () => div(),
  { animate: { enter: "fade-in", exit: "fade-out" } }
)
```
