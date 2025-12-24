import { Effect } from "effect";
import { RendererContext } from "@effex/core";
import type { Element } from "@effex/dom";
import { hydrate as domHydrate } from "@effex/dom/hydrate";
import { type LoaderData } from "./RouteLoader.js";

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
  element: Element<never, RendererContext>,
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

  // domHydrate returns a Promise
  await domHydrate(element, container);

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
 * Recursively deserialize a value, restoring special types
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

    // Check for our special type markers
    if ("__effex_type__" in obj) {
      const typeTag = obj.__effex_type__ as string;
      const valueTag = obj.__effex_value__;

      switch (typeTag) {
        case "undefined":
          return undefined;
        case "NaN":
          return NaN;
        case "Infinity":
          return Infinity;
        case "-Infinity":
          return -Infinity;
        case "BigInt":
          return BigInt(valueTag as string);
        case "Date":
          return new Date(valueTag as string);
        case "Map":
          return new Map(
            (valueTag as [unknown, unknown][]).map(([k, v]) => [
              deserializeValue(k),
              deserializeValue(v),
            ]),
          );
        case "Set":
          return new Set((valueTag as unknown[]).map(deserializeValue));
        case "RegExp": {
          const { source, flags } = valueTag as {
            source: string;
            flags: string;
          };
          return new RegExp(source, flags);
        }
        case "URL":
          return new URL(valueTag as string);
      }
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
