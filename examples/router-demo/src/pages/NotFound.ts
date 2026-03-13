import { Effect } from "effect";

import { $, collect } from "@effex/dom";
import { Link } from "@effex/router";

export const NotFoundPage = () =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "space-y-4 text-center" },
      collect(
        $.h1({ class: "text-6xl font-bold text-gray-300" }, $.of("404")),
        $.h2({ class: "text-2xl font-bold" }, $.of("Page Not Found")),
        $.p(
          { class: "text-gray-600" },
          $.of("The page you're looking for doesn't exist."),
        ),
        Link(
          { href: "/", class: "text-blue-600 hover:underline" },
          $.of("Go Home"),
        ),
      ),
    );
  });
