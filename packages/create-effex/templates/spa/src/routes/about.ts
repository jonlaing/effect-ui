import { $, Component } from "@effex/dom";
import { Link, Route } from "@effex/router";

export const route = Route.define();

const AboutPage = Component.gen(function* () {
  return yield* $.div({ class: "page" }, [
    $.h1("About"),
    $.p("This is a sample Effex single-page application."),
    $.p([
      "Effex is built entirely on Effect.ts primitives, providing full type safety ",
      "and powerful abstractions for building reactive user interfaces.",
    ]),
    $.div({ class: "card" }, [$.p(Link({ href: "/" }, "Back to Home"))]),
  ]);
});

export default AboutPage;
