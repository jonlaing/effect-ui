import { Effect } from "effect";
import { Menu } from "lucide-static";

import { $, Signal } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

import logoDarkSvg from "../assets/stax-logo-dark.svg?raw";
import logoLightSvg from "../assets/stax-logo-light.svg?raw";
import type { DocSection } from "../content.js";
import { NavLink } from "./NavLink.js";
import { ThemeToggle } from "./ThemeToggle.js";

/**
 * Docs sidebar. Three zones — header, doc-page list, external API
 * link — laid out as rows of a single grid. The mobile menu drives
 * the outer grid's `grid-template-rows` directly:
 *
 *   closed → `auto 0fr 0fr`   (only the header row has size)
 *   open   → `auto 1fr 1fr`   (rows expand to content)
 *   md+    → `auto 1fr auto`  (static, no animation)
 *
 * A `transition-[grid-template-rows]` on the container smoothly
 * animates the two collapsing rows from 0fr → 1fr. Each collapsible
 * child just needs `overflow-hidden` to clip its content when its
 * row is 0fr — no per-child grid-rows trick required.
 *
 * `1fr` (not `auto`) in the open state because `0fr → auto` doesn't
 * interpolate — the animation would snap on those tracks. In an
 * unconstrained mobile parent `1fr` sizes to content anyway, so
 * the visual reads the same.
 */
export const Sidebar = (props: { readonly sections: readonly DocSection[] }) =>
  Effect.gen(function* () {
    const menuOpen = yield* Signal.make(false);

    return yield* $.div(
      {
        class: "w-full lg:w-63 relative lg:h-auto",
      },
      $.div(
        {
          class: [
            "grid grid-cols-1 lg:h-screen",
            // Row-template state machine (see block comment above).
            "grid-rows-[auto_0fr_0fr] data-[menu-open=true]:grid-rows-[auto_1fr_auto] max-h-screen",
            "lg:grid-rows-[auto_1fr_auto]",
            "w-full lg:w-63 lg:gap-6 bg-base-100 lg:px-0 fixed",
            "shadow-md lg:shadow-none z-50 overflow-hidden",
          ],
          "data-menu-open": menuOpen,
        },
        // ─── Header: logo + theme toggle + mobile hamburger ──────────
        $.div(
          {
            class: [
              "flex items-center justify-start lg:justify-between gap-4",
              "p-4 lg:pl-8 lg:pr-5 py-7 border-b",
              "lg:border-b",
            ],
          },
          Link(
            { href: "/" },
            $.div({
              class: "[&_svg]:h-4 [&_svg]:w-auto stax-logo-light",
              innerHTML: logoLightSvg,
            }),
            $.div({
              class: "[&_svg]:h-4 [&_svg]:w-auto stax-logo-dark",
              innerHTML: logoDarkSvg,
            }),
          ),
          ThemeToggle(),
          $.div(
            { class: "flex-1 lg:hidden text-right" },
            $.button({
              onClick: () => menuOpen.update((prev) => !prev),
              innerHTML: Menu,
            }),
          ),
        ),
        // ─── Doc-page list ──────────────────────────────────────────
        // `overflow-hidden` clips when the row is 0fr; `md:overflow-y-auto`
        // restores scrolling when the desktop layout gives it a `1fr` row.
        $.nav(
          { class: "overflow-y-auto " },
          $.div(
            {
              class: ["p-4 pt-6", "lg:pl-8 lg:pr-5 lg:pb-7"],
            },
            props.sections.map((section) =>
              $.div(
                { class: "mb-8" },
                $.h3(
                  {
                    class: [
                      "text-caption-2 font-semibold uppercase tracking-widest",
                      "text-neutral mb-4",
                    ],
                  },
                  section.name,
                ),
                $.ul(
                  { class: "flex flex-col items-stretch gap-1" },
                  section.pages.map((page) =>
                    $.li(
                      NavLink(
                        { href: `/docs/${page.slug}`, active: "exact" },
                        page.title,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        // ─── API reference ──────────────────────────────────────────
        $.div(
          { class: "overflow-hidden border-b md:border-b-none" },
          $.ul(
            {
              class: [
                "p-4 pt-6 lg:pl-8 lg:pr-5 lg:pb-7",
                "flex flex-col gap-3 items-stretch",
                "border-t",
              ],
            },
            $.li(
              Link(
                {
                  href: "https://stax-api.pages.dev",
                  target: "_blank",
                  class: [
                    "text-nav text-base-content/50 hover:underline",
                    "flex items-center gap-2",
                  ],
                },
                "API Reference",
              ),
            ),
          ),
        ),
      ),
    );
  });
