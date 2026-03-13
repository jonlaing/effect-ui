# @effex/vite-plugin

Vite plugin for Effex SSR applications. Provides server-code stripping for client builds and an SSR dev server with HMR.

## Installation

```bash
pnpm add -D @effex/vite-plugin
```

## Quick Start

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { effexPlatform } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexPlatform({ entry: "src/vite-entry.ts" }),
  ],
});
```

> Only needed when using `@effex/platform` for SSR. Pure SPA apps don't need this plugin.

## What It Does

The plugin provides two capabilities:

### 1. Server-Code Stripping (Client Builds)

When Vite builds the client bundle, the plugin removes server-only code from route definitions so that server dependencies (database clients, file system access, etc.) don't get bundled into the browser.

**Loaders** — the first argument to `Route.get()` is replaced with `null`:

```ts
// Source
Route.get(
  ({ params }) => db.getUser(params.id),  // server-only loader
  (user) => UserPage({ user }),
)

// Client bundle
Route.get(
  null,                                    // stripped
  (user) => UserPage({ user }),
)
```

**Mutation handlers** — the handler function in `Route.post/put/del()` is replaced with a throw stub. The action key is preserved since the client needs it to compute action URLs:

```ts
// Source
Route.post("create", (body) =>
  Effect.gen(function* () {
    const svc = yield* PostService;
    return yield* svc.createPost(body.content);
  }),
)

// Client bundle
Route.post("create", () => { throw new Error("server only"); })
```

This stripping only applies to client builds — SSR builds and dev-mode SSR modules keep the full server code.

### 2. SSR Dev Server (Dev Mode)

When `entry` is provided, the plugin runs an SSR dev server during `vite dev`:

- Intercepts incoming requests (skips Vite internal paths and static assets)
- Loads your entry module via `server.ssrLoadModule()` for HMR support
- Calls your entry's `render(request)` function with a standard Web Request
- Injects Vite's HMR client into HTML responses
- Displays readable error pages with stack traces on failure

## Entry Module

The entry file must export a `render` function:

```ts
// src/vite-entry.ts
import { HttpApp, HttpRouter } from "@effect/platform";
import { Layer } from "effect";
import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

const effexRoutes = Platform.toHttpRoutes(router, {
  app: App,
  document: {
    title: "My App",
    scripts: ["/src/client.ts"],
    head: '<link rel="stylesheet" href="/src/styles.css">',
  },
});

const app = HttpRouter.empty.pipe(HttpRouter.concat(effexRoutes));

const { handler } = HttpApp.toWebHandlerLayer(app, MyServiceLayer);

export async function render(request: Request): Promise<Response> {
  return handler(request);
}
```

The `render` function receives a standard Web `Request` and must return a `Response`. Use `HttpApp.toWebHandlerLayer` from `@effect/platform` to bridge Effect's HTTP handlers to the Web API.

## Options

```ts
effexPlatform({
  // Path to SSR entry module. Enables the dev server when provided.
  entry: "src/vite-entry.ts",

  // File patterns to apply stripping to (default: /\.(tsx?|jsx?)$/)
  include: /\.(tsx?|jsx?)$/,

  // File patterns to exclude from stripping
  exclude: /\.test\./,
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `entry` | `string` | — | SSR entry module path. Enables dev server when set. |
| `include` | `RegExp` | `/\.(tsx?\|jsx?)$/` | Files to apply server-code stripping to |
| `exclude` | `RegExp` | — | Files to exclude from stripping |

## API Reference

| Export | Description |
|---|---|
| `effexPlatform(options?)` | Create the Vite plugin |
| `stripServerCode(code)` | Strip server code from a string (exported for testing) |
