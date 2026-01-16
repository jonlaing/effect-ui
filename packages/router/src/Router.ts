import { Effect, Layer, Option, Scope } from "effect";

import { Derived, Signal } from "@effex/core";

import { createActionMethods } from "./action";
import { setupHistoryListener } from "./history";
import { isBrowser, RouterInternalsContext } from "./internals";
import { createLoaderMethods } from "./loader";
import { tryMatchSync } from "./matching";
import { createNavigationMethods } from "./navigation";
import { routeSpecificity } from "./Route";
import { RouterContext } from "./RouterContext";
import { createRouteStates } from "./routeState";
import { setupPathnameSubscription } from "./subscription";
import type {
  ActionState,
  AnyRoute,
  LayoutsRecord,
  LayoutState,
  LoaderState,
  RouteLayoutsRecord,
  RouterOptions,
  Router as RouterType,
} from "./types";

/**
 * Create a Router from a record of routes.
 *
 * @param routes - A record mapping route names to Route definitions
 * @param options - Optional router configuration
 *
 * @example
 * ```ts
 * const HomeRoute = Route.make("/")
 * const UserRoute = Route.make("/users/:id", {
 *   params: Schema.Struct({ id: Schema.String })
 * })
 *
 * const router = yield* Router.make({
 *   home: HomeRoute,
 *   user: UserRoute,
 * })
 *
 * // Provide to your app using router.layer
 * yield* mount(App().pipe(Effect.provide(router.layer)), root)
 *
 * // Navigate
 * yield* router.push("/users/123")
 *
 * // Access route state
 * const isUserActive = yield* router.routes.user.isActive.get
 * const userParams = yield* router.routes.user.params.get
 * ```
 */
export const make = <
  Routes extends Record<string, AnyRoute>,
  Layouts extends LayoutsRecord = LayoutsRecord,
  RL extends RouteLayoutsRecord = RouteLayoutsRecord,
>(
  routes: Routes,
  options?: RouterOptions<Layouts, RL>,
): Effect.Effect<RouterType<Routes>, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Get initial path and search from options or window.location
    const initialPath =
      options?.initialPath ?? (isBrowser() ? window.location.pathname : "/");
    const initialSearch =
      options?.initialSearch ?? (isBrowser() ? window.location.search : "");

    // Get layouts configuration
    const layoutDefinitions = options?.layouts ?? ({} as Layouts);
    const routeLayouts = options?.routeLayouts ?? ({} as RL);
    const layoutNames = Object.keys(layoutDefinitions);

    // Create signals for pathname and search params
    const pathnameSignal = yield* Signal.make(initialPath);
    const searchParamsSignal = yield* Signal.make(
      new URLSearchParams(initialSearch),
    );

    // Sort routes by specificity (most specific first)
    const sortedRouteEntries = Object.entries(routes).sort(
      ([, a], [, b]) =>
        routeSpecificity(b.segments) - routeSpecificity(a.segments),
    );

    // Create a derived for the current matched route
    const currentRoute = yield* Derived.sync(
      [pathnameSignal],
      ([pathname]): Option.Option<keyof Routes & string> => {
        for (const [name, route] of sortedRouteEntries) {
          const result = tryMatchSync(route, pathname);
          if (result !== null) {
            return Option.some(name as keyof Routes & string);
          }
        }
        return Option.none();
      },
    );

    // Create a derived for active layouts based on current route
    const activeLayouts = yield* Derived.sync(
      [currentRoute],
      ([routeOpt]): readonly string[] => {
        if (Option.isNone(routeOpt)) {
          return [];
        }
        const routeName = routeOpt.value;
        return routeLayouts[routeName] ?? [];
      },
    );

    // Create layout state for each layout
    const layoutStates: Record<string, LayoutState> = {};
    for (const layoutName of layoutNames) {
      const isActive = yield* Derived.sync([activeLayouts], ([layouts]) =>
        layouts.includes(layoutName),
      );
      layoutStates[layoutName] = { isActive };
    }

    // Create loader and action state signals
    const initialLoaderState: LoaderState = {
      routeName: null,
      params: {},
      data: null,
      isLoading: false,
      error: null,
    };
    const loaderStateSignal = yield* Signal.make(initialLoaderState);

    const initialActionState: ActionState = {
      isSubmitting: false,
      data: null,
      error: null,
      routeName: null,
      submissionId: null,
    };
    const actionStateSignal = yield* Signal.make(initialActionState);

    // Create context layer with all shared state
    const internalsLayer = Layer.succeed(RouterInternalsContext, {
      routes,
      currentRoute,
      pathnameSignal,
      searchParamsSignal,
      loaderStateSignal,
      actionStateSignal,
    });

    // Create route-specific state for each route
    const routeStates = yield* createRouteStates<Routes>().pipe(
      Effect.provide(internalsLayer),
    );

    // Set up history listener
    yield* setupHistoryListener().pipe(Effect.provide(internalsLayer));

    // Create navigation methods
    const { push, replace, back, forward } =
      yield* createNavigationMethods().pipe(Effect.provide(internalsLayer));

    // Create loader methods
    const { executeLoader, runLoaderAndUpdateState, initializeLoaderData } =
      yield* createLoaderMethods<Routes>().pipe(Effect.provide(internalsLayer));

    // Create action methods (needs runLoaderAndUpdateState as parameter)
    const { executeAction, submitAction, initializeActionData } =
      yield* createActionMethods<Routes>(runLoaderAndUpdateState).pipe(
        Effect.provide(internalsLayer),
      );

    // Subscribe to pathname changes and execute loaders
    yield* setupPathnameSubscription(initialPath, runLoaderAndUpdateState).pipe(
      Effect.provide(internalsLayer),
    );

    const router: RouterType<Routes> = {
      pathname: pathnameSignal,
      searchParams: searchParamsSignal,
      currentRoute,
      routes: routeStates,
      definitions: routes,
      activeLayouts,
      layouts: layoutStates,
      loaderState: loaderStateSignal,
      actionState: actionStateSignal,
      push,
      replace,
      back,
      forward,
      executeLoader,
      executeAction,
      submitAction,
      initializeLoaderData,
      initializeActionData,
      // Layer is added below after router object is created
      layer: null as unknown as Layer.Layer<unknown>,
    };

    // Add the layer property (needs router reference)
    (router as { layer: Layer.Layer<RouterContext> }).layer = Layer.succeed(
      RouterContext,
      router,
    );

    return router;
  });

/**
 * Infer the Router type from a routes record.
 * Use this to create typed router contexts.
 *
 * @example
 * ```ts
 * const routes = {
 *   home: Route.make("/"),
 *   user: Route.make("/users/:id", { params: Schema.Struct({ id: Schema.String }) }),
 * }
 *
 * // Infer the router type
 * type AppRouter = Router.Infer<typeof routes>
 *
 * // Create a typed context for your app
 * class AppRouterContext extends Context.Tag("AppRouterContext")<
 *   AppRouterContext,
 *   AppRouter
 * >() {}
 *
 * // Now you can yield the typed router from context
 * const router = yield* AppRouterContext
 * router.currentRoute // Readable<Option<"home" | "user">>
 * router.routes.user.params // Readable<{ id: string } | null>
 * ```
 */
export type Infer<Routes extends Record<string, AnyRoute>> = RouterType<Routes>;

/**
 * Router module namespace.
 */
export const Router = {
  make,
};
