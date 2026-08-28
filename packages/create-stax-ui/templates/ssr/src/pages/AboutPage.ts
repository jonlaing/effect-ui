import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

export const AboutPage = () =>
  $.div(
    $.h1("About"),
    $.p("This is a sample Stax application with server-side rendering."),
    $.p(
      "Stax is built entirely on Effect.ts primitives, providing full type safety and powerful abstractions for building reactive user interfaces.",
    ),
    $.div({ class: "card" }, Link({ href: "/" }, "Back to Home")),
  );
