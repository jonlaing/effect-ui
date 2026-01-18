import { $, Component, Link } from "@effex/platform";

/**
 * Documentation home page.
 */
export default Component.gen(function* () {
  return yield* $.div({ class: "home" }, [
    $.section({ class: "hero" }, [
      $.h1({}, ["Effex Documentation"]),
      $.p({ class: "tagline" }, [
        "A reactive UI framework built on Effect.ts primitives",
      ]),
      $.div({ class: "hero-actions" }, [
        Link({ href: "/docs/getting-started", class: "btn btn-primary" }, "Get Started"),
        $.a(
          {
            href: "https://github.com/jonlaing/effex",
            class: "btn btn-secondary",
            target: "_blank",
          },
          "View on GitHub",
        ),
      ]),
    ]),
    $.section({ class: "features" }, [
      $.div({ class: "feature" }, [
        $.h3({}, ["Type-Safe Reactivity"]),
        $.p({}, ["Fine-grained reactivity with Signals, Derived values, and Effects - all fully typed."]),
      ]),
      $.div({ class: "feature" }, [
        $.h3({}, ["Effect.ts Powered"]),
        $.p({}, ["Built on Effect.ts for structured concurrency, error handling, and dependency injection."]),
      ]),
      $.div({ class: "feature" }, [
        $.h3({}, ["SSR & SSG"]),
        $.p({}, ["First-class server-side rendering and static site generation support."]),
      ]),
    ]),
  ]);
});
