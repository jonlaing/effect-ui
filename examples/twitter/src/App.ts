import { $, collect } from "@effex/dom";
import { Link, Outlet } from "@effex/router";

import { router } from "./routes.js";

export const App = () =>
  $.div(
    {},
    collect(
      // Navigation header
      $.nav(
        {},
        collect(
          Link({ href: "/" }, $.of("Feed")),
          $.of(" | "),
          Link({ href: "/users/alice" }, $.of("Alice")),
          $.of(" | "),
          Link({ href: "/users/bob" }, $.of("Bob")),
          $.of(" | "),
          Link({ href: "/users/carol" }, $.of("Carol")),
          $.of(" | "),
          Link({ href: "/users/me" }, $.of("Me (redirect)")),
          $.of(" | "),
          Link({ href: "/posts/999" }, $.of("Bad Post (404)")),
        ),
      ),
      // Matched route
      Outlet({ router }),
    ),
  );
