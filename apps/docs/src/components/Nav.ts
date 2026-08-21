import { Effect } from "effect";
import { Menu } from "lucide-static";

import { $, Signal } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

import logoDarkSvg from "../assets/stax-logo-dark.svg?raw";
import logoLightSvg from "../assets/stax-logo-light.svg?raw";
import { NavLink } from "./NavLink.js";
import { ThemeToggle } from "./ThemeToggle";

export const Nav = () =>
  Effect.gen(function* () {
    const menuOpen = yield* Signal.make(false);

    return yield* $.div(
      {
        class: "w-full lg:w-63 relative md:h-28 lg:h-auto",
      },
      $.div(
        {
          class: [
            "md:grid grid-cols-1 grid-rows-[auto_auto_1fr] md:grid-cols-2 md:grid-rows-[auto_auto] lg:grid-cols-1 lg:grid-rows-[auto_auto_1fr] lg:h-screen overflow-y-auto",
            "w-full lg:w-63 gap-6 md:gap-0 lg:gap-6 bg-base-100 md:px-8 lg:px-0 fixed",
            "bg-base-100 shadow-md lg:shadow-none z-50 md:pb-4 lb:pb-0",
          ],
        },
        $.div(
          {
            class: [
              "flex items-center justify-start lg:justify-between gap-4",
              "p-4",
              "md:pl-0 md:pr-0 md:py-4 lg:pl-8 lg:pr-5 py-7 border-b col-start-1 row-start-1",
              "md:border-b-none lg:border-b",
            ],
          },
          $.div(
            { class: "flex items-end gap-2" },
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
            $.span(
              {
                class:
                  "text-[10px] text-base-content/50 uppercase leading-none -translate-y-0.5 tracking-wider",
              },
              "beta",
            ),
          ),
          ThemeToggle(),
          $.div(
            {
              class: "flex-1 md:hidden text-right",
            },
            $.button({
              onClick: () => menuOpen.update((prev) => !prev),
              innerHTML: Menu,
            }),
          ),
        ),
        $.nav(
          {
            class: [
              "col-start-1 row-start-2 md:col-span-2 lg:col-span-1",
              "grid md:block grid-rows-[0fr] data-[menu-open=true]:grid-rows-[1fr]",
              "transition-all",
            ],
            "data-menu-open": menuOpen,
          },
          $.div(
            {
              class: ["overflow-hidden"],
            },
            $.div(
              {
                class: [
                  "p-4 border-b md:border-t lg:border-t-0",
                  "md:pl-0 md:pr-0 md:py-2 lg:pl-8 lg:pr-5 lg:pb-7",
                ],
              },
              $.ul(
                {
                  class:
                    "w-full flex flex-col md:flex-row lg:flex-col gap-4 items-stretch md:justify-between lg:justify-start",
                },
                $.li(NavLink({ href: "/docs/quick-start" }, "Quick Start")),
                $.li(NavLink({ href: "/docs/introduction" }, "About Stax")),
                $.li(
                  NavLink(
                    { href: "/docs/02-todo-app/00-introduction" },
                    "Tutorial",
                  ),
                ),
                $.li(NavLink({ href: "/docs" }, "Documentation")),
                $.li(
                  NavLink(
                    { href: "https://stax-api.pages.dev/" },
                    "API Reference",
                  ),
                ),
              ),
            ),
          ),
        ),
        $.div(
          {
            class: [
              "col-start-1 row-start-3 md:col-start-2 md:row-start-1 lg:col-start-1 lg:row-start-3",
              "grid grid-rows-[0fr] md:block data-[menu-open=true]:grid-rows-[1fr] transition-all",
              "border-b md:border-b-0",
            ],
            "data-menu-open": menuOpen,
          },
          $.div(
            { class: "overflow-hidden" },
            $.ul(
              {
                class: [
                  "p-4 md:pl-0 md:pr-0 md:py-4 lg:pl-8 lg:pr-5 lg:pb-7 flex flex-col gap-3 items-stretch",
                  "md:flex-row md:justify-end md:items-center md:gap-4",
                  "lg:flex-col lg:items-start lg:justify-start",
                  "col-start-1 row-start-3 md:col-start-2 md:row-start-1 lg:col-start-1 lg:row-start-3",
                ],
              },
              $.li(
                Link(
                  {
                    href: "https://github.com/stax-ui/stax",
                    target: "_blank",
                    class: "text-nav text-base-content/50 hover:underline",
                  },
                  "GitHub Repository",
                ),
              ),
              $.li(
                Link(
                  {
                    href: "/contact",
                    class: "text-nav text-base-content/50 hover:underline",
                  },
                  "Contact Us",
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });
