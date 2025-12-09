import { Effect, Scope } from "effect";
import type { Schema } from "effect";
import { Signal } from "@core/Signal";
import { Derived } from "@core/Derived";
import type {
  Route,
  Router as RouterType,
  RouterOptions,
  RouteState,
  NavigateOptions,
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
export const make = <
  Routes extends Record<string, Route<string, Schema.Schema.AnyNoContext>>,
>(
  routes: Routes,
  options?: RouterOptions,
): Effect.Effect<RouterType<Routes>, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Get initial path from options or window.location
    const initialPath =
      options?.initialPath ??
      (typeof window !== "undefined" ? window.location.pathname : "/");
    const initialSearch =
      typeof window !== "undefined" ? window.location.search : "";

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

    const router: RouterType<Routes> = {
      pathname: pathnameSignal,
      searchParams: searchParamsSignal,
      currentRoute,
      routes: routeStates,
      push,
      replace,
      back,
      forward,
    };

    return router;
  });

/**
 * Synchronously try to match a route against a pathname.
 * Returns the raw params if matched, null if no match.
 * This doesn't validate with Schema - just checks if the path pattern matches.
 */
const tryMatchSync = (
  route: Route<string, Schema.Schema.AnyNoContext>,
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
export type Infer<
  Routes extends Record<string, Route<string, Schema.Schema.AnyNoContext>>,
> = RouterType<Routes>;

/**
 * Router module namespace.
 */
export const Router = {
  make,
};
