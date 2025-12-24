import { Effect, Scope, Stream } from "effect";
import type { Schema } from "effect";
import { Signal, Derived } from "@effex/core";
import type {
  AnyRoute,
  Route,
  Router as RouterType,
  RouterOptions,
  RouteState,
  NavigateOptions,
  LoaderResult,
  LoaderState,
} from "./types";
import { routeSpecificity } from "./Route";

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
 * // Navigate
 * yield* router.push("/users/123")
 *
 * // Access route state
 * const isUserActive = yield* router.routes.user.isActive.get
 * const userParams = yield* router.routes.user.params.get
 * ```
 */
export const make = <Routes extends Record<string, AnyRoute>>(
  routes: Routes,
  options?: RouterOptions,
): Effect.Effect<RouterType<Routes>, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Get initial path and search from options or window.location
    const initialPath =
      options?.initialPath ??
      (typeof window !== "undefined" ? window.location.pathname : "/");
    const initialSearch =
      options?.initialSearch ??
      (typeof window !== "undefined" ? window.location.search : "");

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
      ([pathname]): keyof Routes | null => {
        for (const [name, route] of sortedRouteEntries) {
          // Try to match synchronously by checking segments
          const result = tryMatchSync(route, pathname);
          if (result !== null) {
            return name as keyof Routes;
          }
        }
        return null;
      },
    );

    // Create route-specific state for each route
    const routeStates = {} as {
      [K in keyof Routes]: RouteState<
        Routes[K] extends Route<string, infer P>
          ? P extends Schema.Schema.AnyNoContext
            ? Schema.Schema.Type<P>
            : Record<string, never>
          : Record<string, never>
      >;
    };

    for (const [name, route] of Object.entries(routes)) {
      const isActive = yield* Derived.sync(
        [currentRoute],
        ([current]) => current === name,
      );

      // Derive params synchronously using the raw matching (without schema validation)
      // Schema validation happens on route.match() when explicitly called
      const params = yield* Derived.sync([pathnameSignal], (values) => {
        const pathname = values[0];
        const rawMatch = tryMatchSync(route, pathname);
        return rawMatch as unknown | null;
      });

      (routeStates as Record<string, RouteState<unknown>>)[name] = {
        isActive,
        params,
      };
    }

    // Set up history listener
    if (typeof window !== "undefined") {
      const handlePopState = () => {
        Effect.runSync(pathnameSignal.set(window.location.pathname));
        Effect.runSync(
          searchParamsSignal.set(new URLSearchParams(window.location.search)),
        );
      };

      window.addEventListener("popstate", handlePopState);

      // Clean up listener when scope is closed
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          window.removeEventListener("popstate", handlePopState);
        }),
      );
    }

    // Navigation functions
    const push = (path: string, opts?: NavigateOptions): Effect.Effect<void> =>
      Effect.sync(() => {
        if (typeof window !== "undefined") {
          const url = new URL(path, window.location.origin);
          if (opts?.replace) {
            window.history.replaceState(null, "", url.pathname + url.search);
          } else {
            window.history.pushState(null, "", url.pathname + url.search);
          }
          Effect.runSync(pathnameSignal.set(url.pathname));
          Effect.runSync(searchParamsSignal.set(url.searchParams));
        }
      });

    const replace = (path: string): Effect.Effect<void> =>
      push(path, { replace: true });

    const back = (): Effect.Effect<void> =>
      Effect.sync(() => {
        if (typeof window !== "undefined") {
          window.history.back();
        }
      });

    const forward = (): Effect.Effect<void> =>
      Effect.sync(() => {
        if (typeof window !== "undefined") {
          window.history.forward();
        }
      });

    // Create reactive loader state
    const initialLoaderState: LoaderState = {
      routeName: null,
      params: {},
      data: null,
      isLoading: false,
      error: null,
    };
    const loaderStateSignal = yield* Signal.make(initialLoaderState);

    // Execute the loader for the currently matched route
    const executeLoader = <R = never>(): Effect.Effect<
      LoaderResult | null,
      unknown,
      R
    > =>
      Effect.gen(function* () {
        const currentRouteName = yield* currentRoute.get;
        if (currentRouteName === null) {
          return null;
        }

        const routeDef = routes[currentRouteName as keyof Routes];
        if (!routeDef || !routeDef.loader) {
          return null;
        }

        const pathname = yield* pathnameSignal.get;
        const params = yield* routeDef.match(pathname);

        const data = yield* routeDef.loader(params) as Effect.Effect<
          unknown,
          unknown,
          R
        >;

        return {
          routeName: currentRouteName as string,
          params,
          data,
        } satisfies LoaderResult;
      });

    // Execute loader and update reactive state
    const runLoaderAndUpdateState = Effect.gen(function* () {
      const currentRouteName = yield* currentRoute.get;
      if (currentRouteName === null) {
        yield* loaderStateSignal.set({
          routeName: null,
          params: {},
          data: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      const routeDef = routes[currentRouteName as keyof Routes];
      const pathname = yield* pathnameSignal.get;
      const rawParams = tryMatchSync(routeDef, pathname) ?? {};

      // If route has no loader, just update with null data
      if (!routeDef || !routeDef.loader) {
        yield* loaderStateSignal.set({
          routeName: currentRouteName as string,
          params: rawParams,
          data: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Set loading state
      yield* loaderStateSignal.set({
        routeName: currentRouteName as string,
        params: rawParams,
        data: null,
        isLoading: true,
        error: null,
      });

      // Execute loader
      const result = yield* Effect.either(
        Effect.gen(function* () {
          const params = yield* routeDef.match(pathname);
          return yield* routeDef.loader!(params) as Effect.Effect<unknown>;
        }),
      );

      if (result._tag === "Right") {
        yield* loaderStateSignal.set({
          routeName: currentRouteName as string,
          params: rawParams,
          data: result.right,
          isLoading: false,
          error: null,
        });
      } else {
        yield* loaderStateSignal.set({
          routeName: currentRouteName as string,
          params: rawParams,
          data: null,
          isLoading: false,
          error: result.left,
        });
      }
    });

    // Initialize loader data from SSR (for hydration)
    const initializeLoaderData = (
      routeName: string,
      params: Record<string, string>,
      data: unknown,
    ): Effect.Effect<void> =>
      loaderStateSignal.set({
        routeName,
        params,
        data,
        isLoading: false,
        error: null,
      });

    // Subscribe to route changes and execute loaders (client-side only)
    if (typeof window !== "undefined") {
      // Track last route to detect changes
      let lastRouteName: string | null = null;

      yield* Effect.fork(
        Stream.runForEach(currentRoute.changes, (newRouteName) =>
          Effect.gen(function* () {
            // Only run loader if route actually changed
            if (newRouteName !== lastRouteName) {
              lastRouteName = newRouteName as string | null;
              yield* runLoaderAndUpdateState;
            }
          }),
        ),
      );
    }

    const router: RouterType<Routes> = {
      pathname: pathnameSignal,
      searchParams: searchParamsSignal,
      currentRoute,
      routes: routeStates,
      definitions: routes,
      loaderState: loaderStateSignal,
      push,
      replace,
      back,
      forward,
      executeLoader,
      initializeLoaderData,
    };

    return router;
  });

/**
 * Synchronously try to match a route against a pathname.
 * Returns the raw params if matched, null if no match.
 * This doesn't validate with Schema - just checks if the path pattern matches.
 */
const tryMatchSync = (
  route: AnyRoute,
  pathname: string,
): Record<string, string> | null => {
  const parts = pathname.split("/").filter((p) => p.length > 0);
  const params: Record<string, string> = {};

  let segmentIndex = 0;
  let partIndex = 0;

  while (segmentIndex < route.segments.length) {
    const segment = route.segments[segmentIndex];

    if (segment.type === "catchAll") {
      return params;
    }

    if (partIndex >= parts.length) {
      return null;
    }

    const part = parts[partIndex];

    if (segment.type === "static") {
      if (segment.value !== part) {
        return null;
      }
    } else if (segment.type === "param") {
      params[segment.name] = part;
    }

    segmentIndex++;
    partIndex++;
  }

  if (partIndex < parts.length) {
    return null;
  }

  return params;
};

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
 * router.currentRoute // Readable<"home" | "user" | null>
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
