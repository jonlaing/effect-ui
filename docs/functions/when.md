[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / when

# Function: when()

> **when**(`condition`, `onTrue`, `onFalse`): [`Element`](../type-aliases/Element.md)

Defined in: src/Control.ts:136

Conditionally render one of two elements based on a reactive boolean.

## Parameters

### condition

[`Readable`](../interfaces/Readable.md)\<`boolean`\>

Reactive boolean value

### onTrue

() => [`Element`](../type-aliases/Element.md)

Element to render when true

### onFalse

() => [`Element`](../type-aliases/Element.md)

Element to render when false

## Returns

[`Element`](../type-aliases/Element.md)

## Example

```ts
const isLoggedIn = yield* Signal.make(false)
when(
  isLoggedIn,
  () => div(["Welcome back!"]),
  () => div(["Please log in"])
)
```
