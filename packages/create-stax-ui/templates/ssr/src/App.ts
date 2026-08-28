import { $ } from "@stax-ui/dom";
import { Link, Outlet } from "@stax-ui/router";

import { router } from "./routes.js";

export const App = () =>
  $.div(
    { class: "page" },
    $.nav(Link({ href: "/" }, "Home"), Link({ href: "/about" }, "About")),
    $.div(Outlet({ router })),
  );
