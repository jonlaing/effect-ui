import { $, component, Link } from "@effex/platform";

const AboutPage = component("AboutPage", () =>
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
  ]),
);

export default AboutPage;
