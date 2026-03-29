import { $ } from "@effex/dom";
import { Outlet } from "@effex/router";

import { router } from "./routes.js";

export const DocLayout = () =>
  $.div(
    { class: "min-h-screen bg-base-100 text-base-content" },
    Outlet({ router }),
  );
