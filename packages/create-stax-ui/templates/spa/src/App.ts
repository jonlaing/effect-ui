import { $, collect } from "@stax-ui/dom";
import { Link, Outlet } from "@stax-ui/router";

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
