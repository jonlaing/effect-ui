import { Effect } from "effect";

import { $, collect } from "@effex/dom";
import { Link, Route } from "@effex/router";

export const HomeRoute = Route.make("/").pipe(Route.render(() => HomePage()));

const HomePage = () =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "space-y-4" },
      collect(
        $.h1({ class: "text-3xl font-bold" }, $.of("Welcome to Router Demo")),
        $.p(
          { class: "text-gray-600" },
          $.of("This demo shows off the @effex/router package."),
        ),
        $.div(
          { class: "flex gap-4" },
          collect(
            Link(
              { href: "/about", class: "text-blue-600 hover:underline" },
              $.of("About"),
            ),
            Link(
              { href: "/users", class: "text-blue-600 hover:underline" },
              $.of("View Users"),
            ),
          ),
        ),
      ),
    );
  });
