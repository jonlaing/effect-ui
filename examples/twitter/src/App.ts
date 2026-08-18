import { $, collect } from "@stax-ui/dom";
import { Link, Outlet } from "@stax-ui/router";

import { router } from "./routes.js";

export const App = () =>
  $.div(
    { class: "min-h-screen bg-base-200" },
    collect(
      // Navigation header
      $.div(
        { class: "navbar bg-base-100 shadow-sm" },
        collect(
          $.div(
            { class: "flex-1" },
            Link(
              { href: "/", class: "btn btn-ghost text-xl" },
              $.of("Stax Twitter"),
            ),
          ),
          $.div(
            { class: "flex-none" },
            $.ul(
              { class: "menu menu-horizontal px-1" },
              collect(
                $.li({}, Link({ href: "/" }, $.of("Feed"))),
                $.li({}, Link({ href: "/users/alice" }, $.of("Alice"))),
                $.li({}, Link({ href: "/users/bob" }, $.of("Bob"))),
                $.li({}, Link({ href: "/users/carol" }, $.of("Carol"))),
                $.li({}, Link({ href: "/users/me" }, $.of("Me"))),
                $.li(
                  {},
                  Link(
                    { href: "/posts/999", class: "text-error" },
                    $.of("404"),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      // Page content
      $.div({ class: "container mx-auto max-w-2xl p-4" }, Outlet({ router })),
    ),
  );
