[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / makeRoute

# Function: makeRoute()

> **makeRoute**\<`Path`, `P`\>(`path`, `options?`): [`RouteType`](../interfaces/RouteType.md)\<`Path`, `P`\>

Defined in: [packages/router/src/router/Route.ts:115](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/Route.ts#L115)

Create a route definition.

## Type Parameters

### Path

`Path` *extends* `string`

### P

`P` *extends* `AnyNoContext` = `AnyNoContext`

## Parameters

### path

`Path`

The path pattern (e.g., "/users/:id")

### options?

[`RouteOptions`](../interfaces/RouteOptions.md)\<`P`\>

Route configuration including params schema

## Returns

[`RouteType`](../interfaces/RouteType.md)\<`Path`, `P`\>

## Example

```ts
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String })
})

const HomeRoute = Route.make("/")

const CatchAllRoute = Route.make("/*")
```
