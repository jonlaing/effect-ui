import { Effect } from "effect";

import { $, collect } from "@effex/dom";
import { Link } from "@effex/router";

export const NotFoundPage = () =>
  Effect.gen(function* () {
    const page = yield* $.div(
      { class: "max-w-2xl mx-auto px-6 py-32 text-center" },
      collect(
        $.h1(
          { class: "text-3xl font-bold mb-4" },
          $.of("404 — Page Not Found"),
        ),
        $.p(
          {},
          Link({ href: "/", class: "link link-primary" }, $.of("Back to Home")),
        ),
      ),
    );
    return page;
  });
