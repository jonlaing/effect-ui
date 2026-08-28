import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

export interface AboutData {
  title: string;
}

export const AboutPage = (data: AboutData) =>
  $.div(
    $.h1(data.title),
    $.p(
      "This is a statically generated Stax site. Every page is pre-rendered at build time.",
    ),
    $.div({ class: "card" }, Link({ href: "/" }, "Back to Home")),
  );
