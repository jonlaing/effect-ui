import type { Effect, Option, Schema } from "effect";
import type { Readable } from "@effex/core";

/**
 * A loader function that fetches data for a route.
 * Receives the validated params and returns data.
 * @template P - The params type
 * @template A - The return data type
 * @template E - The error type
 * @template R - The required context
 */
export type LoaderFn<P, A, E = never, R = never> = (
  params: P,
) => Effect.Effect<A, E, R>;

/**
 * An action function that handles form submissions/mutations.
 * Receives form data and request, returns action result.
 * @template A - The return data type
 * @template E - The error type
 * @template R - The required context
 */
export type ActionFn<A = unknown, E = never, R = never> = (args: {
  formData: FormData;
  request: Request;
  params: Record<string, string>;
}) => Effect.Effect<A, E, R>;

/**
 * A path segment in a route pattern.
 */
export type PathSegment =
  | { readonly type: "static"; readonly value: string }
  | { readonly type: "param"; readonly name: string }
  | { readonly type: "catchAll" };

/**
 * Options for creating a Route.
 * @template P - The params schema type
 * @template LA - The loader return type
 * @template LE - The loader error type
 * @template LR - The loader required context
 * @template AA - The action return type
 * @template AE - The action error type
 * @template AR - The action required context
 */
export interface RouteOptions<
  P extends Schema.Schema.AnyNoContext,
  LA = unknown,
  LE = never,
  LR = never,
  AA = unknown,
  AE = never,
  AR = never,
> {
  /** Schema for validating and typing path parameters */
  readonly params?: P;
  /** Loader function to fetch data for this route */
  readonly loader?: LoaderFn<Schema.Schema.Type<P>, LA, LE, LR>;
  /** Action function to handle form submissions for this route */
  readonly action?: ActionFn<AA, AE, AR>;
}

/**
 * A route definition with typed parameters, optional loader, and optional action.
 * @template Path - The path pattern literal type
 * @template P - The params schema type
 * @template LA - The loader return type
 * @template LE - The loader error type
 * @template LR - The loader required context
 * @template AA - The action return type
 * @template AE - The action error type
 * @template AR - The action required context
 */
export interface Route<
  Path extends string = string,
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
  LA = unknown,
  LE = never,
  LR = never,
  AA = unknown,
  AE = never,
  AR = never,
> {
  /** The original path pattern */
  readonly path: Path;
  /** Parsed path segments */
  readonly segments: readonly PathSegment[];
  /** Schema for params validation */
  readonly paramsSchema: P | undefined;
  /** Loader function to fetch data for this route */
  readonly loader: LoaderFn<Schema.Schema.Type<P>, LA, LE, LR> | undefined;
  /** Action function to handle form submissions for this route */
  readonly action: ActionFn<AA, AE, AR> | undefined;
  /** Match a pathname against this route, returning params if matched */
  readonly match: (
    pathname: string,
  ) => Effect.Effect<
    Schema.Schema.Type<P> | Record<string, never>,
    RouteMatchError
  >;
}

/**
 * Error when a route doesn't match.
 */
export interface RouteMatchError {
  readonly _tag: "RouteMatchError";
  readonly path: string;
  readonly reason: "no-match" | "validation-failed";
  readonly details?: string;
}

/**
 * Create a RouteMatchError.
 */
export const RouteMatchError = (
  path: string,
  reason: "no-match" | "validation-failed",
  details?: string,
): RouteMatchError => ({
  _tag: "RouteMatchError",
  path,
  reason,
  details,
});

/**
 * A matched route with its parsed params.
 */
export interface MatchedRoute<P = unknown> {
  /** The route that matched */
  readonly route: AnyRoute;
  /** The parsed and validated params */
  readonly params: P;
}

/**
 * State for an individual route within the router.
 * @template P - The params type
 */
export interface RouteState<P = unknown> {
  /** Whether this route is currently active */
  readonly isActive: Readable.Readable<boolean>;
  /** The current params (only meaningful when active) */
  readonly params: Readable.Readable<P>;
}

/**
 * Navigation options.
 */
export interface NavigateOptions {
  /** Replace the current history entry instead of pushing */
  readonly replace?: boolean;
}

/**
 * Result of executing a loader.
 */
export interface LoaderResult<A = unknown, E = unknown> {
  /** The route name that was loaded */
  readonly routeName: string;
  /** The params used for the loader */
  readonly params: unknown;
  /** The loader data (if successful) */
  readonly data: A;
  /** The error (if failed) */
  readonly error?: E;
}

/**
 * Result of executing an action.
 */
export interface ActionResult<A = unknown> {
  /** The route name where the action was executed */
  readonly routeName: string;
  /** The action return data */
  readonly data: A;
}

/**
 * Current loader state for the active route.
 */
export interface LoaderState<A = unknown> {
  /** The route name that was loaded */
  readonly routeName: string | null;
  /** The params used for the loader */
  readonly params: Record<string, string>;
  /** The loader data */
  readonly data: A | null;
  /** Whether the loader is currently loading */
  readonly isLoading: boolean;
  /** Error from loader (if any) */
  readonly error: unknown | null;
}

/**
 * Current action state for form submissions.
 */
export interface ActionState<A = unknown> {
  /** Whether an action is currently submitting */
  readonly isSubmitting: boolean;
  /** The last action result data */
  readonly data: A | null;
  /** Error from action (if any) */
  readonly error: unknown | null;
  /** The route name where the action was submitted */
  readonly routeName: string | null;
  /** Unique submission ID for tracking multiple submissions */
  readonly submissionId: string | null;
}

/**
 * A route with any loader/action type (used for Router constraints)
 */
export type AnyRoute = Route<
  string,
  Schema.Schema.AnyNoContext,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>;

/**
 * The main Router interface.
 * @template Routes - Record of route names to Route definitions
 */
export interface Router<Routes extends Record<string, AnyRoute>> {
  /** The current pathname */
  readonly pathname: Readable.Readable<string>;
  /** The current query params */
  readonly searchParams: Readable.Readable<URLSearchParams>;
  /** The currently matched route name, or Option.none() if no match */
  readonly currentRoute: Readable.Readable<
    Option.Option<keyof Routes & string>
  >;
  /** Route-specific state for each defined route */
  readonly routes: {
    readonly [K in keyof Routes]: RouteState<
      Routes[K] extends Route<string, infer P>
        ? P extends Schema.Schema.AnyNoContext
          ? Schema.Schema.Type<P>
          : Record<string, never>
        : Record<string, never>
    >;
  };
  /** The original route definitions (for accessing loaders) */
  readonly definitions: Routes;
  /**
   * Reactive loader state for the current route.
   * Updates automatically when navigation triggers a loader.
   */
  readonly loaderState: Readable.Readable<LoaderState>;
  /**
   * Reactive action state for form submissions.
   * Updates when actions are submitted and completed.
   */
  readonly actionState: Readable.Readable<ActionState>;
  /** Navigate to a path */
  readonly push: (
    path: string,
    options?: NavigateOptions,
  ) => Effect.Effect<void>;
  /** Replace current path */
  readonly replace: (path: string) => Effect.Effect<void>;
  /** Go back in history */
  readonly back: () => Effect.Effect<void>;
  /** Go forward in history */
  readonly forward: () => Effect.Effect<void>;
  /**
   * Execute the loader for the currently matched route.
   * Returns the loader result, or null if no route matches or route has no loader.
   */
  readonly executeLoader: <R = never>() => Effect.Effect<
    LoaderResult | null,
    unknown,
    R
  >;
  /**
   * Execute an action for the specified route.
   * @param routeName - The route to execute the action for
   * @param formData - The form data to pass to the action
   * @param request - The request object
   */
  readonly executeAction: <R = never>(
    routeName: string,
    formData: FormData,
    request: Request,
  ) => Effect.Effect<ActionResult | null, unknown, R>;
  /**
   * Submit a form to the current route's action.
   * Updates actionState reactively during submission.
   */
  readonly submitAction: (
    formData: FormData,
  ) => Effect.Effect<ActionResult | null, unknown>;
  /**
   * Initialize loader state with pre-loaded data (for SSR hydration).
   */
  readonly initializeLoaderData: (
    routeName: string,
    params: Record<string, string>,
    data: unknown,
  ) => Effect.Effect<void>;
  /**
   * Initialize action state with pre-loaded data (for SSR form submission).
   */
  readonly initializeActionData: (
    routeName: string,
    data: unknown,
  ) => Effect.Effect<void>;
}

/**
 * Options for creating a Router.
 */
export interface RouterOptions {
  /** Initial path to start at (defaults to window.location.pathname) */
  readonly initialPath?: string;
  /** Initial search string to start at (defaults to window.location.search) */
  readonly initialSearch?: string;
}

/**
 * Base router interface for context (without route-specific typing).
 * Used by Link, Form, and other components that need router access.
 */
export interface BaseRouter {
  /** The current pathname */
  readonly pathname: Readable.Readable<string>;
  /** The current query params */
  readonly searchParams: Readable.Readable<URLSearchParams>;
  /** The currently matched route name, or Option.none() if no match */
  readonly currentRoute: Readable.Readable<Option.Option<string>>;
  /** Reactive loader state for the current route */
  readonly loaderState: Readable.Readable<LoaderState>;
  /** Reactive action state for form submissions */
  readonly actionState: Readable.Readable<ActionState>;
  /** Navigate to a path */
  readonly push: (
    path: string,
    options?: NavigateOptions,
  ) => Effect.Effect<void>;
  /** Replace current path */
  readonly replace: (path: string) => Effect.Effect<void>;
  /** Go back in history */
  readonly back: () => Effect.Effect<void>;
  /** Go forward in history */
  readonly forward: () => Effect.Effect<void>;
  /** Submit a form to the current route's action */
  readonly submitAction: (
    formData: FormData,
  ) => Effect.Effect<ActionResult | null, unknown>;
}
