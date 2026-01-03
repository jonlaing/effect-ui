# @effex/vite-plugin

Vite plugin for Effex applications. Provides file-based routing and SSR middleware.

## Installation

```bash
pnpm add -D @effex/vite-plugin
```

## Quick Start

### SPA (Client-Side Only)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { effexRoutes } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexRoutes({
      routesDir: "src/routes",
      outputPath: "src/generated/routes.ts",
    }),
  ],
  resolve: {
    conditions: ["effect-ts"],
  },
});
```

### SSR (Server-Side Rendering)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { effexRoutes, effexSSR } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexRoutes({
      routesDir: "src/routes",
      outputPath: "src/generated/routes.ts",
    }),
    effexSSR({
      entry: "src/vite-entry.ts",
    }),
  ],
  resolve: {
    conditions: ["effect-ts"],
  },
});
```

## File-Based Routing

Create route files in your routes directory:

```
src/routes/
├── _index.ts      → /
├── about.ts       → /about
├── contact.ts     → /contact
├── users/
│   ├── _index.ts  → /users
│   └── $id.ts     → /users/:id
└── posts/
    └── $slug.ts   → /posts/:slug
```

### Route File Conventions

- `_index.ts` - Index route for the directory
- `$param.ts` - Dynamic parameter route
- Nested directories create nested paths

### Route File Structure

Each route file should export a default component:

```ts
// src/routes/about.ts
import { Effect } from "effect";
import { $, component } from "@effex/platform";

const AboutPage = component("AboutPage", () =>
  Effect.gen(function* () {
    return yield* $.div({ class: "page" }, [
      $.h1("About Us"),
      $.p("Welcome to our site."),
    ]);
  }),
);

export default AboutPage;
```

### Routes with Loaders

Export a `loader` function for data loading:

```ts
// src/routes/users/$id.ts
import { Effect, Schema } from "effect";
import { $, component, RouteLoader, Route } from "@effex/platform";

export const route = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String }),
  loader: (ctx) =>
    Effect.gen(function* () {
      const params = yield* ctx.params.get;
      return yield* fetchUser(params.id);
    }),
});

const UserPage = component("UserPage", () =>
  Effect.gen(function* () {
    const user = yield* RouteLoader.loaderData<User>();

    return yield* $.div([
      $.h1(user.name),
      $.p(user.email),
    ]);
  }),
);

export default UserPage;
```

## Generated Routes File

The plugin generates a routes file:

```ts
// src/generated/routes.ts (auto-generated)
import { Route } from "@effex/platform";

import AboutComponent from "../routes/about";
import IndexComponent from "../routes/_index";
import UsersIdComponent from "../routes/users/$id";

export const routes = {
  about: Route.make("/about"),
  index: Route.make("/"),
  users_$id: Route.make("/users/:id"),
} as const;

export const components = {
  about: AboutComponent,
  index: IndexComponent,
  users_$id: UsersIdComponent,
} as const;

export type Routes = typeof routes;
export type RouteNames = keyof Routes;
```

## SSR Plugin Options

```ts
effexSSR({
  // Path to Vite SSR entry module
  entry: "src/vite-entry.ts",
})
```

### Vite Entry Requirements

Your Vite entry must export a `render` function:

```ts
// src/vite-entry.ts
import { Effect } from "effect";
import { render as effexRender, renderToDocument } from "@effex/platform/server";
import { Router, Routes, makeRouterLayer } from "@effex/platform";
import { routes, components } from "./generated/routes.js";

export async function render(
  url: string,
  _ssrManifest?: Record<string, string[]>,
): Promise<string> {
  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const urlObj = new URL(url, "http://localhost");
        const router = yield* Router.make(routes, {
          initialPath: urlObj.pathname,
          initialSearch: urlObj.search,
        });
        const routerLayer = makeRouterLayer(router);

        const app = Routes({ components }).pipe(Effect.provide(routerLayer));
        const result = yield* effexRender(app, { router });

        return renderToDocument(result, {
          title: "My App",
          scripts: ["/client.js"],
          styles: ["/styles.css"],
        });
      }),
    ),
  );
}
```

## Routes Plugin Options

```ts
effexRoutes({
  // Directory containing route files
  routesDir: "src/routes",

  // Output path for generated routes file
  outputPath: "src/generated/routes.ts",
})
```

## Development

Routes are regenerated automatically when:
- Files are added/removed in the routes directory
- The dev server starts
- You run `vite build`

## API Reference

### Plugins

- `effexRoutes(options)` - File-based route generation
- `effexSSR(options)` - SSR middleware for development

### effexRoutes Options

- `routesDir` - Path to routes directory (default: `"src/routes"`)
- `outputPath` - Path for generated routes file (default: `"src/generated/routes.ts"`)

### effexSSR Options

- `entry` - Path to Vite SSR entry module
