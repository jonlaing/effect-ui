[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / makeRouterLayer

# Function: makeRouterLayer()

> **makeRouterLayer**(`router`): `Layer`\<[`RouterContext`](../classes/RouterContext.md)\>

Defined in: [src/router/RouterContext.ts:40](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/router/RouterContext.ts#L40)

Convenience function to create a RouterContext layer.

## Parameters

### router

[`BaseRouter`](../interfaces/BaseRouter.md)

The router instance to provide

## Returns

`Layer`\<[`RouterContext`](../classes/RouterContext.md)\>

## Example

```ts
const router = yield* Router.make(routes)
const layer = makeRouterLayer(router)

// Use in mount
mount(
  app.pipe(Effect.provide(layer)),
  document.getElementById("root")!
)
```
