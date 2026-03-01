# Platform v2: Composable SSR Primitives

## Philosophy

Instead of a meta-framework with conventions, provide composable Effect primitives. Data loading and mutations are just Effects that behave differently based on environment.

**Principles:**
1. Effect Platform handles HTTP - we provide rendering and data primitives
2. `Loader.make()` and `Action.make()` are environment-aware Effects
3. No special route extensions - routes are just path + component
4. Components define their own data needs inline
5. Vite plugin strips server code from client builds
6. Users compose their own server - we provide the building blocks

---

## Package Structure

```
@effex/router (environment-agnostic, unchanged)
├── Route.make()                # Route definition with path, component, schemas
├── Router.empty                # Empty router for composition
├── Router.concat()             # Add routes to router
├── Router.layout()             # Apply layout wrappers
├── Navigation.make()           # Navigation state (works on server AND client)
├── findMatch()                 # Route matching
└── Link                        # Navigation link component

@effex/platform (environment-aware data primitives)
├── Loader.make()               # Data loading primitive (SSR/hydrate/fetch)
├── Action.make()               # Monadic mutation primitive (POST data → response)
├── Platform.toHttpRoutes()     # Router → HttpRouter (handles ?_data requests)
├── Serialization               # Type-preserving JSON
└── Document                    # HTML document generation

@effex/vite-plugin (enhanced)
├── loaderTransform()           # Strips Effect bodies from Loader.make/Action.make
└── (existing functionality)

@effex/dom (unchanged)
├── renderToString()            # Already exists
├── hydrate()                   # Already exists

@effex/ssg (new, separate package)
├── buildStaticPages()
├── StaticRouteConfig
└── getStaticRoutes()
```

### Key Insight: Environment-Aware Primitives

Instead of extending route definitions with loaders and actions, we provide **primitives that behave differently based on environment**:

| Environment | `Loader.make(effect)` | `Action.make(effect)` |
|-------------|----------------------|----------------------|
| Server (SSR) | Runs effect, returns data | Available for form POST |
| Server (data request) | Runs effect, collects for JSON response | Runs effect, returns JSON |
| Client (hydration) | Reads from `window.__EFFEX_DATA__` | POSTs to server |
| Client (navigation) | Data pre-fetched before render | POSTs to server |

The router is already environment-agnostic (Navigation.make works on server and client). Platform adds data primitives that are also environment-agnostic.

---

## The Loader Primitive

`Loader.make()` is an environment-aware Effect primitive for data fetching. Components define their data needs inline - no route extensions needed.

### Basic Usage

```typescript
import { $, collect } from "@effex/dom"
import { Effect } from "effect"
import { Loader } from "@effex/platform"
import { Route } from "@effex/router"

// Route is just path + component (no loader property)
export const userRoute = Route.make("/users/:id", () => UserPage()).pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
)

// Component defines its own data needs
const UserPage = () =>
  Effect.gen(function* () {
    // Get params from router (already works)
    const { id } = yield* userRoute.useParams()

    // Loader.make is environment-aware
    const user = yield* Loader.make("user", Effect.gen(function* () {
      const db = yield* DatabaseService
      return yield* db.getUser(id)
    }))

    return yield* $.div({ class: "user-page" }, collect(
      $.h1({}, $.of(user.name)),
      $.p({}, $.of(user.email)),
    ))
  })
```

### How It Works

`Loader.make(key, effect)` behaves differently based on environment:

**Server (SSR):**
```typescript
// Runs the effect, returns data immediately
const user = yield* Loader.make("user", Effect.gen(function* () {
  return yield* db.getUser(id)
}))
// user is the actual User object
```

**Server (data request - `?_data=1`):**
```typescript
// Runs the effect, collects result, component continues with no-op rendering
// At the end, all collected loader data is serialized and returned as JSON
```

**Client (hydration):**
```typescript
// Vite strips the Effect body. Reads from window.__EFFEX_DATA__["user"]
const user = yield* Loader.make("user")  // Effect argument stripped
// user is deserialized from embedded data
```

**Client (navigation):**
```typescript
// Data was pre-fetched before component rendered (via ?_data=1 request)
// Reads from LoaderDataContext["user"]
const user = yield* Loader.make("user")
// user is the fetched data
```

### Multiple Loaders

Components can have multiple loaders - they're identified by key:

```typescript
const DashboardPage = () =>
  Effect.gen(function* () {
    // Multiple loaders, identified by key
    const user = yield* Loader.make("user", Effect.gen(function* () {
      return yield* AuthService.getCurrentUser()
    }))

    const stats = yield* Loader.make("stats", Effect.gen(function* () {
      return yield* StatsService.getDashboard()
    }))

    const notifications = yield* Loader.make("notifications", Effect.gen(function* () {
      return yield* NotificationService.getRecent(10)
    }))

    return yield* $.div({}, collect(
      UserHeader({ user }),
      StatsGrid({ stats }),
      NotificationList({ notifications }),
    ))
  })
```

### Parallel Loading

Use `Effect.all` for parallel data fetching:

```typescript
const DashboardPage = () =>
  Effect.gen(function* () {
    // Fetch in parallel
    const [user, stats, notifications] = yield* Effect.all([
      Loader.make("user", AuthService.getCurrentUser()),
      Loader.make("stats", StatsService.getDashboard()),
      Loader.make("notifications", NotificationService.getRecent(10)),
    ])

    // ...
  })
```

### Type Inference

Types are inferred from the Effect's return type - no annotations needed:

```typescript
const user = yield* Loader.make("user", Effect.gen(function* () {
  const db = yield* DatabaseService
  return yield* db.getUser(id)  // Returns Effect<User, NotFound, DatabaseService>
}))
// user: User (inferred!)
```

### Loader Implementation

```typescript
// Context for loader state
class LoaderContext extends Context.Tag("@effex/platform/LoaderContext")<
  LoaderContext,
  {
    mode: "ssr" | "data-collect" | "hydrate" | "client"
    collected: Map<string, unknown>
    hydrationData: Map<string, unknown>
  }
>() {}

const Loader = {
  make: <A, E, R>(key: string, effect?: Effect.Effect<A, E, R>): Effect.Effect<A, E, R | LoaderContext> =>
    Effect.gen(function* () {
      const ctx = yield* LoaderContext

      if (ctx.mode === "ssr" || ctx.mode === "data-collect") {
        // Server: run the effect, store result
        const result = yield* effect!
        ctx.collected.set(key, result)
        return result
      } else {
        // Client: read from context (hydration or pre-fetched)
        return ctx.hydrationData.get(key) as A
      }
    }),

  // For redirects
  redirect: (url: string, status?: number) =>
    Effect.fail(new RedirectError({ url, status })),
}
```

---

## The Action Primitive

`Action.make()` is an environment-aware mutation primitive. An Action is a **monad over POST data** - it represents a transformation pipeline that processes incoming form data, runs side effects, and returns a response.

### Basic Usage

```typescript
import { Form, Field } from "@effex/form"
import { Schema } from "effect"
import { Action } from "@effex/platform"

// Form defined outside component
const ContactForm = Form.make({
  name: Field.make(Schema.String),
  email: Field.make(Schema.String.pipe(Schema.email())),
  message: Field.make(Schema.String.pipe(Schema.minLength(10))),
})

const ContactPage = () =>
  Effect.gen(function* () {
    // Action is a pipeline: decode POST data → run effect → respond with result
    const submitAction = yield* Action.make("submit").pipe(
      Action.decode(ContactForm.schema),
      Action.flatMap(data => Effect.gen(function* () {
        const email = yield* EmailService
        yield* email.send({
          to: "support@example.com",
          subject: `Contact from ${data.name}`,
          body: data.message,
        })
        return { success: true }
      }))
    )

    // Form uses native action attribute - just a string!
    // Form package stays completely platform-agnostic
    return yield* ContactForm.provide(
      {
        defaults: { name: "", email: "", message: "" },
        action: submitAction.path,  // "?_action=submit"
      },
      $.form({}, collect(
        NameField(),
        EmailField(),
        MessageField(),
        $.button({ type: "submit" }, $.of("Send")),
      ))
    )
  })

// Field components access state via context
const NameField = () =>
  Effect.gen(function* () {
    const name = yield* ContactForm.fields.name
    return yield* $.input({
      name: "name",  // Required for FormData
      value: name.value,
      onInput: (e) => name.set(e.target.value),
      onBlur: name.blur,
    })
  })
```

### Action as a Monad

An Action is a transformation pipeline over POST data. The response is whatever the pipeline produces:

```typescript
// Responds with raw body as JSON
Action.make("echo")

// Responds with just the message field
Action.make("echo").pipe(
  Action.map(data => data.message)
)

// Responds with decoded data (or ParseError)
Action.make("submit").pipe(
  Action.decode(ContactForm.schema)
)

// Responds with { success: true } after running side effects
Action.make("submit").pipe(
  Action.decode(ContactForm.schema),
  Action.flatMap(data => Effect.gen(function* () {
    yield* EmailService.send({ message: data.message })
    return { success: true }
  }))
)

// Redirect after mutation
Action.make("submit").pipe(
  Action.decode(ContactForm.schema),
  Action.flatMap(data => Effect.gen(function* () {
    yield* EmailService.send({ message: data.message })
    return yield* Action.redirect("/thank-you")
  }))
)
```

### How It Works

**Server (POST request):**
1. Request arrives at `/contact?_action=submit` with form body
2. Platform runs the component with no-op renderer
3. `Action.make("submit")` registers itself during component execution
4. Platform finds registered action, runs its pipeline with request body
5. Pipeline result is JSON-serialized and returned as response

**Client (form submission):**
- Without JS: Native form POST, full page reload with response
- With JS: Form intercepts submit, fetches, handles response (redirect, update UI, etc.)

**Vite Transform (client build):**
```typescript
// Server: full pipeline
const submitAction = yield* Action.make("submit").pipe(
  Action.decode(ContactForm.schema),
  Action.flatMap(data => EmailService.send(...))
)

// Client: pipeline stripped, just path
const submitAction = yield* Action.make("submit")
// submitAction.path is still available
```

### Action Type & Combinators

```typescript
interface Action<A, E, R> extends Pipeable {
  readonly path: string
  readonly key: string
  // Internal: pipeline to run on POST body
  readonly _pipeline: (body: unknown) => Effect<A, E, R>
}

const Action = {
  // Create base action - wraps raw POST body
  make: (key: string) => Effect<Action<unknown, never, never>, never, ActionContext>,

  // Transform the value
  map: <A, B>(fn: (a: A) => B) =>
    <E, R>(action: Action<A, E, R>) => Action<B, E, R>,

  // Chain an Effect (for side effects, async operations)
  flatMap: <A, B, E2, R2>(fn: (a: A) => Effect<B, E2, R2>) =>
    <E, R>(action: Action<A, E, R>) => Action<B, E | E2, R | R2>,

  // Decode with Schema (sugar for flatMap + Schema.decodeUnknown)
  decode: <A>(schema: Schema<A>) =>
    <E, R>(action: Action<unknown, E, R>) => Action<A, E | ParseError, R>,

  // Trigger redirect response
  redirect: (url: string, status?: number) => Effect<never, RedirectError, never>,
}
```

### Form Integration

Form stays completely platform-agnostic - it just accepts an `action` string:

```typescript
// @effex/form - no platform dependency
interface FormProvideConfig<T> {
  defaults: T
  action?: string           // Native form action attribute
  onSubmit?: (ctx) => Effect<void, E, R>  // JS-only handler (optional)
}

// Form renders with native action
return yield* ContactForm.provide(
  {
    defaults: { ... },
    action: submitAction.path,  // Just a string: "?_action=submit"
  },
  $.form({}, ...)
)
// Renders: <form action="?_action=submit" method="POST">
```

With JS available, Form can intercept submission and use fetch for a better UX (no full page reload). Without JS, the native form submission works.

---

## Routes Stay Simple

With Loader and Action as primitives, routes don't need extension:

```typescript
// routes.ts - just path + component, no loaders/actions
import { Route, Router } from "@effex/router"
import { Schema } from "effect"

const homeRoute = Route.make("/", () => HomePage())

const userRoute = Route.make("/users/:id", () => UserPage()).pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
)

const contactRoute = Route.make("/contact", () => ContactPage())

export const router = Router.empty.pipe(
  Router.concat(homeRoute),
  Router.concat(userRoute),
  Router.concat(contactRoute),
)
```

The router already supports Schema validation for params - Platform just adds the data primitives.

---

## Server Integration

### Basic Setup

```typescript
// server.ts
import { HttpRouter, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { Platform } from "@effex/platform"
import { router } from "./routes"

// Platform builds HttpRouter routes that handle SSR and data requests
const effexRoutes = Platform.toHttpRoutes(router, {
  document: {
    title: "My App",
    scripts: ["/static/client.js"],
    styles: ["/static/styles.css"],
  },
})

// Compose with your own routes
const app = HttpRouter.empty.pipe(
  // API routes
  HttpRouter.get("/api/health", () => HttpServerResponse.json({ ok: true })),
  HttpRouter.all("/api/*", apiRouter),

  // Static files
  HttpRouter.get("/static/*", HttpServer.static("./public")),

  // Effex routes
  effexRoutes,
)

// Provide dependencies and run
const server = HttpServer.serve(app).pipe(
  Layer.provide(NodeHttpServer.layer({ port: 3000 })),
  Layer.provide(DatabaseServiceLive),
  Layer.provide(EmailServiceLive),
)

NodeRuntime.runMain(Layer.launch(server))
```

### How `Platform.toHttpRoutes` Works

The key insight: **run the component to collect loader data**. In data-request mode, DOM operations are no-ops but Loaders execute and collect their results.

```typescript
const toHttpRoutes = <E, R>(
  router: Router<E, R>,
  options: DocumentOptions
): HttpRouter.HttpRouter<never, R> => {
  // Build handler for each route
  const handler = Effect.gen(function* () {
    const serverRequest = yield* HttpServerRequest.HttpServerRequest
    const request = yield* HttpServerRequest.toWeb(serverRequest)
    const url = new URL(request.url)

    // Create navigation for this request
    const nav = yield* Navigation.make(router, {
      initialPath: url.pathname,
      initialSearch: url.search,
    })

    const match = yield* nav.currentMatch.get
    if (Option.isNone(match)) {
      return HttpServerResponse.text("Not Found", { status: 404 })
    }

    // Check request type
    const isDataRequest = url.searchParams.has("_data")
    const actionKey = url.searchParams.get("_action")

    // Handle action requests (POST with ?_action=key)
    if (actionKey && request.method === "POST") {
      const body = yield* Effect.tryPromise(() => request.json())
      // Action handlers are collected during component render
      // We need to run the component to find the action, then execute it
      // (Implementation detail - could also use a registry)
      return HttpServerResponse.json({ error: "Action not found" }, { status: 404 })
    }

    // Create loader context for data collection
    const loaderCollector: Map<string, unknown> = new Map()
    const loaderContext = {
      mode: isDataRequest ? "data-collect" : "ssr",
      collected: loaderCollector,
      hydrationData: new Map(),  // Not used on server
    } as const

    const loaderLayer = Layer.succeed(LoaderContext, loaderContext)
    const navLayer = makeNavigationLayer(nav)

    // Render the component (loaders execute and collect data)
    const renderLayer = isDataRequest
      ? NoOpRenderer  // Skip actual DOM work for data requests
      : DOMRenderer

    const html = yield* renderToString(match.value.route.render()).pipe(
      Effect.provide(Layer.mergeAll(loaderLayer, navLayer, renderLayer)),
    )

    // Data request → return collected loader data as JSON
    if (isDataRequest) {
      const data = Object.fromEntries(loaderCollector)
      return HttpServerResponse.json(serialize(data))
    }

    // SSR request → return full HTML document
    const loaderData = Object.fromEntries(loaderCollector)
    const doc = generateDocument(html, loaderData, options)

    return HttpServerResponse.html(doc)
  })

  // Handle redirects from loaders
  const handlerWithRedirects = handler.pipe(
    Effect.catchTag("RedirectError", (err) =>
      Effect.succeed(HttpServerResponse.redirect(err.url, { status: err.status ?? 302 }))
    ),
  )

  // Register routes from the router
  let httpRouter = HttpRouter.empty
  for (const route of router.routes) {
    httpRouter = httpRouter.pipe(
      HttpRouter.get(route.path, handlerWithRedirects),
      HttpRouter.post(route.path, handlerWithRedirects),
    )
  }

  return httpRouter
}
```

### The No-Op Renderer

For data-only requests, we skip DOM work but still run the component:

```typescript
// Normal renderer creates DOM elements
const DOMRenderer = Layer.succeed(Renderer, {
  createElement: (tag) => document.createElement(tag),
  createTextNode: (text) => document.createTextNode(text),
  // ...
})

// No-op renderer for data collection
const NoOpRenderer = Layer.succeed(Renderer, {
  createElement: () => ({ nodeType: 1 }),  // Minimal stub
  createTextNode: () => ({ nodeType: 3 }),
  appendChild: () => {},
  // All operations are no-ops
})
```

The component runs to completion with loaders executing and collecting data, but no actual DOM work happens.

### Handling Redirects

Loaders can trigger redirects:

```typescript
const AdminPage = () =>
  Effect.gen(function* () {
    const user = yield* Loader.make("user", Effect.gen(function* () {
      const auth = yield* AuthService
      const user = yield* auth.getCurrentUser()
      if (!user) {
        return yield* Loader.redirect("/login")
      }
      if (!user.isAdmin) {
        return yield* Loader.redirect("/", 403)
      }
      return user
    }))

    return yield* $.div({}, $.of(`Welcome, ${user.name}`))
  })
```

`Platform.toHttpRoutes` catches `RedirectError` and returns the appropriate redirect response.

---

## Client Integration

### Hydration

```typescript
// client.ts
import { Effect, Layer } from "effect"
import { hydrate } from "@effex/dom"
import { Navigation, makeNavigationLayer } from "@effex/router"
import { Platform } from "@effex/platform"
import { router } from "./routes"
import { App } from "./App"

const program = Effect.gen(function* () {
  // Create navigation - automatically reads window.location
  const nav = yield* Navigation.make(router)

  // Platform creates loader context from embedded SSR data
  const loaderLayer = Platform.makeClientLoaderLayer({
    hydrationData: window.__EFFEX_DATA__,
  })

  // Hydrate with layers
  const appLayer = Layer.mergeAll(
    makeNavigationLayer(nav),
    loaderLayer,
  )

  yield* hydrate(App(), document.getElementById("root")!, { layer: appLayer })
})

Effect.runPromise(Effect.scoped(program))
```

### How Client Loaders Work

On the client, `Loader.make()` doesn't have the Effect body (stripped by Vite). It reads from context:

```typescript
// What the component looks like after Vite transform (client build)
const UserPage = () =>
  Effect.gen(function* () {
    const { id } = yield* userRoute.useParams()

    // Effect body is stripped - just reads from context
    const user = yield* Loader.make("user")

    return yield* $.div({}, $.of(user.name))
  })
```

### Client-Side Navigation

When a `Link` is clicked:

1. Navigation updates the URL (router's job)
2. Platform intercepts and fetches `?_data=1` for the new route
3. Server runs component with loaders, returns collected data as JSON
4. Platform populates LoaderContext with new data
5. Component re-renders, `Loader.make("user")` reads from context

```typescript
// Platform.makeClientLoaderLayer
const makeClientLoaderLayer = (options: { hydrationData: unknown }) =>
  Effect.gen(function* () {
    // Start with hydration data
    const loaderData = yield* Signal.make<Map<string, unknown>>(
      new Map(Object.entries(deserialize(options.hydrationData ?? {})))
    )

    // Get navigation
    const nav = yield* NavigationContext

    // When route changes, fetch new data
    yield* Readable.forEach(nav.currentMatch, (match) =>
      Effect.gen(function* () {
        if (Option.isNone(match)) return

        const path = yield* nav.pathname.get

        // Fetch loader data from server
        const response = yield* Effect.tryPromise(() =>
          fetch(`${path}?_data=1`)
        )
        const data = yield* Effect.tryPromise(() => response.json())

        // Update loader context
        yield* loaderData.set(new Map(Object.entries(deserialize(data))))
      })
    )

    // Provide LoaderContext for Loader.make to read from
    return Layer.succeed(LoaderContext, {
      mode: "client",
      collected: new Map(),  // Not used on client
      hydrationData: loaderData,
    })
  })
```

### The App Component

No special `Routes` component needed - just render the matched route:

```typescript
// App.tsx
import { match } from "@effex/dom"

export const App = () =>
  Effect.gen(function* () {
    const nav = yield* NavigationContext

    return yield* $.div({ class: "app" }, collect(
      Header(),
      // Render matched route (router already has this)
      yield* matchOption(nav.currentMatch, {
        onSome: (m) => m.route.render(),
        onNone: () => NotFound(),
      }),
      Footer(),
    ))
  })
```

---

## Data Flow

### Initial Page Load (SSR)

```
Browser requests GET /users/123
         │
         ▼
┌─────────────────────────────────┐
│ Effect Platform HttpRouter      │
│                                 │
│ Matches /users/:id route        │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Platform.toHttpRoutes handler   │
│                                 │
│ 1. Create Navigation with       │
│    initialPath: "/users/123"    │
│ 2. Create LoaderContext with    │
│    mode: "ssr"                  │
│ 3. Render component             │
│    - Loader.make("user", ...)   │
│      runs Effect, collects data │
│ 4. Serialize collected data     │
│ 5. Wrap HTML in document        │
│ 6. Embed data in script tag     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ HTML Response                   │
│                                 │
│ <div id="root">...</div>        │
│ <script>                        │
│   window.__EFFEX_DATA__ =       │
│     { "user": {...} }           │
│ </script>                       │
│ <script src="/client.js">       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Client hydration                │
│                                 │
│ 1. Navigation.make() reads      │
│    window.location              │
│ 2. LoaderContext gets           │
│    window.__EFFEX_DATA__        │
│ 3. hydrate() attaches to DOM    │
│ 4. Loader.make("user") reads    │
│    from context (no fetch)      │
└─────────────────────────────────┘
```

### Client Navigation

```
User clicks <Link to="/users/456">
         │
         ▼
┌─────────────────────────────────┐
│ nav.pushPath("/users/456")      │
│                                 │
│ 1. history.pushState            │
│ 2. Update pathname signal       │
│ 3. Update currentMatch signal   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Platform client layer reacts    │
│                                 │
│ 1. Observe currentMatch change  │
│ 2. fetch("/users/456?_data=1")  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Server handles ?_data=1         │
│                                 │
│ 1. Render with NoOpRenderer     │
│    (DOM ops are no-ops)         │
│ 2. Loader.make("user", ...)     │
│    runs Effect, collects data   │
│ 3. Return JSON:                 │
│    { "user": {...} }            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Client receives data            │
│                                 │
│ 1. Deserialize response         │
│ 2. Update LoaderContext         │
│ 3. Component re-renders         │
│ 4. Loader.make("user") reads    │
│    new data from context        │
└─────────────────────────────────┘
```

---

## Layouts

Layouts are already implemented in `@effex/router` as wrapper functions that receive children:

```typescript
// LayoutWrapper type - receives children, returns wrapped element
type LayoutWrapper = <A extends HTMLElement | SVGElement, E, R>(
  children: Element<A, E, R>,
) => Element<A, E, R>;
```

### Defining Layouts

```typescript
// Layout is just a function that wraps children
const RootLayout = <A extends HTMLElement | SVGElement, E, R>(
  children: Element<A, E, R>
) =>
  $.div({ class: "root-layout" }, collect(
    Header(),
    $.main({}, children),
    Footer(),
  ))

const SidebarLayout = <A extends HTMLElement | SVGElement, E, R>(
  children: Element<A, E, R>
) =>
  $.div({ class: "sidebar-layout" }, collect(
    Sidebar(),
    $.div({ class: "content" }, children),
  ))
```

### Applying Layouts to Routes

```typescript
import { Router } from "@effex/router"

// Layouts are applied via Router.layout()
const dashboardRouter = Router.empty.pipe(
  Router.concat(DashboardHomeRoute),
  Router.concat(SettingsRoute),
  Router.layout(SidebarLayout),  // Inner
  Router.layout(RootLayout),     // Outer
)
// Renders: RootLayout(SidebarLayout(matchedRoute))
```

### Nested Router Groups

```typescript
// Different sections can have different layouts
const publicRouter = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.layout(PublicLayout),
)

const adminRouter = Router.empty.pipe(
  Router.concat(AdminDashboardRoute),
  Router.concat(AdminUsersRoute),
  Router.prefixAll("/admin"),
  Router.layout(AdminLayout),
)

// Combine into full app router
const appRouter = Router.empty.pipe(
  Router.concat(publicRouter),
  Router.concat(adminRouter),
)
```

### Layouts with Loaders (v2)

Layouts can also load data using Loader.make:

```typescript
// Layout with its own data loading
const UsersLayout = <A extends HTMLElement, E, R>(children: Element<A, E, R>) =>
  Effect.gen(function* () {
    // Layout can have its own loaders
    const stats = yield* Loader.make("layout-stats", Effect.gen(function* () {
      return yield* StatsService.getUserStats()
    }))

    return yield* $.div({ class: "users-layout" }, collect(
      UsersSidebar({ stats }),
      $.div({ class: "content" }, children),
    ))
  })
```

Layout loaders are collected alongside component loaders - they're all just `Loader.make` calls.

---

## Vite Plugin: Stripping Server Code from Client Builds

### The Problem

Components use `Loader.make()` and `Action.make()` with server-only Effects:

```typescript
// UserPage.tsx
import { db } from "./db"  // Server-only!

const UserPage = () =>
  Effect.gen(function* () {
    const { id } = yield* userRoute.useParams()

    // This Effect uses server-only code
    const user = yield* Loader.make("user", Effect.gen(function* () {
      return yield* db.getUser(id)  // db is server-only!
    }))

    return yield* $.div({}, $.of(user.name))
  })
```

If bundled as-is for the client, it will try to include `db`, which:
1. Won't work in the browser
2. Bloats the bundle
3. May expose server secrets

### The Solution

The Vite plugin strips the Effect argument from `Loader.make()` and `Action.make()` calls in client builds.

**Server build:** Unchanged

**Client build:** Effect arguments are removed

```typescript
// Client build output
const UserPage = () =>
  Effect.gen(function* () {
    const { id } = yield* userRoute.useParams()

    // Effect argument stripped - just reads from context
    const user = yield* Loader.make("user")

    return yield* $.div({}, $.of(user.name))
  })
// db import is removed (unused)
```

### Plugin Implementation

```typescript
// @effex/vite-plugin/src/loaderTransform.ts

import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"

/**
 * Transform Loader.make() and Action.make() calls for client builds.
 *
 * Loader.make("key", effect) → Loader.make("key")
 * Action.make("key").pipe(...) → Action.make("key")
 *
 * Also removes imports that become unused after stripping.
 */
export function transformLoaders(code: string, options: { isClient: boolean }): string {
  if (!options.isClient) {
    return code  // Server build - no transformation
  }

  // Skip files that don't use Loader or Action
  if (!code.includes("Loader.make") && !code.includes("Action.make")) {
    return code
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript"],
  })

  const strippedIdentifiers = new Set<string>()
  const usedIdentifiers = new Set<string>()

  // First pass: strip Effect arguments from Loader.make, strip .pipe() from Action.make
  traverse(ast, {
    CallExpression(path) {
      // Handle Loader.make("key", effect) → Loader.make("key")
      if (isLoaderMakeCall(path.node) && path.node.arguments.length > 1) {
        const strippedArg = path.node.arguments[1]
        collectIdentifiers(strippedArg, strippedIdentifiers)
        path.node.arguments = [path.node.arguments[0]]
      }

      // Handle Action.make("key").pipe(...) → Action.make("key")
      if (isActionPipeCall(path.node)) {
        // Collect identifiers from .pipe() arguments
        for (const arg of path.node.arguments) {
          collectIdentifiers(arg, strippedIdentifiers)
        }
        // Replace entire .pipe() call with just Action.make("key")
        const actionMakeCall = (path.node.callee as t.MemberExpression).object
        path.replaceWith(actionMakeCall)
      }
    },
  })

  // Second pass: collect identifiers still used in the code
  traverse(ast, {
    Identifier(path) {
      usedIdentifiers.add(path.node.name)
    },
  })

  // Third pass: remove imports that are now unused
  traverse(ast, {
    ImportDeclaration(path) {
      path.node.specifiers = path.node.specifiers.filter((specifier) => {
        if (t.isImportSpecifier(specifier) || t.isImportDefaultSpecifier(specifier)) {
          const name = specifier.local.name
          // Keep if still used, or wasn't in stripped code
          return usedIdentifiers.has(name) || !strippedIdentifiers.has(name)
        }
        return true
      })

      if (path.node.specifiers.length === 0) {
        path.remove()
      }
    },
  })

  return generate(ast).code
}

function isLoaderMakeCall(node: t.CallExpression): boolean {
  if (!t.isMemberExpression(node.callee)) return false
  const obj = node.callee.object
  const prop = node.callee.property
  return t.isIdentifier(obj) && obj.name === "Loader" &&
         t.isIdentifier(prop) && prop.name === "make"
}

function isActionPipeCall(node: t.CallExpression): boolean {
  // Looking for: Action.make("key").pipe(...)
  if (!t.isMemberExpression(node.callee)) return false
  const prop = node.callee.property
  if (!t.isIdentifier(prop) || prop.name !== "pipe") return false

  // Check if the object is Action.make(...)
  const obj = node.callee.object
  if (!t.isCallExpression(obj)) return false
  if (!t.isMemberExpression(obj.callee)) return false

  const actionObj = obj.callee.object
  const actionProp = obj.callee.property
  return t.isIdentifier(actionObj) && actionObj.name === "Action" &&
         t.isIdentifier(actionProp) && actionProp.name === "make"
}

function collectIdentifiers(node: t.Node, set: Set<string>): void {
  traverse(
    t.file(t.program([t.expressionStatement(node as t.Expression)])),
    { Identifier(path) { set.add(path.node.name) } },
    undefined,
    {}
  )
}
```

### Vite Plugin Integration

```typescript
// @effex/vite-plugin/src/plugin.ts

import { transformLoaders } from "./loaderTransform"

export function effexPlugin(options: EffexPluginOptions = {}): Plugin[] {
  return [
    {
      name: "effex:loader-transform",

      transform(code, id) {
        // Transform all .ts/.tsx files (or use a pattern)
        if (!id.match(/\.(ts|tsx)$/)) return null

        // Detect if this is a client build
        const isClient = !this.environment?.name?.includes("ssr")

        const transformed = transformLoaders(code, { isClient })

        if (transformed === code) return null

        return { code: transformed, map: null }
      },
    },
  ]
}
```

### What Gets Transformed

| Source | Client Build |
|--------|--------------|
| `Loader.make("user", Effect.gen(...))` | `Loader.make("user")` |
| `Loader.make("stats", fetchStats())` | `Loader.make("stats")` |
| `Action.make("submit").pipe(Action.decode(...), Action.flatMap(...))` | `Action.make("submit")` |

### Benefits of This Approach

1. **No file conventions needed** - transforms any file using Loader/Action
2. **Simple AST transform** - remove second argument from Loader, strip .pipe() from Action
3. **Works with any code structure** - inline, variable, imported handlers
4. **Automatic dead code elimination** - Vite tree-shakes unused imports

### Testing the Transform

```typescript
describe("transformLoaders", () => {
  it("strips Effect argument from Loader.make", () => {
    const input = `
      import { db } from "./db"
      const user = yield* Loader.make("user", Effect.gen(function* () {
        return yield* db.getUser(id)
      }))
    `

    const output = transformLoaders(input, { isClient: true })

    expect(output).toContain('Loader.make("user")')
    expect(output).not.toContain("db.getUser")
    expect(output).not.toContain('import { db }')
  })

  it("strips pipeline from Action.make", () => {
    const input = `
      const action = yield* Action.make("submit").pipe(
        Action.decode(ContactForm.schema),
        Action.flatMap(data => Effect.gen(function* () {
          yield* EmailService.send(data)
        }))
      )
    `

    const output = transformLoaders(input, { isClient: true })

    expect(output).toContain('Action.make("submit")')
    expect(output).not.toContain("Action.decode")
    expect(output).not.toContain("Action.flatMap")
    expect(output).not.toContain("EmailService")
  })

  it("preserves code in server build", () => {
    const input = `Loader.make("user", fetchUser())`
    const output = transformLoaders(input, { isClient: false })
    expect(output).toBe(input)
  })
})
```

---

## What Gets Removed from Platform

Current platform → v2:

| Current | v2 |
|---------|-----|
| `EffexServer.makeHttpApp()` | `Platform.toHttpRoutes()` |
| `RouteLoader.loaderData()` | `Loader.make("key", effect)` |
| `Route.define({ loader })` | `Loader.make()` in component |
| `Route.define({ action })` | `Action.make()` in component |
| `PlatformForm` | `Action.make().pipe(...)` + Form with `action` prop |
| `performSSR()` | Internal to `Platform.toHttpRoutes()` |
| `hydrateApp()` | `Platform.makeClientLoaderLayer()` + `hydrate()` |
| `Platform.cookies` | Use Effect Platform directly |
| `Platform.isServer` | `typeof window === "undefined"` |

**Platform v2 provides:**
- `Loader.make(key, effect)` - Environment-aware data loading primitive
- `Action.make(key).pipe(...)` - Monadic mutation primitive (POST data → transform → response)
- `Platform.toHttpRoutes()` - Builds HttpRouter routes with data collection
- `Platform.makeClientLoaderLayer()` - Client-side loader context
- `Serialization` - Type-preserving JSON
- `Document` - HTML generation helpers

**Router (unchanged, environment-agnostic):**
- `Route.make()` - Basic route definition (path + component + schemas)
- `Router.empty` / `Router.concat()` - Router composition
- `Navigation.make()` - Navigation state (works on server AND client)
- `findMatch()` - Route matching
- `Link` - Navigation link component

**Moved to separate @effex/ssg:**
- `buildStaticPages()`
- `getStaticRoutes()`
- Static route configuration

## Migration Path

### Before (Platform v1)

```typescript
// server.ts
import { EffexServer } from "@effex/platform/server"

const app = EffexServer.makeHttpApp({
  app: () => App(),
  router: appRouter,
  document: { title: "My App", scripts: ["/client.js"] },
})

// client.ts
import { hydrateApp } from "@effex/platform/client"
hydrateApp(App(), document.getElementById("root")!)

// routes defined separately, loaders in platform conventions
```

### After (Platform v2)

```typescript
// routes.ts - routes are simple path + component
import { Route, Router } from "@effex/router"
import { Schema } from "effect"

const homeRoute = Route.make("/", () => HomePage())

const userRoute = Route.make("/users/:id", () => UserPage()).pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
)

export const router = Router.empty.pipe(
  Router.concat(homeRoute),
  Router.concat(userRoute),
)

// re-export for components to use typed accessors
export { userRoute }
```

```typescript
// UserPage.tsx - loaders are in components
import { $, collect } from "@effex/dom"
import { Effect } from "effect"
import { Loader } from "@effex/platform"
import { userRoute } from "./routes"
import { UserService } from "./services/user"

export const UserPage = () =>
  Effect.gen(function* () {
    const { id } = yield* userRoute.useParams()

    // Loader.make runs on server, reads from context on client
    const user = yield* Loader.make("user", Effect.gen(function* () {
      const service = yield* UserService
      return yield* service.getById(id)
    }))

    return yield* $.div({ class: "user-page" }, collect(
      $.h1({}, $.of(user.name)),
      $.p({}, $.of(user.email)),
    ))
  })
```

```typescript
// server.ts
import { HttpRouter, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Platform } from "@effex/platform"
import { router } from "./routes"

// Platform builds HttpRouter routes that handle SSR and data requests
const effexRoutes = Platform.toHttpRoutes(router, {
  document: { title: "My App", scripts: ["/client.js"] },
})

// Compose with your own routes
const app = HttpRouter.empty.pipe(
  HttpRouter.get("/api/health", () => HttpServerResponse.json({ ok: true })),
  HttpRouter.all("/api/*", apiRouter),
  effexRoutes,  // Concat Effex routes
)

// Run server - provide dependencies used by loaders
const server = HttpServer.serve(app).pipe(
  Layer.provide(NodeHttpServer.layer({ port: 3000 })),
  Layer.provide(UserServiceLive),  // Provides UserService for loaders
)

NodeRuntime.runMain(Layer.launch(server))
```

```typescript
// client.ts
import { Effect, Layer } from "effect"
import { hydrate } from "@effex/dom"
import { Navigation, makeNavigationLayer } from "@effex/router"
import { Platform } from "@effex/platform"
import { router } from "./routes"
import { App } from "./App"

const program = Effect.gen(function* () {
  // Create navigation - reads window.location automatically
  const nav = yield* Navigation.make(router)

  // Platform creates loader context from embedded SSR data
  const loaderLayer = Platform.makeClientLoaderLayer({
    hydrationData: window.__EFFEX_DATA__,
  })

  // Combine layers and hydrate
  const appLayer = Layer.merge(makeNavigationLayer(nav), loaderLayer)
  yield* hydrate(App(), document.getElementById("root")!, { layer: appLayer })
})

Effect.runPromise(Effect.scoped(program))
```

---

## Benefits

1. **Simpler mental model** - Routes are the source of truth, Effect Platform handles HTTP
2. **Reuses router directly** - No wrapper layer; Navigation.make() works on server and client
3. **Type inference everywhere** - Params, search params, loader data - all inferred from route definition
4. **More composable** - Add any routes, use any middleware, full control
5. **Smaller platform package** - Just the loader layer and HTTP integration
6. **Effect-native** - Leverages Effect Platform instead of reinventing it
7. **Clear data flow** - Loader layer observes navigation changes, fetches data, provides context

## Trade-offs

1. **More boilerplate for forms** - No automatic action handling
2. **Network round-trip on navigation** - Loaders always run on server
3. **Users must set up HttpRouter** - More initial setup than meta-framework
4. **Explicit layer composition** - Must combine NavigationLayer and LoaderLayer

---

## Loading States

Loading behavior follows standard Effect semantics. During client navigation, `Loader.make()` blocks until data arrives. Users control the loading UX with Suspense boundaries:

**No boundary - blocks until ready:**
```typescript
const UserPage = () =>
  Effect.gen(function* () {
    // Blocks until data arrives
    const user = yield* Loader.make("user", fetchUser)

    return yield* $.div({}, $.of(user.name))
  })
```

**With boundary - shows fallback:**
```typescript
const userRoute = Route.make("/users/:id", () =>
  Boundary.suspense({
    render: () => UserPage(),
    fallback: () => UserSkeleton(),
  })
)
```

**App-level loading indicator:**
```typescript
const App = () =>
  Effect.gen(function* () {
    return yield* Boundary.suspense({
      render: () => $.div({}, collect(
        Header(),
        Routes(),
        Footer(),
      )),
      fallback: () => PageSpinner(),
    })
  })
```

This is just Effect composition - no special Platform APIs needed.

---

## Error Handling

Error handling follows Effect patterns with combinators at the Route and Router level. `Platform.toHttpRoutes` only accepts routers with `never` in the error channel, forcing users to handle all errors before reaching the platform layer.

### Route-Level Error Handling

Routes can catch errors from their render function using familiar Effect combinators:

```typescript
import { Route } from "@effex/router"

const userRoute = Route.make("/users/:id", () => UserPage()).pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
  // Handle specific error types
  Route.catchTag("NotFound", () => NotFoundPage()),
  Route.catchTag("Unauthorized", () => UnauthorizedPage()),
)

const dashboardRoute = Route.make("/dashboard", () => DashboardPage()).pipe(
  // Redirect on auth errors
  Route.catchTag("Unauthorized", () => Loader.redirect("/login")),
  // Catch remaining errors
  Route.catch((error) => ErrorPage({ error })),
)
```

### Router-Level Error Handling

Router provides fallback error handling for anything that slips through individual routes:

```typescript
import { Router } from "@effex/router"

const router = Router.empty.pipe(
  Router.concat(userRoute),
  Router.concat(dashboardRoute),
  Router.concat(homeRoute),
  // Catch-all for unhandled errors
  Router.catchAll((error) => GenericErrorPage({ error })),
)
```

### Type-Safe Error Handling

`Platform.toHttpRoutes` only accepts `Router<never, R>` - routers with no unhandled errors:

```typescript
// ✅ Compiles - all errors handled
const safeRouter = Router.empty.pipe(
  Router.concat(userRoute),
  Router.catchAll(() => ErrorPage()),
)
Platform.toHttpRoutes(safeRouter, { document: { ... } })

// ❌ Won't compile - unhandled NotFoundError
const unsafeRouter = Router.empty.pipe(
  Router.concat(userRoute),  // Has NotFoundError in E
)
Platform.toHttpRoutes(unsafeRouter, { document: { ... } })  // Type error!
```

### Error Handling and Loaders

Since `Loader.make()` runs during render, loader errors bubble up through the render function and get caught by Route/Router error handlers:

```typescript
const UserPage = () =>
  Effect.gen(function* () {
    // If this fails with NotFoundError, it bubbles to Route.catchTag
    const user = yield* Loader.make("user", Effect.gen(function* () {
      const db = yield* DatabaseService
      return yield* db.getUser(id)  // May fail with NotFoundError
    }))

    return yield* $.div({}, $.of(user.name))
  })

const userRoute = Route.make("/users/:id", () => UserPage()).pipe(
  Route.catchTag("NotFoundError", () => NotFoundPage()),
)
```

For `?_data=1` requests, if an error occurs and a catch handler runs, the catch handler's render executes (with its own loaders if any), and that data is returned. The catch handler *is* the error response.

### Combinator Signatures

```typescript
// Route combinators
Route.catch: <E, E2, R2>(
  handler: (error: E) => Element<HTMLElement | SVGElement, E2, R2>
) => <Path, Params, SearchParams, R>(
  route: Route<Path, Params, SearchParams, E, R>
) => Route<Path, Params, SearchParams, E2, R | R2>

Route.catchTag: <K extends E["_tag"], E extends { _tag: string }, E2, R2>(
  tag: K,
  handler: (error: Extract<E, { _tag: K }>) => Element<HTMLElement | SVGElement, E2, R2>
) => <Path, Params, SearchParams, R>(
  route: Route<Path, Params, SearchParams, E, R>
) => Route<Path, Params, SearchParams, Exclude<E, { _tag: K }> | E2, R | R2>

Route.catchAll: <E2, R2>(
  handler: (error: unknown) => Element<HTMLElement | SVGElement, E2, R2>
) => <Path, Params, SearchParams, E, R>(
  route: Route<Path, Params, SearchParams, E, R>
) => Route<Path, Params, SearchParams, E2, R | R2>

// Router combinators (similar pattern)
Router.catch: ...
Router.catchTag: ...
Router.catchAll: ...
```

> **Note:** These combinators are environment-agnostic and belong in `@effex/router`, not `@effex/platform`. They're just Effect error handling applied to routes - no server-side rendering knowledge required.

---

## Implementation Plan

### Phase 1: Router & Form Prerequisites

**Router changes needed:**
- [x] Add `Route.catchIf`, `Route.catchTag`, `Route.catchAll` combinators
- [x] Add `Router.catchIf`, `Router.catchTag`, `Router.catchAll` combinators
- [x] `Route.make(path, render)` API confirmed (render passed to make, not piped)
- [x] Ensure `Navigation.make()` works correctly on server (no window dependency when initialPath provided)

**Form changes needed:**
- [x] Add optional `action` prop to `Form.provide` config (string, sets native form action attribute)
- [x] Ensure form renders with `method="POST"` when action is provided
- [ ] Fields need `name` attributes for FormData serialization (user responsibility - documented in examples)

### Phase 2: Router Demo

Before implementing Platform, validate that Router works correctly in a real application:
- [x] Build a multi-page demo app using Router
- [x] Test client-side navigation with Link

- [x] Test route params and search params
- [x] Test guards and redirects
- [x] Test layouts and nested routers
- [ ] Test error handling with catch combinators

### Phase 3: Platform Implementation

After Router is validated:
- [x] Implement `Loader.make(key, effect)` primitive
- [x] Implement `LoaderContext` for SSR/hydration/client modes
- [x] Implement `Action.make(key)` with monadic combinators (`map`, `flatMap`, `decode`)
- [x] Implement `ActionContext` for registration during component render
- [x] Implement `Platform.toHttpRoutes(router, options)` - the HttpRouter builder
- [ ] Implement `Platform.makeClientLoaderLayer()` for client hydration
- [ ] Implement no-op renderer for data-only requests
- [ ] Implement Vite transform for stripping Loader/Action server code
- [ ] Implement `Serialization` module for type-preserving JSON

### Phase 4: Platform Demo

Validate Platform with a real SSR application:
- [ ] Build demo with SSR + hydration
- [ ] Test Loader.make with real data fetching
- [ ] Test Action.make with form submission
- [ ] Test client-side navigation with data fetching
- [ ] Test error handling flows
- [ ] Test redirects from loaders/actions

### Deferred (Post-v1)

- Prefetching on Link hover
- Cache invalidation strategies
- Optimistic update helpers (leave to user for now)

---

## Open Questions

1. ~~**Form and Action integration**~~ **RESOLVED**

   Action is a monad over POST data with a `.path` property. Form accepts `action` as a string (the native form attribute). Form stays completely platform-agnostic - it doesn't know about Action, just accepts a string. See "The Action Primitive" section.

2. **Prefetching** - Should `Link` component prefetch on hover?

3. **Cache invalidation** - How long to cache loader data on client?

4. **Optimistic updates** - Any built-in support, or leave to user?
