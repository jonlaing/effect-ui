[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / Element

# Type Alias: Element\<E, R\>

> **Element**\<`E`, `R`\> = [`Element`](../../../core/src/type-aliases/Element.md)\<`HTMLElement`, `E`, `R`\>

Defined in: [packages/dom/src/Element/types.ts:30](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Element/types.ts#L30)

A DOM element wrapped in an Effect with scope management.
This is the DOM-specialized version that returns HTMLElement.

## Type Parameters

### E

`E` = `never`

The error type (defaults to never for infallible elements)

### R

`R` = `never`

The requirements/context type (defaults to never for no requirements)

## Example

```ts
const myButton: Element = button({ className: "primary" }, ["Click me"])

// Component that can fail
const UserProfile: Element<UserNotFoundError> = Effect.gen(function* () {
  const user = yield* fetchUser(userId)
  return yield* div([user.name])
})

// Component with requirements
const NavLink: Element<never, RouterContext> = Effect.gen(function* () {
  const router = yield* RouterContext
  return yield* button({ onClick: () => router.push("/") }, "Home")
})
```
