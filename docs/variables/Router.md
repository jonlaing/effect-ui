[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / Router

# Variable: Router

> `const` **Router**: `object`

Defined in: [src/router/Router.ts:256](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/Router.ts#L256)

Router module namespace.

## Type Declaration

### make()

> **make**: \<`Routes`\>(`routes`, `options?`) => `Effect`\<[`RouterType`](../interfaces/RouterType.md)\<`Routes`\>, `never`, `Scope`\>

Create a Router from a record of routes.

#### Type Parameters

##### Routes

`Routes` _extends_ `Record`\<`string`, [`RouteType`](../interfaces/RouteType.md)\<`string`, `AnyNoContext`\>\>

#### Parameters

##### routes

`Routes`

A record mapping route names to Route definitions

##### options?

[`RouterOptions`](../interfaces/RouterOptions.md)

Optional router configuration

#### Returns

`Effect`\<[`RouterType`](../interfaces/RouterType.md)\<`Routes`\>, `never`, `Scope`\>

#### Example

```ts
const HomeRoute = Route.make("/");
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String }),
});

const router =
  yield *
  Router.make({
    home: HomeRoute,
    user: UserRoute,
  });

// Navigate
yield * router.push("/users/123");

// Access route state
const isUserActive = yield * router.routes.user.isActive.get;
const userParams = yield * router.routes.user.params.get;
```
