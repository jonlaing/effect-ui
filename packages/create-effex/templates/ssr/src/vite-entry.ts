/**
 * Vite SSR entry point.
 *
 * Exports a `render` function that the effexPlatform plugin's
 * dev server calls to handle incoming requests.
 */

import { HttpApp, HttpRouter } from "@effect/platform";

import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

const effexRoutes = Platform.toHttpRoutes(router, {
  app: App,
  document: {
    title: "Effex App",
    scripts: ["/src/client.ts"],
    styles: ["/styles.css"],
  },
});

const app = HttpRouter.empty.pipe(HttpRouter.concat(effexRoutes));

const { handler } = HttpApp.toWebHandlerLayer(app);

/**
 * Handle an incoming request and return the Response.
 */
export async function render(request: Request): Promise<Response> {
  return handler(request);
}
