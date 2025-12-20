[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / makeRouterLayer

# Function: makeRouterLayer()

> **makeRouterLayer**(`router`): `Layer`\<[`RouterContext`](../classes/RouterContext.md)\>

Defined in: [packages/router/src/router/RouterContext.ts:40](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/RouterContext.ts#L40)

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
