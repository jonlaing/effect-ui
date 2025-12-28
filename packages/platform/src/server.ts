import { Effect, Layer, Option } from "effect";
import * as HttpApp from "@effect/platform/HttpApp";
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import { RendererContext } from "@effex/dom";
import type { Element } from "@effex/dom";
import { renderToString } from "@effex/dom/server";
import {
  makeServerPlatformContext,
  PlatformContext,
  type PlatformContextType,
} from "./Platform.js";
import {
  type LoaderData,
  LoaderContextTag,
  makeLoaderContext,
} from "./RouteLoader.js";
import { serializeForHtmlSync } from "./Serialization.js";

/**
 * Router interface for SSR (avoids cross-package Effect type issues)
 */
interface SSRRouter {
  executeLoader: () => Effect.Effect<
    { routeName: string; params: unknown; data: unknown } | null,
    unknown,
    unknown
  >;
  executeAction: (
    routeName: string,
    formData: FormData,
    request: Request,
  ) => Effect.Effect<
    { routeName: string; data: unknown } | null,
    unknown,
    unknown
  >;
  currentRoute: { get: Effect.Effect<Option.Option<string>> };
  pathname: { get: Effect.Effect<string> };
}

/**
 * Action data structure for hydration
 */
export interface ActionData {
  routeName: string;
  data: unknown;
  timestamp: number;
}

/**
 * Result of server-side rendering
 */
export interface SSRResult {
  readonly html: string;
  readonly loaderData: LoaderData;
  readonly loaderDataScript: string;
  readonly actionData: ActionData | null;
  readonly actionDataScript: string;
  readonly headers: Headers;
  readonly platformContext: PlatformContextType;
}

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
 * Options for HTML document generation
 */
export interface DocumentOptions {
  title?: string;
  scripts?: string[];
  styles?: string[];
  head?: string;
  bodyAttributes?: string;
  rootId?: string;
}

/**
 * Perform SSR for a request and return the result
 */
const performSSR = (
  request: Request,
  element: Element<never, RendererContext>,
  router: SSRRouter | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providedLayer: Layer.Layer<any, never, never> | undefined,
): Effect.Effect<SSRResult, never, never> =>
  Effect.gen(function* () {
    console.log("Starting SSR process...");
    const platformContext = makeServerPlatformContext(request);
    const loaderDataCache = new Map<string, unknown>();

    let currentRouteName: string | null = null;
    let currentParams: Record<string, string> = {};
    let actionData: ActionData | null = null;

    console.log("Processing router actions/loaders...");
    if (router) {
      const method = request.method.toUpperCase();
      const isActionRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(
        method,
      );

      if (isActionRequest) {
        const routeNameOption = yield* router.currentRoute.get as Effect.Effect<
          Option.Option<string>
        >;
        const routeName = Option.getOrNull(routeNameOption);

        if (routeName) {
          const formData = yield* Effect.promise(() => request.formData());

          const actionResult = yield* Effect.either(
            router.executeAction(
              routeName,
              formData,
              request,
            ) as Effect.Effect<{ routeName: string; data: unknown } | null>,
          );

          if (actionResult._tag === "Right" && actionResult.right) {
            actionData = {
              routeName: actionResult.right.routeName,
              data: actionResult.right.data,
              timestamp: Date.now(),
            };
          } else if (actionResult._tag === "Left") {
            actionData = {
              routeName,
              data: { error: String(actionResult.left) },
              timestamp: Date.now(),
            };
          }
        }
      }

      console.log("Executing loader for current route...");
      const loaderResult = yield* router.executeLoader() as Effect.Effect<{
        routeName: string;
        params: unknown;
        data: unknown;
      } | null>;

      if (loaderResult) {
        currentRouteName = loaderResult.routeName;
        currentParams = (loaderResult.params as Record<string, string>) ?? {};
        loaderDataCache.set(loaderResult.routeName, loaderResult.data);
      }
    }

    console.log("Setting up loader context...");
    const paramsReadable = {
      get: Effect.succeed(currentParams),
    };

    console.log("Creating loader context...");
    const loaderContext = makeLoaderContext({
      routeId: currentRouteName ?? "",
      params: paramsReadable,
      loaderDataCache,
      isHydrating: false,
    });

    const loaderLayer = Layer.succeed(LoaderContextTag, loaderContext);
    const platformLayer = Layer.succeed(PlatformContext, platformContext);
    const baseLayers = Layer.merge(loaderLayer, platformLayer);

    const effectiveLayers = providedLayer
      ? Layer.merge(baseLayers, providedLayer)
      : baseLayers;

    console.log("Rendering to string...");
    console.log("effectiveLayers keys:", effectiveLayers);
    const renderEffect = renderToString(element);
    console.log("renderToString effect created, now providing layers...");
    const providedEffect = Effect.provide(renderEffect, effectiveLayers);
    console.log("Effect.provide complete, now yielding...");
    const html = yield* providedEffect;
    console.log("yield complete, html length:", html?.length);

    console.log("Collecting loader data for hydration...");
    const loaderData: LoaderData = {};
    for (const [routeId, data] of loaderDataCache) {
      loaderData[routeId] = {
        data,
        timestamp: Date.now(),
        params: currentParams,
      };
    }

    console.log("Serializing data for HTML embedding...");

    const loaderDataScript = serializeForHtmlSync(loaderData);
    const actionDataScript = serializeForHtmlSync(actionData);

    console.log("SSR process complete.");

    return {
      html,
      loaderData,
      loaderDataScript,
      actionData,
      actionDataScript,
      headers: platformContext.responseHeaders,
      platformContext,
    };
  });

/**
 * Generate a full HTML document from SSR result
 */
const generateDocument = (
  result: SSRResult,
  options: DocumentOptions = {},
): string => {
  const {
    title = "Effex App",
    scripts = [],
    styles = [],
    head = "",
    bodyAttributes = "",
    rootId = "root",
  } = options;

  const styleLinks = styles
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("\n    ");

  const scriptTags = scripts
    .map((src) => `<script type="module" src="${escapeHtml(src)}"></script>`)
    .join("\n    ");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    ${styleLinks}
    ${head}
  </head>
  <body${bodyAttributes ? ` ${bodyAttributes}` : ""}>
    <div id="${escapeHtml(rootId)}">${result.html}</div>
    <script>
      window.__EFFEX_LOADER_DATA__ = ${result.loaderDataScript};
      window.__EFFEX_ACTION_DATA__ = ${result.actionDataScript};
    </script>
    ${scriptTags}
  </body>
</html>`;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    console.log("Effex HTTP app handling request...");
    const serverRequest = yield* HttpServerRequest.HttpServerRequest;

    // Convert Effect request to Web Request
    const webRequest = yield* HttpServerRequest.toWeb(serverRequest);

    // Create the Effex element
    const element = options.app(webRequest);

    console.log("Performing SSR...");
    // Perform SSR - cast to handle the generic R constraint
    const result = yield* performSSR(
      webRequest,
      element as Element<never, RendererContext>,
      options.router,
      options.provide,
    );
    console.log("SSR complete.");

    // Generate full HTML document
    console.log("Generating HTML document...");
    const html = generateDocument(result, options.document);
    console.log("HTML document generated.");

    // Convert platform headers to response headers
    const responseHeaders: Record<string, string> = {};
    result.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    console.log("Ima coming");

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
 * Effex server utilities for @effect/platform integration.
 */
export const EffexServer = {
  makeHttpApp,
  makeRouter,
  makeFullApp,
};
