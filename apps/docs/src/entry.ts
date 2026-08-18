/**
 * SSG entry point for the docs site.
 *
 * Exports router, app, and document config for buildStaticSite().
 * Also exports a render() function for the dev server.
 */

import { HttpApp, HttpRouter } from "@effect/platform";

import { Platform } from "@stax-ui/platform";

import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

const documentOptions = {
  title: "Stax Docs",
  scripts: ["/src/client.ts"],
  styles: ["/src/styles.css"],
  htmlAttrs: { lang: "en", "data-theme": "dark" },
};

// Used by buildStaticSite() at build time
export { router };
export const app = DocLayout;
export const document = documentOptions;

// Used by the dev server during development
const staxRoutes = Platform.toHttpRoutes(router, {
  app: DocLayout,
  document: documentOptions,
});

const httpApp = HttpRouter.empty.pipe(HttpRouter.concat(staxRoutes));
const handler = HttpApp.toWebHandler(httpApp);

export async function render(request: Request): Promise<Response> {
  return handler(request);
}
