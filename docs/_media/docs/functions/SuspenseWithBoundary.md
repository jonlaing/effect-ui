[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / SuspenseWithBoundary

# Function: SuspenseWithBoundary()

> **SuspenseWithBoundary**\<`E`, `R1`, `E2`, `R2`, `E3`, `R3`\>(`asyncRender`, `fallbackRender`, `catchRender`): [`Element`](../type-aliases/Element.md)\<`E2` \| `E3`, `R1` \| `R2` \| `R3`\>

Defined in: [src/dom/Control.ts:87](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L87)

Combines Suspense with ErrorBoundary for async renders that may fail.

## Type Parameters

### E

`E`

### R1

`R1` = `never`

### E2

`E2` = `never`

### R2

`R2` = `never`

### E3

`E3` = `never`

### R3

`R3` = `never`

## Parameters

### asyncRender

() => `Effect`\<`HTMLElement`, `E`, `Scope` \| `R1`\>

Async function that may fail

### fallbackRender

() => [`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

Function to render the loading state

### catchRender

(`error`) => [`Element`](../type-aliases/Element.md)\<`E3`, `R3`\>

Function to render the error state

## Returns

[`Element`](../type-aliases/Element.md)\<`E2` \| `E3`, `R1` \| `R2` \| `R3`\>

## Example

```ts
SuspenseWithBoundary(
  () => fetchAndRenderData(),
  () => div(["Loading..."]),
  (error) => div(["Failed to load: ", String(error)]),
);
```
