import { Effect, Schema } from "effect";

import { Route, Router } from "@stax-ui/router";

import { AboutPage } from "./pages/AboutPage.js";
import { DocsPage } from "./pages/DocsPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

// =============================================================================
// Home page (static, no params)
// =============================================================================

const HomeRoute = Route.make("/").pipe(
  Route.static({
    load: () =>
      Effect.succeed({
        title: "Welcome to Stax",
        description: "A reactive UI framework built on Effect.ts primitives.",
      }),
    render: (data) => HomePage(data),
  }),
);

// =============================================================================
// About page (static, no params)
// =============================================================================

const AboutRoute = Route.make("/about").pipe(
  Route.static({
    load: () => Effect.succeed({ title: "About" }),
    render: (data) => AboutPage(data),
  }),
);

// =============================================================================
// Docs pages (static with dynamic params)
// =============================================================================

const docs: Record<string, { title: string; content: string }> = {
  "getting-started": {
    title: "Getting Started",
    content:
      "Welcome to the Stax documentation. Edit src/routes.ts to add your own content.",
  },
  routing: {
    title: "Routing",
    content:
      "Stax uses a type-safe router built on Effect.ts. Define routes with Route.make() and compose them with Router.",
  },
};

const DocsRoute = Route.make("/docs/:slug").pipe(
  Route.params(Schema.Struct({ slug: Schema.String })),
  Route.static({
    paths: () => Effect.succeed(Object.keys(docs).map((slug) => ({ slug }))),
    load: ({ params }) =>
      Effect.succeed(
        docs[params.slug] ?? {
          title: "Not Found",
          content: "This page does not exist.",
        },
      ),
    render: (data) => DocsPage(data),
  }),
  Route.catchAll(() => NotFoundPage()),
);

// =============================================================================
// Router
// =============================================================================

export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.concat(DocsRoute),
  Router.fallback(() => NotFoundPage()),
);
