[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Link

# Variable: Link

> `const` **Link**: [`Component`](../type-aliases/Component.md)\<`"Link"`, [`LinkProps`](../interfaces/LinkProps.md), `never`, [`RouterContext`](../classes/RouterContext.md)\>

Defined in: [src/router/RouterContext.ts:113](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/router/RouterContext.ts#L113)

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
