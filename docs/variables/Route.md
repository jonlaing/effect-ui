[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Route

# Variable: Route

> `const` **Route**: `object`

Defined in: [src/router/Route.ts:157](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/Route.ts#L157)

Route module namespace.

## Type Declaration

### make()

> **make**: \<`Path`, `P`\>(`path`, `options?`) => [`RouteType`](../interfaces/RouteType.md)\<`Path`, `P`\>

Create a route definition.

#### Type Parameters

##### Path

`Path` *extends* `string`

##### P

`P` *extends* `AnyNoContext` = `AnyNoContext`

#### Parameters

##### path

`Path`

The path pattern (e.g., "/users/:id")

##### options?

[`RouteOptions`](../interfaces/RouteOptions.md)\<`P`\>

Route configuration including params schema

#### Returns

[`RouteType`](../interfaces/RouteType.md)\<`Path`, `P`\>

#### Example

```ts
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String })
})

const HomeRoute = Route.make("/")

const CatchAllRoute = Route.make("/*")
```
