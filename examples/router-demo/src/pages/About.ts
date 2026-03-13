import { Effect } from "effect";

import { $, collect } from "@effex/dom";
import { Link, Route } from "@effex/router";

export const AboutRoute = Route.make("/about").pipe(
  Route.render(() => AboutPage()),
);

const AboutPage = () =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "space-y-4" },
      collect(
        $.h1({ class: "text-3xl font-bold" }, $.of("About")),
        $.p(
          { class: "text-gray-600" },
          $.of(
            "This is a simple demo application to test the Effex router package.",
          ),
        ),
        $.p(
          { class: "text-gray-600" },
          $.of(
            "It demonstrates client-side navigation, route params, and layouts.",
          ),
        ),
        Link(
          { href: "/", class: "text-blue-600 hover:underline" },
          $.of("Back to Home"),
        ),
      ),
    );
  });
