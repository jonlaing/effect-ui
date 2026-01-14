import { Effect } from "effect";

import { $, Component, Signal } from "@effex/dom";
import { Link, Route } from "@effex/router";

export const route = Route.define();

const HomePage: Component.Unit = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div({ class: "page" }, [
      $.h1({}, ["Welcome to Effex"]),
      $.p({}, ["A reactive UI framework built on Effect.ts primitives."]),
      $.div({ class: "card" }, [
        $.h2({}, ["Get Started"]),
        $.p({}, ["Edit src/routes/_index.ts to modify this page."]),
      ]),
      $.div({ class: "card" }, [
        $.h2({}, ["Features"]),
        $.ul({}, [
          $.li({}, ["File-based routing"]),
          $.li({}, ["Client-side rendering"]),
          $.li({}, ["Reactive signals"]),
          $.li({}, ["Type-safe forms"]),
        ]),
      ]),
      $.div({ class: "card" }, [
        $.h2({}, ["Counter"]),
        $.div({}, [
          $.button({ onClick: () => count.update((c) => c - 1) }, ["-"]),
          $.span({}, [count]),
          $.button({ onClick: () => count.update((c) => c + 1) }, ["+"]),
        ]),
      ]),
      $.div({ class: "card" }, [
        $.h2({}, ["Navigation"]),
        $.ul({}, [$.li({}, [Link({ href: "/about" }, "About")])]),
      ]),
    ]);
  });

export default HomePage;
