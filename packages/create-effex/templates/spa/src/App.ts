import { $, collect } from "@effex/dom";
import { Link, Outlet } from "@effex/router";

import { router } from "./routes.js";

export const App = () =>
  $.div(
    { class: "page" },
    collect(
      $.nav(
        {},
        collect(
          Link({ href: "/" }, $.of("Home")),
          $.of(" | "),
          Link({ href: "/about" }, $.of("About")),
        ),
      ),
      $.div({}, Outlet({ router })),
    ),
  );
