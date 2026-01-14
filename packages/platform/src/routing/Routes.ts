import { Effect, Layer, Option, pipe } from "effect";

import { $, Derived, Element, match } from "@effex/dom";
import { RouterContext } from "@effex/router";

import { LoaderContextTag, makeLoaderContext } from "./RouteLoader.js";

/**
 * A component function that returns an Element.
 */
export type RouteComponent<E = never, R = never> = () => Element.Element<E, R>;

/**
 * Map of route names to their component functions.
 * This is the type of the `components` export from the generated routes file.
 */
export type ComponentsMap = {
  readonly [K: string]: RouteComponent<any, any>;
};

/**
 * Extracts the union of all error types from a components map.
 */
export type ComponentsError<T extends ComponentsMap> = {
  [K in keyof T]: T[K] extends () => Element.Element<infer E, any> ? E : never;
}[keyof T];

/**
 * Extracts the union of all requirement types from a components map.
 */
export type ComponentsRequirements<T extends ComponentsMap> = {
  [K in keyof T]: T[K] extends () => Element.Element<any, infer R> ? R : never;
}[keyof T];

/**
 * Props for the Routes component.
 */
export interface RoutesProps<T extends ComponentsMap = ComponentsMap> {
  /**
   * Map of route names to component functions.
   * Pass the `components` export from your generated routes file.
   */
  readonly components: T;

  /**
   * Component to render when no route matches (404).
   * If not provided, renders an empty div.
   */
  readonly fallback?: RouteComponent<
    ComponentsError<T>,
    ComponentsRequirements<T>
  >;
}

/**
 * Renders the component for the currently active route.
 *
 * This component reads the current route from RouterContext and renders
 * the corresponding component from the components map. It automatically
 * re-renders when the route changes.
 *
 * The return type preserves error and requirement types from all route
 * components, allowing TypeScript to track which errors need handling
 * and which services need to be provided.
 *
 * @example
 * ```ts
 * import { Routes, Component } from "@effex/platform";
 * import { routes, components } from "./generated/routes";
 *
 * const App: Component.Unit = () =>
 *   Effect.gen(function* () {
 *     return yield* div([
 *       Header(),
 *       Routes({ components }),
 *       Footer(),
 *     ]);
 *   });
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
const RoutesImpl = <T extends ComponentsMap>(
  props: RoutesProps<T>,
): Element.Element<
  ComponentsError<T>,
  ComponentsRequirements<T> | RouterContext
> =>
  Effect.gen(function* () {
    const router = yield* RouterContext;

    // Create a derived value that combines route name + pathname
    // This ensures re-renders when params change within the same route
    // (e.g., /users/1 -> /users/2 both have route "users_$id" but different paths)
    const routeWithPath = yield* Derived.sync(
      [router.currentRoute, router.pathname] as const,
      ([routeOpt, pathname]) =>
        pipe(
          routeOpt,
          Option.map((route) => `${route}::${pathname}`),
          Option.getOrNull,
        ),
    );

    // Extract the route name from the combined value for pattern matching
    const extractRouteName = (combined: string | null): string | null => {
      if (combined === null) return null;
      return combined.split("::")[0];
    };

    // Create a wrapper that provides LoaderContext to each route component
    // Only provides LoaderContext during client-side navigation (not SSR or hydration)
    const wrapWithLoaderContext =
      (
        routeName: string,
        componentFn: RouteComponent<any, any>,
      ): RouteComponent<any, any> =>
      () =>
        Effect.gen(function* () {
          // Check if LoaderContext is already provided (SSR or hydration)
          const existingLoaderContext =
            yield* Effect.serviceOption(LoaderContextTag);

          // If we have existing context, determine whether to use it
          if (Option.isSome(existingLoaderContext)) {
            const ctx = existingLoaderContext.value;
            // During SSR or hydration, use existing context IF it's for the same route
            // - SSR: router.loaderState isn't populated on the server
            // - Hydration: loader data was already fetched on server and provided
            // - Client nav: old context from hydration may still be in scope, skip it
            const isSSR = typeof window === "undefined";
            const isHydratingThisRoute =
              ctx.isHydrating && ctx.routeId === routeName;

            // Special case: during initial hydration of a route WITHOUT a loader,
            // ctx.routeId is "" but we should still use the context.
            // We detect this by checking if loaderState hasn't been set yet
            // (during initial hydration) vs client-side navigation (loaderState is set).
            const loaderState = yield* router.loaderState.get;
            const isInitialHydrationNoLoader =
              ctx.isHydrating &&
              ctx.routeId === "" &&
              loaderState.routeName === null;

            if (isSSR || isHydratingThisRoute || isInitialHydrationNoLoader) {
              return yield* componentFn();
            }
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
        });

    // Build match cases from components map, wrapping each with LoaderContext
    const cases = Object.entries(props.components).map(
      ([routeName, componentFn]) => ({
        pattern: routeName,
        render: wrapWithLoaderContext(routeName, componentFn),
      }),
    );

    // Default fallback renders empty div with display:contents
    const fallback =
      props.fallback ?? (() => $.div({ style: { display: "contents" } }, []));

    // Use match control flow to render the active route's component
    // routeWithPath includes the pathname for change detection (e.g., params changes)
    // extractPattern extracts just the route name for case matching
    // When routeWithPath is null, fallback is rendered
    return yield* match(routeWithPath, {
      cases,
      fallback,
      extractPattern: extractRouteName,
    });
  }) as Element.Element<
    ComponentsError<T>,
    ComponentsRequirements<T> | RouterContext
  >;

/**
 * The Routes component with a _tag for debugging.
 */
export const Routes = Object.assign(RoutesImpl, { _tag: "Routes" as const });
