import { Effect, Layer } from "effect";
import { Element } from "@effex/dom";
import { RendererContext } from "@effex/dom";
import { hydrate as domHydrate } from "@effex/dom/hydrate";
import {
  type LoaderData,
  LoaderContextTag,
  makeLoaderContext,
} from "../routing/RouteLoader.js";
import { reviveTypeMarker } from "../Serialization.js";

/**
 * Router interface for hydration (avoids cross-package Effect type issues)
 */
interface HydrationRouter {
  initializeLoaderData: (
    routeName: string,
    params: Record<string, string>,
    data: unknown,
  ) => Effect.Effect<void>;
}

/**
 * Global loader data injected by SSR
 */
declare global {
  interface Window {
    __EFFEX_LOADER_DATA__?: LoaderData;
  }
}

/**
 * Options for client-side hydration
 */
export interface HydrateOptions {
  /**
   * Pre-loaded loader data (defaults to window.__EFFEX_LOADER_DATA__)
   */
  readonly loaderData?: LoaderData;

  /**
   * Router instance for initializing loader state.
   * If provided, the router's loaderState will be populated with SSR data.
   */
  readonly router?: HydrationRouter;
}

/**
 * Hydrate an Effex application on the client
 *
 * This function:
 * 1. Reads loader data from window.__EFFEX_LOADER_DATA__ (or options.loaderData)
 * 2. Deserializes the data (restoring Date, Map, Set, etc.)
 * 3. Initializes router's loaderState with SSR data (if router provided)
 * 4. Hydrates the DOM, attaching reactivity to server-rendered elements
 *
 * @example
 * ```ts
 * // client.ts - Basic usage
 * import { hydrateApp } from "@effex/platform";
 * import { App } from "./App";
 *
 * hydrateApp(App(), document.getElementById("root")!);
 * ```
 *
 * @example
 * ```ts
 * // client.ts - With router for reactive loader data
 * import { Effect, Scope } from "effect";
 * import { hydrateApp } from "@effex/platform";
 * import { Router } from "@effex/router";
 * import { App, routes } from "./App";
 *
 * const program = Effect.gen(function* () {
 *   const router = yield* Router.make(routes);
 *   yield* Effect.promise(() =>
 *     hydrateApp(App(), document.getElementById("root")!, { router })
 *   );
 * });
 *
 * Effect.runPromise(Effect.scoped(program));
 * ```
 */
export const hydrateApp = async (
  element: Element.Element<never, RendererContext>,
  container: HTMLElement,
  options: HydrateOptions = {},
): Promise<void> => {
  // Get loader data from options or window
  const rawLoaderData =
    options.loaderData ?? window.__EFFEX_LOADER_DATA__ ?? {};

  // Deserialize loader data (restores Date, Map, Set, etc.)
  const loaderData = deserializeLoaderData(rawLoaderData);

  // Create loader data cache from deserialized data
  const loaderDataCache = new Map<string, unknown>();
  for (const [routeId, entry] of Object.entries(loaderData)) {
    loaderDataCache.set(routeId, entry.data);
  }

  // Initialize router's loaderState with SSR data (if router provided)
  if (options.router) {
    for (const [routeId, entry] of Object.entries(loaderData)) {
      await Effect.runPromise(
        options.router.initializeLoaderData(routeId, entry.params, entry.data),
      );
    }
  }

  // Get current route info for LoaderContext
  const routeIds = Object.keys(loaderData);
  const currentRouteId = routeIds.length > 0 ? routeIds[0] : "";
  const currentParams =
    routeIds.length > 0 ? loaderData[routeIds[0]].params : {};

  // Create a params readable for LoaderContext
  const paramsReadable = {
    get: Effect.succeed(currentParams),
  };

  // Create LoaderContext for hydration
  const loaderContext = makeLoaderContext({
    routeId: currentRouteId,
    params: paramsReadable,
    loaderDataCache: loaderDataCache,
    isHydrating: true,
  });

  // Create the layer to provide during hydration
  const loaderLayer = Layer.succeed(LoaderContextTag, loaderContext);

  // domHydrate returns a Promise
  await domHydrate(element, container, { layers: loaderLayer });

  // Clean up the loader data from window after hydration
  // This frees memory and prevents stale data usage
  if (typeof window !== "undefined") {
    delete window.__EFFEX_LOADER_DATA__;
  }
};

/**
 * Deserialize loader data entries
 */
function deserializeLoaderData(raw: LoaderData): LoaderData {
  const result: LoaderData = {};

  for (const [routeId, entry] of Object.entries(raw)) {
    result[routeId] = {
      data: deserializeValue(entry.data),
      timestamp: entry.timestamp,
      params: entry.params,
    };
  }

  return result;
}

/**
 * Recursively deserialize a value, restoring special types.
 * Uses reviveTypeMarker for the actual type conversion.
 */
function deserializeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deserializeValue);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    // Check for type marker - if found, revive it
    if ("__effex_type__" in obj) {
      const revived = reviveTypeMarker(obj);

      // For Map and Set, we need to recursively deserialize the contents
      // since reviveTypeMarker doesn't recurse
      if (revived instanceof Map) {
        const entries = Array.from(revived.entries()).map(
          ([k, v]) => [deserializeValue(k), deserializeValue(v)] as const,
        );
        return new Map(entries);
      }
      if (revived instanceof Set) {
        return new Set(Array.from(revived).map(deserializeValue));
      }

      return revived;
    }

    // Regular object - deserialize all values
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = deserializeValue(val);
    }
    return result;
  }

  return value;
}

/**
 * Check if the app is currently hydrating
 * Useful for components that need to behave differently during hydration
 */
export const isHydrating = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.__EFFEX_LOADER_DATA__ !== undefined;
};
