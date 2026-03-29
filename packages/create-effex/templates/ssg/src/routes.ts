import { Effect, Schema } from "effect";

import { $, collect } from "@effex/dom";
import { Link, Route, Router } from "@effex/router";

// =============================================================================
// Home page (static, no params)
// =============================================================================

const HomeRoute = Route.make("/").pipe(
  Route.static({
    load: () =>
      Effect.succeed({
        title: "Welcome to Effex",
        description: "A reactive UI framework built on Effect.ts primitives.",
      }),
    render: (data) =>
      $.div(
        {},
        collect(
          $.h1({}, $.of(data.title)),
          $.p({}, $.of(data.description)),
          $.div(
            { class: "card" },
            collect(
              $.h2({}, $.of("Features")),
              $.ul(
                {},
                collect(
                  $.li({}, $.of("Static site generation")),
                  $.li({}, $.of("Pre-rendered HTML pages")),
                  $.li({}, $.of("Built on Effect.ts")),
                  $.li({}, $.of("Type-safe routing")),
                ),
              ),
            ),
          ),
        ),
      ),
  }),
);

// =============================================================================
// About page (static, no params)
// =============================================================================

const AboutRoute = Route.make("/about").pipe(
  Route.static({
    load: () => Effect.succeed({ title: "About" }),
    render: (data) =>
      $.div(
        {},
        collect(
          $.h1({}, $.of(data.title)),
          $.p(
            {},
            $.of(
              "This is a statically generated Effex site. Every page is pre-rendered at build time.",
            ),
          ),
          $.div({ class: "card" }, Link({ href: "/" }, $.of("Back to Home"))),
        ),
      ),
  }),
);

// =============================================================================
// Docs pages (static with dynamic params)
// =============================================================================

const docs: Record<string, { title: string; content: string }> = {
  "getting-started": {
    title: "Getting Started",
    content:
      "Welcome to the Effex documentation. Edit src/routes.ts to add your own content.",
  },
  routing: {
    title: "Routing",
    content:
      "Effex uses a type-safe router built on Effect.ts. Define routes with Route.make() and compose them with Router.",
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
    render: (data) =>
      $.div(
        {},
        collect(
          $.h1({}, $.of(data.title)),
          $.p({}, $.of(data.content)),
          $.div(
            { class: "card" },
            collect(
              $.h3({}, $.of("Documentation")),
              $.ul(
                {},
                collect(
                  $.li(
                    {},
                    Link(
                      { href: "/docs/getting-started" },
                      $.of("Getting Started"),
                    ),
                  ),
                  $.li({}, Link({ href: "/docs/routing" }, $.of("Routing"))),
                ),
              ),
            ),
          ),
        ),
      ),
  }),
);

// =============================================================================
// Router
// =============================================================================

export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.concat(DocsRoute),
  Router.fallback(() =>
    $.div(
      {},
      collect(
        $.h1({}, $.of("404 — Not Found")),
        Link({ href: "/" }, $.of("Go Home")),
      ),
    ),
  ),
);
