[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / makeRouter

# Function: makeRouter()

> **makeRouter**\<`Routes`\>(`routes`, `options?`): `Effect`\<[`RouterType`](../interfaces/RouterType.md)\<`Routes`\>, `never`, `Scope`\>

Defined in: [src/router/Router.ts:40](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/router/Router.ts#L40)

Create a Router from a record of routes.

## Type Parameters

### Routes

`Routes` *extends* `Record`\<`string`, [`RouteType`](../interfaces/RouteType.md)\<`string`, `AnyNoContext`\>\>

## Parameters

### routes

`Routes`

A record mapping route names to Route definitions

### options?

[`RouterOptions`](../interfaces/RouterOptions.md)

Optional router configuration

## Returns

`Effect`\<[`RouterType`](../interfaces/RouterType.md)\<`Routes`\>, `never`, `Scope`\>

## Example

```ts
const HomeRoute = Route.make("/")
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String })
})

const router = yield* Router.make({
  home: HomeRoute,
  user: UserRoute,
})

// Navigate
yield* router.push("/users/123")

// Access route state
const isUserActive = yield* router.routes.user.isActive.get
const userParams = yield* router.routes.user.params.get
```
