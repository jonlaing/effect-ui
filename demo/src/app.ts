/**
 * Shared app configuration for both dev (Vite) and production servers.
 */
import { $, Link, Routes } from "@effex/platform";
import { routes, components } from "./generated/routes.js";

// Re-export for convenience
export { routes, components };

/**
 * 404 fallback component.
 */
export const NotFound = () =>
  $.div({ class: "page" }, [
    $.h1({}, ["404 - Page Not Found"]),
    $.p({}, ["The page you're looking for doesn't exist."]),
    $.p({}, [Link({ href: "/" }, "Go Home")]),
  ]);

/**
 * The main application component.
 */
export const App = () => Routes({ components, fallback: NotFound });

/**
 * Base document configuration (without scripts, which differ between dev/prod).
 */
export const baseDocumentConfig = {
  title: "Effex Demo",
  styles: ["/styles.css"],
};
