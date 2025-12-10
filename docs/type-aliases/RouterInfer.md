[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / RouterInfer

# Type Alias: RouterInfer\<Routes\>

> **RouterInfer**\<`Routes`\> = [`RouterType`](../interfaces/RouterType.md)\<`Routes`\>

Defined in: [src/router/Router.ts:249](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/Router.ts#L249)

Infer the Router type from a routes record.
Use this to create typed router contexts.

## Type Parameters

### Routes

`Routes` _extends_ `Record`\<`string`, [`RouteType`](../interfaces/RouteType.md)\<`string`, `Schema.Schema.AnyNoContext`\>\>

## Example

```ts
const routes = {
  home: Route.make("/"),
  user: Route.make("/users/:id", {
    params: Schema.Struct({ id: Schema.String }),
  }),
};

// Infer the router type
type AppRouter = Router.Infer<typeof routes>;

// Create a typed context for your app
class AppRouterContext extends Context.Tag("AppRouterContext")<
  AppRouterContext,
  AppRouter
>() {}

// Now you can yield the typed router from context
const router = yield * AppRouterContext;
router.currentRoute; // Readable<"home" | "user" | null>
router.routes.user.params; // Readable<{ id: string } | null>
```
