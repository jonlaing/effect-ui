import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

export const NotFoundPage = () =>
  $.div(
    { class: "max-w-2xl mx-auto px-6 py-32 text-center" },
    $.h1({ class: "text-3xl font-bold mb-4" }, "404 — Page Not Found"),
    $.p({}, Link({ href: "/", class: "link link-primary" }, "Back to Home")),
  );
