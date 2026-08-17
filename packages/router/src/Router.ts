import { Effect, Option, Pipeable, Record, Schema } from "effect";

import { Readable } from "@effex/core";
import type { Element } from "@effex/dom";

import {
  isRoute,
  matchSegments,
  parsePath,
  routeSpecificity,
  type Route,
} from "./Route.js";
import type { ScrollBehavior } from "./ScrollBehavior.js";

// =============================================================================
// TypeId
// =============================================================================

export const TypeId: unique symbol = Symbol.for("@effex/router/Router");
export type TypeId = typeof TypeId;

// =============================================================================
// Types
// =============================================================================

/**
 * Layout wrapper function - must be transparent to E/R.
 */
export type LayoutWrapper = <A extends HTMLElement | SVGElement, E, R>(
  children: Element.Element<A, E, R>,
) => Element.Element<HTMLElement, E, R>;

/**
 * Options for Router.match
 */
export interface MatchOptions {
  readonly animate?: {
    readonly enter?: string;
    readonly exit?: string;
  };
}

/**
 * A router containing routes and configuration.
 */
export interface Router<
  P extends Record<string, unknown> | never = never,
  S extends Record<string, unknown> | never = never,
  D = never,
  E = never,
  R = never,
>
  extends Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  /** All routes in this router */
  readonly routes: ReadonlyArray<Route<string, P, S, D, E, R>>;
  /** Fallback render function when no route matches */
  readonly fallback:
    | (() => Element.Element<HTMLElement | SVGElement, E, R>)
    | null;
  /** Layout wrappers to apply (in order, inside-out) */
  readonly layouts: ReadonlyArray<LayoutWrapper>;
  /**
   * Router-level default scroll behavior. Applied on push/replace when a
   * matched route has no `_scrollBehavior` of its own. If unset, the
   * framework default is `"top"`.
   */
  readonly scrollBehavior: ScrollBehavior | null;
}

// =============================================================================
// Constructors
// =============================================================================

const RouterProto = {
  [TypeId]: TypeId,
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments);
  },
};

/**
 * An empty router with no routes.
 */
export const empty: Router = Object.assign(Object.create(RouterProto), {
  routes: [],
  fallback: null,
  layouts: [],
  scrollBehavior: null,
});

// =============================================================================
// Combinators
// =============================================================================

/**
 * Add a route or merge another router.
 * This is polymorphic - accepts both Route and Router.
 *
 * @example
 * ```ts
 * const router = Router.empty.pipe(
 *   Router.concat(HomeRoute),
 *   Router.concat(UserRoute),
 *   Router.concat(adminRouter),
 * );
 * ```
 */
export const concat: {
  <
    Path extends string,
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    R,
  >(
    route: Route<Path, P, S, D, E, R>,
  ): <
    P2 extends Record<string, unknown> | never,
    S2 extends Record<string, unknown> | never,
    D2,
    E2,
    R2,
  >(
    router: Router<P2, S2, D2, E2, R2>,
  ) => Router<P & P2, S & S2, D | D2, E | E2, R | R2>;
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    R,
  >(
    other: Router<P, S, D, E, R>,
  ): <
    P2 extends Record<string, unknown> | never,
    S2 extends Record<string, unknown> | never,
    D2,
    E2,
    R2,
  >(
    router: Router<P2, S2, D2, E2, R2>,
  ) => Router<P & P2, S & S2, D | D2, E | E2, R | R2>;
} =
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    R,
  >(
    routeOrRouter: Route<string, P, S, D, E, R> | Router<P, S, D, E, R>,
  ) =>
  <
    P2 extends Record<string, unknown> | never,
    S2 extends Record<string, unknown> | never,
    D2,
    E2,
    R2,
  >(
    router: Router<P2, S2, D2, E2, R2>,
  ): Router<P & P2, S & S2, D | D2, E | E2, R | R2> => {
    if (isRoute(routeOrRouter)) {
      // Adding a single route
      return Object.assign(Object.create(RouterProto), {
        ...router,
        routes: [...router.routes, routeOrRouter],
      }) as Router<P & P2, S & S2, D | D2, E | E2, R | R2>;
    }
    // Merging another router
    const other = routeOrRouter as Router<P, S, D, E, R>;
    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: [...router.routes, ...other.routes],
      // Keep existing fallback if other doesn't have one
      fallback: other.fallback ?? router.fallback,
      // Combine layouts (router's layouts applied first, then other's)
      layouts: [...router.layouts, ...other.layouts],
    }) as Router<P & P2, S & S2, D | D2, E | E2, R | R2>;
  };

/**
 * Add a prefix to all routes in the router.
 *
 * @example
 * ```ts
 * const adminRouter = Router.empty.pipe(
 *   Router.concat(AdminDashboardRoute),
 *   Router.concat(AdminUsersRoute),
 *   Router.prefixAll("/admin"),
 * );
 * // Routes: /admin, /admin/users
 * ```
 */
export const prefixAll =
  (prefix: string) =>
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    R,
  >(
    router: Router<P, S, D, E, R>,
  ): Router<P, S, D, E, R> => {
    const normalizedPrefix = prefix.endsWith("/")
      ? prefix.slice(0, -1)
      : prefix;

    const prefixedRoutes = router.routes.map((route) => {
      const newPath =
        route.path === "/"
          ? normalizedPrefix || "/"
          : `${normalizedPrefix}${route.path}`;

      return {
        ...route,
        path: newPath,
        segments: parsePath(newPath),
      };
    });

    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: prefixedRoutes,
    }) as Router<P, S, D, E, R>;
  };

/**
 * Set the fallback render function for when no route matches.
 *
 * @example
 * ```ts
 * const router = Router.empty.pipe(
 *   Router.concat(HomeRoute),
 *   Router.fallback(() => NotFoundPage()),
 * );
 * ```
 */
export const fallback =
  <E, R>(render: () => Element.Element<HTMLElement | SVGElement, E, R>) =>
  <
    P extends Record<string, unknown>,
    S extends Record<string, unknown>,
    D,
    E2,
    R2,
  >(
    router: Router<P, S, D, E2, R2>,
  ): Router<P, S, D, E | E2, R | R2> => {
    return Object.assign(Object.create(RouterProto), {
      ...router,
      fallback: render,
    }) as Router<P, S, D, E | E2, R | R2>;
  };

/**
 * Set the default scroll behavior for client-side navigation. Applies to
 * every route in this router unless the route sets its own via
 * `Route.scrollBehavior`. Only fires for `pushPath` / `replacePath` — the
 * browser handles popstate.
 *
 * @example
 * ```ts
 * const router = Router.empty.pipe(
 *   Router.concat(HomeRoute),
 *   Router.concat(BlogRoute),
 *   Router.scrollBehavior("top"),  // reset scroll on every push nav
 * );
 * ```
 */
export const scrollBehavior =
  (behavior: ScrollBehavior) =>
  <
    P extends Record<string, unknown>,
    S extends Record<string, unknown>,
    D,
    E,
    R,
  >(
    router: Router<P, S, D, E, R>,
  ): Router<P, S, D, E, R> => {
    return Object.assign(Object.create(RouterProto), {
      ...router,
      scrollBehavior: behavior,
    }) as Router<P, S, D, E, R>;
  };

/**
 * Protect routes with a guard condition.
 * If the guard is false, redirects or renders fallback.
 *
 * @example
 * ```ts
 * const protectedRouter = Router.empty.pipe(
 *   Router.concat(DashboardRoute),
 *   Router.concat(ProfileRoute),
 * );
 *
 * const router = Router.empty.pipe(
 *   Router.concat(publicRouter),
 *   Router.guard(isAuthenticated, protectedRouter, { redirect: "/login" }),
 * );
 * ```
 */
export const guard =
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    R,
  >(
    condition: Readable.Readable<boolean> | Effect.Effect<boolean>,
    protectedRouter: Router<P, S, D, E, R>,
    options:
      | { redirect: string }
      | {
          fallback: () => Element.Element<
            HTMLElement | SVGElement,
            never,
            never
          >;
        },
  ) =>
  <
    P2 extends Record<string, unknown> | never,
    S2 extends Record<string, unknown> | never,
    D2,
    E2,
    R2,
  >(
    router: Router<P2, S2, D2, E2, R2>,
  ): Router<P & P2, S & S2, D | D2, E | E2, R | R2> => {
    // Add guard to all routes in the protected router
    const guardedRoutes = protectedRouter.routes.map((route) => ({
      ...route,
      guard: condition,
      guardOptions: options,
    }));

    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: [...router.routes, ...guardedRoutes],
    }) as Router<P & P2, S & S2, D | D2, E | E2, R | R2>;
  };

/**
 * Wrap all routes in a layout.
 * Layouts are applied inside-out (first layout is innermost).
 *
 * @example
 * ```ts
 * const dashboardRouter = Router.empty.pipe(
 *   Router.concat(DashboardHomeRoute),
 *   Router.concat(SettingsRoute),
 *   Router.layout(SidebarLayout),
 *   Router.layout(AppShell),
 * );
 * // Renders: AppShell(SidebarLayout(matchedRoute))
 * ```
 */
export const layout =
  <E, R>(
    wrapper: <A extends HTMLElement | SVGElement, E, R>(
      children: Element.Element<A, E, R>,
    ) => Element.Element<HTMLElement, E, R>,
  ) =>
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E2,
    R2,
  >(
    router: Router<P, S, D, E2, R2>,
  ): Router<P, S, D, E | E2, R | R2> => {
    return Object.assign(Object.create(RouterProto), {
      ...router,
      layouts: [...router.layouts, wrapper],
    }) as Router<P, S, D, E | E2, R | R2>;
  };

// =============================================================================
// Error Handling Combinators
// =============================================================================

/**
 * Catch errors from all routes using a predicate.
 *
 * @example
 * ```ts
 * const router = Router.empty.pipe(
 *   Router.concat(HomeRoute),
 *   Router.concat(UserRoute),
 *   Router.catchIf(
 *     (e) => e._tag === "NotFound",
 *     () => NotFoundPage()
 *   ),
 * );
 * ```
 */
export const catchIf =
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    E2,
    R2,
  >(
    predicate: (error: E) => boolean,
    handler: (error: E) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ) =>
  <R>(router: Router<P, S, D, E, R>): Router<P, S, D, E2, R | R2> => {
    const transformedRoutes = router.routes.map((route) => ({
      ...route,
      render: (data: D) =>
        Effect.catchIf(
          route.render(data),
          predicate,
          handler,
        ) as Element.Element<HTMLElement | SVGElement, E2, R | R2>,
    }));

    const transformedFallback = router.fallback
      ? () =>
          Effect.catchIf(
            router.fallback!(),
            predicate,
            handler,
          ) as Element.Element<HTMLElement | SVGElement, E2, R | R2>
      : null;

    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: transformedRoutes,
      fallback: transformedFallback,
    }) as Router<P, S, D, E2, R | R2>;
  };

/**
 * Catch errors with a specific _tag from all routes.
 *
 * @example
 * ```ts
 * const router = Router.empty.pipe(
 *   Router.concat(HomeRoute),
 *   Router.concat(UserRoute),
 *   Router.catchTag("NotFound", () => NotFoundPage()),
 *   Router.catchTag("Unauthorized", () => LoginPage()),
 * );
 * ```
 */
export const catchTag: {
  <
    const K extends string,
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E2,
    R2,
  >(
    tag: K,
    handler: (error: {
      _tag: K;
    }) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ): <E extends { _tag: string }, R>(
    router: Router<P, S, D, E, R>,
  ) => Router<P, S, D, Exclude<E, { _tag: K }> | E2, R | R2>;
} = (<
    const K extends string,
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E2,
    R2,
  >(
    tag: K,
    handler: (error: {
      _tag: K;
    }) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ) =>
  <E extends { _tag: string }, R>(
    router: Router<P, S, D, E, R>,
  ): Router<P, S, D, Exclude<E, { _tag: K }> | E2, R | R2> => {
    const transformedRoutes = router.routes.map((route) => ({
      ...route,
      render: (data: D) =>
        Effect.catchTag(
          route.render(data) as Effect.Effect<
            HTMLElement | SVGElement,
            { _tag: string },
            unknown
          >,
          tag,
          handler as (error: {
            _tag: K;
          }) => Effect.Effect<HTMLElement | SVGElement, E2, R2>,
        ),
    }));

    const transformedFallback = router.fallback
      ? () =>
          Effect.catchTag(
            router.fallback!() as Effect.Effect<
              HTMLElement | SVGElement,
              { _tag: string },
              unknown
            >,
            tag,
            handler as (error: {
              _tag: K;
            }) => Effect.Effect<HTMLElement | SVGElement, E2, R2>,
          )
      : null;

    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: transformedRoutes,
      fallback: transformedFallback,
    }) as Router<P, S, D, Exclude<E, { _tag: K }> | E2, R | R2>;
  }) as {
  <
    const K extends string,
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E2,
    R2,
  >(
    tag: K,
    handler: (error: {
      _tag: K;
    }) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ): <E extends { _tag: string }, R>(
    router: Router<P, S, D, E, R>,
  ) => Router<P, S, D, Exclude<E, { _tag: K }> | E2, R | R2>;
};

/**
 * Catch all errors from all routes.
 * This removes errors from the error channel entirely.
 *
 * @example
 * ```ts
 * const router = Router.empty.pipe(
 *   Router.concat(HomeRoute),
 *   Router.concat(UserRoute),
 *   Router.catchAll((error) => ErrorPage({ error })),
 * );
 * ```
 */
export const catchAll =
  <
    P extends Record<string, unknown> | never,
    S extends Record<string, unknown> | never,
    D,
    E,
    E2,
    R2,
  >(
    handler: (error: E) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ) =>
  <R>(router: Router<P, S, D, E, R>): Router<P, S, D, E2, R | R2> => {
    const transformedRoutes = router.routes.map((route) => ({
      ...route,
      render: (data: D) =>
        Effect.catchAll(route.render(data), handler) as Element.Element<
          HTMLElement | SVGElement,
          E2,
          R | R2
        >,
    }));

    const transformedFallback = router.fallback
      ? () =>
          Effect.catchAll(router.fallback!(), handler) as Element.Element<
            HTMLElement | SVGElement,
            E2,
            R | R2
          >
      : null;

    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: transformedRoutes,
      fallback: transformedFallback,
    }) as Router<P, S, D, E2, R | R2>;
  };

// =============================================================================
// Matching
// =============================================================================

/**
 * Find the best matching route for a pathname.
 * Routes are sorted by specificity - more specific routes match first.
 */
export const findMatch = <
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
>(
  router: Router<P, S, D, E, R>,
  pathname: string,
): Option.Option<{
  route: Route<string, P, S, D, E, R>;
  params: Record<string, string>;
}> => {
  // Sort routes by specificity (descending)
  const sortedRoutes = [...router.routes].sort(
    (a, b) => routeSpecificity(b.segments) - routeSpecificity(a.segments),
  );

  for (const route of sortedRoutes) {
    const params = matchSegments(route.segments, pathname);
    if (params !== null) {
      return Option.some({ route, params });
    }
  }

  return Option.none();
};

/**
 * Parse and validate params using the route's schema.
 */
export const parseParams = <
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
>(
  route: Route<string, P, S, D, E, R>,
  rawParams: Record<string, string>,
): Effect.Effect<P, unknown> => {
  if (route.paramsSchema) {
    return Schema.decodeUnknown(route.paramsSchema)(rawParams);
  }
  return Effect.succeed(rawParams as P);
};

/**
 * Parse search params from URLSearchParams.
 */
export const parseSearchParams = <
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
>(
  route: Route<string, P, S, D, E, R>,
  searchParams: URLSearchParams,
): Effect.Effect<S, unknown> => {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  if (route.searchParamsSchema) {
    return Schema.decodeUnknown(route.searchParamsSchema)(raw);
  }
  return Effect.succeed(raw as S);
};

// =============================================================================
// Utilities
// =============================================================================

/**
 * Check if a value is a Router.
 */
export const isRouter = (value: unknown): value is Router => {
  return typeof value === "object" && value !== null && TypeId in value;
};

// =============================================================================
// Module
// =============================================================================

export const Router = {
  empty,
  concat,
  prefixAll,
  fallback,
  guard,
  layout,
  scrollBehavior,
  catchIf,
  catchTag,
  catchAll,
  findMatch,
  parseParams,
  parseSearchParams,
  isRouter,
};
