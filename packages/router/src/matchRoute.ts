import { Effect, Option } from "effect";

import { Readable } from "@effex/core";
import { Element, match } from "@effex/dom";

import { RouterContext } from "./RouterContext.js";

/**
 * Route cases for matchRoute. Keys are route names, values are render functions.
 * The special `_` key is the fallback when no route matches.
 */
export type RouteCases<E = never, R = never> = {
  readonly [K: string]: () => Element.Element<HTMLElement | SVGElement, E, R>;
} & {
  /** Fallback to render when no route matches or router is not available */
  readonly _: () => Element.Element<HTMLElement | SVGElement, E, R>;
};

/**
 * Renders different content based on the current route.
 *
 * This is a convenience wrapper around `match` that automatically:
 * - Accesses the RouterContext
 * - Unwraps the Option from currentRoute
 * - Falls back gracefully if no router is present
 *
 * The `_` key is required and serves as the fallback for:
 * - When no route matches
 * - When RouterContext is not available
 *
 * @example
 * ```ts
 * matchRoute({
 *   home: () => HomePage(),
 *   about: () => AboutPage(),
 *   users_$id: () => UserPage(),
 *   _: () => NotFoundPage(),
 * })
 * ```
 *
 * @example
 * ```ts
 * // In a layout component
 * const Layout = Component.gen(function* () {
 *   return yield* $.div({ class: "layout" }, [
 *     Header(),
 *     $.main([
 *       matchRoute({
 *         home: () => HomePage(),
 *         about: () => AboutPage(),
 *         _: () => NotFoundPage(),
 *       }),
 *     ]),
 *     Footer(),
 *   ]);
 * });
 * ```
 */
export const matchRoute = <E = never, R = never>(
  cases: RouteCases<E, R>,
): Element.Element<HTMLElement | SVGElement, E, R> =>
  Effect.gen(function* () {
    const routerOption = yield* Effect.serviceOption(RouterContext);

    // No router context - render fallback using match with empty cases
    // This ensures consistent wrapping behavior
    if (Option.isNone(routerOption)) {
      return yield* match(Readable.id(null as string | null), {
        cases: [],
        fallback: cases._,
      });
    }

    const router = routerOption.value;

    // Unwrap Option<string> to string | null
    const currentRouteUnwrapped = router.currentRoute.map((opt) =>
      Option.isSome(opt) ? opt.value : null,
    );

    // Build match cases from the cases object (excluding the fallback)
    const { _, ...routeCases } = cases;
    const matchCases = Object.entries(routeCases).map(([pattern, render]) => ({
      pattern,
      render,
    }));

    return yield* match(currentRouteUnwrapped, {
      cases: matchCases,
      fallback: _,
    });
  }) as Element.Element<HTMLElement | SVGElement, E, R>;
