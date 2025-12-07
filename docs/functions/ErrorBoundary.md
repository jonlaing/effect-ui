[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / ErrorBoundary

# Function: ErrorBoundary()

> **ErrorBoundary**\<`E`\>(`tryRender`, `catchRender`): [`Element`](../type-aliases/Element.md)

Defined in: src/Control.ts:19

Catches errors from a render function and displays a fallback element.

## Type Parameters

### E

`E`

## Parameters

### tryRender

() => `Effect`\<`HTMLElement`, `E`, `Scope`\>

Function that may fail with an error

### catchRender

(`error`) => [`Element`](../type-aliases/Element.md)

Function to render the error fallback

## Returns

[`Element`](../type-aliases/Element.md)

## Example

```ts
ErrorBoundary(
  () => riskyComponent(),
  (error) => div(["Something went wrong: ", String(error)])
)
```
