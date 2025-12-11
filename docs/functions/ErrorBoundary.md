[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ErrorBoundary

# Function: ErrorBoundary()

> **ErrorBoundary**\<`E`, `R1`, `E2`, `R2`\>(`tryRender`, `catchRender`): [`Element`](../type-aliases/Element.md)\<`E2`, `R1` \| `R2`\>

Defined in: [src/dom/Control.ts:29](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Control.ts#L29)

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
