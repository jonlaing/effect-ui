[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / SuspenseWithBoundary

# Function: SuspenseWithBoundary()

> **SuspenseWithBoundary**\<`E`\>(`asyncRender`, `fallbackRender`, `catchRender`): [`Element`](../type-aliases/Element.md)

Defined in: src/Control.ts:87

Combines Suspense with ErrorBoundary for async renders that may fail.

## Type Parameters

### E

`E`

## Parameters

### asyncRender

() => `Effect`\<`HTMLElement`, `E`, `Scope`\>

Async function that may fail

### fallbackRender

() => [`Element`](../type-aliases/Element.md)

Function to render the loading state

### catchRender

(`error`) => [`Element`](../type-aliases/Element.md)

Function to render the error state

## Returns

[`Element`](../type-aliases/Element.md)

## Example

```ts
SuspenseWithBoundary(
  () => fetchAndRenderData(),
  () => div(["Loading..."]),
  (error) => div(["Failed to load: ", String(error)])
)
```
