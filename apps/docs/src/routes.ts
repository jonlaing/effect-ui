import { Effect } from "effect";

import { $, collect } from "@effex/dom";
import { Link, Route, Router } from "@effex/router";

import { discoverPages, getSections, loadPage } from "./content.js";

// ─── Home page ───────────────────────────────────────────────────────────────

const HomeRoute = Route.make("/").pipe(
  Route.static({
    load: () =>
      Effect.gen(function* () {
        const pages = yield* discoverPages();
        const sections = getSections(pages);
        return { sections };
      }),
    render: (data) =>
      $.div(
        { class: "home" },
        collect(
          $.h1({}, $.of("Effex Documentation")),
          $.p(
            { class: "lead" },
            $.of(
              "A reactive UI framework built on Effect.ts primitives.",
            ),
          ),
          ...data.sections.map((section) =>
            $.div(
              { class: "section-group" },
              collect(
                $.h2({}, $.of(section.name)),
                $.ul(
                  {},
                  collect(
                    ...section.pages.map((page) =>
                      $.li(
                        {},
                        Link(
                          { href: `/docs/${page.slug}` },
                          $.of(page.title),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
  }),
);

// ─── Doc pages ───────────────────────────────────────────────────────────────

const DocRoute = Route.make("/docs/*").pipe(
  Route.static({
    paths: () =>
      Effect.gen(function* () {
        const pages = yield* discoverPages();
        return pages.map((p) => ({ "*": p.slug } as Record<string, string>));
      }),
    load: ({ params }) =>
      Effect.gen(function* () {
        const slug = params["*"];
        const parts = slug.split("/");
        const section = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
        const filename = parts[parts.length - 1] + ".md";
        const page = yield* loadPage(section, filename);

        // Load all pages for sidebar navigation
        const allPages = yield* discoverPages();
        const sections = getSections(allPages);

        return { page, sections };
      }),
    render: (data) =>
      $.div(
        { class: "doc-page" },
        collect(
          $.aside(
            { class: "sidebar" },
            collect(
              $.div(
                { class: "sidebar-header" },
                Link({ href: "/" }, $.of("Effex Docs")),
              ),
              $.nav(
                {},
                collect(
                  ...data.sections.map((section) =>
                    $.div(
                      { class: "nav-section" },
                      collect(
                        $.h3({}, $.of(section.name)),
                        $.ul(
                          {},
                          collect(
                            ...section.pages.map((page) =>
                              $.li(
                                {},
                                Link(
                                  { href: `/docs/${page.slug}` },
                                  $.of(page.title),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          $.main(
            { class: "content" },
            collect(
              $.article({
                class: "prose",
                innerHTML: data.page.html,
              }),
            ),
          ),
        ),
      ),
  }),
);

// ─── Router ──────────────────────────────────────────────────────────────────

export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(DocRoute),
  Router.fallback(() =>
    $.div(
      { class: "not-found" },
      collect(
        $.h1({}, $.of("404 — Page Not Found")),
        $.p({}, Link({ href: "/" }, $.of("Back to Home"))),
      ),
    ),
  ),
);
