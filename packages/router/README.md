# @effex/router

Type-safe routing for Effex applications built on Effect.

## Installation

```bash
pnpm add @effex/router effect
```

## Overview

The router is built around four main concepts:

- **Route** - Define individual routes with paths and render functions
- **Router** - Compose routes together using a pipeable API
- **Navigation** - Runtime service for navigation state and methods
- **Link** - Component for declarative navigation

## Quick Start

```ts
import { Effect } from "effect";
import { $, mount } from "@effex/dom";
import { Route, Router, Navigation, Link } from "@effex/router";

// Define routes
const HomeRoute = Route.make("/", () =>
  $.div({}, Effect.succeed("Welcome home!"))
);

const AboutRoute = Route.make("/about", () =>
  $.div({}, Effect.succeed("About us"))
);

// Compose router
const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
);

// Create navigation layer and run app
const App = Effect.gen(function* () {
  const nav = yield* Navigation.Context;
  const match = yield* nav.currentMatch.get;

  return yield* $.div(
    {},
    // Navigation
    $.nav(
      {},
      Link({ href: "/" }, Effect.succeed("Home")),
      Link({ href: "/about" }, Effect.succeed("About")),
    ),
    // Render matched route
    Option.match(match, {
      onNone: () => $.div({}, Effect.succeed("Not found")),
      onSome: ({ route, params }) => route.render(params),
    }),
  );
});

mount(
  App.pipe(Effect.provide(Navigation.makeLayer(router))),
  document.getElementById("root")!,
);
```

## Route

Routes are defined with a path pattern and a render function.

### Basic Routes

```ts
import { Route } from "@effex/router";

const HomeRoute = Route.make("/", () =>
  $.div({}, Effect.succeed("Home"))
);

const AboutRoute = Route.make("/about", () =>
  $.div({}, Effect.succeed("About"))
);
```

### Routes with Parameters

Use `:param` syntax for dynamic segments. Access params via the scoped `Route.Params` context:

```ts
const UserRoute = Route.make("/users/:id", () =>
  Effect.gen(function* () {
    // Type-safe access to route params
    const { id } = yield* Route.params;

    return yield* $.div({}, Effect.succeed(`User ${id}`));
  })
);

const PostRoute = Route.make("/posts/:slug/comments/:commentId", () =>
  Effect.gen(function* () {
    const { slug, commentId } = yield* Route.params;

    return yield* $.div(
      {},
      Effect.succeed(`Post ${slug}, Comment ${commentId}`),
    );
  })
);
```

### Search Params

Access search/query parameters via the scoped context:

```ts
const SearchRoute = Route.make("/search", () =>
  Effect.gen(function* () {
    const searchParams = yield* Route.searchParams;
    const query = searchParams.get("q") ?? "";

    return yield* $.div({}, Effect.succeed(`Searching for: ${query}`));
  })
);
```

### Route Guards

Add guards to protect routes:

```ts
const ProtectedRoute = Route.make("/dashboard", renderDashboard).pipe(
  Route.withGuard(() =>
    Effect.gen(function* () {
      const user = yield* AuthService;
      return user.isAuthenticated;
    })
  ),
);
```

### Lazy Loading

Load route components lazily:

```ts
const HeavyRoute = Route.lazy("/reports", () =>
  import("./ReportsPage.js").then((m) => m.default)
);
```

## Router

Compose routes using the pipeable Router API.

### Basic Composition

```ts
import { Router, Route } from "@effex/router";

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.concat(UserRoute),
);
```

### Prefix Routes

Add a common prefix to a group of routes:

```ts
const apiRoutes = Router.empty.pipe(
  Router.concat(Route.make("/users", renderUsers)),
  Router.concat(Route.make("/posts", renderPosts)),
);

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(Router.prefixAll(apiRoutes, "/api")),
);
// Results in: /, /api/users, /api/posts
```

### Router Guards

Apply a guard to all routes in a router:

```ts
const adminRoutes = Router.empty.pipe(
  Router.concat(Route.make("/settings", renderSettings)),
  Router.concat(Route.make("/users", renderUserAdmin)),
);

const protectedAdmin = Router.guard(
  adminRoutes,
  () => Effect.map(AuthService, (auth) => auth.isAdmin),
);

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(Router.prefixAll(protectedAdmin, "/admin")),
);
```

### Layouts

Wrap routes with a layout component:

```ts
const dashboardRoutes = Router.empty.pipe(
  Router.concat(Route.make("/", renderDashboardHome)),
  Router.concat(Route.make("/analytics", renderAnalytics)),
);

const withDashboardLayout = Router.layout(
  dashboardRoutes,
  (content) => $.div(
    { class: "dashboard-layout" },
    $.aside({}, renderSidebar()),
    $.main({}, content),
  ),
);

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(Router.prefixAll(withDashboardLayout, "/dashboard")),
);
```

### Finding Matches

```ts
import { Router } from "@effex/router";

const match = Router.findMatch(router, "/users/123");
// Option<{ route: Route, params: { id: "123" } }>
```

## Navigation

The Navigation service provides runtime state and navigation methods.

### Setup

```ts
import { Navigation } from "@effex/router";

const navLayer = Navigation.makeLayer(router, {
  initialPath: "/",  // Optional, defaults to window.location
});

// Provide to your app
App.pipe(Effect.provide(navLayer));
```

### Accessing Navigation

```ts
import { Navigation, NavigationContext } from "@effex/router";

Effect.gen(function* () {
  const nav = yield* NavigationContext;

  // Current pathname (reactive)
  const pathname = yield* nav.pathname.get;

  // Current search params (reactive)
  const searchParams = yield* nav.searchParams.get;

  // Current matched route (reactive)
  const match = yield* nav.currentMatch.get;
});
```

### Programmatic Navigation

```ts
Effect.gen(function* () {
  const nav = yield* NavigationContext;

  // Navigate to a path
  yield* nav.pushPath("/users/123");

  // Replace current history entry
  yield* nav.replacePath("/login");

  // Type-safe navigation with routes
  yield* nav.pushRoute(UserRoute, {
    params: { id: "456" },
    searchParams: { tab: "posts" },
  });

  // Browser history
  yield* nav.back();
  yield* nav.forward();
});
```

### Accessor Effects

Convenience effects for common operations:

```ts
import { Navigation } from "@effex/router";

// These access NavigationContext internally
const path = yield* Navigation.pathname;
const params = yield* Navigation.searchParams;
const match = yield* Navigation.currentMatch;

yield* Navigation.pushPath("/about");
yield* Navigation.replacePath("/home");
yield* Navigation.back;
yield* Navigation.forward;
```

## Link

The Link component provides declarative navigation with automatic active state.

### Basic Usage

```ts
import { Link } from "@effex/router";

// Path-based navigation
Link({ href: "/about" }, Effect.succeed("About Us"))

// With CSS class
Link({ href: "/contact", class: "nav-link" }, Effect.succeed("Contact"))
```

### Type-Safe Route Navigation

```ts
// Navigate using a Route object for type-safe params
Link(
  { to: UserRoute, params: { id: "123" } },
  Effect.succeed("View User"),
)

// With search params
Link(
  {
    to: SearchRoute,
    searchParams: { q: "effect", page: "1" }
  },
  Effect.succeed("Search"),
)
```

### Active State

Links automatically receive data attributes based on the current path:

- `data-active-exact="true"` - Path matches exactly
- `data-active-prefix="true"` - Current path starts with link href

Style active links with CSS:

```css
/* Exact match */
a[data-active-exact] {
  font-weight: bold;
}

/* Prefix match (for parent routes) */
a[data-active-prefix] {
  color: blue;
}
```

### Replace Navigation

Use `replace` to replace the current history entry instead of pushing:

```ts
Link(
  { href: "/login", replace: true },
  Effect.succeed("Login"),
)
```

### External Links

External URLs and `target="_blank"` links work normally without SPA interception:

```ts
// External link - opens normally
Link(
  { href: "https://example.com", target: "_blank", rel: "noopener" },
  Effect.succeed("External Site"),
)
```

## Building Paths

Build path strings from routes with type-safe params:

```ts
import { Navigation } from "@effex/router";

const path = Navigation.buildPath(
  UserRoute,
  { id: "123" },
  { tab: "posts" },
);
// "/users/123?tab=posts"
```

## API Reference

### Route

| Export | Description |
|--------|-------------|
| `Route.make(path, render)` | Create a route |
| `Route.lazy(path, loader)` | Create a lazily-loaded route |
| `Route.params` | Effect to access current route params |
| `Route.searchParams` | Effect to access current search params |
| `Route.withGuard(route, guard)` | Add a guard to a route |
| `Route.withAnimation(route, options)` | Add animation config |

### Router

| Export | Description |
|--------|-------------|
| `Router.empty` | Empty router to start composition |
| `Router.concat(router, route)` | Add a route to a router |
| `Router.prefixAll(router, prefix)` | Add prefix to all routes |
| `Router.guard(router, guard)` | Add guard to all routes |
| `Router.layout(router, wrapper)` | Wrap all routes with layout |
| `Router.findMatch(router, path)` | Find matching route for path |

### Navigation

| Export | Description |
|--------|-------------|
| `Navigation.make(router, options?)` | Create Navigation service |
| `Navigation.makeLayer(router, options?)` | Create Navigation layer |
| `Navigation.buildPath(route, params, searchParams?)` | Build path string |
| `NavigationContext` | Context tag for Navigation service |
| `Navigation.pathname` | Effect to get current pathname |
| `Navigation.searchParams` | Effect to get current search params |
| `Navigation.currentMatch` | Effect to get current matched route |
| `Navigation.pushPath(path)` | Effect to navigate to path |
| `Navigation.replacePath(path)` | Effect to replace current path |
| `Navigation.back` | Effect to go back in history |
| `Navigation.forward` | Effect to go forward in history |

### Link

| Export | Description |
|--------|-------------|
| `Link(props, children)` | Navigation link component |

#### LinkProps

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Path to navigate to |
| `to` | `Route` | Route object for type-safe navigation |
| `params` | `Record<string, unknown>` | Params for route-based navigation |
| `searchParams` | `Record<string, unknown>` | Search params to append |
| `replace` | `boolean` | Replace history entry instead of push |
| `class` | `string \| Readable<string>` | CSS class |
| `target` | `string` | Link target (`_blank`, etc.) |
| `rel` | `string` | Link rel attribute |
