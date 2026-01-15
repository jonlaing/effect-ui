# @effex/router

Type-safe routing for Effex applications with Effect Schema validation for route params.

## Installation

```bash
pnpm add @effex/router effect
```

## Basic Usage

```ts
import { Effect, Context } from "effect";
import { $, Component, mount, runApp } from "@effex/dom";
import { Route, Router, Link } from "@effex/router";

// Define routes
const routes = {
  home: Route.make("/"),
  about: Route.make("/about"),
};

// Create the router and mount
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);

    yield* mount(
      App().pipe(Effect.provide(router.layer)),
      document.getElementById("root")!,
    );
  }),
);
```

## Route.define (File-Based Routing)

When using file-based routing with `@effex/vite-plugin`, use `Route.define` to co-locate route configuration with your component:

```ts
// src/routes/users.$id.ts
import { Effect, Schema } from "effect";
import { $, Component } from "@effex/dom";
import { Route, Link } from "@effex/router";

// Define route with params, loader, and action
export const route = Route.define({
  params: Schema.Struct({ id: Schema.String }),
  loader: (params) =>
    Effect.gen(function* () {
      return yield* fetchUser(params.id);
    }),
});

const UserPage = Component.gen(function* () {
  // Type-safe access to params
  const params = yield* route.params();
  // params is typed as { id: string } | null

  // Type-safe access to loader data
  const user = yield* route.loaderData<User>();

  // Check if this route is active
  const isActive = route.isActive();

  return yield* $.div([
    $.h1(["User ", params?.id ?? "Unknown"]),
    $.p([user.name]),
  ]);
});

export default UserPage;
```

### Route.define Options

- `params` - Effect Schema for route parameters
- `loader` - Function that receives params and returns data
- `action` - Function for handling form submissions

### Route Methods

When you use `Route.define`, the exported `route` object provides type-safe accessor methods:

- `route.params()` - Effect that returns current route params (or null if not on this route)
- `route.loaderData<T>()` - Effect that returns loader data
- `route.isActive()` - Readable signal indicating if this route is active

## Route Parameters

Define routes with typed parameters using Effect Schema:

```ts
import { Schema } from "effect";

const routes = {
  home: Route.make("/"),
  user: Route.make("/users/:id", {
    params: Schema.Struct({ id: Schema.String }),
  }),
  post: Route.make("/posts/:slug", {
    params: Schema.Struct({ slug: Schema.String }),
  }),
};
```

Access params in your components:

```ts
const UserPage = Component.gen(function* () {
  const router = yield* RouterContext;
  const params = yield* router.routes.user.params.get;
  // params is typed as { id: string } | null

  return yield* $.div([
    $.h1(["User ", params?.id ?? "Unknown"]),
  ]);
});
```

## Router Layer

Create a router and use its layer to provide context:

```ts
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);

    yield* mount(
      App().pipe(Effect.provide(router.layer)),
      document.getElementById("root")!,
    );
  }),
);
```

### Typed Router Context

For full type safety with a custom context tag:

```ts
import { Context } from "effect";
import { type RouterInfer, makeTypedRouterLayer } from "@effex/router";

// Infer the router type from your routes
type AppRouter = RouterInfer<typeof routes>;

// Create a typed context tag
class AppRouterContext extends Context.Tag("AppRouterContext")<
  AppRouterContext,
  AppRouter
>() {}

// Provide the typed layer
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);
    const routerLayer = makeTypedRouterLayer(router, AppRouterContext);

    yield* mount(
      App().pipe(Effect.provide(routerLayer)),
      document.getElementById("root")!,
    );
  }),
);
```

## Link Component

The `Link` component handles navigation:

```ts
import { Link } from "@effex/router";

// Basic link
Link({ href: "/about" }, "About Us");

// With reactive href
const userId = yield* Signal.make("123");
Link({ href: userId.map(id => `/users/${id}`) }, "View User");

// With additional attributes
Link({ href: "/contact", class: "nav-link" }, "Contact");
```

## Programmatic Navigation

Navigate programmatically using the router:

```ts
const router = yield* RouterContext;

// Navigate to a path
yield* router.navigate("/users/456");

// Navigate with options
yield* router.navigate("/search", { replace: true });

// Access current state
const pathname = yield* router.pathname.get;
const currentRoute = yield* router.currentRoute.get;
```

## Query Parameters

Access query parameters directly as `URLSearchParams`:

```ts
const router = yield* RouterContext;

// Read search params (already a URLSearchParams object)
const searchParams = yield* router.searchParams.get;
const query = searchParams.get("q");
const page = searchParams.get("page");
```

## Route Matching

Use `matchRoute` to render different components based on the current route:

```ts
import { matchRoute } from "@effex/router";

matchRoute({
  home: () => HomePage(),
  about: () => AboutPage(),
  users_$id: () => UserPage(),
  _: () => NotFoundPage(),
})
```

The `_` key is the fallback rendered when:
- No route matches
- RouterContext is not available

`matchRoute` automatically accesses the router context internally, so you don't need to pass it as an argument.

For more control, you can access the current route directly:

```ts
const router = yield* RouterContext;

// currentRoute is Option<RouteNames>
const currentRoute = yield* router.currentRoute.get;

if (Option.isSome(currentRoute)) {
  console.log("Current route:", currentRoute.value);
}
```

## API Reference

### Route

- `Route.make(pattern, options?)` - Define a route with optional param schema, loader, action
- `Route.define(options?)` - Define a route for file-based routing (path injected by vite-plugin)

### Router

- `Router.make(routes, options?)` - Create a router instance
- `router.layer` - Layer providing RouterContext
- `router.navigate(path, options?)` - Navigate to a path
- `router.pathname` - Readable of current pathname
- `router.search` - Readable of current search string
- `router.currentRoute` - Readable of matched route name (Option)
- `router.routes.<name>.params` - Readable of route params

### Context

- `RouterContext` - Base router context tag
- `makeTypedRouterLayer(router, tag)` - Create a layer providing both contexts

### Components

- `Link(props, children)` - Navigation link component
- `matchRoute(cases)` - Render components based on current route (uses `_` key as fallback)
