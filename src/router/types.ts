import type { Effect } from "effect";
import type { Schema } from "effect";
import type { Readable } from "@core/Readable";

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
 */
export interface RouteOptions<P extends Schema.Schema.AnyNoContext> {
  /** Schema for validating and typing path parameters */
  readonly params?: P;
}

/**
 * A route definition with typed parameters.
 * @template Path - The path pattern literal type
 * @template P - The params schema type
 */
export interface Route<
  Path extends string = string,
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
> {
  /** The original path pattern */
  readonly path: Path;
  /** Parsed path segments */
  readonly segments: readonly PathSegment[];
  /** Schema for params validation */
  readonly paramsSchema: P | undefined;
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
  readonly route: Route<string, Schema.Schema.AnyNoContext>;
  /** The parsed and validated params */
  readonly params: P;
}

/**
 * State for an individual route within the router.
 * @template P - The params type
 */
export interface RouteState<P = unknown> {
  /** Whether this route is currently active */
  readonly isActive: Readable<boolean>;
  /** The current params (only meaningful when active) */
  readonly params: Readable<P>;
}

/**
 * Navigation options.
 */
export interface NavigateOptions {
  /** Replace the current history entry instead of pushing */
  readonly replace?: boolean;
}

/**
 * The main Router interface.
 * @template Routes - Record of route names to Route definitions
 */
export interface Router<
  Routes extends Record<string, Route<string, Schema.Schema.AnyNoContext>>,
> {
  /** The current pathname */
  readonly pathname: Readable<string>;
  /** The current query params */
  readonly searchParams: Readable<URLSearchParams>;
  /** The currently matched route name, or null if no match */
  readonly currentRoute: Readable<keyof Routes | null>;
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

/**
 * Options for creating a Router.
 */
export interface RouterOptions {
  /** Initial path to start at (defaults to window.location.pathname) */
  readonly initialPath?: string;
}

/**
 * Base router interface for context (without route-specific typing).
 * Used by Link and other components that need router access.
 */
export interface BaseRouter {
  /** The current pathname */
  readonly pathname: Readable<string>;
  /** The current query params */
  readonly searchParams: Readable<URLSearchParams>;
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
