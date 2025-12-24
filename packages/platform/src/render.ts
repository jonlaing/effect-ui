import { Effect, Layer } from "effect";
import { RendererContext } from "@effex/core";
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
}

/**
 * Options for server-side rendering
 */
export interface RenderOptions {
  /**
   * The incoming request
   */
  readonly request: Request;

  /**
   * Optional router instance. If provided, loaders will be executed before rendering.
   * Create the router with Router.make() and pass it here.
   */
  readonly router?: SSRRouter;
}

/**
 * Result of server-side rendering
 */
export interface RenderResult {
  /**
   * The rendered HTML string
   */
  readonly html: string;

  /**
   * Serialized loader data for hydration (HTML-safe)
   */
  readonly loaderData: LoaderData;

  /**
   * Serialized loader data as HTML-safe JSON string
   */
  readonly loaderDataScript: string;

  /**
   * Response headers (includes Set-Cookie, etc.)
   */
  readonly headers: Headers;

  /**
   * The platform context (for accessing response headers, etc.)
   */
  readonly platformContext: PlatformContextType;
}

/**
 * Render an Effex application to HTML string for SSR
 *
 * @example
 * ```ts
 * import { render } from "@effex/platform";
 * import { App } from "./App";
 *
 * const handler = async (request: Request) => {
 *   const result = await render(App(), { request });
 *
 *   return new Response(`
 *     <!DOCTYPE html>
 *     <html>
 *       <body>
 *         <div id="root">${result.html}</div>
 *         <script>
 *           window.__EFFEX_LOADER_DATA__ = ${result.loaderDataScript};
 *         </script>
 *         <script src="/app.js"></script>
 *       </body>
 *     </html>
 *   `, {
 *     headers: result.headers,
 *   });
 * };
 * ```
 */
export const render = async (
  element: Element<never, RendererContext>,
  options: RenderOptions,
): Promise<RenderResult> => {
  const platformContext = makeServerPlatformContext(options.request);

  // Create a loader data cache to collect data during rendering
  const loaderDataCache = new Map<string, unknown>();

  // If router is provided, execute the loader for the matched route
  let currentRouteName: string | null = null;
  let currentParams: Record<string, string> = {};

  if (options.router) {
    // Execute loader and populate cache
    const loaderResult = await Effect.runPromise(
      options.router.executeLoader() as Effect.Effect<{
        routeName: string;
        params: unknown;
        data: unknown;
      } | null>,
    );

    if (loaderResult) {
      currentRouteName = loaderResult.routeName;
      currentParams = (loaderResult.params as Record<string, string>) ?? {};
      loaderDataCache.set(loaderResult.routeName, loaderResult.data);
    }
  }

  // Create loader context for components to access
  // Use a simple object that satisfies ParamsReadable to avoid cross-package type issues
  const paramsReadable = {
    get: Effect.succeed(currentParams),
  };

  const loaderContext = makeLoaderContext({
    routeId: currentRouteName ?? "",
    params: paramsReadable,
    loaderDataCache,
    isHydrating: false,
  });

  // Provide LoaderContext and PlatformContext during rendering
  const loaderLayer = Layer.succeed(LoaderContextTag, loaderContext);
  const platformLayer = Layer.succeed(PlatformContext, platformContext);
  const layers = Layer.merge(loaderLayer, platformLayer);

  // renderToString handles providing the RendererContext internally
  // Type assertion needed due to pnpm resolving Effect types differently across packages
  const html: string = await Effect.runPromise(
    Effect.provide(
      renderToString(element) as unknown as Effect.Effect<
        string,
        never,
        LoaderContextTag | PlatformContext
      >,
      layers,
    ) as unknown as Effect.Effect<string>,
  );

  // Convert loader data cache to serializable format
  const loaderData: LoaderData = {};
  for (const [routeId, data] of loaderDataCache) {
    loaderData[routeId] = {
      data,
      timestamp: Date.now(),
      params: currentParams,
    };
  }

  // Serialize for safe embedding in HTML
  const loaderDataScript = serializeForHtmlSync(loaderData);

  return {
    html,
    loaderData,
    loaderDataScript,
    headers: platformContext.responseHeaders,
    platformContext,
  };
};

/**
 * Generate a full HTML document from render result
 *
 * @example
 * ```ts
 * const result = await render(App(), { request });
 * const html = renderToDocument(result, {
 *   title: "My App",
 *   scripts: ["/app.js"],
 *   styles: ["/app.css"],
 * });
 * ```
 */
export const renderToDocument = (
  result: RenderResult,
  options: {
    title?: string;
    scripts?: string[];
    styles?: string[];
    head?: string;
    bodyAttributes?: string;
    rootId?: string;
  } = {},
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
    <script>window.__EFFEX_LOADER_DATA__ = ${result.loaderDataScript};</script>
    ${scriptTags}
  </body>
</html>`;
};

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
