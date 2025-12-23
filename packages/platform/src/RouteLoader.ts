import { Context, Effect, Option } from "effect";

/**
 * Readable-like interface (avoids cross-package Effect type issues)
 */
interface ParamsReadable {
  readonly get: Effect.Effect<Record<string, string>>;
}

/**
 * Context for the current route's loader
 */
export interface LoaderContext {
  /**
   * Route ID (e.g., "routes/users/$id")
   */
  readonly routeId: string;

  /**
   * Current route params (reactive)
   */
  readonly params: ParamsReadable;

  /**
   * Loader data cache (populated during SSR, read during hydration)
   */
  readonly loaderDataCache: Map<string, unknown>;

  /**
   * Whether we're hydrating (client should use cached data)
   */
  readonly isHydrating: boolean;

  /**
   * Parent route's loader data (for nested routes)
   */
  readonly parentData: Option.Option<unknown>;
}

/**
 * Context tag for loader context
 */
export class LoaderContextTag extends Context.Tag("@effex/LoaderContext")<
  LoaderContextTag,
  LoaderContext
>() {}

/**
 * Context for form actions
 */
export interface ActionContext {
  /**
   * The form data from the submission
   */
  readonly formData: FormData;

  /**
   * The request that triggered the action
   */
  readonly request: Request;
}

/**
 * Context tag for action context
 */
export class ActionContextTag extends Context.Tag("@effex/ActionContext")<
  ActionContextTag,
  ActionContext
>() {}

/**
 * Serialized loader data structure for hydration
 */
export interface LoaderData {
  [routeId: string]: {
    data: unknown;
    timestamp: number;
    params: Record<string, string>;
  };
}

/**
 * Redirect error for loader/action redirects
 */
export class RedirectError {
  readonly _tag = "RedirectError";
  readonly url: string;
  readonly status: 301 | 302 | 303 | 307 | 308;

  constructor(url: string, status: 301 | 302 | 303 | 307 | 308 = 302) {
    this.url = url;
    this.status = status;
  }
}

/**
 * Route utilities for loaders and components
 */
export const RouteLoader = {
  /**
   * Get the current route params
   */
  params: () =>
    Effect.flatMap(LoaderContextTag, (ctx) =>
      Effect.map(ctx.params.get, (params) => params),
    ),

  /**
   * Get the loader data for the current route
   * - During hydration: returns cached data from window.__EFFEX_LOADER_DATA__
   * - During navigation: loader should have been run by platform
   */
  loaderData: <T>() =>
    Effect.gen(function* () {
      const ctx = yield* LoaderContextTag;

      // Check if we have cached data (hydration case)
      const cached = ctx.loaderDataCache.get(ctx.routeId);
      if (cached !== undefined && ctx.isHydrating) {
        return cached as T;
      }

      // Check for cached data from loader run
      const data = ctx.loaderDataCache.get(ctx.routeId);
      if (data !== undefined) {
        return data as T;
      }

      return yield* Effect.fail(
        new Error(
          `No loader data found for route "${ctx.routeId}". ` +
            `Make sure the route exports a loader.`,
        ),
      );
    }),

  /**
   * Get the parent route's loader data (for nested routes)
   */
  parentData: <T>() =>
    Effect.gen(function* () {
      const ctx = yield* LoaderContextTag;
      if (Option.isNone(ctx.parentData)) {
        return yield* Effect.die(new Error("No parent route data available"));
      }
      return ctx.parentData.value as T;
    }),

  /**
   * Get form data from an action submission
   */
  formData: () =>
    Effect.gen(function* () {
      const ctx = yield* ActionContextTag;
      return ctx.formData;
    }),

  /**
   * Trigger a redirect from a loader or action
   */
  redirect: (
    url: string,
    status: 301 | 302 | 303 | 307 | 308 = 302,
  ): Effect.Effect<never, RedirectError> =>
    Effect.fail(new RedirectError(url, status)),

  /**
   * Get the request object (in actions)
   */
  request: () =>
    Effect.gen(function* () {
      const ctx = yield* ActionContextTag;
      return ctx.request;
    }),
};

/**
 * Helper to create a loader context for a route
 */
export const makeLoaderContext = (options: {
  routeId: string;
  params: ParamsReadable;
  loaderDataCache: Map<string, unknown>;
  isHydrating: boolean;
  parentData?: unknown;
}): LoaderContext => ({
  routeId: options.routeId,
  params: options.params,
  loaderDataCache: options.loaderDataCache,
  isHydrating: options.isHydrating,
  parentData: Option.fromNullable(options.parentData),
});

/**
 * Helper to create an action context
 */
export const makeActionContext = (
  request: Request,
  formData: FormData,
): ActionContext => ({
  request,
  formData,
});
