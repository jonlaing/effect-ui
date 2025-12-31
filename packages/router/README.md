# @effex/router

Type-safe routing for Effex applications with Effect Schema validation for route params.

## Installation

```bash
pnpm add @effex/router effect
```

## Basic Usage

```ts
import { Effect, Context } from "effect";
import { $, component, mount, runApp } from "@effex/dom";
import {
  Route,
  Router,
  Link,
  makeTypedRouterLayer,
  type RouterInfer,
} from "@effex/router";

// Define routes
const routes = {
  home: Route.make("/"),
  about: Route.make("/about"),
};

// Create the router and mount
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);
    const routerLayer = makeRouterLayer(router);

    yield* mount(
      App().pipe(Effect.provide(routerLayer)),
      document.getElementById("root")!,
    );
  }),
);
```

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
const UserPage = component("UserPage", () =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    const params = yield* router.routes.user.params.get;
    // params is typed as { id: string } | null

    return yield* $.div([
      $.h1(["User ", params?.id ?? "Unknown"]),
    ]);
  }),
);
```

## Typed Router Context

For full type safety, create a typed router context:

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

// Use the typed context in components
const App = component("App", () =>
  Effect.gen(function* () {
    const router = yield* AppRouterContext;

    // router.currentRoute is typed as Option<"home" | "user" | "post">
    // router.routes.user.params is typed as Readable<{ id: string } | null>

    return yield* $.div([
      $.nav([
        Link({ href: "/" }, "Home"),
        Link({ href: "/users/123" }, "User 123"),
      ]),
    ]);
  }),
);

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

Access and update query parameters:

```ts
const router = yield* RouterContext;

// Read search params
const search = yield* router.search.get; // "?q=hello&page=2"

// Parse search params
const searchParams = new URLSearchParams(search);
const query = searchParams.get("q");
```

## Route Matching

The router automatically matches the current URL to defined routes:

```ts
const router = yield* RouterContext;

// currentRoute is Option<RouteNames>
const currentRoute = yield* router.currentRoute.get;

if (Option.isSome(currentRoute)) {
  console.log("Current route:", currentRoute.value);
}
```

Use with `match` for rendering:

```ts
import { match } from "@effex/dom";

match(router.currentRoute.map(opt => Option.isSome(opt) ? opt.value : null), {
  cases: [
    { pattern: "home", render: () => HomePage() },
    { pattern: "user", render: () => UserPage() },
    { pattern: "about", render: () => AboutPage() },
  ],
  fallback: () => NotFoundPage(),
});
```

## API Reference

### Route

- `Route.make(pattern, options?)` - Define a route with optional param schema

### Router

- `Router.make(routes, options?)` - Create a router instance
- `router.navigate(path, options?)` - Navigate to a path
- `router.pathname` - Readable of current pathname
- `router.search` - Readable of current search string
- `router.currentRoute` - Readable of matched route name (Option)
- `router.routes.<name>.params` - Readable of route params

### Context

- `RouterContext` - Base router context tag
- `makeRouterLayer(router)` - Create a layer providing RouterContext
- `makeTypedRouterLayer(router, tag)` - Create a layer providing both contexts

### Components

- `Link(props, children)` - Navigation link component
