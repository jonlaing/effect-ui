import { Effect } from "effect";

import { $, collect } from "@stax-ui/dom";
import { Link, Route } from "@stax-ui/router";

import { isAuthenticated } from "../auth";

// Route with guard - redirects to /login if not authenticated
export const AdminRoute = Route.make("/admin").pipe(
  Route.render(() => AdminPage()),
  Route.withGuard(isAuthenticated, { redirect: "/login" }),
);

const AdminPage = () =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "space-y-4" },
      collect(
        $.h1({ class: "text-3xl font-bold" }, $.of("Admin Dashboard")),
        $.p(
          { class: "text-gray-600" },
          $.of("Welcome to the admin area. You are authenticated!"),
        ),
        $.div(
          { class: "p-4 bg-yellow-100 rounded" },
          $.of("This page is protected by a route guard."),
        ),
        Link(
          { href: "/", class: "text-blue-600 hover:underline" },
          $.of("Back to Home"),
        ),
      ),
    );
  });
