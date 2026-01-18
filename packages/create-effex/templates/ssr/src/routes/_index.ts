import { $, Component, Link, Route, Signal } from "@effex/platform";

export const route = Route.define();

const HomePage = Component.gen(function* () {
  const count = yield* Signal.make(0);

  return yield* $.div({ class: "page" }, [
    $.h1("Welcome to Effex"),
    $.p("A reactive UI framework built on Effect.ts primitives."),
    $.div({ class: "card" }, [
      $.h2("Get Started"),
      $.p("Edit src/routes/_index.ts to modify this page."),
    ]),
    $.div({ class: "card" }, [
      $.h2("Features"),
      $.ul([
        $.li("File-based routing"),
        $.li("Server-side rendering"),
        $.li("Loaders for data fetching"),
        $.li("Actions for form handling"),
        $.li("Seamless hydration"),
      ]),
    ]),
    $.div({ class: "card" }, [
      $.h2("Counter"),
      $.div([
        $.button({ onClick: () => count.update((c) => c - 1) }, "-"),
        $.span(count),
        $.button({ onClick: () => count.update((c) => c + 1) }, "+"),
      ]),
    ]),
    $.div({ class: "card" }, [
      $.h2("Navigation"),
      $.ul([$.li(Link({ href: "/about" }, "About"))]),
    ]),
  ]);
});

export default HomePage;
