import { Effect } from "effect";
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
        $.li({}, ["Server-side rendering"]),
        $.li({}, ["Loaders for data fetching"]),
        $.li({}, ["Actions for form handling"]),
        $.li({}, ["Seamless hydration"]),
      ]),
    ]),
    $.div({ class: "card" }, [
      $.h2({}, ["Navigation"]),
      $.ul({}, [
        $.li({}, [Link({ href: "/about" }, "About")]),
        $.li({}, [Link({ href: "/users/1" }, "User Profile")]),
        $.li({}, [Link({ href: "/contacts" }, "Contact Form")]),
      ]),
    ]),
  ]),
);

export default HomePage;
