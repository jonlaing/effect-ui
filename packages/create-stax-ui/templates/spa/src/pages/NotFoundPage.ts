import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

export const NotFoundPage = () =>
  $.div($.h1("404 — Not Found"), Link({ href: "/" }, "Go Home"));
