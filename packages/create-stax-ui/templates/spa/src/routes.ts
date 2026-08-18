import { Effect } from "effect";

import { $, collect, Signal } from "@stax-ui/dom";
import { Link, Route, Router } from "@stax-ui/router";

// =============================================================================
// Home page
// =============================================================================

const HomePage = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div(
      {},
      collect(
        $.h1({}, $.of("Welcome to Stax")),
        $.p({}, $.of("A reactive UI framework built on Effect.ts primitives.")),
        $.div(
          { class: "card" },
          collect(
            $.h2({}, $.of("Get Started")),
            $.p({}, $.of("Edit src/routes.ts to modify this page.")),
          ),
        ),
        $.div(
          { class: "card" },
          collect(
            $.h2({}, $.of("Counter")),
            $.div(
              {},
              collect(
                $.button(
                  { onClick: () => count.update((c) => c - 1) },
                  $.of("-"),
                ),
                $.span({}, $.of(count)),
                $.button(
                  { onClick: () => count.update((c) => c + 1) },
                  $.of("+"),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });

const HomeRoute = Route.make("/").pipe(Route.render(() => HomePage()));

// =============================================================================
// About page
// =============================================================================

const AboutPage = () =>
  $.div(
    {},
    collect(
      $.h1({}, $.of("About")),
      $.p({}, $.of("This is a sample Stax single-page application.")),
      $.p(
        {},
        $.of(
          "Stax is built entirely on Effect.ts primitives, providing full type safety and powerful abstractions for building reactive user interfaces.",
        ),
      ),
      $.div({ class: "card" }, Link({ href: "/" }, $.of("Back to Home"))),
    ),
  );

const AboutRoute = Route.make("/about").pipe(Route.render(() => AboutPage()));

// =============================================================================
// Router
// =============================================================================

export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
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
