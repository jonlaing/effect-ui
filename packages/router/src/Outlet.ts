import { Effect, Option, pipe, Record, Stream } from "effect";

import { ControlCtx, logDebug, reconcile } from "@stax-ui/core";
import {
  $,
  AnimationConfigCtx,
  Element,
  type AnimationOptions,
} from "@stax-ui/dom";

import { buildPath, NavigationContext, type Navigation } from "./Navigation.js";
import { resolveMeta, type Route } from "./Route.js";
import {
  RouteDataContext,
  RouteDataProvider,
  type RouteDataService,
} from "./RouteData.js";
import { findMatch, type LayoutWrapper, type Router } from "./Router.js";
import { runScrollBehavior, type ScrollBehavior } from "./ScrollBehavior.js";

/**
 * Configuration for the Outlet component.
 */
export interface OutletConfig<
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
> {
  /** The router whose routes/layouts to render */
  readonly router: Router<P, S, D, E, R>;
  /** Animation options for route transitions */
  readonly animate?: AnimationOptions;
  /**
   * When true, the enter animation also plays for the initially matched
   * route on hydration. Default is to attach handlers to the SSR-rendered
   * DOM without re-animating.
   */
  readonly intro?: boolean;
}

/**
 * Apply layout wrappers to an Element Effect.
 * Layouts are applied inside-out (first layout is innermost).
 */
const applyLayouts = <E, R>(
  element: Element.Element<HTMLElement | SVGElement, E, R>,
  layouts: ReadonlyArray<LayoutWrapper>,
): Element.Element<HTMLElement | SVGElement, E, R> => {
  if (layouts.length === 0) {
    return element;
  }
  // Apply layouts inside-out: layouts[0] wraps element, layouts[1] wraps that, etc.
  return layouts.reduce<Element.Element<HTMLElement | SVGElement, E, R>>(
    (inner, wrapper) => wrapper(inner),
    element,
  );
};

/**
 * Check if a route's guard allows rendering.
 * Returns true if allowed, false if blocked.
 */
const checkGuard = <P, S, D, E, R>(
  route: Route<string, P, S, D, E, R>,
): Effect.Effect<boolean> => {
  if (!route.guard) return Effect.succeed(true);

  // Guard can be Readable<boolean> or Effect<boolean>
  if ("get" in route.guard) {
    return route.guard.get;
  }
  return route.guard as Effect.Effect<boolean>;
};

/**
 * Render a route, handling guards, data loading, and layouts.
 */
const renderRouteWithGuard = <E, R>(
  route: Route<string, any, any, any, any, any>,
  nav: Navigation,
  layouts: ReadonlyArray<LayoutWrapper>,
): Element.Element<HTMLElement | SVGElement, E, R> =>
  Effect.gen(function* () {
    // Check guard if present
    const allowed = yield* checkGuard(route);

    if (!allowed && route.guardOptions) {
      // Guard blocked - handle based on options
      if ("redirect" in route.guardOptions) {
        yield* logDebug("guard blocked, redirecting", "stax.outlet", {
          route: route.path,
          redirect: route.guardOptions.redirect,
        });
        // Redirect to another path
        yield* nav.pushPath(route.guardOptions.redirect);
        // Return empty div while redirecting
        return yield* $.div();
      } else if ("fallback" in route.guardOptions) {
        yield* logDebug("guard blocked, rendering fallback", "stax.outlet", {
          route: route.path,
        });
        // Render fallback component
        return yield* route.guardOptions.fallback();
      }
    }

    // Get current match and search params
    const currentMatch = yield* nav.currentMatch.get;
    const currentSearchParams = yield* nav.searchParams.get;
    const searchParamsObj = Object.fromEntries(currentSearchParams.entries());

    yield* logDebug("resolving route", "stax.outlet", {
      route: route.path,
      params: currentMatch.params,
      searchParams: searchParamsObj,
    });

    // Build loaderPath preserving current search params alongside _data=1
    const resolvedPath = buildPath(route, currentMatch.params);
    const loaderSearch = new URLSearchParams(currentSearchParams);
    loaderSearch.set("_data", "1");
    const loaderPath = `${resolvedPath}?${loaderSearch.toString()}`;

    // Fetch route data for the route.
    // If a RouteDataProvider is in context (e.g. from platform), always use it —
    // it has embedded/fetched data even when loaders have been stripped by the
    // Vite transform (Route.get(null, render)).
    // Otherwise fall back to running the loader directly (SPA mode).
    let routeData: RouteDataService = {
      data: undefined,
      loaderPath,
      actions: {},
    };

    const maybeProvider = yield* Effect.serviceOption(RouteDataProvider);

    if (Option.isSome(maybeProvider)) {
      yield* logDebug("fetching route data via provider", "stax.route-data", {
        route: route.path,
        loaderPath,
      });
      routeData = yield* maybeProvider.value.getRouteData(
        route,
        currentMatch.params,
        searchParamsObj,
      );

      // Handle client-side redirects — the data provider signals these
      // as { _redirect: url } when the server returns a redirect for data requests
      const maybeRedirect = routeData as unknown as { _redirect?: string };
      if (maybeRedirect._redirect) {
        yield* logDebug("provider signaled redirect", "stax.route-data", {
          from: route.path,
          to: maybeRedirect._redirect,
        });
        yield* nav.pushPath(maybeRedirect._redirect);
        return yield* $.div();
      }
    } else {
      // SPA fallback: no data provider in context (e.g. SPA-only app, or a
      // component tree with a data provider bypassed). Run whichever loader
      // the route has directly. Route.get sets `_loader`; Route.static puts
      // its loader inside `_staticConfig.load` — both need to be honoured or
      // the route's render will receive undefined data and crash.
      const hasLoader =
        route._loader != null || route._staticConfig?.load != null;
      const hasHooks =
        hasLoader || (route._handlers && route._handlers.length > 0);

      yield* logDebug(
        "SPA fallback: no route-data provider",
        "stax.route-data",
        {
          route: route.path,
          source: route._loader
            ? "loader"
            : route._staticConfig?.load
              ? "static.load"
              : "none",
        },
      );

      if (hasHooks) {
        const data = route._loader
          ? yield* route._loader({
              params: currentMatch.params,
              searchParams: searchParamsObj,
            })
          : route._staticConfig?.load
            ? yield* route._staticConfig.load({
                params: currentMatch.params,
              })
            : undefined;

        const actions: Record<string, string> = {};
        for (const h of route._handlers) {
          actions[h.key] = `${resolvedPath}?_action=${h.key}`;
        }

        routeData = { data, loaderPath, actions };
      }
    }

    // Resolve meta (title, description, etc.) and apply to document
    if (route._meta) {
      const meta = resolveMeta(route, {
        params: currentMatch.params,
        searchParams: searchParamsObj,
        data: routeData.data,
      });
      if (typeof document !== "undefined" && meta.title) {
        document.title = meta.title;
      }
    }

    // Build the route element with RouteContext and RouteDataContext provided
    const routeElement = route.render(routeData.data).pipe(
      Effect.provideService(route.Params, {
        params: currentMatch.params,
        searchParams: searchParamsObj,
      }),
      Effect.provideService(RouteDataContext, routeData),
    );

    // Apply layouts (inside-out) and render
    return yield* applyLayouts(routeElement, layouts);
  });

/**
 * Renders the currently matched route.
 *
 * Outlet reads from NavigationContext and uses pattern matching to render
 * the active route. When the route changes, it handles enter/exit animations
 * if configured.
 *
 * The matched route's RouteContext is automatically provided, allowing
 * route components to access typed params via `yield* MyRoute.params`.
 *
 * Guards are automatically enforced - if a route has a guard that returns
 * false, the guard's redirect or fallback is used instead.
 *
 * @example
 * ```ts
 * // Basic usage
 * $.main(
 *   { class: "content" },
 *   Outlet({ router }),
 * )
 *
 * // With animations
 * $.main(
 *   { class: "content" },
 *   Outlet({
 *     router,
 *     animate: {
 *       enterFrom: "opacity-0 transition-opacity duration-150",
 *       enter: "!opacity-100",
 *       exit: "transition-opacity duration-150",
 *       exitTo: "!opacity-0",
 *     },
 *   }),
 * )
 * ```
 */
export const Outlet = <
  P extends Record<string, unknown> | never,
  S extends Record<string, unknown> | never,
  D,
  E,
  R,
>(
  config: OutletConfig<P, S, D, E, R>,
): Element.Element<
  HTMLElement | SVGElement,
  E,
  R | NavigationContext | ControlCtx
> =>
  pipe(
    Effect.gen(function* () {
      const nav = yield* NavigationContext;
      const router = config.router;
      const layouts = router.layouts;
      const scope = yield* Effect.scope;

      // Scroll behavior subscription: apply the effective ScrollBehavior for
      // the target route on push/replace navigations. Popstate is skipped —
      // the browser's `history.scrollRestoration = "auto"` restores per-
      // entry positions better than a URL-keyed cache could. lastSource is
      // set before pathname publishes (see Navigation.ts), so reading it
      // inside the subscriber reflects the source of the change.
      let previousPathname = yield* nav.pathname.get;
      yield* Stream.runForEach(nav.pathname.changes, (to) =>
        Effect.gen(function* () {
          const from = previousPathname;
          previousPathname = to;
          const source = yield* nav.lastSource.get;
          if (source === "pop") return;
          const matched = findMatch(router, to);
          const routeBehavior: ScrollBehavior | null = Option.isSome(matched)
            ? matched.value.route._scrollBehavior
            : null;
          const effective: ScrollBehavior =
            routeBehavior ?? router.scrollBehavior ?? "top";
          yield* runScrollBehavior(effective, from, to);
        }),
      ).pipe(Effect.forkIn(scope));

      // Use pathname as the reconcile key so param-only navigations
      // (e.g. /users/alice → /users/bob) trigger a re-render.
      return (yield* reconcile(nav.pathname, {
        getTargetKeys: (pathname: string) => {
          const matched = findMatch(router, pathname);
          if (Option.isSome(matched)) return [pathname];
          if (router.fallback) return ["__fallback__"];
          return [];
        },
        renderSlot: (key: string) => {
          if (key === "__fallback__") {
            return router.fallback?.() ?? $.div();
          }
          // Find the route that matches this pathname
          const matched = findMatch(router, key);
          if (Option.isNone(matched)) {
            return router.fallback?.() ?? $.div();
          }
          return renderRouteWithGuard(matched.value.route, nav, layouts);
        },
      })) as HTMLElement | SVGElement;
    }),
    // Provide the animation config the way `match`/`when` do — reconcile's
    // addSlot/removeSlot read `AnimationConfigCtx` lazily to drive enter/
    // exit transitions between routes. Without this, `config.animate` and
    // `config.intro` sit in the type but never reach the control ctx.
    config.animate || config.intro
      ? Effect.provideService(AnimationConfigCtx, {
          single: config.animate,
          intro: config.intro,
        })
      : (x) => x,
  ) as Element.Element<
    HTMLElement | SVGElement,
    E,
    R | NavigationContext | ControlCtx
  >;
