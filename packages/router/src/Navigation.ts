import { Context, Effect, Layer, Option, Record, Runtime, Scope } from "effect";

import { Readable, Signal } from "@effex/core";

import type { Route } from "./Route.js";
import { findMatch, type Router } from "./Router.js";

// =============================================================================
// Path Building
// =============================================================================

/**
 * Build a path string from a route and params.
 * Replaces :param segments with actual values and appends search params.
 */
export const buildPath = <P, SP, D, E, R>(
  route: Route<string, P, SP, D, E, R>,
  params: P,
  searchParams?: SP,
): string => {
  // Replace param segments in the path
  let path = route.path;

  if (params && typeof params === "object") {
    for (const [key, value] of Object.entries(
      params as Record<string, unknown>,
    )) {
      path = path.replace(`:${key}`, String(value));
    }
  }

  // Append search params if provided
  if (searchParams && typeof searchParams === "object") {
    const entries = Object.entries(
      searchParams as Record<string, unknown>,
    ).filter(([, v]) => v !== undefined && v !== null);

    if (entries.length > 0) {
      const queryString = entries
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
        )
        .join("&");
      path = `${path}?${queryString}`;
    }
  }

  return path;
};

// =============================================================================
// Navigation Service Types
// =============================================================================

/**
 * Options for route-based navigation.
 */
export interface RouteNavigateOptions<P, SP> {
  readonly params?: P;
  readonly searchParams?: SP;
}

/**
 * The current match result from the router.
 */
export interface CurrentMatch {
  readonly route: Route<string, unknown, unknown, unknown, unknown, unknown>;
  readonly params: Record<string, string>;
}

/**
 * Which mechanism triggered the most recent navigation. Consumers (Outlet's
 * scroll behavior, DevTools) use this to distinguish user actions from
 * browser back/forward so they don't fight the browser's native scroll
 * restoration.
 *
 * `null` on initial construction — no navigation has happened yet.
 */
export type NavigationSource = "push" | "replace" | "pop" | null;

/**
 * Navigation service for managing browser history and route state.
 */
export interface Navigation {
  /** The router this navigation is bound to */
  readonly router: Router<any, any, any, any, any>;

  /** Current pathname as a reactive readable */
  readonly pathname: Readable.Readable<string>;

  /** Current search params as a reactive readable */
  readonly searchParams: Readable.Readable<URLSearchParams>;

  /** Current matched route (if any) */
  readonly currentMatch: Readable.Readable<CurrentMatch>;

  /**
   * Which mechanism drove the most recent pathname change. Updated *before*
   * `pathname` publishes, so subscribers reading both can rely on
   * `lastSource.get` reflecting the source of the change they were woken
   * for. `null` until the first navigation.
   */
  readonly lastSource: Readable.Readable<NavigationSource>;

  /** Navigate to a path string */
  readonly pushPath: (path: string) => Effect.Effect<void>;

  /** Navigate to a path string, replacing current history entry */
  readonly replacePath: (path: string) => Effect.Effect<void>;

  /** Navigate to a route with type-safe params */
  readonly pushRoute: <P, SP>(
    route: Route<string, P, SP, unknown, unknown, unknown>,
    options?: RouteNavigateOptions<P, SP>,
  ) => Effect.Effect<void>;

  /** Navigate to a route, replacing current history entry */
  readonly replaceRoute: <P, SP>(
    route: Route<string, P, SP, unknown, unknown, unknown>,
    options?: RouteNavigateOptions<P, SP>,
  ) => Effect.Effect<void>;

  /** Go back in history */
  readonly back: () => Effect.Effect<void>;

  /** Go forward in history */
  readonly forward: () => Effect.Effect<void>;
}

// =============================================================================
// Navigation Context
// =============================================================================

/**
 * Context tag for the Navigation service.
 */
export class NavigationContext extends Context.Tag("@effex/router/Navigation")<
  NavigationContext,
  Navigation
>() {}

// =============================================================================
// Navigation Options
// =============================================================================

export interface NavigationOptions {
  /** Initial pathname for SSR or testing */
  readonly initialPath?: string;
  /** Initial search string for SSR or testing (e.g., "?foo=bar") */
  readonly initialSearch?: string;
}

// =============================================================================
// Navigation Implementation
// =============================================================================

/**
 * Create a Navigation service for a router.
 *
 * @example
 * ```ts
 * const NavigationLive = Navigation.makeLayer(router);
 *
 * // In your app
 * Effect.gen(function* () {
 *   const nav = yield* NavigationContext;
 *   const path = yield* nav.pathname.get;
 *   yield* nav.pushRoute(UserRoute, { params: { id: 123 } });
 * }).pipe(Effect.provide(NavigationLive));
 * ```
 */
export const make = <
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
>(
  router: Router<P, S, D, E, R>,
  options?: NavigationOptions,
): Effect.Effect<Navigation, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Determine if we're in a browser environment
    const isBrowser = typeof window !== "undefined";

    // Get initial values
    const initialPathname =
      options?.initialPath ?? (isBrowser ? window.location.pathname : "/");
    const initialSearch =
      options?.initialSearch ?? (isBrowser ? window.location.search : "");

    // Create mutable reactive state
    const pathnameState = yield* Signal.make(initialPathname);
    const searchParamsState = yield* Signal.make(
      new URLSearchParams(initialSearch),
    );
    // Nav source is set BEFORE the pathname update publishes so subscribers
    // (Outlet's scroll behavior) can distinguish push/replace/pop when they
    // wake up. Ordering matters — see updateState / handlePopState below.
    const lastSourceState = yield* Signal.make<NavigationSource>(null);

    // Compute current match from pathname (derived readable)
    const currentMatch: Readable.Readable<CurrentMatch> = Readable.map(
      pathnameState,
      (pathname): CurrentMatch => {
        const match = findMatch(router, pathname);
        return Option.getOrElse(match, () => ({
          route: router.fallback,
        })) as CurrentMatch;
      },
    );

    // Update internal state from a full path (may include query string).
    // Callers set lastSource first, then updateState publishes the pathname
    // change — subscribers reading lastSource see the correct source.
    const updateState = (fullPath: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const url = new URL(fullPath, "http://localhost");
        yield* pathnameState.set(url.pathname);
        yield* searchParamsState.set(url.searchParams);
      });

    // Navigation methods
    const pushPath = (path: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const from = yield* pathnameState.get;
        yield* Effect.logDebug("pushPath", { from, to: path }).pipe(
          Effect.annotateLogs("subsystem", "effex.nav"),
        );
        yield* lastSourceState.set("push");
        yield* updateState(path);
        if (isBrowser) {
          window.history.pushState(null, "", path);
        }
      });

    const replacePath = (path: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const from = yield* pathnameState.get;
        yield* Effect.logDebug("replacePath", { from, to: path }).pipe(
          Effect.annotateLogs("subsystem", "effex.nav"),
        );
        yield* lastSourceState.set("replace");
        yield* updateState(path);
        if (isBrowser) {
          window.history.replaceState(null, "", path);
        }
      });

    const pushRoute = <P, SP>(
      route: Route<string, P, SP, unknown, unknown, unknown>,
      opts?: RouteNavigateOptions<P, SP>,
    ): Effect.Effect<void> => {
      const path = buildPath(
        route,
        opts?.params ?? ({} as P),
        opts?.searchParams,
      );
      return pushPath(path);
    };

    const replaceRoute = <P, SP>(
      route: Route<string, P, SP, unknown, unknown, unknown>,
      opts?: RouteNavigateOptions<P, SP>,
    ): Effect.Effect<void> => {
      const path = buildPath(
        route,
        opts?.params ?? ({} as P),
        opts?.searchParams,
      );
      return replacePath(path);
    };

    const back = (): Effect.Effect<void> =>
      Effect.sync(() => {
        if (isBrowser) {
          window.history.back();
        }
      });

    const forward = (): Effect.Effect<void> =>
      Effect.sync(() => {
        if (isBrowser) {
          window.history.forward();
        }
      });

    // Set up popstate listener for browser back/forward.
    //
    // Capture the current Runtime at Layer construction time and use it
    // to run the popstate handler. Two reasons:
    //
    // 1. `updateState` calls Signal.set → SubscriptionRef.set, which
    //    uses `semaphore.withPermits(1)` internally. Effect can flag
    //    that as async-capable and Effect.runSync throws for anything
    //    that isn't pure-sync — silently, from the browser's event
    //    handler perspective. `Runtime.runFork` on the app's runtime
    //    accepts async work and doesn't throw.
    //
    // 2. Running on the SAME runtime the app is using ensures the
    //    signal update reaches subscribers that live in that runtime.
    //    A fresh default runtime (as Effect.runSync creates) can miss
    //    cross-runtime PubSub delivery timing in rare cases.
    if (isBrowser) {
      const runtime = yield* Effect.runtime<never>();
      const runFork = Runtime.runFork(runtime);

      const handlePopState = () => {
        // Set the source BEFORE running updateState. Both are runFork'd on
        // the same runtime, so the semaphore inside SubscriptionRef.set
        // serialises them — lastSource is guaranteed to be "pop" by the
        // time pathname's subscribers wake up.
        const target = window.location.pathname + window.location.search;
        runFork(
          Effect.gen(function* () {
            const from = yield* pathnameState.get;
            yield* Effect.logDebug("popstate", { from, to: target }).pipe(
              Effect.annotateLogs("subsystem", "effex.nav"),
            );
            yield* lastSourceState.set("pop");
            yield* updateState(target);
          }),
        );
      };

      window.addEventListener("popstate", handlePopState);

      // Clean up on scope finalization
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          window.removeEventListener("popstate", handlePopState);
        }),
      );
    }

    return {
      router,
      pathname: pathnameState,
      searchParams: searchParamsState,
      currentMatch,
      lastSource: lastSourceState,
      pushPath,
      replacePath,
      pushRoute,
      replaceRoute,
      back,
      forward,
    } as Navigation;
  });

/**
 * Create a Layer that provides Navigation for a router.
 */
export const makeLayer = <
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
>(
  router: Router<P, S, D, E, R>,
  options?: NavigationOptions,
) => Layer.scoped(NavigationContext, make(router, options));

// =============================================================================
// Accessor Effects
// =============================================================================

/**
 * Get the current pathname.
 */
export const pathname: Effect.Effect<string, never, NavigationContext> =
  Effect.flatMap(NavigationContext, (nav) => nav.pathname.get);

/**
 * Get the current search params.
 */
export const searchParams: Effect.Effect<
  URLSearchParams,
  never,
  NavigationContext
> = Effect.flatMap(NavigationContext, (nav) => nav.searchParams.get);

/**
 * Get the current matched route.
 */
export const currentMatch: Effect.Effect<
  CurrentMatch,
  never,
  NavigationContext
> = Effect.flatMap(NavigationContext, (nav) => nav.currentMatch.get);

/**
 * Navigate to a path.
 */
export const pushPath = (
  path: string,
): Effect.Effect<void, never, NavigationContext> =>
  Effect.flatMap(NavigationContext, (nav) => nav.pushPath(path));

/**
 * Navigate to a path, replacing current history entry.
 */
export const replacePath = (
  path: string,
): Effect.Effect<void, never, NavigationContext> =>
  Effect.flatMap(NavigationContext, (nav) => nav.replacePath(path));

/**
 * Navigate to a route with type-safe params.
 */
export const pushRoute = <P, SP, D, E, R>(
  route: Route<string, P, SP, D, E, R>,
  options?: RouteNavigateOptions<P, SP>,
): Effect.Effect<void, never, NavigationContext> =>
  Effect.flatMap(NavigationContext, (nav) => {
    const path = buildPath(
      route,
      options?.params ?? ({} as P),
      options?.searchParams,
    );
    return nav.pushPath(path);
  });

/**
 * Navigate to a route, replacing current history entry, with type-safe params.
 */
export const replaceRoute = <P, SP, D, E, R>(
  route: Route<string, P, SP, D, E, R>,
  options?: RouteNavigateOptions<P, SP>,
): Effect.Effect<void, never, NavigationContext> =>
  Effect.flatMap(NavigationContext, (nav) => {
    const path = buildPath(
      route,
      options?.params ?? ({} as P),
      options?.searchParams,
    );
    return nav.replacePath(path);
  });

/**
 * Go back in history.
 */
export const back: Effect.Effect<void, never, NavigationContext> =
  Effect.flatMap(NavigationContext, (nav) => nav.back());

/**
 * Go forward in history.
 */
export const forward: Effect.Effect<void, never, NavigationContext> =
  Effect.flatMap(NavigationContext, (nav) => nav.forward());

// =============================================================================
// Module Export
// =============================================================================

export const Navigation = {
  buildPath,
  make,
  makeLayer,
  Context: NavigationContext,
  pathname,
  searchParams,
  currentMatch,
  pushPath,
  replacePath,
  pushRoute,
  replaceRoute,
  back,
  forward,
};
