/**
 * Shared app configuration for both dev (Vite) and production servers.
 */

import { $, Link, Routes } from "@effex/platform";

import { components, layouts, layoutComponents, routeLayouts, routes } from "./generated/routes.js";

// Re-export for convenience
export { routes, components, layouts, layoutComponents, routeLayouts };

/**
 * 404 fallback component.
 */
export const NotFound = () =>
  $.div({ class: "not-found" }, [
    $.h1({}, ["404 - Page Not Found"]),
    $.p({}, ["The page you're looking for doesn't exist."]),
    $.p({}, [Link({ href: "/" }, "Go Home")]),
  ]);

/**
 * The main application component.
 */
export const App = () =>
  Routes({
    components,
    layouts: layoutComponents,
    routeLayouts,
    fallback: NotFound,
  });

/**
 * Base document configuration (without scripts, which differ between dev/prod).
 */
export const baseDocumentConfig = {
  title: "Effex Documentation",
  styles: ["/styles.css"],
};
