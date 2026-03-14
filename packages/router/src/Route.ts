import { Context, Data, Effect, ParseResult, Pipeable, Schema } from "effect";

import { Readable } from "@effex/core";
import type { Element } from "@effex/dom";

// =============================================================================
// TypeId
// =============================================================================

export const TypeId: unique symbol = Symbol.for("@effex/router/Route");
export type TypeId = typeof TypeId;

// =============================================================================
// Errors
// =============================================================================

/**
 * Error yielded when a route is used without calling `Route.render()`.
 * `Route.render()` excludes this error from the route's E channel.
 */
export class NoRenderError extends Data.TaggedError("NoRenderError")<{
  readonly path: string;
}> {}

// =============================================================================
// Path Parsing
// =============================================================================

/**
 * A path segment in a route pattern.
 */
export type PathSegment =
  | { readonly type: "static"; readonly value: string }
  | { readonly type: "param"; readonly name: string }
  | { readonly type: "catchAll" };

/**
 * Parse a path pattern into segments.
 * Handles static segments, :param segments, and * catch-all.
 */
export const parsePath = (path: string): PathSegment[] => {
  const segments: PathSegment[] = [];
  const parts = path.split("/").filter((p) => p.length > 0);

  for (const part of parts) {
    if (part === "*") {
      segments.push({ type: "catchAll" });
    } else if (part.startsWith(":")) {
      const name = part.slice(1).replace(/\?$/, "");
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
  score += segments.length * 0.1;
  return score;
};

/**
 * Try to match a pathname against route segments.
 * Returns extracted params if matched, or null if no match.
 */
export const matchSegments = (
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
      // Capture remaining path
      params["*"] = parts.slice(partIndex).join("/");
      return params;
    }

    if (partIndex >= parts.length) {
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

  if (partIndex < parts.length) {
    return null;
  }

  return params;
};

// =============================================================================
// Route Context
// =============================================================================

/**
 * Context provided to a route's render function.
 * Each route has its own unique context type for type-safe param access.
 */
export interface RouteContext<Params, SearchParams> {
  readonly params: Params;
  readonly searchParams: SearchParams;
}

// =============================================================================
// Route Type
// =============================================================================

/**
 * Animation options for route transitions.
 */
export interface AnimationOptions {
  readonly enter?: string;
  readonly exit?: string;
  readonly enterFrom?: string;
  readonly enterTo?: string;
}

/**
 * Guard options for protected routes.
 */
export type GuardOptions =
  | { readonly redirect: string }
  | { readonly fallback: () => Element.Element<HTMLElement | SVGElement> };

/**
 * A handler entry for POST/PUT/DELETE mutations.
 */
export interface RouteHandler {
  readonly method: "post" | "put" | "delete";
  readonly key: string;
  readonly handler: (body: unknown) => Effect.Effect<unknown, unknown, unknown>;
}

/**
 * A route definition with typed parameters.
 */
export interface Route<
  Path extends string = string,
  Params = Record<string, string>,
  SearchParams = Record<string, string>,
  Data = unknown,
  E = never,
  R = never,
>
  extends Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  /** The path pattern */
  readonly path: Path;
  /** Parsed path segments */
  readonly segments: readonly PathSegment[];
  /** The render function — receives loader data (or undefined if no loader) */
  readonly render: (
    data: Data,
  ) => Element.Element<HTMLElement | SVGElement, E, R>;
  /** Schema for params validation (if set) */
  readonly paramsSchema: Schema.Schema<Params, unknown> | null;
  /** Schema for search params validation (if set) */
  readonly searchParamsSchema: Schema.Schema<SearchParams, unknown> | null;
  /** Guard condition (if set) */
  readonly guard: Readable.Readable<boolean> | Effect.Effect<boolean> | null;
  /** Guard options */
  readonly guardOptions: GuardOptions | null;
  /** Animation options */
  readonly animation: AnimationOptions | null;
  /** Whether this is a lazy-loaded route */
  readonly lazy: boolean;
  /**
   * Context tag for this route's params.
   * Use `yield* MyRoute.Params` to access typed params.
   */
  readonly Params: Context.Tag<
    RouteContext<Params, SearchParams>,
    RouteContext<Params, SearchParams>
  >;
  /**
   * Effect that yields the route's typed params.
   * Only valid when this route is active.
   */
  readonly params: Effect.Effect<
    Params,
    ParseResult.ParseError,
    RouteContext<Params, SearchParams>
  >;
  /**
   * Effect that yields the route's typed search params.
   * Only valid when this route is active.
   */
  readonly searchParams: Effect.Effect<
    SearchParams,
    ParseResult.ParseError,
    RouteContext<Params, SearchParams>
  >;
  /**
   * Loader hook — executed on GET by platform.
   * Receives { params, searchParams } and returns data for the render function.
   * Stored opaquely; the router never executes it.
   */
  readonly _loader:
    | (<EL, RL>(args: {
        params: Params;
        searchParams: SearchParams;
      }) => Effect.Effect<unknown, EL, RL>)
    | null;
  /**
   * Mutation handlers — executed on POST/PUT/DELETE by platform.
   * Each entry has a method, unique key, and handler function.
   * Stored opaquely; the router never executes them.
   */
  readonly _handlers: ReadonlyArray<RouteHandler>;
  /**
   * Static site generation config — set by `Route.static`.
   * Contains `paths` (enumerate param sets) and `load` (fetch data for one page).
   * Stored opaquely; only consumed by `Platform.buildStaticSite()`.
   */
  readonly _staticConfig: {
    readonly paths: () => Effect.Effect<unknown[], unknown, unknown>;
    readonly load: (args: {
      params: unknown;
    }) => Effect.Effect<unknown, unknown, unknown>;
  } | null;
}

// =============================================================================
// Constructors
// =============================================================================

const RouteProto = {
  [TypeId]: TypeId,
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments);
  },
};

/**
 * Create a route definition.
 *
 * Use combinators to add params, loaders, handlers, and the render function:
 *
 * @param path - The path pattern (e.g., "/users/:id")
 *
 * @example
 * ```ts
 * const HomeRoute = Route.make("/").pipe(
 *   Route.render(() => HomePage()),
 * );
 *
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.params(Schema.Struct({ id: Schema.NumberFromString })),
 *   Route.get(
 *     ({ params: { id } }) => Effect.gen(function* () {
 *       const db = yield* DatabaseService;
 *       return yield* db.getUser(id);
 *     }),
 *     (user) => UserPage({ user }),
 *   ),
 * );
 * ```
 */
export const make = <Path extends string>(
  path: Path,
): Route<
  Path,
  Record<string, string>,
  Record<string, string>,
  unknown,
  NoRenderError,
  never
> => {
  const segments = parsePath(path);

  // Create a unique context tag for this route
  const ParamsTag = Context.GenericTag<
    RouteContext<Record<string, string>, Record<string, string>>
  >(`@effex/router/Route(${path})`);

  const route: Route<
    Path,
    Record<string, string>,
    Record<string, string>,
    unknown,
    NoRenderError,
    never
  > = Object.assign(Object.create(RouteProto), {
    path,
    segments,
    render: (_data: unknown) => Effect.fail(new NoRenderError({ path })),
    paramsSchema: null,
    searchParamsSchema: null,
    guard: null,
    guardOptions: null,
    animation: null,
    lazy: false,
    Params: ParamsTag,
    params: Effect.map(ParamsTag, (ctx) => ctx.params),
    searchParams: Effect.map(ParamsTag, (ctx) => ctx.searchParams),
    _loader: null,
    _handlers: [],
    _staticConfig: null,
  });

  return route;
};

// =============================================================================
// Combinators
// =============================================================================

/**
 * Add a schema for route params.
 * The schema transforms raw string params to typed values.
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.params(Schema.Struct({ id: Schema.NumberFromString }))
 * );
 *
 * // In UserPage:
 * const { id } = yield* UserRoute.params;  // id is number
 * ```
 */
export const params =
  <P, I>(schema: Schema.Schema<P, I>) =>
  <Path extends string, OldP, SP, D, E, R>(
    route: Route<Path, OldP, SP, D, E, R>,
  ): Route<Path, P, SP, D, E | ParseResult.ParseError, R> => {
    // Create a new context tag with the updated params type
    const ParamsTag = Context.GenericTag<RouteContext<P, SP>>(
      `@effex/router/Route(${route.path})`,
    );

    return Object.assign(Object.create(RouteProto), {
      ...route,
      paramsSchema: schema,
      Params: ParamsTag,
      params: Effect.flatMap(ParamsTag, (ctx) => Effect.succeed(ctx.params)),
      searchParams: Effect.map(ParamsTag, (ctx) => ctx.searchParams),
    }) as Route<Path, P, SP, D, E | ParseResult.ParseError, R>;
  };

/**
 * Add a schema for search params (query string).
 *
 * @example
 * ```ts
 * const SearchRoute = Route.make("/search").pipe(
 *   Route.searchParams(Schema.Struct({
 *     q: Schema.String,
 *     page: Schema.optional(Schema.NumberFromString).pipe(
 *       Schema.withDefault(() => 1)
 *     ),
 *   }))
 * );
 *
 * // In SearchPage:
 * const { q, page } = yield* SearchRoute.searchParams;
 * ```
 */
export const searchParams =
  <SP, I>(schema: Schema.Schema<SP, I>) =>
  <Path extends string, P, OldSP, D, E, R>(
    route: Route<Path, P, OldSP, D, E, R>,
  ): Route<Path, P, SP, D, E | ParseResult.ParseError, R> => {
    const ParamsTag = Context.GenericTag<RouteContext<P, SP>>(
      `@effex/router/Route(${route.path})`,
    );

    return Object.assign(Object.create(RouteProto), {
      ...route,
      searchParamsSchema: schema,
      Params: ParamsTag,
      params: Effect.map(ParamsTag, (ctx) => ctx.params),
      searchParams: Effect.flatMap(ParamsTag, (ctx) =>
        Effect.succeed(ctx.searchParams),
      ),
    }) as Route<Path, P, SP, D, E | ParseResult.ParseError, R>;
  };

/**
 * Keep raw string params without schema validation.
 * Useful when you want to handle params manually.
 *
 * @example
 * ```ts
 * const ProfileRoute = Route.make("/profile/:username").pipe(
 *   Route.rawParams
 * );
 *
 * // In ProfilePage:
 * const { username } = yield* ProfileRoute.params;  // string
 * ```
 */
export const rawParams = <Path extends string, OldP, SP, D, E, R>(
  route: Route<Path, OldP, SP, D, E, R>,
): Route<Path, Record<string, string>, SP, D, E, R> => {
  const ParamsTag = Context.GenericTag<
    RouteContext<Record<string, string>, SP>
  >(`@effex/router/Route(${route.path})`);

  return Object.assign(Object.create(RouteProto), {
    ...route,
    paramsSchema: null,
    Params: ParamsTag,
    params: Effect.map(ParamsTag, (ctx) => ctx.params),
    searchParams: Effect.map(ParamsTag, (ctx) => ctx.searchParams),
  }) as Route<Path, Record<string, string>, SP, D, E, R>;
};

// =============================================================================
// Route-Level Hook Combinators
// =============================================================================

/**
 * Set the render function for a route without a loader.
 *
 * Shorthand for routes that don't need data loading.
 * For routes with loaders, use `Route.get(loader, render)` instead.
 *
 * @example
 * ```ts
 * const HomeRoute = Route.make("/").pipe(
 *   Route.render(() => HomePage()),
 * );
 * ```
 */
export const render =
  <E2, R2>(fn: () => Element.Element<HTMLElement | SVGElement, E2, R2>) =>
  <Path extends string, P, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): [NoRenderError] extends [E]
    ? Route<Path, P, SP, D, Exclude<E, NoRenderError> | E2, R | R2>
    : never => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      render: (_data: D) => fn(),
    });
  };

/**
 * Add a GET loader and render function to the route.
 *
 * The loader receives `{ params, searchParams }` and returns data of type `A`.
 * The render function receives `A` directly — fully typed, no cast needed.
 *
 * The loader's E/R requirements do NOT flow into the Route's E/R —
 * they flow to the Platform's HttpRouter instead.
 *
 * @example
 * ```ts
 * const UsersRoute = Route.make("/users").pipe(
 *   Route.get(
 *     ({}) => Effect.succeed(usersMock),
 *     (users) => UsersPage({ users }),
 *   ),
 * );
 *
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.params(Schema.Struct({ id: Schema.NumberFromString })),
 *   Route.get(
 *     ({ params: { id } }) => Effect.gen(function* () {
 *       const db = yield* DatabaseService;
 *       return yield* db.getUser(id);
 *     }),
 *     (user) => UserPage({ user }),
 *   ),
 * );
 * ```
 */
export const get =
  <P, SP, A, E2, R2, E3, R3>(
    loader: (args: { params: P; searchParams: SP }) => Effect.Effect<A, E2, R2>,
    renderFn: (data: A) => Element.Element<HTMLElement | SVGElement, E3, R3>,
  ) =>
  <Path extends string, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): [NoRenderError] extends [E]
    ? Route<Path, P, SP, A, Exclude<E, NoRenderError> | E3, R | R3>
    : never => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      _loader: loader,
      render: renderFn,
    });
  };

/**
 * Static site generation config for a route.
 *
 * Provides `paths` to enumerate all param sets at build time,
 * `load` to fetch data for each page, and `render` to produce the element.
 *
 * Mutually exclusive with `Route.get` and `Route.render` — all three
 * consume `NoRenderError`.
 *
 * @example
 * ```ts
 * const DocRoute = Route.make("/docs/:slug").pipe(
 *   Route.params(Schema.Struct({ slug: Schema.String })),
 *   Route.static({
 *     paths: () => Effect.gen(function* () {
 *       const files = yield* glob("docs/*.md");
 *       return files.map(f => ({ slug: basename(f, ".md") }));
 *     }),
 *     load: ({ params }) => Effect.gen(function* () {
 *       const raw = yield* readFile(`docs/${params.slug}.md`);
 *       return parseMarkdown(raw);
 *     }),
 *     render: (data) => DocPage(data),
 *   }),
 * );
 * ```
 */
export const static_ =
  <P, A, E2, R2, E3, R3>(config: {
    readonly paths?: () => Effect.Effect<P[], E2, R2>;
    readonly load: (args: { params: P }) => Effect.Effect<A, E2, R2>;
    readonly render: (
      data: A,
    ) => Element.Element<HTMLElement | SVGElement, E3, R3>;
  }) =>
  <Path extends string, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): [NoRenderError] extends [E]
    ? Route<Path, P, SP, A, Exclude<E, NoRenderError> | E3, R | R3>
    : never => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      render: config.render,
      _staticConfig: {
        paths: config.paths ?? (() => Effect.succeed([{} as P])),
        load: config.load,
      },
    });
  };

/**
 * Add a POST mutation handler to the route.
 *
 * The handler receives the parsed request body and returns a result.
 * Platform executes it directly on POST — no component rendering needed.
 *
 * The handler's E/R requirements do NOT flow into the Route's E/R.
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.post("updateProfile", (body) => Effect.gen(function* () {
 *     const data = yield* Schema.decodeUnknown(ProfileSchema)(body);
 *     const db = yield* DatabaseService;
 *     return yield* db.updateProfile(data);
 *   })),
 *   Route.render(() => UserPage()),
 * );
 * ```
 */
export const post =
  <A, E2, R2>(
    key: string,
    handler: (body: unknown) => Effect.Effect<A, E2, R2>,
  ) =>
  <Path extends string, P, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, E, R> => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      _handlers: [
        ...route._handlers,
        { method: "post" as const, key, handler },
      ],
    }) as Route<Path, P, SP, D, E, R>;
  };

/**
 * Add a PUT mutation handler to the route.
 * Same semantics as `Route.post()` but for PUT requests.
 */
export const put =
  <A, E2, R2>(
    key: string,
    handler: (body: unknown) => Effect.Effect<A, E2, R2>,
  ) =>
  <Path extends string, P, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, E, R> => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      _handlers: [...route._handlers, { method: "put" as const, key, handler }],
    }) as Route<Path, P, SP, D, E, R>;
  };

/**
 * Add a DELETE mutation handler to the route.
 * Same semantics as `Route.post()` but for DELETE requests.
 */
export const del =
  <A, E2, R2>(
    key: string,
    handler: (body: unknown) => Effect.Effect<A, E2, R2>,
  ) =>
  <Path extends string, P, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, E, R> => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      _handlers: [
        ...route._handlers,
        { method: "delete" as const, key, handler },
      ],
    }) as Route<Path, P, SP, D, E, R>;
  };

/**
 * Add a guard to the route.
 * The route will only render if the guard condition is true.
 *
 * @example
 * ```ts
 * const DashboardRoute = Route.make("/dashboard").pipe(
 *   Route.withGuard(isAuthenticated, { redirect: "/login" })
 * );
 * ```
 */
export const withGuard =
  (
    condition: Readable.Readable<boolean> | Effect.Effect<boolean>,
    options: GuardOptions,
  ) =>
  <Path extends string, P, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, E, R> => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      guard: condition,
      guardOptions: options,
    });
  };

/**
 * Add animation options to the route.
 *
 * @example
 * ```ts
 * const ModalRoute = Route.make("/modal/:id").pipe(
 *   Route.withAnimation({
 *     enter: "slide-up",
 *     exit: "slide-down",
 *   })
 * );
 * ```
 */
export const withAnimation =
  (options: AnimationOptions) =>
  <Path extends string, P, SP, D, E, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, E, R> => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      animation: options,
    });
  };

// =============================================================================
// Error Handling Combinators
// =============================================================================

/**
 * Catch errors from the route's render function using a predicate.
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.catch((error) => error._tag === "NotFound", () => NotFoundPage())
 * );
 * ```
 */
export const catchIf =
  <E, E2, R2>(
    predicate: (error: E) => boolean,
    handler: (error: E) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ) =>
  <Path extends string, P, SP, D, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, Exclude<E, E> | E2, R | R2> => {
    const ParamsTag = route.Params as Context.Tag<
      RouteContext<P, SP>,
      RouteContext<P, SP>
    >;

    return Object.assign(Object.create(RouteProto), {
      ...route,
      Params: ParamsTag,
      render: (data: D) =>
        Effect.catchIf(
          route.render(data),
          predicate,
          handler,
        ) as Element.Element<
          HTMLElement | SVGElement,
          Exclude<E, E> | E2,
          R | R2
        >,
    });
  };

/**
 * Catch errors with a specific _tag from the route's render function.
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.catchTag("NotFound", () => NotFoundPage()),
 *   Route.catchTag("Unauthorized", () => UnauthorizedPage())
 * );
 * ```
 */
export const catchTag: {
  <const K extends string, E2, R2>(
    tag: K,
    handler: (error: {
      _tag: K;
    }) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ): <Path extends string, P, SP, D, E extends { _tag: string }, R>(
    route: Route<Path, P, SP, D, E, R>,
  ) => Route<Path, P, SP, D, Exclude<E, { _tag: K }> | E2, R | R2>;
} = (<const K extends string, E2, R2>(
    tag: K,
    handler: (error: {
      _tag: K;
    }) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ) =>
  <Path extends string, P, SP, D, E extends { _tag: string }, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, Exclude<E, { _tag: K }> | E2, R | R2> => {
    return Object.assign(Object.create(RouteProto), {
      ...route,
      render: (data: D) =>
        Effect.catchTag(
          route.render(data) as Effect.Effect<
            HTMLElement | SVGElement,
            { _tag: string },
            unknown
          >,
          tag,
          handler as (error: {
            _tag: K;
          }) => Effect.Effect<HTMLElement | SVGElement, E2, R2>,
        ),
    }) as Route<Path, P, SP, D, Exclude<E, { _tag: K }> | E2, R | R2>;
  }) as {
  <const K extends string, E2, R2>(
    tag: K,
    handler: (error: {
      _tag: K;
    }) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ): <Path extends string, P, SP, D, E extends { _tag: string }, R>(
    route: Route<Path, P, SP, D, E, R>,
  ) => Route<Path, P, SP, D, Exclude<E, { _tag: K }> | E2, R | R2>;
};

/**
 * Catch all errors from the route's render function.
 * This removes errors from the error channel entirely.
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id").pipe(
 *   Route.catchAll((error) => ErrorPage({ error }))
 * );
 * ```
 */
export const catchAll =
  <E, E2, R2>(
    handler: (error: E) => Element.Element<HTMLElement | SVGElement, E2, R2>,
  ) =>
  <Path extends string, P, SP, D, R>(
    route: Route<Path, P, SP, D, E, R>,
  ): Route<Path, P, SP, D, E2, R | R2> => {
    const ParamsTag = route.Params as Context.Tag<
      RouteContext<P, SP>,
      RouteContext<P, SP>
    >;

    return Object.assign(Object.create(RouteProto), {
      ...route,
      Params: ParamsTag,
      render: (data: D) =>
        Effect.catchAll(route.render(data), handler) as Element.Element<
          HTMLElement | SVGElement,
          E2,
          R | R2
        >,
    });
  };

/**
 * Create a lazy-loaded route.
 *
 * @example
 * ```ts
 * const AdminRoute = Route.lazy("/admin", () => import("./admin/AdminPage"));
 * ```
 */
export const lazy = <Path extends string>(
  path: Path,
  load: () => Promise<{
    default: Route<Path, unknown, unknown, unknown, unknown, unknown>;
  }>,
  options?: { fallback?: () => Element.Element<HTMLElement | SVGElement> },
): Route<Path, unknown, unknown, unknown, never, never> => {
  // Create a placeholder route that will be replaced when loaded
  const segments = parsePath(path);
  const ParamsTag = Context.GenericTag<RouteContext<unknown, unknown>>(
    `@effex/router/Route(${path})`,
  );

  const route: Route<Path, unknown, unknown, unknown, never, never> =
    Object.assign(Object.create(RouteProto), {
      path,
      segments,
      render: options?.fallback
        ? (_data: unknown) => options.fallback!()
        : (_data: unknown) => {
            throw new Error(`Lazy route ${path} not yet loaded`);
          },
      paramsSchema: null,
      searchParamsSchema: null,
      guard: null,
      guardOptions: null,
      animation: null,
      lazy: true,
      Params: ParamsTag,
      params: Effect.map(ParamsTag, (ctx) => ctx.params),
      searchParams: Effect.map(ParamsTag, (ctx) => ctx.searchParams),
      _loader: null,
      _handlers: [],
      _staticConfig: null,
      // Store the module loader for the router to use
      _load: load,
    });

  return route;
};

// =============================================================================
// Utilities
// =============================================================================

/**
 * Check if a value is a Route.
 */
export const isRoute = (value: unknown): value is Route => {
  return typeof value === "object" && value !== null && TypeId in value;
};

/**
 * Extract the params type from a Route.
 */
export type RouteParams<R> =
  R extends Route<string, infer P, unknown, unknown, unknown, unknown>
    ? P
    : never;

/**
 * Extract the search params type from a Route.
 */
export type RouteSearchParams<R> =
  R extends Route<string, unknown, infer SP, unknown, unknown, unknown>
    ? SP
    : never;

/**
 * Extract the data type from a Route.
 */
export type RouteData<R> =
  R extends Route<string, unknown, unknown, infer D, unknown, unknown>
    ? D
    : never;

// =============================================================================
// Module
// =============================================================================

export const Route = {
  make,
  render,
  get,
  static: static_,
  post,
  put,
  delete: del,
  params,
  searchParams,
  rawParams,
  withGuard,
  withAnimation,
  lazy,
  isRoute,
  catchIf,
  catchTag,
  catchAll,
};
