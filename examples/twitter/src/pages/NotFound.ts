import { $, collect } from "@effex/dom";
import { Link } from "@effex/router";

export const NotFoundPage = () =>
  $.div(
    {},
    collect(
      $.h1({}, $.of("404 — Not Found")),
      $.p({}, Link({ href: "/" }, $.of("Go home"))),
    ),
  );
