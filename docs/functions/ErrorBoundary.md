[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ErrorBoundary

# Function: ErrorBoundary()

> **ErrorBoundary**\<`E`, `R1`, `E2`, `R2`\>(`tryRender`, `catchRender`): [`Element`](../type-aliases/Element.md)\<`E2`, `R1` \| `R2`\>

Defined in: [src/dom/Control.ts:30](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L30)

Catches errors from a render function and displays a fallback element.

## Type Parameters

### E

`E`

### R1

`R1` = `never`

### E2

`E2` = `never`

### R2

`R2` = `never`

## Parameters

### tryRender

() => `Effect`\<`HTMLElement`, `E`, `Scope` \| `R1`\>

Function that may fail with an error

### catchRender

(`error`) => [`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

Function to render the error fallback

## Returns

[`Element`](../type-aliases/Element.md)\<`E2`, `R1` \| `R2`\>

## Example

```ts
ErrorBoundary(
  () => riskyComponent(),
  (error) => div(["Something went wrong: ", String(error)])
)
```
