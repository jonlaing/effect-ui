/**
 * SSG entry point for the docs site.
 *
 * Exports router, app, and document config for buildStaticSite().
 * Also exports a render() function for the dev server.
 */

import { HttpApp, HttpRouter } from "@effect/platform";

import type { Element } from "@effex/dom";
import { Platform } from "@effex/platform";

import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

const documentOptions = {
  title: "Effex Docs",
  scripts: ["/src/client.ts"],
  styles: ["/src/styles.css"],
};

// Used by buildStaticSite() at build time
export { router };
export const app = DocLayout as unknown as () => Element.Element;
export const document = documentOptions;

// Used by the dev server during development
const effexRoutes = Platform.toHttpRoutes(router, {
  app: DocLayout as unknown as () => Element.Element,
  document: documentOptions,
});

const httpApp = HttpRouter.empty.pipe(HttpRouter.concat(effexRoutes));
const handler = HttpApp.toWebHandler(httpApp);

export async function render(request: Request): Promise<Response> {
  return handler(request);
}
