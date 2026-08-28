import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

export interface DocsData {
  title: string;
  content: string;
}

export const DocsPage = (data: DocsData) =>
  $.div(
    $.h1(data.title),
    $.p(data.content),
    $.div(
      { class: "card" },
      $.h3("Documentation"),
      $.ul(
        $.li(Link({ href: "/docs/getting-started" }, "Getting Started")),
        $.li(Link({ href: "/docs/routing" }, "Routing")),
      ),
    ),
  );
