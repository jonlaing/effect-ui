[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / Suspense

# Function: Suspense()

> **Suspense**(`asyncRender`, `fallbackRender`): [`Element`](../type-aliases/Element.md)

Defined in: src/Control.ts:46

Renders a fallback while waiting for an async render to complete.

## Parameters

### asyncRender

() => `Effect`\<`HTMLElement`, `never`, `Scope`\>

Async function that returns the final element

### fallbackRender

() => [`Element`](../type-aliases/Element.md)

Function to render the loading state

## Returns

[`Element`](../type-aliases/Element.md)

## Example

```ts
Suspense(
  () => fetchAndRenderUserProfile(userId),
  () => div(["Loading..."])
)
```
