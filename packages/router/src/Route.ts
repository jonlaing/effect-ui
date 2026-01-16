import { Effect, Schema } from "effect";

import { RouterContext } from "./RouterContext";
import {
  RouteMatchError,
  type ActionFn,
  type LoaderFn,
  type PathSegment,
  type RouteOptions,
  type Route as RouteType,
} from "./types";

/**
 * Parse a path pattern into segments.
 * Handles static segments, :param segments, and * catch-all.
 */
const parsePath = (path: string): PathSegment[] => {
  const segments: PathSegment[] = [];
  const parts = path.split("/").filter((p) => p.length > 0);

  for (const part of parts) {
    if (part === "*") {
      segments.push({ type: "catchAll" });
    } else if (part.startsWith(":")) {
      const name = part.slice(1).replace(/\?$/, ""); // Remove optional marker
      segments.push({ type: "param", name });
    } else {
      segments.push({ type: "static", value: part });
    }
  }

  return segments;
};

/**
 * Calculate route specificity for sorting.
 * Higher = more specific.
 * Static segments worth more than params, params worth more than catch-all.
 */
export const routeSpecificity = (segments: readonly PathSegment[]): number => {
  let score = 0;
  for (const segment of segments) {
    if (segment.type === "static") {
      score += 3;
    } else if (segment.type === "param") {
      score += 2;
    } else if (segment.type === "catchAll") {
      score += 1;
    }
  }
  // Bonus for length (longer more specific paths)
  score += segments.length * 0.1;
  return score;
};

/**
 * Try to match a pathname against route segments.
 * Returns extracted params if matched, or null if no match.
 */
const matchSegments = (
  segments: readonly PathSegment[],
  pathname: string,
): Record<string, string> | null => {
  const parts = pathname.split("/").filter((p) => p.length > 0);
  const params: Record<string, string> = {};

  let segmentIndex = 0;
  let partIndex = 0;

  while (segmentIndex < segments.length) {
    const segment = segments[segmentIndex];

    if (segment.type === "catchAll") {
      // Catch-all matches everything remaining
      return params;
    }

    if (partIndex >= parts.length) {
      // No more parts but still have segments - no match
      return null;
    }

    const part = parts[partIndex];

    if (segment.type === "static") {
      if (segment.value !== part) {
        return null;
      }
    } else if (segment.type === "param") {
      params[segment.name] = part;
    }

    segmentIndex++;
    partIndex++;
  }

  // If we have leftover parts and no catch-all, no match
  if (partIndex < parts.length) {
    return null;
  }

  return params;
};

/**
 * Create a route definition.
 *
 * @param path - The path pattern (e.g., "/users/:id")
 * @param options - Route configuration including params schema, loader, and action
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id", {
 *   params: Schema.Struct({ id: Schema.String }),
 *   loader: (params) => Effect.gen(function* () {
 *     const userService = yield* UserService;
 *     return yield* userService.getById(params.id);
 *   }),
 *   action: ({ formData, params }) => Effect.gen(function* () {
 *     const userService = yield* UserService;
 *     const name = formData.get("name") as string;
 *     return yield* userService.update(params.id, { name });
 *   }),
 * })
 *
 * const HomeRoute = Route.make("/")
 *
 * const CatchAllRoute = Route.make("/*")
 * ```
 */
export const make = <
  Path extends string,
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
  LA = unknown,
  LE = never,
  LR = never,
  AA = unknown,
  AE = never,
  AR = never,
>(
  path: Path,
  options?: RouteOptions<P, LA, LE, LR, AA, AE, AR>,
): RouteType<Path, P, LA, LE, LR, AA, AE, AR> => {
  const segments = parsePath(path);
  const paramsSchema = options?.params;
  const loader = options?.loader;
  const action = options?.action;

  const route: RouteType<Path, P, LA, LE, LR, AA, AE, AR> = {
    path,
    segments,
    paramsSchema,
    loader,
    action,
    match: (pathname: string) =>
      Effect.gen(function* () {
        const rawParams = matchSegments(segments, pathname);

        if (rawParams === null) {
          return yield* Effect.fail(RouteMatchError(pathname, "no-match"));
        }

        if (paramsSchema) {
          const decode = Schema.decodeUnknown(paramsSchema);
          const result = yield* decode(rawParams).pipe(
            Effect.mapError((e) =>
              RouteMatchError(pathname, "validation-failed", String(e)),
            ),
          );
          return result as Schema.Schema.Type<P>;
        }

        return rawParams as Schema.Schema.Type<P>;
      }),
  };

  return route;
};

// ============================================================================
// Route.define - Co-located route definition with accessor methods
// ============================================================================

/**
 * Options for defining a route with co-located configuration.
 * The path is injected by the vite-plugin based on file location.
 */
export interface DefineOptions<
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
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
  /**
   * Mark this route for static site generation.
   * When true, this route will be pre-rendered at build time.
   *
   * For dynamic routes (with params), you must also export a `staticPaths` function
   * that returns all paths to pre-render.
   *
   * @example
   * ```ts
   * // Static page (no params)
   * export const route = Route.define({ static: true });
   *
   * // Dynamic static page (with params)
   * export const route = Route.define({
   *   static: true,
   *   params: Schema.Struct({ slug: Schema.String }),
   * });
   *
   * // Must also export staticPaths for dynamic routes:
   * export const staticPaths = async () => [
   *   { slug: "hello-world" },
   *   { slug: "about-us" },
   * ];
   * ```
   */
  readonly static?: boolean;
  /**
   * Time in seconds after which a statically generated page should be regenerated.
   * Only applies when `static: true`.
   *
   * This enables Incremental Static Regeneration (ISR) on platforms that support it.
   * - `undefined` (default): Page is generated once at build time
   * - `0`: Page is regenerated on every request (SSR)
   * - `> 0`: Page is regenerated after the specified number of seconds
   *
   * @example
   * ```ts
   * export const route = Route.define({
   *   static: true,
   *   revalidate: 60, // Regenerate every 60 seconds
   * });
   * ```
   */
  readonly revalidate?: number;
  /**
   * @internal Injected by vite-plugin - do not set manually
   */
  readonly __path?: string;
}

/**
 * A defined route with accessor methods for use in components.
 * Created by Route.define() and used within page components.
 */
export interface DefinedRoute<
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
  LA = unknown,
  LE = never,
  LR = never,
  AA = unknown,
  AE = never,
  AR = never,
> {
  /**
   * Get the current route params (type-safe based on params schema).
   * Only valid when this route is active.
   *
   * @example
   * ```ts
   * const { id } = yield* route.params()
   * ```
   */
  readonly params: () => Effect.Effect<
    Schema.Schema.Type<P>,
    RouteMatchError,
    RouterContext
  >;

  /**
   * Get the loader data for this route (type-safe based on loader return type).
   * Only valid when this route is active and has a loader.
   *
   * @example
   * ```ts
   * const user = yield* route.loaderData()
   * ```
   */
  readonly loaderData: () => Effect.Effect<LA, never, RouterContext>;

  /**
   * Check if this route is currently active.
   *
   * @example
   * ```ts
   * const active = yield* route.isActive()
   * ```
   */
  readonly isActive: () => Effect.Effect<boolean, never, RouterContext>;

  // Internal properties for the router to use
  /** @internal */
  readonly _config: {
    readonly paramsSchema: P | undefined;
    readonly loader: LoaderFn<Schema.Schema.Type<P>, LA, LE, LR> | undefined;
    readonly action: ActionFn<AA, AE, AR> | undefined;
    readonly static: boolean;
    readonly revalidate: number | undefined;
  };
  /** @internal */
  readonly _path: string;
  /** @internal */
  readonly _segments: readonly PathSegment[];
}

/**
 * Define a route with co-located configuration.
 * Use this in page files to define routes alongside components.
 *
 * The path is automatically injected by the vite-plugin based on the file location.
 *
 * @example
 * ```ts
 * // routes/users.$id.ts
 * import { Route } from "@effex/router";
 * import { Schema, Effect } from "effect";
 *
 * export const route = Route.define({
 *   params: Schema.Struct({ id: Schema.String }),
 *   loader: (params) => Effect.gen(function* () {
 *     return yield* fetchUser(params.id);
 *   }),
 * });
 *
 * export default component("UserPage", () =>
 *   Effect.gen(function* () {
 *     const { id } = yield* route.params();
 *     const user = yield* route.loaderData();
 *     // ...
 *   })
 * );
 * ```
 */
export const define = <
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
  LA = unknown,
  LE = never,
  LR = never,
  AA = unknown,
  AE = never,
  AR = never,
>(
  options: DefineOptions<P, LA, LE, LR, AA, AE, AR> = {},
): DefinedRoute<P, LA, LE, LR, AA, AE, AR> => {
  // Path is injected by vite-plugin, default to "/" if not set
  const path = options.__path ?? "/";
  const segments = parsePath(path);
  const paramsSchema = options.params;

  const definedRoute: DefinedRoute<P, LA, LE, LR, AA, AE, AR> = {
    params: () =>
      Effect.gen(function* () {
        const router = yield* RouterContext;
        const pathname = yield* router.pathname.get;
        const rawParams = matchSegments(segments, pathname);

        if (rawParams === null) {
          return yield* Effect.fail(RouteMatchError(pathname, "no-match"));
        }

        if (paramsSchema) {
          const decode = Schema.decodeUnknown(paramsSchema);
          const result = yield* decode(rawParams).pipe(
            Effect.mapError((e) =>
              RouteMatchError(pathname, "validation-failed", String(e)),
            ),
          );
          return result as Schema.Schema.Type<P>;
        }

        return rawParams as Schema.Schema.Type<P>;
      }),

    loaderData: () =>
      Effect.gen(function* () {
        const router = yield* RouterContext;
        const state = yield* router.loaderState.get;
        return state.data as LA;
      }),

    isActive: () =>
      Effect.gen(function* () {
        const router = yield* RouterContext;
        const pathname = yield* router.pathname.get;
        return matchSegments(segments, pathname) !== null;
      }),

    _config: {
      paramsSchema: options.params,
      loader: options.loader,
      action: options.action,
      static: options.static ?? false,
      revalidate: options.revalidate,
    },
    _path: path,
    _segments: segments,
  };

  return definedRoute;
};

/**
 * Route module namespace.
 */
export const Route = {
  make,
  define,
};
