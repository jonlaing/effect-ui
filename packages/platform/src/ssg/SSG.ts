/**
 * Static Site Generation (SSG) module for Effex.
 *
 * Provides functionality to pre-render routes at build time,
 * including support for dynamic routes via staticPaths.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { Effect, Layer } from "effect";

import { Element, RendererContext } from "@effex/dom";
import { renderToString } from "@effex/dom/server";

import { makeServerPlatformContext, PlatformContext } from "../Platform.js";
import {
  LoaderContextTag,
  makeLoaderContext,
  type LoaderData,
} from "../routing/RouteLoader.js";
import { serializeForHtmlSync } from "../Serialization.js";

/**
 * Configuration for a static route.
 */
export interface StaticRouteConfig {
  /** Whether this route should be statically generated */
  readonly static: boolean;
  /** Time in seconds after which page should be regenerated (ISR) */
  readonly revalidate: number | undefined;
  /** Function to get all paths for dynamic routes */
  readonly staticPaths?: () => Promise<Record<string, string>[]>;
}

/**
 * Map of route names to their static configuration.
 */
export type StaticRouteConfigMap = Record<string, StaticRouteConfig>;

/**
 * Route definition with path and optional loader.
 */
export interface RouteDefinition {
  /** The route path pattern (e.g., "/users/:id") */
  readonly path: string;
  /** Loader function to fetch data */
  readonly loader?: (
    params: Record<string, string>,
  ) => Effect.Effect<unknown, unknown, unknown>;
}

/**
 * A rendered static page.
 */
export interface StaticPage {
  /** The URL path for this page */
  readonly path: string;
  /** The route name */
  readonly routeName: string;
  /** The rendered HTML content */
  readonly html: string;
  /** Loader data for hydration */
  readonly loaderData: LoaderData;
  /** Serialized loader data */
  readonly loaderDataScript: string;
  /** Revalidate time in seconds (for ISR) */
  readonly revalidate: number | undefined;
}

/**
 * Options for the SSG build.
 */
export interface SSGBuildOptions<R = never> {
  /**
   * Map of route names to route definitions.
   * Typically imported from the generated routes file.
   */
  readonly routes: Record<string, RouteDefinition>;

  /**
   * Static route configuration map.
   * Typically imported from the generated routes file as `staticRouteConfig`.
   */
  readonly staticRouteConfig: StaticRouteConfigMap;

  /**
   * Map of route names to their component functions.
   * Typically imported from the generated routes file as `components`.
   */
  readonly components: Record<
    string,
    () => Element.Element<never, RendererContext>
  >;

  /**
   * Function that creates the full application element for a given route component.
   * This should wrap the route component with any layouts, providers, etc.
   *
   * @param routeElement - The route component to render
   * @param routeName - The name of the route being rendered
   * @returns The full application element
   */
  readonly createApp: (
    routeElement: Element.Element<never, RendererContext>,
    routeName: string,
  ) => Element.Element<never, RendererContext>;

  /**
   * Output directory for generated HTML files.
   */
  readonly outDir: string;

  /**
   * Optional Layer to provide dependencies for loaders.
   * If your loaders require services, provide them here.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly layer?: Layer.Layer<R, never, never>;

  /**
   * Function to generate the full HTML document from render result.
   * If not provided, a basic document wrapper will be used.
   */
  readonly generateDocument?: (page: StaticPage) => string;
}

/**
 * Result of an SSG build.
 */
export interface SSGBuildResult {
  /** List of generated pages */
  readonly pages: readonly StaticPage[];
  /** Total time in milliseconds */
  readonly duration: number;
}

/**
 * Build all static pages for the application.
 *
 * @example
 * ```ts
 * import { buildStaticPages } from "@effex/platform/ssg";
 * import { routes, staticRouteConfig, components } from "./generated/routes";
 * import { App } from "./App";
 *
 * const result = await buildStaticPages({
 *   routes,
 *   staticRouteConfig,
 *   components,
 *   createApp: (routeElement) => App({ children: routeElement }),
 *   outDir: "./dist",
 * });
 *
 * console.log(`Generated ${result.pages.length} pages in ${result.duration}ms`);
 * ```
 */
export const buildStaticPages = async <R = never>(
  options: SSGBuildOptions<R>,
): Promise<SSGBuildResult> => {
  const startTime = Date.now();
  const pages: StaticPage[] = [];

  // Find all routes marked as static
  const staticRouteNames = Object.entries(options.staticRouteConfig)
    .filter(([, config]) => config.static)
    .map(([name]) => name);

  for (const routeName of staticRouteNames) {
    const routeConfig = options.staticRouteConfig[routeName];
    const routeDef = options.routes[routeName];
    const component = options.components[routeName];

    if (!routeDef || !component) {
      console.warn(`SSG: Route "${routeName}" not found, skipping`);
      continue;
    }

    // Get all paths to generate
    const pathsToGenerate = await getPathsForRoute(
      routeName,
      routeDef.path,
      routeConfig,
    );

    for (const { path: pagePath, params } of pathsToGenerate) {
      const page = await renderStaticPage({
        routeName,
        path: pagePath,
        params,
        routeDef,
        component,
        createApp: options.createApp,
        layer: options.layer,
        revalidate: routeConfig.revalidate,
      });

      pages.push(page);
    }
  }

  // Write all pages to disk
  await writePages(pages, options.outDir, options.generateDocument);

  return {
    pages,
    duration: Date.now() - startTime,
  };
};

/**
 * Get all paths to generate for a route.
 */
const getPathsForRoute = async (
  routeName: string,
  pathPattern: string,
  config: StaticRouteConfig,
): Promise<{ path: string; params: Record<string, string> }[]> => {
  // Check if route has dynamic segments
  const hasDynamicSegments = pathPattern.includes(":");

  if (!hasDynamicSegments) {
    // Static path - just return the pattern as-is
    return [{ path: pathPattern, params: {} }];
  }

  // Dynamic route - need staticPaths
  if (!config.staticPaths) {
    console.warn(
      `SSG: Route "${routeName}" has dynamic segments but no staticPaths function, skipping`,
    );
    return [];
  }

  // Get all params from staticPaths
  const allParams = await config.staticPaths();

  return allParams.map((params) => ({
    path: buildPath(pathPattern, params),
    params,
  }));
};

/**
 * Build a concrete path from a pattern and params.
 */
const buildPath = (pattern: string, params: Record<string, string>): string => {
  let result = pattern;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(value));
  }
  return result;
};

/**
 * Render a single static page.
 */
const renderStaticPage = async <R = never>(options: {
  routeName: string;
  path: string;
  params: Record<string, string>;
  routeDef: RouteDefinition;
  component: () => Element.Element<never, RendererContext>;
  createApp: (
    routeElement: Element.Element<never, RendererContext>,
    routeName: string,
  ) => Element.Element<never, RendererContext>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layer?: Layer.Layer<R, never, never>;
  revalidate: number | undefined;
}): Promise<StaticPage> => {
  const {
    routeName,
    path: pagePath,
    params,
    routeDef,
    component,
    createApp,
    layer,
    revalidate,
  } = options;

  // Create a fake request for the page
  const request = new Request(`http://localhost${pagePath}`);
  const platformContext = makeServerPlatformContext(request);

  // Execute loader if present
  const loaderDataCache = new Map<string, unknown>();
  if (routeDef.loader) {
    const loaderEffect = routeDef.loader(params);
    const effectWithLayer = layer
      ? Effect.provide(loaderEffect, layer)
      : loaderEffect;

    const data = await Effect.runPromise(
      effectWithLayer as Effect.Effect<unknown>,
    );
    loaderDataCache.set(routeName, data);
  }

  // Create context for rendering
  const paramsReadable = {
    get: Effect.succeed(params),
  };

  const loaderContext = makeLoaderContext({
    routeId: routeName,
    params: paramsReadable,
    loaderDataCache,
    isHydrating: false,
  });

  const loaderLayer = Layer.succeed(LoaderContextTag, loaderContext);
  const platformLayer = Layer.succeed(PlatformContext, platformContext);
  const baseLayers = Layer.merge(loaderLayer, platformLayer);

  const effectiveLayers = layer ? Layer.merge(baseLayers, layer) : baseLayers;

  // Render the component
  const routeElement = component();
  const appElement = createApp(routeElement, routeName);

  const html = await Effect.runPromise(
    Effect.provide(renderToString(appElement), effectiveLayers),
  );

  // Build loader data
  const loaderData: LoaderData = {};
  for (const [routeId, data] of loaderDataCache) {
    loaderData[routeId] = {
      data,
      timestamp: Date.now(),
      params,
    };
  }

  const loaderDataScript = serializeForHtmlSync(loaderData);

  return {
    path: pagePath,
    routeName,
    html,
    loaderData,
    loaderDataScript,
    revalidate,
  };
};

/**
 * Write all pages to disk.
 */
const writePages = async (
  pages: StaticPage[],
  outDir: string,
  generateDocument?: (page: StaticPage) => string,
): Promise<void> => {
  // Ensure output directory exists
  await fs.promises.mkdir(outDir, { recursive: true });

  for (const page of pages) {
    // Determine file path
    let filePath: string;
    if (page.path === "/") {
      filePath = path.join(outDir, "index.html");
    } else {
      // /users/123 -> /users/123/index.html
      filePath = path.join(outDir, page.path, "index.html");
    }

    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    // Generate full document
    const html = generateDocument
      ? generateDocument(page)
      : defaultGenerateDocument(page);

    // Write file
    await fs.promises.writeFile(filePath, html, "utf-8");
    console.log(`SSG: Generated ${filePath}`);
  }
};

/**
 * Default document generator.
 */
const defaultGenerateDocument = (page: StaticPage): string => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Effex App</title>
  </head>
  <body>
    <div id="root">${page.html}</div>
    <script>
      window.__EFFEX_LOADER_DATA__ = ${page.loaderDataScript};
      window.__EFFEX_ACTION_DATA__ = null;
    </script>
  </body>
</html>`;
};

/**
 * Get list of static routes from configuration.
 * Useful for build tooling integration.
 */
export const getStaticRoutes = async (
  routes: Record<string, RouteDefinition>,
  staticRouteConfig: StaticRouteConfigMap,
): Promise<
  { routeName: string; path: string; params: Record<string, string> }[]
> => {
  const result: {
    routeName: string;
    path: string;
    params: Record<string, string>;
  }[] = [];

  const staticRouteNames = Object.entries(staticRouteConfig)
    .filter(([, config]) => config.static)
    .map(([name]) => name);

  for (const routeName of staticRouteNames) {
    const routeConfig = staticRouteConfig[routeName];
    const routeDef = routes[routeName];

    if (!routeDef) continue;

    const paths = await getPathsForRoute(routeName, routeDef.path, routeConfig);
    for (const { path, params } of paths) {
      result.push({ routeName, path, params });
    }
  }

  return result;
};
