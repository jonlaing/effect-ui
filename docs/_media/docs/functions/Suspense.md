[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Suspense

# Function: Suspense()

> **Suspense**\<`R1`, `E`, `R2`\>(`asyncRender`, `fallbackRender`): [`Element`](../type-aliases/Element.md)\<`E`, `R1` \| `R2`\>

Defined in: [src/dom/Control.ts:46](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L46)

Renders a fallback while waiting for an async render to complete.

## Type Parameters

### R1

`R1` = `never`

### E

`E` = `never`

### R2

`R2` = `never`

## Parameters

### asyncRender

() => `Effect`\<`HTMLElement`, `never`, `Scope` \| `R1`\>

Async function that returns the final element

### fallbackRender

() => [`Element`](../type-aliases/Element.md)\<`E`, `R2`\>

Function to render the loading state

## Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R1` \| `R2`\>

## Example

```ts
Suspense(
  () => fetchAndRenderUserProfile(userId),
  () => div(["Loading..."])
)
```
