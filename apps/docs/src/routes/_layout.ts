import { Effect } from "effect";

import { $, Component, Link, Outlet, Router } from "@effex/platform";

import { getNavigation } from "../lib/navigation.js";

/**
 * Root layout with navigation sidebar.
 */
export default Component.gen(function* () {
  const router = yield* Router.Router;
  const pathname = router.pathname;

  // Get navigation from docs content
  const navigation = getNavigation();

  // Build sidebar sections
  const sidebarSections = yield* Effect.all(
    navigation.map((section) =>
      Effect.gen(function* () {
        const items = yield* Effect.all(
          section.items.map((item) =>
            Effect.gen(function* () {
              const isActive = pathname.map((p) => p === item.href);
              const linkClass = isActive.map((active) =>
                active ? "nav-link active" : "nav-link",
              );
              return yield* $.li(
                {},
                Link({ href: item.href, class: linkClass }, item.label),
              );
            }),
          ),
        );

        return yield* $.div({ class: "nav-section" }, [
          $.h4({ class: "nav-section-title" }, [section.title]),
          $.ul({}, items),
        ]);
      }),
    ),
  );

  return yield* $.div({ class: "layout" }, [
    $.header({ class: "header" }, [
      $.div({ class: "header-content" }, [
        Link({ href: "/", class: "logo" }, "Effex"),
        $.nav({ class: "header-nav" }, [
          Link({ href: "/docs/getting-started" }, "Docs"),
          $.a(
            { href: "https://github.com/jonlaing/effex", target: "_blank" },
            "GitHub",
          ),
        ]),
      ]),
    ]),
    $.div({ class: "main-container" }, [
      $.aside({ class: "sidebar" }, [
        $.nav({ class: "sidebar-nav" }, sidebarSections),
      ]),
      $.main({ class: "content" }, [Outlet()]),
    ]),
  ]);
});
