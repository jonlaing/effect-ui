[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / Link

# Variable: Link

> `const` **Link**: [`Component`](../type-aliases/Component.md)\<`"Link"`, [`LinkProps`](../interfaces/LinkProps.md), `never`, [`RouterContext`](../classes/RouterContext.md)\>

Defined in: [src/router/RouterContext.ts:75](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/RouterContext.ts#L75)

A navigation link component that uses the RouterContext.
Components using Link will have RouterContext in their requirements.

## Example

```ts
// Basic link with children as second argument
Link({ href: "/users" }, "Users");

// With custom class (adds "active" when route matches)
Link({ href: "/", class: "nav-link" }, "Home");

// With multiple children
Link({ href: "/about" }, ["About ", "Us"]);

// Replace instead of push
Link({ href: "/login", replace: true }, "Login");
```
