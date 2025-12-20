[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Element

# Type Alias: Element\<N, E, R\>

> **Element**\<`N`, `E`, `R`\> = `Effect.Effect`\<`N`, `E`, `Scope.Scope` \| [`RendererContext`](../classes/RendererContext.md) \| `R`\>

Defined in: [packages/core/src/Element.ts:30](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Element.ts#L30)

A rendered element wrapped in an Effect with scope management.
This is the generic version that works with any renderer.

## Type Parameters

### N

`N` = `unknown`

The node type (e.g., HTMLElement for DOM, string for SSR)

### E

`E` = `never`

The error type (defaults to never for infallible elements)

### R

`R` = `never`

Additional requirements/context type beyond RendererContext

## Example

```ts
// DOM element
const myButton: Element<HTMLElement> = button({ className: "primary" }, ["Click me"])

// Component that can fail
const UserProfile: Element<HTMLElement, UserNotFoundError> = Effect.gen(function* () {
  const user = yield* fetchUser(userId)
  return yield* div([user.name])
})

// Component with additional requirements
const NavLink: Element<HTMLElement, never, RouterContext> = Effect.gen(function* () {
  const router = yield* RouterContext
  return yield* button({ onClick: () => router.push("/") }, "Home")
})
```
