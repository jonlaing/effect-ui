import { Effect } from "effect";

import { $, collect, Element } from "@effex/dom";

import type { DocSection } from "../content.js";
import { Sidebar } from "./Sidebar.js";

export const SidebarLayout = <E, R>(
  props: { readonly sections: readonly DocSection[] },
  child: Element.Child<E, R>,
) =>
  Effect.gen(function* () {
    const layout = yield* $.div(
      { class: "drawer lg:drawer-open" },
      collect(
        $.input({ id: "nav-drawer", type: "checkbox", class: "drawer-toggle" }),
        $.main(
          { class: "drawer-content p-4" },
          collect(
            $.label(
              { for: "nav-drawer", class: "btn drawer-button lg:hidden" },
              $.of("open"),
            ),
            $.div({ class: "px-8 pb-8" }, child),
          ),
        ),

        Sidebar({ sections: props.sections }),
      ),
    );
    return layout;
  });
