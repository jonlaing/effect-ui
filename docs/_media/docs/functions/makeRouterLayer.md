[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / makeRouterLayer

# Function: makeRouterLayer()

> **makeRouterLayer**(`router`): `Layer`\<[`RouterContext`](../classes/RouterContext.md)\>

Defined in: [src/router/RouterContext.ts:40](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/RouterContext.ts#L40)

Convenience function to create a RouterContext layer.

## Parameters

### router

[`BaseRouter`](../interfaces/BaseRouter.md)

The router instance to provide

## Returns

`Layer`\<[`RouterContext`](../classes/RouterContext.md)\>

## Example

```ts
const router = yield * Router.make(routes);
const layer = makeRouterLayer(router);

// Use in mount
mount(app.pipe(Effect.provide(layer)), document.getElementById("root")!);
```
