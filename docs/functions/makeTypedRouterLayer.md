[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / makeTypedRouterLayer

# Function: makeTypedRouterLayer()

> **makeTypedRouterLayer**\<`R`, `I`\>(`router`, `TypedContext`): `Layer`\<[`RouterContext`](../classes/RouterContext.md) \| `R`\>

Defined in: [src/router/RouterContext.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/RouterContext.ts#L73)

Create a router layer that provides both RouterContext (for Link components)
and a custom typed context (for full router access with typed routes).

## Type Parameters

### R

`R`

### I

`I` *extends* [`BaseRouter`](../interfaces/BaseRouter.md)

## Parameters

### router

`I`

The router instance

### TypedContext

`Tag`\<`R`, `I`\>

Your app's typed router context tag

## Returns

`Layer`\<[`RouterContext`](../classes/RouterContext.md) \| `R`\>

## Example

```ts
// Define routes
const routes = {
  home: Route.make("/"),
  user: Route.make("/users/:id", { params: Schema.Struct({ id: Schema.String }) }),
}

// Create typed context
type AppRouter = RouterInfer<typeof routes>
class AppRouterContext extends Context.Tag("AppRouterContext")<
  AppRouterContext,
  AppRouter
>() {}

// In your app setup
const router = yield* Router.make(routes)
const layer = makeTypedRouterLayer(router, AppRouterContext)

yield* mount(App().pipe(Effect.provide(layer)), root)
```
