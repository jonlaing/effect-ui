/**
 * Vite SSR entry point.
 *
 * Exports a `render` function that the effexPlatform plugin's
 * dev server calls to handle incoming requests.
 */

import { HttpApp, HttpRouter } from "@effect/platform";
import { Layer } from "effect";

import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";
import { PostService, PostServiceLive } from "./services/PostService.js";

const effexRoutes = Platform.toHttpRoutes(router, {
  app: App,
  document: {
    title: "Twitter Demo",
    scripts: ["/src/client.ts"],
    head: '<link rel="stylesheet" href="/src/styles.css">',
  },
});

const app = HttpRouter.empty.pipe(HttpRouter.concat(effexRoutes));

const PostServiceLayer = Layer.scoped(PostService, PostServiceLive);

const { handler } = HttpApp.toWebHandlerLayer(app, PostServiceLayer);

/**
 * Handle an incoming request and return the Response.
 */
export async function render(request: Request): Promise<Response> {
  return handler(request);
}
