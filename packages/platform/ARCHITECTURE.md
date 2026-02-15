# @effex/platform Architecture

This document describes how the platform package currently works. It serves as a reference for understanding the existing implementation before making architectural decisions.

## Overview

`@effex/platform` is a full-stack meta-framework (like Remix/Next.js) for Effex applications. It provides:

- Server-side rendering (SSR)
- Client-side hydration
- Data loading (loaders)
- Form actions
- Static site generation (SSG)
- HTTP server integration via @effect/platform

## Entry Points

The package has three entry points to enable tree-shaking:

```
@effex/platform        → Shared (works everywhere)
@effex/platform/server → Server-only (SSR, HTTP, actions, SSG)
@effex/platform/client → Client-only (hydration)
```

### Main Entry (`index.ts`)
Re-exports everything from `@effex/dom` (which includes `@effex/core`), `@effex/router`, and most of `@effex/form`. Also exports platform-specific modules that work in both environments:
- `Platform` - environment detection, cookies
- `RouteLoader` - data loading utilities
- `Routes` - route rendering component
- `Form` - platform-integrated form (wraps @effex/form)
- Serialization utilities

### Server Entry (`server.ts`)
Server-only exports:
- `render`, `renderToDocument`, `performSSR` - SSR functions
- `EffexServer.makeHttpApp`, `makeRouter`, etc. - HTTP server integration
- `buildStaticPages`, `getStaticRoutes` - SSG
- `makeActionData` - action execution

### Client Entry (`client.ts`)
Client-only exports:
- `hydrateApp` - hydration function
- `isHydrating` - hydration detection

---

## Data Flow

### SSR Request Flow

```
Request
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│ performSSR / render                                      │
│                                                          │
│  1. Create PlatformContext (cookies, headers, request)   │
│  2. If POST/PUT/PATCH/DELETE → execute action            │
│  3. Execute loader for matched route                     │
│  4. Populate loaderDataCache                             │
│  5. Create LoaderContext layer                           │
│  6. renderToString(element) with layers                  │
│  7. Serialize loader/action data for HTML embedding      │
│  8. Return html + loaderDataScript + headers             │
└─────────────────────────────────────────────────────────┘
   │
   ▼
generateDocument()
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│ HTML Document                                            │
│                                                          │
│  <div id="root">{html}</div>                             │
│  <script>                                                │
│    window.__EFFEX_LOADER_DATA__ = {...};                 │
│    window.__EFFEX_ACTION_DATA__ = {...};                 │
│  </script>                                               │
│  <script src="/client.js"></script>                      │
└─────────────────────────────────────────────────────────┘
```

### Hydration Flow

```
Browser loads HTML
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│ hydrateApp()                                             │
│                                                          │
│  1. Read window.__EFFEX_LOADER_DATA__                    │
│  2. Deserialize (restore Date, Map, Set, etc.)           │
│  3. Initialize router.loaderState (if router provided)   │
│  4. Create LoaderContext with isHydrating: true          │
│  5. domHydrate(element, container, { layers })           │
│  6. Clean up window.__EFFEX_LOADER_DATA__                │
└─────────────────────────────────────────────────────────┘
```

### Client-Side Navigation Flow

```
Link click / router.navigate()
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│ Router (from @effex/router)                              │
│                                                          │
│  1. Match route                                          │
│  2. Execute loader                                       │
│  3. Update loaderState signal                            │
└─────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│ Routes component                                         │
│                                                          │
│  1. Observe router.currentRoute + router.pathname        │
│  2. Poll router.loaderState for completion               │
│  3. Create fresh LoaderContext                           │
│  4. Render component with LoaderContext layer            │
└─────────────────────────────────────────────────────────┘
```

---

## Module Details

### Platform.ts - Environment Context

Provides environment-aware utilities:

```typescript
interface PlatformContextType {
  environment: "server" | "client";
  cookies: Cookies;           // Works on both server and client
  request: Request | undefined; // Server-only
  responseHeaders: Headers;   // For Set-Cookie, etc.
}
```

Key functions:
- `makeServerPlatformContext(request)` - Creates context for SSR
- `makeClientPlatformContext()` - Creates context for client
- `Platform.cookies`, `Platform.isServer`, etc. - Accessor Effects

**Issue:** Cookies implementation parses the cookie header on every `get` call. Could be optimized with caching.

### Serialization.ts - SSR Data Transfer

Handles JSON serialization with type preservation for:
- `Date`, `BigInt`, `Map`, `Set`, `RegExp`, `URL`
- `undefined`, `NaN`, `Infinity`, `-Infinity`

Uses type markers:
```typescript
{ "__effex_type__": "Date", "__effex_value__": "2024-01-01T00:00:00.000Z" }
```

Key functions:
- `serialize/serializeSync` - JSON.stringify with type markers
- `deserialize/deserializeSync` - JSON.parse with revival
- `serializeForHtml/serializeForHtmlSync` - XSS-safe for embedding in `<script>`

**Note:** `reviveTypeMarker` is exported for manual revival of already-parsed data (like `window.__EFFEX_LOADER_DATA__`).

### RouteLoader.ts - Data Loading Context

Provides context for accessing loader data in components:

```typescript
interface LoaderContext {
  routeId: string;
  params: ParamsReadable;
  loaderDataCache: Map<string, unknown>;
  isHydrating: boolean;
  parentData: Option<unknown>;
}
```

Key APIs:
- `RouteLoader.params()` - Get current route params
- `RouteLoader.loaderData<T>()` - Get loader data for current route
- `RouteLoader.redirect(url, status)` - Trigger redirect from loader
- `RouteLoader.formData()` - Get FormData in actions

**Issue:** The params readable interface is minimal to avoid cross-package Effect type issues:
```typescript
interface ParamsReadable {
  readonly get: Effect.Effect<Record<string, string>>;
}
```

### Routes.ts - Route Rendering Component

The main component that renders the active route with layouts:

```typescript
Routes({
  components,       // Map of route names to components
  layoutComponents, // Map of layout names to layout components
  routeLayouts,     // Map of route names to layout chains
  fallback,         // 404 component
})
```

**Key Logic:**
1. Creates a derived value combining `router.currentRoute + router.pathname`
   - Ensures re-renders when params change within same route
2. Uses `match` control flow to render active component
3. Wraps each component with:
   - LoaderContext (for accessing loader data)
   - Layout hierarchy (nested from outermost to innermost)

**Client Navigation Handling (lines 219-252):**
```typescript
// Poll loaderState until it matches the current route
while (loaderState.routeName !== routeName || loaderState.isLoading) {
  yield* Effect.sleep(100);
  loaderState = yield* router.loaderState.get;
}
```

**Issue:** This polling approach is not ideal - should use reactive subscription instead.

### SSR.ts / Render.ts - Server-Side Rendering

Two APIs for SSR:

1. **`render(element, { request, router })`** - Promise-based, simpler
   - Uses `Effect.runPromise` internally
   - Type assertions to work around cross-package Effect issues

2. **`performSSR(request, element, router, layer)`** - Effect-based, more control
   - Properly typed with loader/action requirements propagating through R
   - Composes well with Effect pipelines

Both do the same work:
1. Create platform context
2. Execute action if POST/PUT/PATCH/DELETE
3. Execute loader
4. Render to string with layers
5. Serialize data for hydration

**Issue:** `Render.ts` and `SSR.ts` have overlapping functionality and duplicate code (SSRRouter interface defined twice with slight differences).

### Hydrate.ts - Client Hydration

```typescript
hydrateApp(element, container, { loaderData?, router? })
```

1. Reads `window.__EFFEX_LOADER_DATA__`
2. Recursively deserializes (walking object tree to revive type markers)
3. Initializes `router.loaderState` if router provided
4. Creates LoaderContext with `isHydrating: true`
5. Calls `domHydrate` with layers
6. Cleans up window globals

**Issue:** Deserialization walks the entire object tree manually instead of using a more elegant approach.

### Server.ts - HTTP Integration

Integrates with @effect/platform's HTTP server:

```typescript
EffexServer.makeHttpApp({ app, router, document, provide })
```

Key features:
- Converts Effect Platform request to Web Request
- Handles AJAX action requests (returns JSON instead of full HTML)
- Generates full HTML document
- Passes through response headers

```typescript
// AJAX detection
const isAjaxRequest =
  webRequest.headers.get("X-Effex-Action") === "1" ||
  webRequest.headers.get("Accept")?.includes("application/json");
```

### PlatformForm.ts - Form with Actions

Extends `@effex/form` with router action support:

```typescript
const form = yield* Form.make({
  schema: ContactSchema,
  initial: { name: "", email: "" },
  action: true, // Enable action mode
});

yield* form.submit(); // POSTs to route action
```

Key additions:
- `submitToAction()` - Submit to router action
- `action: true` mode makes `submit()` use actions automatically
- Syncs server-side validation errors back to form fields

**Issue:** `toFormData` function handles nested objects and arrays manually - might not handle all edge cases.

### SSG.ts - Static Site Generation

Build-time page generation:

```typescript
await buildStaticPages({
  routes,
  staticRouteConfig,
  components,
  createApp: (routeElement, routeName) => App({ children: routeElement }),
  outDir: "./dist",
  layer: DatabaseLayer, // Optional deps for loaders
});
```

Features:
- Static route detection via `staticRouteConfig`
- Dynamic routes via `staticPaths()` function
- ISR support via `revalidate` option
- Writes to filesystem as `/path/index.html`

**Issue:** Uses Node.js `fs` directly - won't work in non-Node environments.

---

## Cross-Package Type Issues

Several modules use minimal interfaces to avoid Effect type resolution issues across packages:

```typescript
// Instead of importing Readable from @effex/core
interface ParamsReadable {
  readonly get: Effect.Effect<Record<string, string>>;
}

// Instead of importing Router from @effex/router
interface SSRRouter {
  executeLoader: () => Effect.Effect<...>;
  pathname: { get: ..., set: ... };
}
```

This is a symptom of pnpm workspaces resolving Effect to different instances. Worth investigating if there's a better solution.

---

## Potential Issues / Technical Debt

1. **Polling in Routes component** - Client navigation uses `Effect.sleep(100)` polling instead of reactive subscription to loaderState.

2. **Duplicate SSR code** - `Render.ts` and `SSR.ts` overlap significantly. `Render.ts` has `renderToDocument` duplicated from `Document.ts`.

3. **Cookie parsing inefficiency** - `makeServerCookies` and `makeClientCookies` parse cookies on every `get` call.

4. **Manual object tree walking** - `Hydrate.ts` manually walks object tree for deserialization instead of using reviver consistently.

5. **Cross-package type workarounds** - Many interfaces are duplicated to avoid Effect type issues.

6. **Node.js coupling in SSG** - `SSG.ts` uses Node `fs` directly, not portable.

7. **Form data conversion** - `PlatformForm.ts` has manual FormData conversion that may not handle all cases.

8. **No streaming SSR** - Current implementation buffers entire HTML before responding.

---

## File Summary

| File | Purpose | Lines |
|------|---------|-------|
| `index.ts` | Main entry, re-exports | ~100 |
| `server.ts` | Server entry | ~100 |
| `client.ts` | Client entry | ~60 |
| `Platform.ts` | Environment context, cookies | ~275 |
| `Serialization.ts` | Type-preserving JSON | ~245 |
| `routing/RouteLoader.ts` | Loader context | ~200 |
| `routing/Routes.ts` | Route rendering | ~350 |
| `rendering/Render.ts` | Promise-based SSR | ~335 |
| `rendering/SSR.ts` | Effect-based SSR | ~160 |
| `rendering/Hydrate.ts` | Client hydration | ~215 |
| `rendering/Document.ts` | HTML document generation | ~70 |
| `http/Server.ts` | @effect/platform integration | ~325 |
| `actions/Actions.ts` | Action execution | ~90 |
| `actions/PlatformForm.ts` | Form with actions | ~235 |
| `ssg/SSG.ts` | Static site generation | ~450 |

Total: ~3,200 lines
