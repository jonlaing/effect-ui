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
        ),
      ),
      // Matched route
      Outlet({ router }),
    ),
  );
