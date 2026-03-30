import { Effect } from "effect";

import { Route, Router } from "@effex/router";

import { getAdjacentPages, getSections } from "./content.js";
import {
  discoverPages,
  extractToc,
  loadPage,
  renderCode,
} from "./content.server.js";
import { DocPage } from "./pages/DocPage.js";
import {
  counterExample,
  errorsExample,
  fullstackExample,
  HomePage,
  signalsExample,
} from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

// ─── Home page ───────────────────────────────────────────────────────────────

const HomeRoute = Route.make("/").pipe(
  Route.static({
    load: () =>
      Effect.gen(function* () {
        const [counterHtml, signalsHtml, errorsHtml, fullstackHtml] =
          yield* Effect.all([
            renderCode(counterExample, "typescript"),
            renderCode(signalsExample, "typescript"),
            renderCode(errorsExample, "typescript"),
            renderCode(fullstackExample, "typescript"),
          ]);

        return {
          codeExamples: {
            counterHtml,
            signalsHtml,
            errorsHtml,
            fullstackHtml,
          },
        };
      }),
    render: (data) => HomePage(data),
  }),
  Route.meta({ title: "Effex | Reactive UI Built on Effect.ts" }),
);

// ─── Doc pages ───────────────────────────────────────────────────────────────

const DocRoute = Route.make("/docs/*").pipe(
  Route.static({
    paths: () =>
      Effect.gen(function* () {
        const pages = yield* discoverPages();
        return pages.map((p) => ({ "*": p.slug }) as Record<string, string>);
      }),
    load: ({ params }) =>
      Effect.gen(function* () {
        const slug = params["*"];
        const parts = slug.split("/");
        const section = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
        const filename = parts[parts.length - 1] + ".md";
        const page = yield* loadPage(section, filename);

        const allPages = yield* discoverPages();
        const sections = getSections(allPages);

        const { prev, next } = getAdjacentPages(slug, sections);
        const toc = extractToc(page.html);

        return { page, sections, prev, next, toc };
      }),
    render: (data) =>
      DocPage({
        page: data.page,
        sections: data.sections,
        prev: data.prev,
        next: data.next,
        toc: data.toc,
      }),
  }),
  Route.meta(({ data }) => ({
    title: `${data.page.title} | Effex Docs`,
    description: data.page.description,
  })),
);

// ─── Router ──────────────────────────────────────────────────────────────────

export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(DocRoute),
  Router.fallback(() => NotFoundPage()),
);
