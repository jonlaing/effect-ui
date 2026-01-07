# @effex/platform

Full-stack meta-framework for Effex applications. Provides server-side rendering, hydration, loaders, actions, and platform services.

> **Note:** This package re-exports everything from `@effex/core`, `@effex/dom`, `@effex/router`, and `@effex/form`. For most full-stack apps, you only need this package.

## Installation

```bash
pnpm add @effex/platform effect
```

## Quick Start

```ts
// Everything from one import
import {
  $,
  Signal,
  component,
  Router,
  Route,
  Form,
  Routes,
  Platform,
} from "@effex/platform";
```

## File-Based Routing with Route.define

Define routes with co-located params, loaders, and actions:

```ts
// src/routes/users.$id.ts
import { Effect, Schema } from "effect";
import { $, component, Route } from "@effex/platform";

// Define route configuration
export const route = Route.define({
  params: Schema.Struct({ id: Schema.String }),
  loader: (params) =>
    Effect.gen(function* () {
      return yield* fetchUser(params.id);
    }),
});

// Component with type-safe access
const UserPage = component("UserPage", () =>
  Effect.gen(function* () {
    // Type-safe params
    const params = yield* route.params();

    // Type-safe loader data
    const user = yield* route.loaderData<User>();

    return yield* $.div([
      $.h1([user.name]),
      $.p([user.email]),
    ]);
  }),
);

export default UserPage;
```

## Server-Side Rendering

### Server Entry

```ts
// server-entry.ts
import { Effect } from "effect";
import { render, renderToDocument } from "@effex/platform/server";
import { Router, Routes } from "@effex/platform";
import { routes, components } from "./generated/routes.js";

export async function renderPage(request: Request): Promise<string> {
  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const url = new URL(request.url);
        const router = yield* Router.make(routes, {
          initialPath: url.pathname,
          initialSearch: url.search,
        });

        const app = Routes({ components }).pipe(Effect.provide(router.layer));

        const result = yield* render(app, { request, router });

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

### Client Hydration

```ts
// client.ts
import { Effect } from "effect";
import { Router, Routes } from "@effex/platform";
import { hydrateApp } from "@effex/platform/client";
import { routes, components } from "./generated/routes.js";

Effect.runFork(
  Effect.scoped(
    Effect.gen(function* () {
      const router = yield* Router.make(routes);

      const app = Routes({ components }).pipe(Effect.provide(router.layer));

      yield* Effect.promise(() =>
        hydrateApp(app, document.getElementById("root")!, { router }),
      );

      yield* Effect.never; // Keep scope alive
    }),
  ),
);
```

## Loaders

Load data on the server before rendering:

```ts
// src/routes/users.$id.ts
import { Effect, Schema } from "effect";
import { $, component, Route } from "@effex/platform";

export const route = Route.define({
  params: Schema.Struct({ id: Schema.String }),
  loader: (params) =>
    Effect.gen(function* () {
      return yield* fetchUser(params.id);
    }),
});

const UserPage = component("UserPage", () =>
  Effect.gen(function* () {
    const user = yield* route.loaderData<User>();

    return yield* $.div([
      $.h1([user.name]),
      $.p([user.email]),
    ]);
  }),
);

export default UserPage;
```

## Actions

Handle form submissions on the server:

```ts
// src/routes/contact.ts
import { Effect } from "effect";
import { $, component, Route, Form, when, RouterContext } from "@effex/platform";

export const route = Route.define({
  action: ({ formData }) =>
    Effect.gen(function* () {
      const name = formData.get("name") as string;
      const message = formData.get("message") as string;

      yield* sendEmail({ name, message });

      return { success: true, message: "Message sent!" };
    }),
});

const ContactForm = component("ContactForm", () =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    const actionState = router.actionState;

    return yield* $.form({ method: "post" }, [
      $.input({ name: "name", placeholder: "Name" }),
      $.textarea({ name: "message", placeholder: "Message" }),
      $.button({ type: "submit" }, ["Send"]),
      when(actionState.map((s) => s.data?.success), {
        onTrue: () => $.p({ class: "success" }, ["Message sent!"]),
        onFalse: () => $.span(),
      }),
    ]);
  }),
);

export default ContactForm;
```

## Platform Services

Access platform utilities in your components:

```ts
import { Platform } from "@effex/platform";

const handler = Effect.gen(function* () {
  // Environment detection
  const isServer = yield* Platform.isServer;
  const isClient = yield* Platform.isClient;

  // Cookie access (works on both server and client)
  const cookies = yield* Platform.cookies;
  const session = yield* cookies.get("session");
  yield* cookies.set("theme", "dark", { maxAge: 86400, path: "/" });

  // Server-only: access request and set response headers
  const request = yield* Platform.request;
  yield* Platform.setHeader("X-Custom-Header", "value");
});
```

## Data Serialization

Complex types are automatically serialized for SSR hydration:

- `Date` - Serialized as ISO strings, restored as Date objects
- `Map` and `Set` - Serialized as arrays, restored as Map/Set
- `BigInt` - Serialized as strings, restored as BigInt
- `RegExp` - Serialized with source and flags
- `URL` - Serialized as href strings
- `undefined`, `NaN`, `Infinity` - Preserved correctly

```ts
import { serialize, deserialize } from "@effex/platform";

const data = {
  created: new Date(),
  items: new Set([1, 2, 3]),
  metadata: new Map([["key", "value"]]),
};

// Serialize for SSR
const json = serializeSync(data);

// Deserialize on client (happens automatically during hydration)
const restored = deserializeSync(json);
// restored.created instanceof Date === true
```

## Routes Component

Render the current route:

```ts
import { Routes } from "@effex/platform";

const App = component("App", () =>
  Effect.gen(function* () {
    return yield* $.div([
      Header(),
      Routes({
        components,
        fallback: () => NotFoundPage(),
      }),
      Footer(),
    ]);
  }),
);
```

## Subpath Exports

For environment-specific code:

```ts
// Server-only (SSR, HTTP handlers)
import { render, EffexServer } from "@effex/platform/server";

// Client-only (hydration)
import { hydrateApp } from "@effex/platform/client";

// Shared (works everywhere)
import { Routes, Form, Platform } from "@effex/platform";
```

## API Reference

### Route

- `Route.define(options?)` - Define a route with params, loader, action
- `route.params()` - Effect returning current params (or null)
- `route.loaderData<T>()` - Effect returning loader data
- `route.isActive()` - Readable signal for active state

### Server

- `render(element, options)` - Render to HTML
- `renderToDocument(result, options)` - Wrap in HTML document
- `EffexServer.makeHttpApp(options)` - Create HTTP handler

### Client

- `hydrateApp(element, container, options)` - Hydrate server-rendered HTML

### Platform

- `Platform.isServer` - Effect that returns true on server
- `Platform.isClient` - Effect that returns true on client
- `Platform.cookies` - Cookie access
- `Platform.request` - Server request (server only)
- `Platform.setHeader(name, value)` - Set response header (server only)

### Serialization

- `serialize(data)` - Serialize to JSON (async)
- `serializeSync(data)` - Serialize to JSON (sync)
- `deserialize(json)` - Deserialize from JSON (async)
- `deserializeSync(json)` - Deserialize from JSON (sync)
