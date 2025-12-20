[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / Link

# Variable: Link

> `const` **Link**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"Link"`, [`LinkProps`](../interfaces/LinkProps.md), `never`, [`RouterContext`](../classes/RouterContext.md)\>

Defined in: [packages/router/src/router/RouterContext.ts:113](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/RouterContext.ts#L113)

A navigation link component that uses the RouterContext.
Components using Link will have RouterContext in their requirements.

## Example

```ts
// Basic link with children as second argument
Link({ href: "/users" }, "Users")

// With custom class (adds "active" when route matches)
Link({ href: "/", class: "nav-link" }, "Home")

// With multiple children
Link({ href: "/about" }, ["About ", "Us"])

// Replace instead of push
Link({ href: "/login", replace: true }, "Login")
```
