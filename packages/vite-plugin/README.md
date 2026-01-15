# @effex/vite-plugin

Vite plugin for Effex applications. Provides file-based routing, automatic scaffolding, and SSR middleware.

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
      scaffold: true, // Auto-scaffold new route files
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
      scaffold: true,
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

## Auto-Scaffolding

When `scaffold: true` is enabled, creating an empty file in the routes directory automatically populates it with a route definition and component:

```ts
// Create an empty file: src/routes/users.$id.ts
// It will automatically be populated with:

import { Effect, Schema } from "effect";
import { Route } from "@effex/router";
import { component, $ } from "@effex/dom";

export const route = Route.define({
  params: Schema.Struct({
    id: Schema.String,
  }),
});

export default component("UsersId", () =>
  Effect.gen(function* () {
    return yield* $.div([
      $.h1(["UsersId"]),
    ]);
  })
);
```

## Route File Structure

Each route file should export a `route` definition and default component:

```ts
// src/routes/about.ts
import { Effect } from "effect";
import { Route } from "@effex/router";
import { $, Component } from "@effex/dom";

export const route = Route.define();

const AboutPage = Component.gen(function* () {
  return yield* $.div({ class: "page" }, [
    $.h1(["About Us"]),
    $.p(["Welcome to our site."]),
  ]);
});

export default AboutPage;
```

### Routes with Loaders

Define loaders for server-side data fetching:

```ts
// src/routes/users/$id.ts
import { Effect, Schema } from "effect";
import { $, Component, Route } from "@effex/platform";

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

  // Type-safe access to loader data
  const user = yield* route.loaderData<User>();

  return yield* $.div([
    $.h1([user.name]),
    $.p([user.email]),
  ]);
});

export default UserPage;
```

### Routes with Actions

Define actions for form submissions:

```ts
// src/routes/contact.ts
import { Effect } from "effect";
import { $, Component, Route } from "@effex/platform";

export const route = Route.define({
  action: ({ formData }) =>
    Effect.gen(function* () {
      const name = formData.get("name") as string;
      const message = formData.get("message") as string;

      yield* sendEmail({ name, message });

      return { success: true };
    }),
});

const ContactPage = Component.gen(function* () {
  return yield* $.form({ method: "post" }, [
    $.input({ name: "name" }),
    $.textarea({ name: "message" }),
    $.button({ type: "submit" }, ["Send"]),
  ]);
});

export default ContactPage;
```

## Generated Routes File

The plugin generates a routes file with full type information:

```ts
// src/generated/routes.ts (auto-generated)
import { Route } from "@effex/router";

import * as About from "../routes/about";
import * as Index from "../routes/_index";
import * as UsersId from "../routes/users/$id";

export const routes = {
  about: Route.make(About.route._path, {
    params: About.route._config.paramsSchema,
    loader: About.route._config.loader,
    action: About.route._config.action,
  }),
  index: Route.make(Index.route._path, {
    params: Index.route._config.paramsSchema,
    loader: Index.route._config.loader,
    action: Index.route._config.action,
  }),
  users_$id: Route.make(UsersId.route._path, {
    params: UsersId.route._config.paramsSchema,
    loader: UsersId.route._config.loader,
    action: UsersId.route._config.action,
  }),
} as const;

export const components = {
  about: About.default,
  index: Index.default,
  users_$id: UsersId.default,
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
import { Router, Routes } from "@effex/platform";
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

        const app = Routes({ components }).pipe(Effect.provide(router.layer));
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

  // File extensions to watch
  extensions: [".ts", ".tsx"],

  // Auto-scaffold empty route files
  scaffold: true,
})
```

## Development

Routes are regenerated automatically when:
- Files are added/removed in the routes directory
- The dev server starts
- You run `vite build`

With `scaffold: true`, empty files are auto-populated with route boilerplate.

## API Reference

### Plugins

- `effexRoutes(options)` - File-based route generation
- `effexSSR(options)` - SSR middleware for development

### effexRoutes Options

- `routesDir` - Path to routes directory (default: `"src/routes"`)
- `outputPath` - Path for generated routes file (default: `"src/generated/routes.ts"`)
- `extensions` - File extensions to watch (default: `[".ts", ".tsx"]`)
- `scaffold` - Auto-scaffold empty route files (default: `false`)

### effexSSR Options

- `entry` - Path to Vite SSR entry module
