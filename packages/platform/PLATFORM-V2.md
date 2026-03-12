# Platform v2: Composable SSR Primitives

## Philosophy

Instead of a meta-framework with conventions, provide composable Effect primitives. Data loading and mutations are defined on routes, and the platform handles converting them into HTTP endpoints and SSR rendering.

**Principles:**
1. Effect Platform handles HTTP — we provide rendering and data primitives
2. Routes define loaders (`Route.get`) and handlers (`Route.post/put/delete`)
3. Loaders and handlers are opaque to the router — only Platform executes them
4. Users compose their own server — we provide the building blocks
5. `Outlet` renders matched routes and fetches data via `RouteDataProvider`

---

## Package Structure

```
@effex/router (environment-agnostic)
├── Route.make(path)              # Route definition
├── Route.render(fn)              # Set render function (no loader)
├── Route.get(loader, render)     # Set loader + render function
├── Route.post/put/delete(key, handler)  # Mutation handlers
├── Route.params(schema)          # Typed params validation
├── Route.searchParams(schema)    # Typed search params validation
├── Route.catchIf/catchTag/catchAll  # Error handling combinators
├── Route.withGuard(cond, opts)   # Protected routes
├── Router.empty                  # Empty router for composition
├── Router.concat()               # Add routes to router
├── Router.layout()               # Apply layout wrappers
├── Navigation.make()             # Navigation state (server + client)
├── Outlet({ router })            # Renders matched route with data
├── RouteDataContext               # Context: { data, actions }
├── RouteDataProvider              # Abstract data fetching service
└── Link                          # Navigation link component

@effex/platform (SSR + HTTP integration)
├── Platform.toHttpRoutes()       # Router → HttpRouter
├── Platform.generateDocument()   # HTML document generation
├── Platform.serializeForHtml()   # Safe JSON for HTML embedding
├── Platform.generateLoaderDataScript()  # Hydration script tag
└── RedirectError                 # Redirect from loaders/handlers

@effex/vite-plugin (build tooling + dev server)
├── effexPlatform()               # Combined Vite plugin
├──   Server-code stripping       # Strip loaders/handlers from client builds
└──   SSR dev server              # Dev server with HMR (when entry provided)

@effex/dom (unchanged)
├── renderToString()
├── hydrate()
```

---

## Route API

Routes are built with `Route.make(path)` and configured via pipe combinators.

### Routes without loaders

```typescript
const HomeRoute = Route.make("/").pipe(
  Route.render(() => HomePage()),
)
```

### Routes with loaders

`Route.get(loader, render)` sets a loader and render function. The loader receives `{ params, searchParams }` and its return value is passed directly to render. The loader's error/requirements do NOT flow into the Route's E/R — they flow to Platform's HttpRouter instead.

```typescript
const UserRoute = Route.make("/users/:id").pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
  Route.get(
    ({ params: { id } }) => Effect.gen(function* () {
      const db = yield* DatabaseService
      return yield* db.getUser(id)
    }),
    (user) => UserPage({ user }),
  ),
)
```

### Mutation handlers

`Route.post/put/delete(key, handler)` add mutation handlers. Platform executes them directly on the matching HTTP method — no component rendering needed.

```typescript
const UserRoute = Route.make("/users/:id").pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
  Route.post("update", (body) => Effect.gen(function* () {
    const data = yield* Schema.decodeUnknown(UpdateUserSchema)(body)
    const db = yield* DatabaseService
    return yield* db.updateUser(data)
  })),
  Route.get(
    ({ params: { id } }) => Effect.gen(function* () {
      const db = yield* DatabaseService
      return yield* db.getUser(id)
    }),
    (user) => UserPage({ user }),
  ),
)
```

### Error handling

Routes handle errors with `catchIf`, `catchTag`, and `catchAll`:

```typescript
const UserRoute = Route.make("/users/:id").pipe(
  Route.get(loader, render),
  Route.catchTag("NotFound", () => NotFoundPage()),
  Route.catchTag("Unauthorized", () => Loader.redirect("/login")),
)
```

---

## Route Data Flow

### RouteDataContext

Components access loader data and action paths via `RouteDataContext`:

```typescript
interface RouteDataService {
  readonly data: unknown           // Loader result
  readonly actions: Record<string, string>  // handler key → URL path
}
```

### RouteDataProvider

An abstract service that Outlet uses to fetch route data. Platform provides a server-side implementation. On the client, without a provider, Outlet runs the loader directly.

```typescript
interface RouteDataProviderService {
  readonly getRouteData: (
    route: Route,
    params: Record<string, string>,
    searchParams: Record<string, string>,
  ) => Effect<RouteDataService>
}
```

### Outlet

Outlet renders the matched route. It:
1. Reads `NavigationContext` for the current match
2. Checks route guards
3. Fetches data via `RouteDataProvider` (if available) or runs the loader directly
4. Provides `RouteDataContext` and route params to the component
5. Applies layout wrappers (inside-out)

---

## Platform: `toHttpRoutes`

`Platform.toHttpRoutes(router, options)` converts an Effex Router into an `@effect/platform` HttpRouter.

### GET requests

1. Extract and validate route params + search params
2. Run the route's `_loader` (from `Route.get`) with `{ params, searchParams }`
3. Compute action paths from the route's `_handlers`
4. Build `RouteDataService` with `{ data, actions }`
5. If `?_data=1`: return JSON of the route data (for client-side navigation)
6. Otherwise: SSR render the component with data provided, wrap in HTML document with embedded hydration data

### POST/PUT/DELETE requests

1. Read `?_action=key` from query string
2. Find matching handler by method + key
3. Parse request body (JSON or URL-encoded)
4. Execute handler directly — no component rendering
5. Return JSON result

### Redirects

Loaders and handlers can throw `RedirectError`. Platform catches it and returns an HTTP redirect response.

```typescript
// In a loader:
return yield* Effect.fail(new RedirectError({ url: "/login", status: 302 }))
```

### HTML Document

Platform generates a full HTML document with:
- The SSR'd HTML in `<div id="root">`
- Hydration data in `window.__EFFEX_DATA__` script tag
- Configured scripts, styles, and head content

---

## Server Setup

```typescript
import { HttpRouter, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { Platform } from "@effex/platform"
import { router } from "./routes"

const effexRoutes = Platform.toHttpRoutes(router, {
  document: {
    title: "My App",
    scripts: ["/static/client.js"],
    styles: ["/static/styles.css"],
  },
})

const app = HttpRouter.empty.pipe(
  HttpRouter.get("/api/health", () => HttpServerResponse.json({ ok: true })),
  effexRoutes,
)

const server = HttpServer.serve(app).pipe(
  Layer.provide(NodeHttpServer.layer({ port: 3000 })),
  Layer.provide(DatabaseServiceLive),
)

NodeRuntime.runMain(Layer.launch(server))
```

---

## Client Setup

`Platform.makeClientLayer(router)` provides everything the client needs — `NavigationContext` and `RouteDataProvider` — in a single layer.

On the first render (hydration), it reads data from `window.__EFFEX_DATA__` embedded by the server. On subsequent navigations, it fetches from the server via `?_data=1`.

```typescript
import { Effect } from "effect"
import { hydrate } from "@effex/dom"
import { Platform } from "@effex/platform"
import { router } from "./routes"
import { App } from "./App"

const program = Effect.gen(function* () {
  yield* hydrate(App(), document.getElementById("root")!, {
    layer: Platform.makeClientLayer(router),
  })
})

Effect.runPromise(Effect.scoped(program))
```

---

## Layouts

Layouts are wrapper functions applied via `Router.layout()`:

```typescript
const RootLayout = (children) =>
  $.div({ class: "root-layout" }, collect(
    Header(),
    $.main({}, children),
    Footer(),
  ))

const router = Router.empty.pipe(
  Router.concat(homeRoute),
  Router.concat(userRoute),
  Router.layout(RootLayout),
)
```

Layouts are applied inside-out by both Outlet (client) and `toHttpRoutes` (server).

---

## Implementation Status

### Phase 1: Router & Form Prerequisites — Done
- [x] Route error handling combinators (`catchIf`, `catchTag`, `catchAll`)
- [x] Router error handling combinators
- [x] `Route.make(path)` + combinator API
- [x] `Navigation.make()` works on server (with `initialPath`)
- [x] Form `action` prop support

### Phase 2: Router Demo — Done
- [x] Multi-page demo app with client-side navigation
- [x] Route params and search params
- [x] Guards and redirects
- [x] Layouts and nested routers

### Phase 3: Platform Implementation — Done
- [x] `Route.get(loader, render)` — loader on route, data passed to render
- [x] `RouteDataContext` + `RouteDataProvider` — data flow abstractions
- [x] `Route.post/put/delete(key, handler)` — mutation handlers on route
- [x] `Platform.toHttpRoutes(router, options)` — HttpRouter builder
- [x] HTML document generation with hydration data embedding
- [x] Redirect handling via `RedirectError`
- [x] `Platform.makeClientLayer(router)` — provides NavigationContext + RouteDataProvider (hydration + `?_data=1` fetching)
- [x] `AsyncCache` — query-cache service provided on both server (per-request) and client, with prefix-based invalidation
- [x] Vite transform for stripping loader/handler code from client builds (`@effex/vite-plugin`)

### Phase 4: Platform Demo — Done
- [x] Build demo with SSR + hydration (twitter clone)
- [x] Test loader data fetching end-to-end
- [x] Test mutation handlers with form submission
- [x] Test client-side navigation with `?_data=1` data fetching
- [x] Test reactive cache invalidation after mutations (AsyncCache + `each`/`matchOption`)
- [x] Test error handling and redirects (NotFoundError → 404 page, RedirectError → server 302 + client-side nav)

### Deferred
- Prefetching on Link hover
- Optimistic update helpers
- Type-preserving serialization (beyond JSON)

---

## Open Questions

1. **Prefetching** — Should `Link` prefetch `?_data=1` on hover?
