import { Effect } from "effect";

import { $, Signal } from "@stax-ui/dom";

export const HomePage = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div(
      $.h1("Welcome to Stax"),
      $.p("A reactive UI framework built on Effect.ts primitives."),
      $.div(
        { class: "card" },
        $.h2("Get Started"),
        $.p("Edit src/pages/HomePage.ts to modify this page."),
      ),
      $.div(
        { class: "card" },
        $.h2("Counter"),
        $.div(
          $.button({ onClick: () => count.update((c) => c - 1) }, "-"),
          $.span(count),
          $.button({ onClick: () => count.update((c) => c + 1) }, "+"),
        ),
      ),
    );
  });
