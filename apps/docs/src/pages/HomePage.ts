import { $ } from "@effex/dom";
import { Link } from "@effex/router";

import logoSvg from "../assets/effex-logo-dark.svg?raw";

// ─── Code examples ──────────────────────────────────────────────────────────

export const counterExample = `import { Effect } from "effect";
import { $, Signal, mount, runApp } from "@effex/dom";

const Counter = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div(
      { class: "flex items-center gap-4" },
      $.button(
        {
          class: "btn btn-primary",
          onClick: () => count.update((n) => n - 1),
        },
        "-",
      ),
      $.span({ class: "text-2xl tabular-nums" }, count),
      $.button(
        {
          class: "btn btn-primary",
          onClick: () => count.update((n) => n + 1),
        },
        "+",
      ),
    );
  });

// Run the app!
runApp(mount(Counter(), document.getElementById("root")!));`;

export const signalsExample = `// Signals are references, not snapshots.
// No stale closures, no dependency arrays.
const name = yield* Signal.make("world");

// Use a signal directly as element content —
// the text node updates when name changes.
const greeting = yield* $.h1({}, name);

// Derived values update automatically.
const upper = Readable.map(name, (n) => n.toUpperCase());
const shout = yield* $.p({}, upper);`;

export const errorsExample = `// This component can fail — the error type says so.
const UserProfile = (id: string): Element<HttpError, ApiClient> =>
  Effect.gen(function* () {
    const api = yield* ApiClient;
    const user = yield* api.getUser(id);
    return yield* $.div({}, user.name);
  });

// TypeScript won't let you mount this without
// handling HttpError and providing ApiClient.
// Errors are visible in the types, not hidden at runtime.`;

export const fullstackExample = `// Same component, three targets.

// SPA — client-side only
runApp(mount(App(), root));

// SSR — server renders, client hydrates
// server:
const routes = Platform.toHttpRoutes(router, opts);
// client:
hydrate(App(), root);

// SSG — pre-render at build time
Route.static({
  paths: () => discoverPages(),
  load: ({ params }) => loadPage(params.slug),
  render: (data) => DocPage(data),
});`;

// ─── Helper to build a story section ────────────────────────────────────────

const storySection = (
  heading: string,
  description: string,
  codeHtml: string,
  options?: { reverse?: boolean },
) =>
  $.div(
    {
      class: `grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${options?.reverse ? "lg:[direction:rtl] lg:[&>*]:[direction:ltr]" : ""}`,
    },
    $.div(
      { class: "space-y-4" },
      $.h3({ class: "text-2xl font-bold" }, heading),
      $.p({ class: "text-base-content/70 leading-relaxed" }, description),
    ),
    $.div({
      class:
        "rounded-xl shadow-lg overflow-hidden [&_pre]:!rounded-none [&_pre]:!m-0 [&_pre]:!p-6 [&_pre]:!text-xs",
      innerHTML: codeHtml,
    }),
  );

// ─── Package card ───────────────────────────────────────────────────────────

const packageCard = (name: string, description: string, pkg: string) =>
  $.a(
    {
      href: `https://github.com/jonlaing/effex/tree/main/packages/${pkg}`,
      class: "card bg-base-300 shadow-sm hover:bg-neutral transition-colors",
      target: "_blank",
    },
    $.div(
      { class: "card-body p-5" },
      $.h3({ class: "font-mono text-sm text-primary font-semibold" }, name),
      $.p({ class: "text-base-content/70 text-sm" }, description),
    ),
  );

// ─── Page ───────────────────────────────────────────────────────────────────

export const HomePage = (props: {
  readonly codeExamples: {
    counterHtml: string;
    signalsHtml: string;
    errorsHtml: string;
    fullstackHtml: string;
  };
}) => {
  const { counterHtml, signalsHtml, errorsHtml, fullstackHtml } =
    props.codeExamples;

  return $.div(
    {},

    // ── 1. Hero ─────────────────────────────────────────────────────────
    $.div(
      { class: "hero bg-base-300 py-8 md:py-16 overflow-hidden" },
      $.div(
        { class: "hero-content text-center" },
        $.div(
          {},
          $.h1({
            class:
              "text-4xl font-bold mb-2 animate-logo-in [&_svg]:w-full md:[&_svg]:w-auto flex justify-center",
            innerHTML: logoSvg,
          }),
          $.div(
            {
              class: "text-lg text-base-content animate-subhead-fade-in mb-8",
            },
            "A reactive UI framework built on",
            $.div(
              {
                class:
                  "inline-block p-1 rounded bg-secondary text-secondary-content mx-1 font-bold -skew-y-2 shadow",
              },
              "Effect.ts",
            ),
            "primitives.",
          ),
          $.div(
            { class: "animate-slow-fade-in space-y-10" },
            $.div(
              { class: "flex gap-4 justify-center" },
              Link(
                { href: "/docs/quick-start", class: "btn btn-primary" },
                "Quick Start Guide",
              ),
              Link(
                { href: "/docs/introduction", class: "btn btn-neutral" },
                "Documentation",
              ),
            ),
            $.div(
              {
                class:
                  "inline-block bg-neutral rounded-lg px-6 py-3 font-mono text-sm",
              },
              $.span({ class: "text-primary" }, "$ "),
              $.span({}, "pnpm create effex my-app"),
            ),
          ),
        ),
      ),
    ),

    // ── 2. Code Example + Callouts ──────────────────────────────────────
    $.div(
      {
        class:
          "lg:max-w-6xl mx-auto py-8 md:py-16 px-4 space-y-16 flex flex-col-reverse md:flex-row gap-4",
      },
      $.div(
        { class: "flex flex-col gap-4 flex-1" },
        $.div(
          { class: "card shadow-sm bg-base-300 overflow-hidden flex-1" },
          $.div(
            { class: "card-body border-l-4 border-l-success" },
            $.h2({ class: "card-title" }, "Fully Typesafe"),
            $.p(
              { class: "text-base-content/75" },
              "Every element carries its error and dependency types. TypeScript catches unhandled failures and missing context at compile time — not in production.",
            ),
          ),
        ),
        $.div(
          { class: "card shadow-sm bg-base-300 overflow-hidden flex-1" },
          $.div(
            { class: "card-body border-l-4 border-l-info" },
            $.h2({ class: "card-title" }, "Full Stack Reactivity"),
            $.p(
              { class: "text-base-content/75" },
              "The same signals, components, and router work across SPAs, server-rendered apps, and static sites. One model from prototype to production.",
            ),
          ),
        ),
        $.div(
          { class: "card shadow-sm bg-base-300 overflow-hidden flex-1" },
          $.div(
            { class: "card-body border-l-4 border-l-warning" },
            $.h2(
              { class: "card-title" },
              $.span({}, "Built on the power of "),
              $.a(
                { href: "https://effect.website", class: "text-secondary" },
                "Effect.ts",
              ),
            ),
            $.p(
              { class: "text-base-content/75" },
              "Structured concurrency, typed errors, dependency injection, and automatic resource cleanup — all built in. No extra libraries required.",
            ),
          ),
        ),
      ),
      $.div(
        { class: "md:flex-1" },
        $.div({
          class:
            "rounded-xl shadow-lg overflow-hidden [&_pre]:!rounded-none [&_pre]:!m-0 [&_pre]:!p-6 [&_pre]:!text-xs [&_pre]:flex [&_pre]:justify-center",
          innerHTML: counterHtml,
        }),
      ),
    ),

    // ── 3. Story Sections ───────────────────────────────────────────────
    $.div(
      { class: "bg-base-200 py-16" },
      $.div(
        { class: "lg:max-w-6xl mx-auto px-4 space-y-20" },
        $.div(
          { class: "text-center pb-4" },
          $.h2({ class: "text-5xl font-bold" }, "Why Effex?"),
        ),
        storySection(
          "Signals, not hooks",
          "Signals are mutable references that track their own subscribers. Read a signal inside an element, and that element updates when the signal changes — automatically. No dependency arrays to maintain, no useCallback to remember, no stale closure bugs to chase down.",
          signalsHtml,
        ),
        storySection(
          "Errors you can see",
          "Every element in Effex has the type Element<E, R> — where E is the error channel and R is the required context. If a component can fail, TypeScript tells you before you ship. If it needs a service, the compiler asks for it. Runtime surprises become compile-time conversations.",
          errorsHtml,
          { reverse: true },
        ),
        storySection(
          "One framework, every target",
          "Write your components once. Run them client-side as an SPA, server-render with hydration, or pre-render as a static site. The same router, the same signals, the same component model — just a different entry point.",
          fullstackHtml,
        ),
      ),
    ),

    // ── 4. Ecosystem ────────────────────────────────────────────────────
    $.div(
      { class: "lg:max-w-6xl mx-auto py-16 px-4" },
      $.div(
        { class: "text-center mb-10" },
        $.h2({ class: "text-3xl font-bold mb-2" }, "The full picture"),
        $.p(
          { class: "text-base-content/70" },
          "A complete set of packages that work together — or independently.",
        ),
      ),
      $.div(
        { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
        packageCard(
          "@effex/core",
          "Reactive primitives — Signal, Readable, reactive collections, control flow, and transitions.",
          "core",
        ),
        packageCard(
          "@effex/dom",
          "DOM rendering with the $ factory, animations, portals, virtual lists, and hydration.",
          "dom",
        ),
        packageCard(
          "@effex/router",
          "Type-safe routing with schema-validated params, data loaders, and mutation handlers.",
          "router",
        ),
        packageCard(
          "@effex/form",
          "Schema-first forms with per-field reactivity, validation, and nested structures.",
          "form",
        ),
        packageCard(
          "@effex/platform",
          "Full-stack SSR integration with @effect/platform — server rendering, data serialization, and hydration.",
          "platform",
        ),
        packageCard(
          "@effex/vite-plugin",
          "Vite plugin for SSR dev server, server-code stripping, and static site generation.",
          "vite-plugin",
        ),
      ),
    ),

    // ── 5. Final CTA ────────────────────────────────────────────────────
    $.div(
      { class: "bg-base-200 py-16" },
      $.div(
        { class: "text-center space-y-6" },
        $.h2({ class: "text-3xl font-bold" }, "Get started in seconds"),
        $.div(
          {
            class:
              "inline-block bg-neutral rounded-lg px-6 py-3 font-mono text-sm",
          },
          $.span({ class: "text-primary" }, "$ "),
          $.span({}, "pnpm create effex my-app"),
        ),
        $.div(
          { class: "flex gap-4 justify-center" },
          Link(
            {
              href: "/docs/02-todo-app/00-introduction",
              class: "btn btn-primary",
            },
            "Follow the Tutorial",
          ),
          Link(
            { href: "/docs/introduction", class: "btn btn-neutral" },
            "Read the Docs",
          ),
        ),
      ),
    ),
  );
};
