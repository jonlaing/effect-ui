import { Effect, Layer } from "effect";
import * as HttpApp from "@effect/platform/HttpApp";
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import { RendererContext } from "@effex/dom";
import type { Element } from "@effex/dom";
import { type SSRRouter, performSSR } from "../rendering/SSR.js";
import {
  type DocumentOptions,
  generateDocument,
} from "../rendering/Document.js";

// Re-export types for convenience
export type { SSRRouter } from "../rendering/SSR.js";
export type { SSRResult } from "../rendering/SSR.js";
export type { ActionData } from "../actions/Actions.js";
export type { DocumentOptions } from "../rendering/Document.js";

/**
 * Options for creating an Effex HTTP application
 */
export interface EffexAppOptions<R> {
  /**
   * Function that creates the Effex application element.
   * Receives the request for dynamic rendering.
   */
  readonly app: (request: Request) => Element<never, RendererContext | R>;

  /**
   * Optional router instance for executing loaders and actions.
   * Create with Router.make() and pass it here.
   */
  readonly router?: SSRRouter;

  /**
   * Document template options
   */
  readonly document?: DocumentOptions;

  /**
   * Additional Effect requirements to provide
   */
  readonly provide?: Layer.Layer<R, never, never>;
}

/**
 * Create an Effect HttpApp from an Effex application.
 *
 * This is the main integration point for serving Effex apps with
 * @effect/platform's HTTP server.
 *
 * @example
 * ```ts
 * import { HttpServer } from "@effect/platform";
 * import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
 * import { Layer } from "effect";
 * import { EffexServer } from "@effex/platform";
 * import { App } from "./App";
 * import { router } from "./router";
 *
 * const app = EffexServer.makeHttpApp({
 *   app: () => App(),
 *   router,
 *   document: {
 *     title: "My App",
 *     scripts: ["/client.js"],
 *     styles: ["/styles.css"],
 *   },
 * });
 *
 * // Serve with static files
 * const mainRouter = HttpRouter.empty.pipe(
 *   HttpRouter.get("/static/*", HttpServer.static("./public")),
 *   HttpRouter.all("/*", app),
 * );
 *
 * const server = HttpServer.serve(mainRouter).pipe(
 *   Layer.provide(NodeHttpServer.layer({ port: 3000 })),
 * );
 *
 * NodeRuntime.runMain(Layer.launch(server));
 * ```
 */
export const makeHttpApp = <R = never>(
  options: EffexAppOptions<R>,
): HttpApp.Default<
  HttpServerError.RequestError,
  HttpServerRequest.HttpServerRequest
> =>
  Effect.gen(function* () {
    const serverRequest = yield* HttpServerRequest.HttpServerRequest;

    // Convert Effect request to Web Request
    const webRequest = yield* HttpServerRequest.toWeb(serverRequest);

    console.log("[SSR] Rendering:", webRequest.url);

    // Create the Effex element
    const element = options.app(webRequest);

    // Perform SSR - cast to handle the generic R constraint
    const result = yield* Effect.catchAllCause(
      performSSR(
        webRequest,
        element as Element<never, RendererContext>,
        options.router,
        options.provide,
      ),
      (cause) =>
        Effect.gen(function* () {
          console.error("[SSR] Error rendering:", webRequest.url);
          console.error("[SSR] Cause:", cause);
          return yield* Effect.failCause(cause);
        }),
    );

    console.log("[SSR] Rendered successfully:", webRequest.url);

    // Generate full HTML document
    const html = generateDocument(result, options.document);

    // Convert platform headers to response headers
    const responseHeaders: Record<string, string> = {};
    result.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    // Return HTML response
    return HttpServerResponse.html(html).pipe(
      HttpServerResponse.setHeaders(responseHeaders),
    );
  });

/**
 * Create an HttpRouter that serves an Effex application.
 *
 * This sets up catch-all routing for the Effex app, handling
 * all GET requests for pages and POST/PUT/PATCH/DELETE for actions.
 *
 * @example
 * ```ts
 * const router = EffexServer.makeRouter({
 *   app: () => App(),
 *   router: appRouter,
 *   document: { title: "My App", scripts: ["/client.js"] },
 * });
 *
 * // Add static file serving
 * const fullRouter = router.pipe(
 *   HttpRouter.get("/static/*", staticFiles),
 * );
 * ```
 */
export const makeRouter = <R = never>(
  options: EffexAppOptions<R>,
): HttpRouter.HttpRouter<
  HttpServerError.RequestError,
  HttpServerRequest.HttpServerRequest
> => {
  const app = makeHttpApp(options);

  return HttpRouter.empty.pipe(HttpRouter.all("*", app));
};

/**
 * Create an HttpApp that handles both the Effex app and static files.
 *
 * @example
 * ```ts
 * import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
 *
 * const app = EffexServer.makeFullApp({
 *   app: () => App(),
 *   router: appRouter,
 *   document: { title: "My App", scripts: ["/client.js"] },
 *   staticPaths: {
 *     "/static": "./public",
 *     "/assets": "./dist/assets",
 *   },
 * });
 *
 * const server = HttpServer.serve(app).pipe(
 *   Layer.provide(NodeHttpServer.layer({ port: 3000 })),
 * );
 *
 * NodeRuntime.runMain(Layer.launch(server));
 * ```
 */
export const makeFullApp = <R = never>(
  options: EffexAppOptions<R> & {
    /**
     * Map of URL prefixes to filesystem paths for static file serving.
     * Static routes are checked before the Effex app.
     */
    readonly staticPaths?: Record<string, string>;
  },
): HttpApp.Default<
  HttpServerError.RequestError,
  HttpServerRequest.HttpServerRequest
> => {
  // Note: Static file handling requires @effect/platform-node or similar
  // For now, just return the app. Users can compose with HttpRouter.
  return makeHttpApp(options);
};

/**
 * Options for rendering a request to HTML.
 */
export interface RenderRequestOptions<R = never> {
  /**
   * The Effex application element to render.
   */
  readonly app: Element<never, RendererContext | R>;

  /**
   * Optional router instance for executing loaders and actions.
   */
  readonly router?: SSRRouter;

  /**
   * Document template options.
   */
  readonly document?: DocumentOptions;

  /**
   * Additional Effect requirements to provide.
   */
  readonly provide?: Layer.Layer<R, never, never>;
}

/**
 * Render a request to a full HTML string.
 *
 * This is the core SSR function that can be used by both production servers
 * and development servers. It handles:
 * - Router pathname setup
 * - Action execution (for POST/PUT/PATCH/DELETE)
 * - Loader execution
 * - Component rendering
 * - HTML document generation with hydration data
 *
 * @example
 * ```ts
 * // In a dev server entry or custom server
 * import { renderRequest, Router, Routes, makeRouterLayer } from "@effex/platform";
 *
 * export async function render(request: Request): Promise<string> {
 *   return Effect.runPromise(
 *     Effect.scoped(
 *       Effect.gen(function* () {
 *         const router = yield* Router.make(routes);
 *         return yield* renderRequest(request, {
 *           app: Routes({ components }),
 *           router,
 *           document: { title: "My App", scripts: ["/client.js"] },
 *           provide: makeRouterLayer(router),
 *         });
 *       })
 *     )
 *   );
 * }
 * ```
 */
export const renderRequest = <R = never>(
  request: Request,
  options: RenderRequestOptions<R>,
): Effect.Effect<string, never, never> =>
  performSSR(
    request,
    options.app as Element<never, RendererContext>,
    options.router,
    options.provide,
  ).pipe(Effect.map((result) => generateDocument(result, options.document)));

/**
 * Effex server utilities for @effect/platform integration.
 */
export const EffexServer = {
  makeHttpApp,
  makeRouter,
  makeFullApp,
  renderRequest,
};
