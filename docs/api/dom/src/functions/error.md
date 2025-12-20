[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / error

# Function: error()

> **error**\<`E`, `R1`, `E2`, `R2`\>(`tryRender`, `catchRender`): [`Element`](../type-aliases/Element.md)\<`E2`, `R1` \| `R2`\>

Defined in: [packages/dom/src/Boundary.ts:114](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Boundary.ts#L114)

Error boundary that catches errors from a render function and displays a fallback element.

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
Boundary.error(
  () => riskyComponent(),
  (error) => div(["Something went wrong: ", String(error)])
)
```
