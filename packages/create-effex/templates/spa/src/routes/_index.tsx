import { $, component, Link } from "@effex/platform";

const HomePage = component("HomePage", () =>
  $.div({ class: "page" }, [
    $.h1({}, ["Welcome to Effex"]),
    $.p({}, ["A reactive UI framework built on Effect.ts primitives."]),
    $.div({ class: "card" }, [
      $.h2({}, ["Get Started"]),
      $.p({}, ["Edit src/routes/_index.tsx to modify this page."]),
    ]),
    $.div({ class: "card" }, [
      $.h2({}, ["Features"]),
      $.ul({}, [
        $.li({}, ["File-based routing"]),
        $.li({}, ["Client-side rendering"]),
        $.li({}, ["Reactive signals"]),
        $.li({}, ["Type-safe forms"]),
      ]),
    ]),
    $.div({ class: "card" }, [
      $.h2({}, ["Navigation"]),
      $.ul({}, [$.li({}, [Link({ href: "/about" }, "About")])]),
    ]),
  ]),
);

export default HomePage;
