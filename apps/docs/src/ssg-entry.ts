/**
 * SSG entry point for static site generation.
 */

import {
  App,
  baseDocumentConfig,
  components,
  layoutComponents,
  routeLayouts,
  routes,
} from "./app.js";
import { staticRouteConfig } from "./generated/routes.js";

// Re-export for SSG build
export { routes, staticRouteConfig, components, layoutComponents, routeLayouts };

/**
 * Create the app wrapped with router context.
 */
export const createApp = () => App();

/**
 * Generate the full HTML document for a static page.
 */
export const generateDocument = async (page: {
  html: string;
  loaderDataScript: string;
  path: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${baseDocumentConfig.title}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div id="root">${page.html}</div>
    <script>
      window.__EFFEX_LOADER_DATA__ = ${page.loaderDataScript};
    </script>
    <script type="module" src="/client.js"></script>
  </body>
</html>`;
};
