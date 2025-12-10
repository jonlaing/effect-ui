[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / makeRoute

# Function: makeRoute()

> **makeRoute**\<`Path`, `P`\>(`path`, `options?`): [`RouteType`](../interfaces/RouteType.md)\<`Path`, `P`\>

Defined in: [src/router/Route.ts:115](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/Route.ts#L115)

Create a route definition.

## Type Parameters

### Path

`Path` _extends_ `string`

### P

`P` _extends_ `AnyNoContext` = `AnyNoContext`

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
  params: Schema.Struct({ id: Schema.String }),
});

const HomeRoute = Route.make("/");

const CatchAllRoute = Route.make("/*");
```
