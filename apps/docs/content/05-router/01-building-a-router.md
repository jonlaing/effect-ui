---
title: "Building a Router"
description: "Compose routes into a router with fallbacks, layouts, guards, prefixes, and error handling."
order: 1
---

# Building a Router

A Router aggregates routes and adds cross-cutting concerns like layouts, guards, fallback pages, and error handling. You build one by starting with `Router.empty` and piping combinators.

## Adding Routes

Use `Router.concat` to add routes one at a time:

```typescript
import { Router } from "@stax-ui/router";

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.concat(UserRoute),
);
```

`Router.concat` also accepts another Router, so you can compose sub-routers:

```typescript
const adminRouter = Router.empty.pipe(
  Router.concat(AdminDashboardRoute),
  Router.concat(AdminUsersRoute),
);

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(adminRouter),
);
```

## Fallback (404)

Set a fallback component for when no route matches:

```typescript
const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.fallback(() => NotFoundPage()),
);
```

The fallback renders whenever the current pathname doesn't match any route.

## Prefixing

Add a path prefix to all routes in a router. Useful for grouping related routes under a common path:

```typescript
const adminRouter = Router.empty.pipe(
  Router.concat(DashboardRoute),   // "/dashboard"
  Router.concat(UsersRoute),       // "/users"
  Router.prefixAll("/admin"),
);
// Routes: /admin/dashboard, /admin/users
```

## Layouts

Wrap matched routes in a layout component. Layouts are applied inside-out — the first layout is innermost:

```typescript
const dashboardRouter = Router.empty.pipe(
  Router.concat(DashboardHomeRoute),
  Router.concat(SettingsRoute),
  Router.layout(SidebarLayout),
  Router.layout(AppShell),
);
// Renders: AppShell(SidebarLayout(matchedRoute))
```

A layout function receives the matched route's Element and must be transparent to its error and requirement types:

```typescript
const SidebarLayout = <A extends HTMLElement | SVGElement, E, R>(
  children: Element.Element<A, E, R>,
) =>
  $.div(
    { class: "flex" },
    Sidebar(),
    $.main({ class: "flex-1" }, children),
  );
```

The generic signature ensures that errors and context requirements from the matched route flow through the layout unchanged.

## Router-Level Guards

Protect an entire group of routes with a guard:

```typescript
const protectedRouter = Router.empty.pipe(
  Router.concat(DashboardRoute),
  Router.concat(ProfileRoute),
  Router.concat(SettingsRoute),
);

const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(LoginRoute),
  Router.guard(isAuthenticated, protectedRouter, {
    redirect: "/login",
  }),
);
```

When `isAuthenticated` is `false`, any attempt to navigate to a protected route redirects to `/login`. The guard accepts either a `Readable<boolean>` or an `Effect<boolean>`.

You can also render a fallback instead of redirecting:

```typescript
Router.guard(isAuthenticated, protectedRouter, {
  fallback: () => LoginPage(),
});
```

## Router-Level Error Handling

Catch errors from all routes in the router:

```typescript
const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(UserRoute),
  Router.catchTag("NotFound", () => NotFoundPage()),
  Router.catchTag("Unauthorized", () => LoginPage()),
);
```

This is equivalent to adding `Route.catchTag` to every individual route, but applied in one place.

### Other Error Handlers

```typescript
// Catch by predicate
Router.catchIf(
  (e) => e._tag === "NetworkError",
  () => OfflinePage(),
);

// Catch everything
Router.catchAll((error) => ErrorPage({ error }));
```

## Full Example

```typescript
import { Router } from "@stax-ui/router";

// Public routes
const publicRouter = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(LoginRoute),
  Router.concat(SignupRoute),
);

// Admin section with its own layout and prefix
const adminRouter = Router.empty.pipe(
  Router.concat(AdminDashboardRoute),
  Router.concat(AdminUsersRoute),
  Router.prefixAll("/admin"),
  Router.layout(AdminLayout),
);

// Protected routes
const appRouter = Router.empty.pipe(
  Router.concat(DashboardRoute),
  Router.concat(ProfileRoute),
  Router.concat(SettingsRoute),
  Router.layout(AppLayout),
);

// Compose everything
export const router = Router.empty.pipe(
  Router.concat(publicRouter),
  Router.guard(isAuthenticated, appRouter, { redirect: "/login" }),
  Router.guard(isAdmin, adminRouter, { redirect: "/" }),
  Router.fallback(() => NotFoundPage()),
  Router.catchAll((error) => ErrorPage({ error })),
);
```
