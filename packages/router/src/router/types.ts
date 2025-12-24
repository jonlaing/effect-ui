import type { Effect, Schema } from "effect";
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
 * A path segment in a route pattern.
 */
export type PathSegment =
  | { readonly type: "static"; readonly value: string }
  | { readonly type: "param"; readonly name: string }
  | { readonly type: "catchAll" };

/**
 * Options for creating a Route.
 * @template P - The params schema type
 * @template A - The loader return type
 * @template E - The loader error type
 * @template R - The loader required context
 */
export interface RouteOptions<
  P extends Schema.Schema.AnyNoContext,
  A = unknown,
  E = never,
  R = never,
> {
  /** Schema for validating and typing path parameters */
  readonly params?: P;
  /** Loader function to fetch data for this route */
  readonly loader?: LoaderFn<Schema.Schema.Type<P>, A, E, R>;
}

/**
 * A route definition with typed parameters and optional loader.
 * @template Path - The path pattern literal type
 * @template P - The params schema type
 * @template A - The loader return type
 * @template E - The loader error type
 * @template R - The loader required context
 */
export interface Route<
  Path extends string = string,
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
  A = unknown,
  E = never,
  R = never,
> {
  /** The original path pattern */
  readonly path: Path;
  /** Parsed path segments */
  readonly segments: readonly PathSegment[];
  /** Schema for params validation */
  readonly paramsSchema: P | undefined;
  /** Loader function to fetch data for this route */
  readonly loader: LoaderFn<Schema.Schema.Type<P>, A, E, R> | undefined;
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
 * A route with any loader type (used for Router constraints)
 */
export type AnyRoute = Route<
  string,
  Schema.Schema.AnyNoContext,
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
  /** The currently matched route name, or null if no match */
  readonly currentRoute: Readable.Readable<keyof Routes | null>;
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
 * Used by Link and other components that need router access.
 */
export interface BaseRouter {
  /** The current pathname */
  readonly pathname: Readable.Readable<string>;
  /** The current query params */
  readonly searchParams: Readable.Readable<URLSearchParams>;
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
}
