import { Effect, Option, Pipeable, Schema } from "effect";

import { Readable } from "@effex/core";
import type { Element } from "@effex/dom";

import {
  isRoute,
  matchSegments,
  parsePath,
  routeSpecificity,
  type Route,
} from "./Route.js";

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
  readonly scrollRestoration?: boolean;
}

/**
 * A router containing routes and configuration.
 */
export interface Router<E = never, R = never> extends Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  /** All routes in this router */
  readonly routes: ReadonlyArray<Route<string, unknown, unknown, E, R>>;
  /** Fallback render function when no route matches */
  readonly fallback:
    | (() => Element.Element<HTMLElement | SVGElement, E, R>)
    | null;
  /** Layout wrappers to apply (in order, inside-out) */
  readonly layouts: ReadonlyArray<LayoutWrapper>;
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
export const empty: Router<never, never> = Object.assign(
  Object.create(RouterProto),
  {
    routes: [],
    fallback: null,
    layouts: [],
  },
);

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
  <Path extends string, P, SP, E, R>(
    route: Route<Path, P, SP, E, R>,
  ): <E2, R2>(router: Router<E2, R2>) => Router<E | E2, R | R2>;
  <E, R>(
    other: Router<E, R>,
  ): <E2, R2>(router: Router<E2, R2>) => Router<E | E2, R | R2>;
} =
  <E, R>(routeOrRouter: Route<string, unknown, unknown, E, R> | Router<E, R>) =>
  <E2, R2>(router: Router<E2, R2>): Router<E | E2, R | R2> => {
    if (isRoute(routeOrRouter)) {
      // Adding a single route
      return Object.assign(Object.create(RouterProto), {
        ...router,
        routes: [...router.routes, routeOrRouter],
      }) as Router<E | E2, R | R2>;
    }
    // Merging another router
    const other = routeOrRouter as Router<E, R>;
    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: [...router.routes, ...other.routes],
      // Keep existing fallback if other doesn't have one
      fallback: other.fallback ?? router.fallback,
      // Combine layouts (router's layouts applied first, then other's)
      layouts: [...router.layouts, ...other.layouts],
    }) as Router<E | E2, R | R2>;
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
  <E, R>(router: Router<E, R>): Router<E, R> => {
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
    }) as Router<E, R>;
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
  <E2, R2>(router: Router<E2, R2>): Router<E | E2, R | R2> => {
    return Object.assign(Object.create(RouterProto), {
      ...router,
      fallback: render,
    }) as Router<E | E2, R | R2>;
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
  <E, R>(
    condition: Readable.Readable<boolean> | Effect.Effect<boolean>,
    protectedRouter: Router<E, R>,
    options:
      | { redirect: string }
      | { fallback: () => Element.Element<HTMLElement | SVGElement> },
  ) =>
  <E2, R2>(router: Router<E2, R2>): Router<E | E2, R | R2> => {
    // Add guard to all routes in the protected router
    const guardedRoutes = protectedRouter.routes.map((route) => ({
      ...route,
      guard: condition,
      guardOptions: options,
    }));

    return Object.assign(Object.create(RouterProto), {
      ...router,
      routes: [...router.routes, ...guardedRoutes],
    }) as Router<E | E2, R | R2>;
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
  (wrapper: LayoutWrapper) =>
  <E, R>(router: Router<E, R>): Router<E, R> => {
    return Object.assign(Object.create(RouterProto), {
      ...router,
      layouts: [...router.layouts, wrapper],
    }) as Router<E, R>;
  };

// =============================================================================
// Matching
// =============================================================================

/**
 * Find the best matching route for a pathname.
 * Routes are sorted by specificity - more specific routes match first.
 */
export const findMatch = <E, R>(
  router: Router<E, R>,
  pathname: string,
): Option.Option<{
  route: Route<string, unknown, unknown, E, R>;
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
export const parseParams = <P, SP, E, R>(
  route: Route<string, P, SP, E, R>,
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
export const parseSearchParams = <P, SP, E, R>(
  route: Route<string, P, SP, E, R>,
  searchParams: URLSearchParams,
): Effect.Effect<SP, unknown> => {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  if (route.searchParamsSchema) {
    return Schema.decodeUnknown(route.searchParamsSchema)(raw);
  }
  return Effect.succeed(raw as SP);
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
  findMatch,
  parseParams,
  parseSearchParams,
  isRouter,
};
