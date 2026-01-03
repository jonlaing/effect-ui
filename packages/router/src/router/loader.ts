import { Effect, Either, Option } from "effect";
import type {
  AnyRoute,
  LoaderResult,
  AllLoaderRequirements,
  AllLoaderErrors,
} from "./types";
import { RouterInternalsContext } from "./internals";
import { tryMatchSync } from "./matching";

export interface LoaderMethods<Routes extends Record<string, AnyRoute>> {
  executeLoader: () => Effect.Effect<
    LoaderResult | null,
    AllLoaderErrors<Routes>,
    AllLoaderRequirements<Routes>
  >;
  runLoaderAndUpdateState: Effect.Effect<void>;
  initializeLoaderData: (
    routeName: string,
    params: Record<string, string>,
    data: unknown,
  ) => Effect.Effect<void>;
}

/**
 * Create loader-related methods for the router.
 */
export const createLoaderMethods = <
  Routes extends Record<string, AnyRoute>,
>(): Effect.Effect<LoaderMethods<Routes>, never, RouterInternalsContext> =>
  Effect.gen(function* () {
    const internals = yield* RouterInternalsContext;
    const routes = internals.routes as Routes;
    const { currentRoute, pathnameSignal, loaderStateSignal } = internals;

    const executeLoader = (): Effect.Effect<
      LoaderResult | null,
      AllLoaderErrors<Routes>,
      AllLoaderRequirements<Routes>
    > =>
      Effect.gen(function* () {
        const currentRouteOption = yield* currentRoute.get;
        if (Option.isNone(currentRouteOption)) {
          return null;
        }
        const currentRouteName = currentRouteOption.value;

        const routeDef = routes[currentRouteName as keyof Routes];
        if (!routeDef || !routeDef.loader) {
          return null;
        }

        const pathname = yield* pathnameSignal.get;
        // Match can fail with RouteMatchError, but we catch that and return null
        const matchResult = yield* Effect.either(routeDef.match(pathname));
        if (Either.isLeft(matchResult)) {
          return null;
        }
        const params = matchResult.right;

        const data = yield* routeDef.loader(params) as Effect.Effect<
          unknown,
          AllLoaderErrors<Routes>,
          AllLoaderRequirements<Routes>
        >;

        return {
          routeName: currentRouteName as string,
          params,
          data,
        } satisfies LoaderResult;
      });

    const runLoaderAndUpdateState = Effect.gen(function* () {
      const currentRouteOption = yield* currentRoute.get;
      if (Option.isNone(currentRouteOption)) {
        yield* loaderStateSignal.set({
          routeName: null,
          params: {},
          data: null,
          isLoading: false,
          error: null,
        });
        return;
      }
      const currentRouteName = currentRouteOption.value;

      const routeDef = routes[currentRouteName as keyof Routes];
      const pathname = yield* pathnameSignal.get;
      const rawParams = tryMatchSync(routeDef, pathname) ?? {};

      // If route has no loader, just update with null data
      if (!routeDef || !routeDef.loader) {
        yield* loaderStateSignal.set({
          routeName: currentRouteName as string,
          params: rawParams,
          data: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Set loading state
      yield* loaderStateSignal.set({
        routeName: currentRouteName as string,
        params: rawParams,
        data: null,
        isLoading: true,
        error: null,
      });

      // Execute loader
      const result = yield* Effect.either(
        Effect.gen(function* () {
          const params = yield* routeDef.match(pathname);
          return yield* routeDef.loader!(params) as Effect.Effect<unknown>;
        }),
      );

      yield* loaderStateSignal.set({
        routeName: currentRouteName as string,
        params: rawParams,
        data: Either.getOrNull(result),
        isLoading: false,
        error: Either.getOrNull(Either.flip(result)),
      });
    });

    const initializeLoaderData = (
      routeName: string,
      params: Record<string, string>,
      data: unknown,
    ): Effect.Effect<void> =>
      loaderStateSignal.set({
        routeName,
        params,
        data,
        isLoading: false,
        error: null,
      });

    return { executeLoader, runLoaderAndUpdateState, initializeLoaderData };
  });
