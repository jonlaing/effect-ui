/**
 * SSG Entry Point
 *
 * This file configures Static Site Generation for your Effex app.
 * The `effex build` command uses this to generate static HTML files.
 *
 * To enable SSG for a route:
 * 1. Use Route.define({ static: true }) in your route file
 * 2. For dynamic routes, also export a staticPaths function
 *
 * @example
 * ```ts
 * // routes/blog.$slug.ts
 * export const route = Route.define({
 *   static: true,
 *   params: Schema.Struct({ slug: Schema.String }),
 * });
 *
 * export const staticPaths = async () => [
 *   { slug: "hello-world" },
 *   { slug: "getting-started" },
 * ];
 *
 * export default BlogPost;
 * ```
 */

import type { StaticPage } from "@effex/platform/server";

import { App, baseDocumentConfig } from "./app.js";
// @ts-expect-error - staticRouteConfig only exists when routes use Route.define
import { components, routes, staticRouteConfig } from "./generated/routes.js";

// Re-export routes configuration
export { routes, components };

// staticRouteConfig is generated when routes use Route.define({ static: true })
// If no routes use Route.define, this will be undefined and SSG will be skipped
export { staticRouteConfig };

/**
 * Wrap route components in the app shell.
 */
export const createApp = () => App();

/**
 * Generate the full HTML document for a static page.
 */
export const generateDocument = (page: StaticPage) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseDocumentConfig.title}</title>
    ${baseDocumentConfig.styles.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n    ")}
  </head>
  <body>
    <div id="root">${page.html}</div>
    <script>
      window.__EFFEX_LOADER_DATA__ = ${page.loaderDataScript};
      window.__EFFEX_ACTION_DATA__ = null;
    </script>
    <script type="module" src="/assets/client.js"></script>
  </body>
</html>`;
