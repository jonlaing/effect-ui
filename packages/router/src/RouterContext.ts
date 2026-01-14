import { Context, Effect, Layer } from "effect";

import type { Readable } from "@effex/core";
import { a, type Component } from "@effex/dom";

import type { ActionState, BaseRouter } from "./types";

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
 * @deprecated Use `router.layer` instead. The router now includes a layer property.
 *
 * @example
 * ```ts
 * // Old way (deprecated):
 * const router = yield* Router.make(routes)
 * const layer = makeRouterLayer(router)
 * mount(app.pipe(Effect.provide(layer)), root)
 *
 * // New way:
 * const router = yield* Router.make(routes)
 * mount(app.pipe(Effect.provide(router.layer)), root)
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
 * Uses an `<a>` element for proper semantics - hover shows URL in browser,
 * right-click works, middle-click opens in new tab, etc.
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
export const Link: Component.Node<LinkProps, RouterContext> = (
  props,
  children,
) =>
  Effect.gen(function* () {
    const router = yield* RouterContext;

    const isActive = router.pathname.map((p) => p === props.href);

    const baseClass = props.class ?? "link";
    const classValue = isActive.map((active) =>
      active ? `${baseClass} active` : baseClass,
    );

    return yield* a(
      {
        href: props.href,
        class: classValue,
        onClick: (e) => {
          // Allow ctrl/cmd+click and middle-click to work normally
          if (e.ctrlKey || e.metaKey || e.button === 1) {
            return Effect.void;
          }
          e.preventDefault();
          return props.replace
            ? router.replace(props.href)
            : router.push(props.href);
        },
      },
      children ?? [],
    );
  });

/**
 * Access the current action state from the router.
 * Returns a Readable of the action state.
 *
 * @example
 * ```ts
 * const MyComponent = Effect.gen(function* () {
 *   const actionState = yield* getActionState()
 *
 *   return div([
 *     when(actionState.map(s => s.isSubmitting), () =>
 *       span("Submitting...")
 *     ),
 *     when(actionState.map(s => s.error !== null), () =>
 *       span({ class: "error" }, "Submission failed")
 *     ),
 *   ])
 * })
 * ```
 */
export const getActionState = (): Effect.Effect<
  Readable.Readable<ActionState>,
  never,
  RouterContext
> =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    return router.actionState;
  });
