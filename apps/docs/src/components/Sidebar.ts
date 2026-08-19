import { ExternalLink, NotebookText } from "lucide-static";

import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

import logoDarkSvg from "../assets/stax-logo-dark.svg?raw";
import logoLightSvg from "../assets/stax-logo-light.svg?raw";
import type { DocSection } from "../content.js";
import { ThemeToggle } from "./ThemeToggle.js";

export const Sidebar = (props: { readonly sections: readonly DocSection[] }) =>
  $.div(
    { class: "drawer-side" },
    $.label({ for: "nav-drawer", class: "drawer-overlay" }),
    $.div(
      { class: "pt-6 bg-base-200 h-screen flex flex-col" },
      $.div(
        { class: "pb-6 px-4 border-b border-neutral-500/50 flex items-center" },
        Link(
          { href: "/", class: "flex gap-2 items-center group flex-1" },
          $.div({
            class:
              "[&_svg]:h-8 [&_svg]:w-auto group-hover:-translate-y-1 transition-transform stax-logo-dark",
            innerHTML: logoDarkSvg,
          }),
          $.div({
            class:
              "[&_svg]:h-8 [&_svg]:w-auto group-hover:-translate-y-1 transition-transform stax-logo-light",
            innerHTML: logoLightSvg,
          }),
          $.div(
            {
              class: [
                "uppercase tracking-widest px-2 py-1 rounded bg-primary -rotate-3 shadow",
                "group-hover:rotate-0 group-hover:shadow-lg transition-transform",
              ],
            },
            "Docs",
          ),
        ),
        ThemeToggle(),
      ),
      $.nav(
        { class: "flex-1 overflow-y-auto p-4" },
        props.sections.map((section) =>
          $.div(
            { class: "mb-5" },
            $.h3(
              {
                class:
                  "text-xs font-semibold uppercase tracking-wide text-base-content/75 mb-1.5",
              },
              section.name,
            ),
            $.ul(
              { class: "menu menu-sm p-0" },
              section.pages.map((page) =>
                $.li(
                  {},
                  Link(
                    {
                      href: `/docs/${page.slug}`,
                      class: "text-base-content/60 hover:text-primary",
                    },
                    $.i({
                      class: "[&_svg]:w-4 [&_svg]:h-4",
                      innerHTML: NotebookText,
                    }),
                    $.span({}, page.title),
                  ),
                ),
              ),
            ),
          ),
        ),
        $.a(
          {
            href: "https://stax-api.pages.dev",
            class:
              "mt-4 text-sm text-base-content/50 hover:text-primary transition-colors flex items-center gap-2",
          },
          $.span({
            class: "[&_svg]:w-4 [&_svg]:h-4",
            innerHTML: ExternalLink,
          }),
          $.span({}, "API Reference"),
        ),
      ),
    ),
  );
