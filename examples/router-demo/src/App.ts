import { $, Boundary, collect } from "@stax-ui/dom";
import { Link, Outlet } from "@stax-ui/router";

import { router } from "./routes";

export const App = () =>
  Boundary.error(
    () =>
      $.div(
        { class: "min-h-screen" },
        collect(
          // Navigation header
          $.nav(
            { class: "bg-white shadow p-4 mb-6" },
            $.div(
              { class: "max-w-4xl mx-auto flex gap-6" },
              collect(
                Link(
                  { href: "/", class: "font-bold text-lg" },
                  $.of("Router Demo"),
                ),
                Link(
                  { href: "/", class: "text-gray-600 hover:text-gray-900" },
                  $.of("Home"),
                ),
                Link(
                  {
                    href: "/about",
                    class: "text-gray-600 hover:text-gray-900",
                  },
                  $.of("About"),
                ),
                Link(
                  {
                    href: "/users",
                    class: "text-gray-600 hover:text-gray-900",
                  },
                  $.of("Users"),
                ),
                Link(
                  {
                    href: "/admin",
                    class: "text-gray-600 hover:text-gray-900",
                  },
                  $.of("Admin"),
                ),
              ),
            ),
          ),
          // Main content - render matched route
          $.main(
            { class: "max-w-4xl mx-auto px-4" },
            Outlet({
              router,
              animate: {
                enterFrom: "opacity-0 transition-opacity duration-150",
                enter: "!opacity-100",
                exit: "transition-opacity duration-150",
                exitTo: "!opacity-0",
              },
            }),
          ),
        ),
      ),
    (error) =>
      $.div(
        { class: "p-4 bg-red-100 text-red-800" },
        $.of(`An error occurred: ${String(error)}`),
      ),
  );
