import { $ } from "@effex/dom";
import { Outlet } from "@effex/router";

import { router } from "./routes.js";

export const DocLayout = () =>
  $.div(
    { class: "app" },
    Outlet({ router }),
  );
