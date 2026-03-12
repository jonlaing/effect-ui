/**
 * Platform utilities for SSR integration.
 *
 * Provides `toHttpRoutes` which converts an Effex Router into an
 * `@effect/platform` HttpRouter, handling SSR rendering, data requests
 * (`?_data=1`), and action execution (`POST/PUT/DELETE ?_action=key`).
 *
 * Route-level hooks drive behavior:
 * - `Route.get()` loaders run on GET requests only
 * - `Route.post()/put()/delete()` handlers run on their respective methods only
 * - POST/PUT/DELETE handlers execute directly — no component tree rendering
 *
 * @module
 */

import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { Data, Effect, Layer, Ref, Schema, Scope } from "effect";

import {
  AsyncCache,
  makeAsyncCache,
  RendererContext,
  type ControlCtx,
  type SuspenseBoundaryCtx,
} from "@effex/core";
import { renderToString } from "@effex/dom/server";
import {
  Navigation,
  NavigationContext,
  RouteDataContext,
  RouteDataProvider,
  type Router as EffexRouter,
  type RouteDataProviderService,
  type RouteDataService,
  type RouteType,
} from "@effex/router";

// =============================================================================
// Types
// =============================================================================

export interface DocumentOptions {
  /** Page title */
  readonly title?: string;
  /** Script URLs to include */
  readonly scripts?: readonly string[];
  /** Stylesheet URLs to include */
  readonly styles?: readonly string[];
  /** Additional head content */
  readonly head?: string;
}

export interface ToHttpRoutesOptions {
  /** Document generation options */
  readonly document?: DocumentOptions;
  /**
   * Root app component to render on the server.
   * This should be the same component tree the client hydrates.
   * It should contain an Outlet that renders matched routes.
   *
   * If not provided, renders just the matched route with layouts.
   */
  readonly app?: () => import("@effex/dom").Element.Element<
    HTMLElement | SVGElement
  >;
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Redirect error thrown from loaders or action handlers.
 */
export class RedirectError extends Data.TaggedError("RedirectError")<{
  readonly url: string;
  readonly status: number;
}> {}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Serialize data for embedding in HTML (escapes script-breaking characters)
 */
export const serializeForHtml = (data: unknown): string => {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
};

/**
 * Generate the script tag for embedding loader data
 */
export const generateLoaderDataScript = (
  loaderData: Record<string, unknown>,
): string => {
  if (Object.keys(loaderData).length === 0) return "";
  return `<script>window.__EFFEX_DATA__=${serializeForHtml(loaderData)}</script>`;
};

/**
 * Generate a full HTML document wrapping rendered content.
 */
export const generateDocument = (
  html: string,
  loaderData: Record<string, unknown>,
  options?: DocumentOptions,
): string => {
  const title = options?.title ? `<title>${options.title}</title>` : "";
  const styles = (options?.styles ?? [])
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join("\n    ");
  const scripts = (options?.scripts ?? [])
    .map((src) => `<script type="module" src="${src}"></script>`)
    .join("\n    ");
  const head = options?.head ?? "";
  const loaderScript = generateLoaderDataScript(loaderData);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${title}
    ${styles}
    ${head}
  </head>
  <body>
    <div id="root">${html}</div>
    ${loaderScript}
    ${scripts}
  </body>
</html>`;
};

/**
 * Substitute route params into a path pattern.
 * e.g., "/users/:id" + { id: "123" } → "/users/123"
 */
const substituteParams = (
  path: string,
  params: Record<string, string>,
): string => {
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(value));
  }
  return result;
};

/**
 * Compute action paths for a route's handlers given current params.
 */
const computeActionPaths = (
  route: RouteType<string, unknown, unknown, unknown, unknown, unknown>,
  params: Record<string, string>,
): Record<string, string> => {
  const actions: Record<string, string> = {};
  for (const h of route._handlers) {
    const basePath = substituteParams(route.path, params);
    actions[h.key] = `${basePath}?_action=${encodeURIComponent(h.key)}`;
  }
  return actions;
};

/**
 * Validate route params against the route's schema.
 */
const validateParams = (
  route: RouteType<string, unknown, unknown, unknown, unknown, unknown>,
  rawParams: Record<string, string>,
): Effect.Effect<unknown, unknown> => {
  if (route.paramsSchema) {
    return Schema.decodeUnknown(route.paramsSchema)(rawParams);
  }
  return Effect.succeed(rawParams);
};

/**
 * Validate search params against the route's schema.
 */
const validateSearchParams = (
  route: RouteType<string, unknown, unknown, unknown, unknown, unknown>,
  rawSearchParams: Record<string, string>,
): Effect.Effect<unknown, unknown> => {
  if (route.searchParamsSchema) {
    return Schema.decodeUnknown(route.searchParamsSchema)(rawSearchParams);
  }
  return Effect.succeed(rawSearchParams);
};

// Redirect handling helper — uses _tag check to work with generic E
const catchRedirects = (
  handler: Effect.Effect<unknown, unknown, unknown>,
): Effect.Effect<unknown, unknown, unknown> =>
  handler.pipe(
    Effect.catchAll((error) => {
      if (error && typeof error === "object" && "_tag" in error) {
        const tag = (error as { _tag: string })._tag;
        if (tag === "RedirectError") {
          const e = error as RedirectError;
          return Effect.succeed(
            HttpServerResponse.redirect(e.url, { status: e.status }),
          );
        }
      }
      return Effect.fail(error);
    }),
  );

// =============================================================================
// toHttpRoutes
// =============================================================================

/**
 * Convert an Effex Router into an `@effect/platform` HttpRouter.
 *
 * For each route in the Effex Router, registers method-specific handlers:
 *
 * - **GET**: Runs the route's loader (if any), provides data via RouteDataContext,
 *   SSR renders the component. If `?_data=1`, returns data as JSON.
 * - **POST/PUT/DELETE**: Looks up the handler by `?_action=key`, executes it
 *   directly with the parsed request body. No component rendering.
 *
 * Redirect errors are caught and converted to HTTP redirect responses.
 */
export const toHttpRoutes = <E, R>(
  router: EffexRouter<E, R>,
  options?: ToHttpRoutesOptions,
): HttpRouter.HttpRouter<
  Exclude<E, RedirectError>,
  Exclude<
    R,
    | RouteDataContext
    | RouteDataProvider
    | NavigationContext
    | RendererContext
    | ControlCtx
    | SuspenseBoundaryCtx
    | Scope.Scope
  >
> => {
  // Use renderToString with widened types
  const render = renderToString as (
    element: unknown,
  ) => Effect.Effect<string, unknown, unknown>;

  let httpRouter = HttpRouter.empty as HttpRouter.HttpRouter<any, any>;

  for (const route of router.routes) {
    const path = route.path as `/${string}`;

    // -------------------------------------------------------------------
    // GET handler: Run loader → SSR render or return data JSON
    // -------------------------------------------------------------------
    const getHandler = Effect.gen(function* () {
      const serverRequest = yield* HttpServerRequest.HttpServerRequest;
      const url = new URL(serverRequest.url, "http://localhost");
      const isDataRequest = url.searchParams.has("_data");

      // Get route params extracted by @effect/platform's path matching
      const rawRouteParams = yield* HttpRouter.params;
      const rawSearchParams = Object.fromEntries(url.searchParams);

      // Validate params
      const validatedParams = yield* validateParams(
        route,
        rawRouteParams as Record<string, string>,
      );
      const validatedSearchParams = yield* validateSearchParams(
        route,
        rawSearchParams,
      );

      // Run loader if present — catch RedirectError so we can return
      // an appropriate response for data requests vs full page loads
      const loaderFn = route._loader
        ? (route._loader as (args: {
            params: unknown;
            searchParams: unknown;
          }) => Effect.Effect<unknown, unknown, unknown>)
        : null;

      if (loaderFn) {
        const loaderOrRedirect = yield* loaderFn({
          params: validatedParams,
          searchParams: validatedSearchParams,
        }).pipe(
          Effect.map((data) => ({ redirect: false as const, data })),
          Effect.catchAll((error) => {
            if (
              error &&
              typeof error === "object" &&
              "_tag" in error &&
              (error as { _tag: string })._tag === "RedirectError"
            ) {
              const e = error as RedirectError;
              return Effect.succeed({
                redirect: true as const,
                url: e.url,
                status: e.status,
                data: undefined,
              });
            }
            return Effect.fail(error);
          }),
        );

        if (loaderOrRedirect.redirect) {
          if (isDataRequest) {
            // Data requests get a JSON redirect signal so the client can
            // trigger a client-side navigation instead of an HTTP redirect
            return yield* HttpServerResponse.json({
              _redirect: loaderOrRedirect.url,
            });
          }
          return HttpServerResponse.redirect(loaderOrRedirect.url, {
            status: loaderOrRedirect.status,
          });
        }

        // Continue with loader data below
        var loaderData: unknown = loaderOrRedirect.data;
      } else {
        var loaderData: unknown = undefined;
      }

      // Compute action paths
      const actionPaths = computeActionPaths(
        route,
        rawRouteParams as Record<string, string>,
      );

      // Build route data
      const routeData: RouteDataService = {
        data: loaderData,
        actions: actionPaths,
      };

      if (isDataRequest) {
        // Return JSON for data requests (client-side navigation)
        return yield* HttpServerResponse.json(routeData).pipe(
          Effect.catchTag("HttpBodyError", () =>
            Effect.succeed(
              HttpServerResponse.text("Failed to serialize route data", {
                status: 500,
              }),
            ),
          ),
        );
      }

      // SSR: Render the component with data provided

      // Navigation layer for this request
      const navLayer = Navigation.makeLayer(router as EffexRouter<any, any>, {
        initialPath: url.pathname,
        initialSearch: url.search,
      });

      // Server-side RouteDataProvider that returns pre-computed data
      const routeDataProviderLayer = Layer.succeed(RouteDataProvider, {
        getRouteData: () => Effect.succeed(routeData),
      });

      // SSR AsyncCache — entries are scoped to this request
      const asyncCacheLayer = Layer.succeed(AsyncCache, makeAsyncCache());

      // Render to string
      let html: string;

      if (options?.app) {
        // Render the full app component (same tree client hydrates).
        // Outlet inside the app will use the RouteDataProvider to get
        // pre-computed data — no double-loading.
        html = yield* render(options.app()).pipe(
          Effect.provide(
            Layer.mergeAll(navLayer, routeDataProviderLayer, asyncCacheLayer),
          ),
        );
      } else {
        // No app component — render just the matched route with layouts
        const element = route.render(loaderData).pipe(
          Effect.provideService(route.Params, {
            params: rawRouteParams as Record<string, string>,
            searchParams: rawSearchParams,
          }),
          Effect.provideService(RouteDataContext, routeData),
        );

        const withLayouts = (router.layouts as any[]).reduce(
          (inner: any, wrapper: any) => wrapper(inner),
          element,
        );

        html = yield* render(withLayouts).pipe(
          Effect.provide(
            Layer.mergeAll(navLayer, routeDataProviderLayer, asyncCacheLayer),
          ),
        );
      }

      // Embed loader data for hydration
      const hydrationData: Record<string, unknown> = {
        data: loaderData,
        actions: actionPaths,
      };

      return HttpServerResponse.html(
        generateDocument(html, hydrationData, options?.document),
      );
    });

    // Register GET handler with error logging
    const debugHandler = catchRedirects(getHandler).pipe(
      Effect.catchAllCause((cause) => {
        console.error(`[Platform] Error handling GET ${path}:`, cause);
        return Effect.succeed(
          HttpServerResponse.text(`Internal Server Error`, { status: 500 }),
        );
      }),
    );
    httpRouter = httpRouter.pipe(HttpRouter.get(path, debugHandler as any));

    // -------------------------------------------------------------------
    // Mutation handlers: POST/PUT/DELETE — direct execution, no render
    // -------------------------------------------------------------------
    const methodsUsed = new Set<string>();

    for (const handler of route._handlers) {
      // Only register one handler per HTTP method per route
      // (the handler dispatches by _action key)
      if (methodsUsed.has(handler.method)) continue;
      methodsUsed.add(handler.method);

      const mutationHandler = Effect.gen(function* () {
        const serverRequest = yield* HttpServerRequest.HttpServerRequest;
        const url = new URL(serverRequest.url, "http://localhost");
        const actionKey = url.searchParams.get("_action");

        if (!actionKey) {
          return HttpServerResponse.text("Missing ?_action parameter", {
            status: 400,
          });
        }

        // Find the handler matching the method and key
        const matchedHandler = route._handlers.find(
          (h) => h.method === handler.method && h.key === actionKey,
        );

        if (!matchedHandler) {
          return HttpServerResponse.text(
            `Action "${actionKey}" not found for ${handler.method.toUpperCase()}`,
            { status: 404 },
          );
        }

        // Parse request body: try JSON first, fall back to URL params
        const body: unknown = yield* serverRequest.json.pipe(
          Effect.catchAll(() =>
            serverRequest.urlParamsBody.pipe(
              Effect.map((params) => Object.fromEntries(params)),
            ),
          ),
          Effect.catchAll(() => Effect.succeed({})),
        );

        // Execute handler directly — no component rendering
        const result = yield* matchedHandler.handler(body);

        return yield* HttpServerResponse.json(result).pipe(
          Effect.catchTag("HttpBodyError", () =>
            Effect.succeed(
              HttpServerResponse.text("Failed to serialize action result", {
                status: 500,
              }),
            ),
          ),
        );
      });

      // Register on the appropriate HTTP method
      const wrappedHandler = catchRedirects(mutationHandler) as any;
      if (handler.method === "post") {
        httpRouter = httpRouter.pipe(HttpRouter.post(path, wrappedHandler));
      } else if (handler.method === "put") {
        httpRouter = httpRouter.pipe(HttpRouter.put(path, wrappedHandler));
      } else if (handler.method === "delete") {
        httpRouter = httpRouter.pipe(HttpRouter.del(path, wrappedHandler));
      }
    }
  }

  return httpRouter;
};

// =============================================================================
// Client Layer
// =============================================================================

declare const window: Window & {
  __EFFEX_DATA__?: Record<string, unknown>;
};

/**
 * Create a client-side Layer that provides NavigationContext and RouteDataProvider.
 *
 * On the first call (hydration), reads data from `window.__EFFEX_DATA__`.
 * On subsequent calls (client-side navigation), fetches from the server
 * via `?_data=1`.
 *
 * @example
 * ```ts
 * import { hydrate } from "@effex/dom"
 * import { Platform } from "@effex/platform"
 * import { router } from "./routes"
 *
 * const program = Effect.gen(function* () {
 *   yield* hydrate(App(), document.getElementById("root")!, {
 *     layer: Platform.makeClientLayer(router),
 *   })
 * })
 *
 * Effect.runPromise(Effect.scoped(program))
 * ```
 */
export const makeClientLayer = <E, R>(
  router: EffexRouter<E, R>,
): Layer.Layer<NavigationContext | RouteDataProvider, never, never> => {
  const dataProviderLayer = Layer.scoped(
    RouteDataProvider,
    Effect.gen(function* () {
      // Track whether this is the first data request (hydration)
      const isFirstLoad = yield* Ref.make(true);

      const provider: RouteDataProviderService = {
        getRouteData: (route, params, _searchParams) =>
          Effect.gen(function* () {
            const first = yield* Ref.get(isFirstLoad);

            if (first) {
              yield* Ref.set(isFirstLoad, false);

              // Hydration: read embedded data from SSR
              const embedded =
                typeof window !== "undefined"
                  ? window.__EFFEX_DATA__
                  : undefined;

              if (embedded) {
                return embedded as unknown as RouteDataService;
              }
            }

            // Client navigation: fetch from server
            const path = substituteParams(route.path, params);
            const response = yield* Effect.tryPromise(() =>
              fetch(`${path}?_data=1`),
            );

            const json = yield* Effect.tryPromise(() => response.json());

            // Pass through as-is — if it's a redirect signal ({ _redirect: url }),
            // the Outlet handles it via nav.pushPath
            return json as unknown as RouteDataService;
          }).pipe(Effect.orDie),
      };

      return provider;
    }),
  );

  const navLayer = Navigation.makeLayer(router);

  return Layer.mergeAll(navLayer, dataProviderLayer);
};

// =============================================================================
// Namespace
// =============================================================================

/**
 * Platform utilities namespace.
 */
export const Platform = {
  serializeForHtml,
  generateLoaderDataScript,
  generateDocument,
  toHttpRoutes,
  makeClientLayer,
};
