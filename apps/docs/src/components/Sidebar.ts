import { NotebookText } from "lucide-static";

import { $, collect } from "@effex/dom";
import { Link } from "@effex/router";

import logoSvg from "../assets/effex-logo-dark.svg?raw";
import type { DocSection } from "../content.js";

export const Sidebar = (props: { readonly sections: readonly DocSection[] }) =>
  $.div(
    { class: "drawer-side" },
    collect(
      $.label({
        for: "nav-drawer",
        class: "drawer-overlay",
      }),
      $.div(
        { class: "pt-6 bg-base-200 h-screen flex flex-col" },
        collect(
          $.div(
            { class: "pb-6 px-4 border-b border-neutral-500/50" },
            Link(
              { href: "/", class: "flex gap-2 items-center group" },
              collect(
                $.div({
                  class:
                    "[&_svg]:h-8 [&_svg]:w-auto group-hover:-translate-y-1 transition-transform",
                  innerHTML: logoSvg,
                }),
                $.div(
                  {
                    class: [
                      "uppercase tracking-widest px-2 py-1 rounded bg-primary -rotate-3 shadow",
                      "group-hover:rotate-0 group-hover:shadow-lg transition-transform",
                    ],
                  },
                  $.of("Docs"),
                ),
              ),
            ),
          ),
          $.nav(
            { class: "flex-1 overflow-y-auto p-4" },
            collect(
              ...props.sections.map((section) =>
                $.div(
                  { class: "mb-5" },
                  collect(
                    $.h3(
                      {
                        class:
                          "text-xs font-semibold uppercase tracking-wide text-base-content/75 mb-1.5",
                      },
                      $.of(section.name),
                    ),
                    $.ul(
                      { class: "menu menu-sm p-0" },
                      collect(
                        ...section.pages.map((page) =>
                          $.li(
                            {},
                            Link(
                              {
                                href: `/docs/${page.slug}`,
                                class:
                                  "text-base-content/60 hover:text-primary",
                              },
                              collect(
                                $.i({
                                  class: "[&_svg]:w-4 [&_svg]:h-4",
                                  innerHTML: NotebookText,
                                }),
                                $.span({}, $.of(page.title)),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
