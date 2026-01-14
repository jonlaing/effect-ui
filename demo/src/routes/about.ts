import { $, Component, Link, Route, RouterContext } from "@effex/platform";

export const route = Route.define();

const AboutPage: Component.Unit<RouterContext> = () =>
  $.div({ class: "page" }, [
    $.h1({}, ["About Effex"]),
    $.p({}, [
      "Effex is a full-stack reactive UI framework built entirely on Effect.ts primitives.",
    ]),
    $.p({}, [
      "It provides file-based routing, server-side rendering, loaders for data fetching, ",
      "and actions for handling form submissions - all with full type safety.",
    ]),
    $.div({ class: "card" }, [$.p({}, [Link({ href: "/" }, "Back to Home")])]),
  ]);

export default AboutPage;
