import { Effect, Layer, Option } from "effect";
import { component, match, div, Derived } from "@effex/dom";
import type { Element } from "@effex/dom";
import { RouterContext } from "@effex/router";
import { LoaderContextTag, makeLoaderContext } from "./RouteLoader.js";

/**
 * A component function that returns an Element.
 */
export type RouteComponent = () => Element<unknown, unknown>;

/**
 * Map of route names to their component functions.
 * This is the type of the `components` export from the generated routes file.
 */
export type ComponentsMap<RouteNames extends string = string> = {
  readonly [K in RouteNames]: RouteComponent;
};

/**
 * Props for the Routes component.
 */
export interface RoutesProps<RouteNames extends string = string> {
  /**
   * Map of route names to component functions.
   * Pass the `components` export from your generated routes file.
   */
  readonly components: ComponentsMap<RouteNames>;

  /**
   * Component to render when no route matches (404).
   * If not provided, renders an empty div.
   */
  readonly fallback?: RouteComponent;
}

/**
 * Renders the component for the currently active route.
 *
 * This component reads the current route from RouterContext and renders
 * the corresponding component from the components map. It automatically
 * re-renders when the route changes.
 *
 * @example
 * ```ts
 * import { Routes } from "@effex/platform";
 * import { routes, components } from "./generated/routes";
 *
 * const App = component("App", () =>
 *   Effect.gen(function* () {
 *     return yield* div([
 *       Header(),
 *       Routes({ components }),
 *       Footer(),
 *     ]);
 *   })
 * );
 * ```
 *
 * @example
 * ```ts
 * // With custom 404 page
 * Routes({
 *   components,
 *   fallback: () => NotFoundPage(),
 * })
 * ```
 */
export const Routes = component("Routes", (props: RoutesProps) =>
  Effect.gen(function* () {
    const router = yield* RouterContext;

    // Create a derived value that combines route name + pathname
    // This ensures re-renders when params change within the same route
    // (e.g., /users/1 -> /users/2 both have route "users_$id" but different paths)
    const deps = [router.currentRoute, router.pathname] as const;
    const routeWithPath = yield* Derived.sync(deps, (values) => {
      const routeOpt = values[0];
      const pathname = values[1];
      if (Option.isNone(routeOpt)) return null;
      // Combine route name with pathname to create unique key for change detection
      return `${routeOpt.value}::${pathname}`;
    });

    // Map the combined value back to just the route name for case pattern matching
    const currentRouteName = routeWithPath.map((combined) => {
      if (combined === null) return null;
      return combined.split("::")[0];
    });

    // Create a wrapper that provides LoaderContext to each route component
    // Only provides LoaderContext during client-side navigation (not SSR or hydration)
    const wrapWithLoaderContext = (
      routeName: string,
      componentFn: RouteComponent,
    ): RouteComponent => {
      return () =>
        Effect.gen(function* () {
          // Check if LoaderContext is already provided (SSR or hydration)
          const existingLoaderContext =
            yield* Effect.serviceOption(LoaderContextTag);

          // If we already have LoaderContext, just render the component
          if (Option.isSome(existingLoaderContext)) {
            return yield* componentFn();
          }

          // Client-side navigation: wait for loader to complete for this route
          // Poll loaderState until it matches the current route and isn't loading
          let loaderState = yield* router.loaderState.get;
          let attempts = 0;
          const maxAttempts = 100; // 10 seconds max wait

          while (
            (loaderState.routeName !== routeName || loaderState.isLoading) &&
            attempts < maxAttempts
          ) {
            yield* Effect.sleep(100);
            loaderState = yield* router.loaderState.get;
            attempts++;
          }

          // Create a loader data cache with the current data
          const loaderDataCache = new Map<string, unknown>();
          if (loaderState.data !== null && loaderState.routeName) {
            loaderDataCache.set(loaderState.routeName, loaderState.data);
          }

          // Create params readable from loaderState
          const paramsReadable = {
            get: Effect.succeed(loaderState.params),
          };

          // Create LoaderContext for client navigation
          // Note: For routes without loaders, loaderDataCache will be empty
          // and RouteLoader.loaderData() will fail - this is expected behavior
          const loaderContext = makeLoaderContext({
            routeId: routeName,
            params: paramsReadable,
            loaderDataCache,
            isHydrating: false,
          });

          // Provide LoaderContext to the component
          const loaderLayer = Layer.succeed(LoaderContextTag, loaderContext);
          return yield* Effect.provide(componentFn(), loaderLayer);
        }) as Element<unknown, unknown>;
    };

    // Build match cases from components map, wrapping each with LoaderContext
    const cases = Object.entries(props.components).map(
      ([routeName, componentFn]) => ({
        pattern: routeName,
        render: wrapWithLoaderContext(routeName, componentFn),
      }),
    );

    // Default fallback renders empty div with display:contents
    const fallback =
      props.fallback ?? (() => div({ style: { display: "contents" } }, []));

    // Use match control flow to render the active route's component
    // When currentRoute is Option.none() (maps to null), fallback is rendered
    return yield* match(currentRouteName, {
      cases,
      fallback,
    });
  }),
);
