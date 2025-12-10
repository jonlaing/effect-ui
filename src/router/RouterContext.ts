import { Context, Effect, Layer } from "effect";
import { button } from "@dom/Element";
import { component } from "@dom/Component";
import type { BaseRouter } from "./types";

/**
 * Context tag for accessing the router within components.
 * Components that use RouterContext will have it as a requirement in their type signature.
 *
 * @example
 * ```ts
 * const MyComponent = Effect.gen(function* () {
 *   const router = yield* RouterContext
 *   // ...
 * })
 * // Type: Effect<HTMLElement, never, Scope | RouterContext>
 * ```
 */
export class RouterContext extends Context.Tag("RouterContext")<
  RouterContext,
  BaseRouter
>() {}

/**
 * Convenience function to create a RouterContext layer.
 * @param router - The router instance to provide
 *
 * @example
 * ```ts
 * const router = yield* Router.make(routes)
 * const layer = makeRouterLayer(router)
 *
 * // Use in mount
 * mount(
 *   app.pipe(Effect.provide(layer)),
 *   document.getElementById("root")!
 * )
 * ```
 */
export const makeRouterLayer = (
  router: BaseRouter,
): Layer.Layer<RouterContext> => Layer.succeed(RouterContext, router);

/**
 * Create a router layer that provides both RouterContext (for Link components)
 * and a custom typed context (for full router access with typed routes).
 *
 * @param router - The router instance
 * @param TypedContext - Your app's typed router context tag
 *
 * @example
 * ```ts
 * // Define routes
 * const routes = {
 *   home: Route.make("/"),
 *   user: Route.make("/users/:id", { params: Schema.Struct({ id: Schema.String }) }),
 * }
 *
 * // Create typed context
 * type AppRouter = RouterInfer<typeof routes>
 * class AppRouterContext extends Context.Tag("AppRouterContext")<
 *   AppRouterContext,
 *   AppRouter
 * >() {}
 *
 * // In your app setup
 * const router = yield* Router.make(routes)
 * const layer = makeTypedRouterLayer(router, AppRouterContext)
 *
 * yield* mount(App().pipe(Effect.provide(layer)), root)
 * ```
 */
export const makeTypedRouterLayer = <R, I extends BaseRouter>(
  router: I,
  TypedContext: Context.Tag<R, I>,
): Layer.Layer<RouterContext | R> =>
  Layer.merge(
    Layer.succeed(RouterContext, router),
    Layer.succeed(TypedContext, router),
  );

/**
 * Props for the Link component.
 */
export interface LinkProps {
  /** The path to navigate to */
  readonly href: string;
  /** Optional CSS class */
  readonly class?: string;
  /** Whether to replace instead of push */
  readonly replace?: boolean;
}

/**
 * A navigation link component that uses the RouterContext.
 * Components using Link will have RouterContext in their requirements.
 *
 * @example
 * ```ts
 * // Basic link with children as second argument
 * Link({ href: "/users" }, "Users")
 *
 * // With custom class (adds "active" when route matches)
 * Link({ href: "/", class: "nav-link" }, "Home")
 *
 * // With multiple children
 * Link({ href: "/about" }, ["About ", "Us"])
 *
 * // Replace instead of push
 * Link({ href: "/login", replace: true }, "Login")
 * ```
 */
export const Link = component("Link", (props: LinkProps, children?) =>
  Effect.gen(function* () {
    const router = yield* RouterContext;

    const isActive = router.pathname.map((p) => p === props.href);

    const baseClass = props.class ?? "link";
    const classValue = isActive.map((active) =>
      active ? `${baseClass} active` : baseClass,
    );

    return yield* button(
      {
        class: classValue,
        onClick: (e) => {
          e.preventDefault();
          return props.replace
            ? router.replace(props.href)
            : router.push(props.href);
        },
      },
      children ?? [],
    );
  }),
);

// Legacy global router support for backwards compatibility during migration
// These can be removed once all code is migrated to use RouterContext

let currentRouter: BaseRouter | null = null;

/**
 * @deprecated Use RouterContext and makeRouterLayer instead.
 * Set the current router for the application.
 */
export const setRouter = (router: BaseRouter): void => {
  currentRouter = router;
};

/**
 * @deprecated Use RouterContext and makeRouterLayer instead.
 * Clear the current router.
 */
export const clearRouter = (): void => {
  currentRouter = null;
};

/**
 * @deprecated Use RouterContext and makeRouterLayer instead.
 * Get the current router.
 */
export const getRouter = (): BaseRouter | null => currentRouter;
