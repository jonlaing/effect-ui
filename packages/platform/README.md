# @effex/platform

Server-side rendering and hydration utilities for Effex applications. Converts an Effex Router into `@effect/platform` HTTP handlers, handling SSR, data requests, and mutation endpoints.

## Installation

```bash
pnpm add @effex/platform @effect/platform effect
```

`@effex/dom` and `@effex/router` are peer dependencies — install them separately:

```bash
pnpm add @effex/dom @effex/router
```

> `@effex/dom` re-exports `@effex/core`, so you don't need to install core separately.

## Overview

`@effex/platform` is a server-side package that bridges Effex's UI layer with `@effect/platform`'s HTTP server. It does not re-export dom or router — import those directly:

```ts
import { $, collect, Readable } from "@effex/dom";       // UI primitives
import { Route, Router, Outlet, Link } from "@effex/router"; // Routing
import { Platform, RedirectError } from "@effex/platform";    // SSR utilities
```

## Quick Start

### Define Routes

```ts
// routes.ts
import { Effect, Schema } from "effect";
import { Route, Router } from "@effex/router";
import { RedirectError } from "@effex/platform";

import { UserPage } from "./pages/User.js";
import { FeedPage } from "./pages/Feed.js";

const FeedRoute = Route.make("/").pipe(
  Route.get(
    () =>
      Effect.gen(function* () {
        const svc = yield* PostService;
        return yield* svc.getPosts();
      }),
    (posts) => FeedPage({ posts }),
  ),
  Route.post("create", (body) =>
    Effect.gen(function* () {
      const { content } = body as { content: string };
      const svc = yield* PostService;
      return yield* svc.createPost(content);
    }),
  ),
);

const UserRoute = Route.make("/users/:id").pipe(
  Route.params(Schema.Struct({ id: Schema.String })),
  Route.get(
    ({ params: { id } }) =>
      Effect.gen(function* () {
        const svc = yield* PostService;
        return yield* svc.getUser(id);
      }),
    (user) => UserPage({ user }),
  ),
);

export const router = Router.empty.pipe(
  Router.concat(FeedRoute),
  Router.concat(UserRoute),
  Router.fallback(() => NotFoundPage()),
);
```

### Server Entry

```ts
// server.ts
import { createServer } from "node:http";
import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

const effexRoutes = Platform.toHttpRoutes(router, {
  app: App,
  document: {
    title: "My App",
    scripts: ["/src/client.ts"],
    styles: ["/styles.css"],
  },
});

const httpApp = HttpRouter.empty.pipe(
  HttpRouter.get("/api/health", HttpServerResponse.json({ ok: true })),
  HttpRouter.concat(effexRoutes),
);

const ServerLive = httpApp.pipe(
  HttpServer.serve(),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);

NodeRuntime.runMain(Layer.launch(ServerLive));
```

### Client Entry

```ts
// client.ts
import type { Element } from "@effex/dom";
import { hydrate } from "@effex/dom/hydrate";
import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

hydrate(
  App() as unknown as Element.Element<HTMLElement>,
  document.getElementById("root")!,
  { layers: Platform.makeClientLayer(router) },
);
```

### App Component

The app component is shared between server and client. It should contain an `Outlet` that renders matched routes:

```ts
// App.ts
import { $, collect } from "@effex/dom";
import { Link, Outlet } from "@effex/router";
import { router } from "./routes.js";

export const App = () =>
  $.div(
    { class: "app" },
    collect(
      $.nav({}, Link({ href: "/" }, $.of("Home"))),
      $.main({}, Outlet({ router })),
    ),
  );
```

## Server API

### `Platform.toHttpRoutes(router, options?)`

Converts an Effex Router into an `@effect/platform` HttpRouter. For each route:

- **GET** — Runs the loader, SSR renders the component, returns full HTML document. If `?_data=1` is present, returns loader data as JSON (used for client-side navigation).
- **POST / PUT / DELETE** — Dispatches to the handler matching `?_action=key`, executes it with the parsed request body, returns JSON. No component rendering.

```ts
const effexRoutes = Platform.toHttpRoutes(router, {
  app: App,                        // Root component (should contain Outlet)
  document: {
    title: "My App",
    scripts: ["/client.js"],       // <script type="module"> tags
    styles: ["/styles.css"],       // <link rel="stylesheet"> tags
    head: '<meta name="..." ...>', // Additional head HTML
  },
});
```

The returned HttpRouter composes with any `@effect/platform` router via `HttpRouter.concat`.

### `RedirectError`

Throw from loaders or mutation handlers to trigger a redirect:

```ts
import { RedirectError } from "@effex/platform";

Route.make("/users/me").pipe(
  Route.get(
    () => Effect.fail(new RedirectError({ url: "/users/alice", status: 302 })),
    () => $.div(), // never reached
  ),
);
```

- On full page loads: returns an HTTP 3xx redirect
- On data requests (`?_data=1`): returns `{ _redirect: url }` so the client navigates without a full reload

### `generateDocument(html, loaderData, options?)`

Wraps rendered HTML in a full HTML5 document with hydration data:

```ts
const doc = generateDocument("<div>Hello</div>", { data: { name: "World" } }, {
  title: "My Page",
  scripts: ["/client.js"],
});
```

Produces:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Page</title>
  </head>
  <body>
    <div id="root"><div>Hello</div></div>
    <script>window.__EFFEX_DATA__={...}</script>
    <script type="module" src="/client.js"></script>
  </body>
</html>
```

### `serializeForHtml(data)`

Safely serializes JSON for embedding in HTML `<script>` tags. Escapes `<`, `>`, and `&` to prevent XSS.

### `generateLoaderDataScript(loaderData)`

Generates a `<script>` tag that sets `window.__EFFEX_DATA__`. Returns empty string if no data.

## Client API

### `Platform.makeClientLayer(router)`

Creates an Effect Layer providing `NavigationContext` and `RouteDataProvider` for the client.

- **First render (hydration):** Reads data from `window.__EFFEX_DATA__` embedded by the server
- **Subsequent navigations:** Fetches data from the server via `?_data=1`

```ts
import { hydrate } from "@effex/dom/hydrate";
import { Platform } from "@effex/platform";

hydrate(App() as unknown as Element.Element<HTMLElement>, root, {
  layers: Platform.makeClientLayer(router),
});
```

## Data Flow

### Initial Page Load

```
GET /users/123
  -> Route matching
  -> Run loader: getUser("123")
  -> Build RouteDataService: { data, loaderPath, actions }
  -> SSR render component tree
  -> Embed data in window.__EFFEX_DATA__
  -> Return full HTML document
```

### Client Hydration

```
Browser loads HTML
  -> hydrate() attaches to existing DOM
  -> makeClientLayer reads window.__EFFEX_DATA__
  -> Component tree hydrates with server data
```

### Client-Side Navigation

```
User clicks Link
  -> Outlet detects route change
  -> RouteDataProvider fetches /users/456?_data=1
  -> Server runs loader, returns JSON
  -> Component re-renders with new data
```

### Mutation

```
Form submit -> POST /users/123?_action=update
  -> Server finds handler with key "update"
  -> Parses body (JSON or URL-encoded)
  -> Executes handler, returns JSON result
  -> Client receives result
  -> AsyncCache invalidation triggers UI update
```

## Composing with Effect HttpApi

Since `toHttpRoutes` returns a standard `@effect/platform` HttpRouter, it composes naturally with API endpoints:

```ts
const apiRoutes = HttpRouter.empty.pipe(
  HttpRouter.get("/api/users", usersHandler),
  HttpRouter.post("/api/users", createUserHandler),
);

const app = HttpRouter.empty.pipe(
  HttpRouter.concat(apiRoutes),           // API routes first
  HttpRouter.concat(effexRoutes),          // Effex pages catch the rest
);
```

## Vite Plugin

The `@effex/vite-plugin` package provides dev server integration and client build optimization:

```ts
// vite.config.ts
import { effexPlatform } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexPlatform({ entry: "src/vite-entry.ts" }),
  ],
});
```

**Dev mode:** Intercepts requests to the Vite dev server and delegates to your SSR entry, with HMR support.

**Client builds:** Strips server-only code from the client bundle — loader function bodies are removed from `Route.get()` calls, and mutation handlers in `Route.post/put/delete()` are replaced with stubs.

## API Reference

### Platform Namespace

| Function | Description |
|---|---|
| `Platform.toHttpRoutes(router, options?)` | Convert Effex Router to `@effect/platform` HttpRouter |
| `Platform.makeClientLayer(router)` | Create client-side Layer for hydration and navigation |
| `Platform.generateDocument(html, data, options?)` | Wrap HTML in full document with hydration data |
| `Platform.generateLoaderDataScript(data)` | Generate `<script>` tag for hydration data |
| `Platform.serializeForHtml(data)` | Safely serialize JSON for HTML embedding |

### Named Exports

| Export | Description |
|---|---|
| `RedirectError` | Tagged error class for server-side redirects |
| `toHttpRoutes` | Same as `Platform.toHttpRoutes` |
| `makeClientLayer` | Same as `Platform.makeClientLayer` |
| `generateDocument` | Same as `Platform.generateDocument` |
| `generateLoaderDataScript` | Same as `Platform.generateLoaderDataScript` |
| `serializeForHtml` | Same as `Platform.serializeForHtml` |

### DocumentOptions

```ts
interface DocumentOptions {
  title?: string;              // Page <title>
  scripts?: readonly string[]; // Module script URLs
  styles?: readonly string[];  // Stylesheet URLs
  head?: string;               // Additional head HTML
}
```

### ToHttpRoutesOptions

```ts
interface ToHttpRoutesOptions {
  document?: DocumentOptions;
  app?: () => Element.Element<HTMLElement | SVGElement>;  // Root app component
}
```
