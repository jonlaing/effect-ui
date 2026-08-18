import { $, Element } from "@stax-ui/dom";

import type { DocSection } from "../content.js";
import { Sidebar } from "./Sidebar.js";

export const SidebarLayout = <E, R>(
  props: { readonly sections: readonly DocSection[] },
  child: Element.Child<E, R>,
) =>
  $.div(
    { class: "drawer lg:drawer-open" },
    $.input({ id: "nav-drawer", type: "checkbox", class: "drawer-toggle" }),
    $.main(
      { class: "drawer-content p-4" },
      $.label(
        { for: "nav-drawer", class: "btn drawer-button lg:hidden" },
        "open",
      ),
      $.div({ class: "px-8 pb-8" }, child),
    ),
    Sidebar({ sections: props.sections }),
  );
