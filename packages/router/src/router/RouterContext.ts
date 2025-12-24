import { Context, Effect, Layer } from "effect";
import { button, form as formElement } from "@effex/dom";
import { component } from "@effex/dom";
import type { BaseRouter, ActionState } from "./types";
import type { Readable } from "@effex/core";

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

/**
 * Props for the Form component.
 */
export interface FormProps {
  /** HTTP method (defaults to "POST") */
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Optional action URL (defaults to current path) */
  readonly action?: string;
  /** Optional CSS class */
  readonly class?: string;
  /** Called before submission (return false to prevent) */
  readonly onSubmit?: (formData: FormData) => boolean | void;
  /** Called after successful action */
  readonly onSuccess?: (data: unknown) => void;
  /** Called after action error */
  readonly onError?: (error: unknown) => void;
  /** Whether to prevent default form behavior (defaults to true on client) */
  readonly preventDefaultOnClient?: boolean;
}

/**
 * A form component that integrates with the router's action system.
 * Provides progressive enhancement - works without JS, enhanced with JS.
 *
 * @example
 * ```ts
 * // Basic form that submits to current route's action
 * Form({}, [
 *   input({ type: "text", name: "title" }),
 *   button({ type: "submit" }, "Save"),
 * ])
 *
 * // With callbacks
 * Form({
 *   onSuccess: (data) => console.log("Saved!", data),
 *   onError: (err) => console.error("Failed:", err),
 * }, [
 *   input({ type: "text", name: "email" }),
 *   button({ type: "submit" }, "Subscribe"),
 * ])
 *
 * // Different HTTP method
 * Form({ method: "DELETE" }, [
 *   button({ type: "submit" }, "Delete"),
 * ])
 * ```
 */
export const Form = component("Form", (props: FormProps, children?) =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    const currentPath = yield* router.pathname.get;

    const method = props.method ?? "POST";
    const action = props.action ?? currentPath;
    const preventDefault = props.preventDefaultOnClient ?? true;

    // Build attributes object
    // Note: Using type assertion due to intersection type issue with index signatures
    // in @effex/dom's HTMLAttributes type definition
    const formAttrs = {
      method,
      action,
      class: props.class,
      onSubmit: (e: SubmitEvent) => {
        // Get form data before potentially preventing default
        const formEl = e.target as HTMLFormElement;
        const formData = new FormData(formEl);

        // Call user's onSubmit if provided
        if (props.onSubmit) {
          const shouldContinue = props.onSubmit(formData);
          if (shouldContinue === false) {
            e.preventDefault();
            return Effect.void;
          }
        }

        // On client, prevent default and use router
        if (typeof window !== "undefined" && preventDefault) {
          e.preventDefault();

          return Effect.gen(function* () {
            const result = yield* Effect.either(router.submitAction(formData));

            if (result._tag === "Right" && result.right !== null) {
              props.onSuccess?.(result.right.data);
            } else if (result._tag === "Left") {
              props.onError?.(result.left);
            }
          });
        }

        // On server or with preventDefault=false, let form submit normally
        return Effect.void;
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return yield* formElement(formAttrs as any, children ?? []);
  }),
);

/**
 * Hook to access the current action state.
 * Returns a Readable of the action state.
 *
 * @example
 * ```ts
 * const MyForm = Effect.gen(function* () {
 *   const actionState = yield* useActionState()
 *
 *   return div([
 *     when(actionState.map(s => s.isSubmitting), () =>
 *       span("Submitting...")
 *     ),
 *     when(actionState.map(s => s.error !== null), () =>
 *       span({ class: "error" }, "Submission failed")
 *     ),
 *     Form({}, [
 *       input({ name: "email" }),
 *       button({ type: "submit" }, "Subscribe"),
 *     ]),
 *   ])
 * })
 * ```
 */
export const useActionState = (): Effect.Effect<
  Readable.Readable<ActionState>,
  never,
  RouterContext
> =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    return router.actionState;
  });

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
