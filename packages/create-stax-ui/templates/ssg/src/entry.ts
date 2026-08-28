/**
 * SSG entry point.
 *
 * Exports the router, app, and document config for buildStaticSite().
 * Also exports a `render` function for the dev server.
 */

import { HttpApp, HttpRouter } from "@effect/platform";

import { Platform } from "@stax-ui/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

// Used by buildStaticSite() at build time
export { router };
export const app = App;
export const document = {
  title: "Stax App",
  scripts: ["/src/client.ts"],
  styles: ["/styles.css"],
};

// Used by the dev server during development
const staxRoutes = Platform.toHttpRoutes(router, { app, document });
const httpApp = HttpRouter.empty.pipe(HttpRouter.concat(staxRoutes));
const handler = HttpApp.toWebHandler(httpApp);

export async function render(request: Request): Promise<Response> {
  return handler(request);
}
