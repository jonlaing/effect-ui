import { Context, Effect, Layer } from "effect";

import type { Element } from "@effex/dom";

/**
 * A component function that returns an Element.
 */
export type LayoutComponent<E = never, R = never> = () => Element.Element<E, R>;

/**
 * Context for passing outlet content through the layout hierarchy.
 * Layouts render their children via the Outlet component, which reads from this context.
 */
export class OutletContext extends Context.Tag("OutletContext")<
  OutletContext,
  {
    /**
     * The content to render in the outlet.
     * This is either the next layout in the hierarchy or the final route component.
     */
    readonly content: LayoutComponent<any, any>;
    /**
     * The route name being rendered (for debugging and key generation).
     */
    readonly routeName: string;
  }
>() {}

/**
 * Renders the child content within a layout.
 *
 * Layouts use the Outlet component to specify where their child content should render.
 * The child content is either another nested layout or the final route component.
 *
 * @example
 * ```ts
 * // _layout.tsx - Root layout
 * export default component("RootLayout", () =>
 *   Effect.gen(function* () {
 *     return yield* div([
 *       Header(),
 *       main([
 *         Outlet(), // Child layout or route renders here
 *       ]),
 *       Footer(),
 *     ]);
 *   })
 * );
 * ```
 *
 * @example
 * ```ts
 * // users._layout.tsx - Nested layout
 * export default component("UsersLayout", () =>
 *   Effect.gen(function* () {
 *     return yield* div({ class: "users-layout" }, [
 *       aside([UsersSidebar()]),
 *       section([
 *         Outlet(), // Route component renders here
 *       ]),
 *     ]);
 *   })
 * );
 * ```
 */
export const Outlet = (): Element.Element<never, OutletContext> =>
  Effect.gen(function* () {
    const ctx = yield* OutletContext;
    return yield* ctx.content();
  }) as Element.Element<never, OutletContext>;

/**
 * Creates an OutletContext layer with the given content.
 * Used internally to build the layout hierarchy.
 *
 * @param content - The component function to render in the outlet
 * @param routeName - The route name (for debugging)
 */
export const makeOutletLayer = (
  content: LayoutComponent<any, any>,
  routeName: string,
): Layer.Layer<OutletContext> =>
  Layer.succeed(OutletContext, { content, routeName });

/**
 * Layout components map type.
 * Maps layout names to their component functions.
 */
export type LayoutComponentsMap = {
  readonly [K: string]: LayoutComponent<any, any>;
};

/**
 * Extracts the union of all error types from a layout components map.
 */
export type LayoutComponentsError<T extends LayoutComponentsMap> = {
  [K in keyof T]: T[K] extends () => Element.Element<infer E, any> ? E : never;
}[keyof T];

/**
 * Extracts the union of all requirement types from a layout components map.
 */
export type LayoutComponentsRequirements<T extends LayoutComponentsMap> = {
  [K in keyof T]: T[K] extends () => Element.Element<any, infer R> ? R : never;
}[keyof T];
