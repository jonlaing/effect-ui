import { $, Element } from "@stax-ui/dom";

import type { DocSection } from "../content.js";
import { Sidebar } from "./Sidebar.js";

/**
 * Docs shell — mirrors HomePage's top-level layout: a Sidebar column
 * on the left (stacked on top on mobile), and a `<main>` flex column
 * on the right that scrolls with the page content.
 */
export const SidebarLayout = <E, R>(
  props: { readonly sections: readonly DocSection[] },
  child: Element.Child<E, R>,
) =>
  $.div(
    { class: "flex flex-col lg:flex-row" },
    $.div({ class: "lg:border-r" }, Sidebar({ sections: props.sections })),
    $.main(
      { class: "flex-1 flex flex-col text-base-content" },
      $.div({ class: "pt-22 lg:pt-0 px-8 pb-8" }, child),
    ),
  );
