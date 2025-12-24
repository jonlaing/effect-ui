import { Effect, Option } from "effect";
import { component, match, div } from "@effex/dom";
import type { Element } from "@effex/dom";
import { RouterContext } from "@effex/router";

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

    // Map Option<string> to string | null for pattern matching
    // Option.none() becomes null, Option.some(name) becomes name
    const currentRouteName = router.currentRoute.map(Option.getOrNull);

    // Build match cases from components map
    const cases = Object.entries(props.components).map(
      ([routeName, componentFn]) => ({
        pattern: routeName as string | null,
        render: componentFn as RouteComponent,
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
