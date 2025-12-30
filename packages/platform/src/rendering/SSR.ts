import { Effect, Layer } from "effect";
import { RendererContext } from "@effex/dom";
import type { Element } from "@effex/dom";
import { renderToString } from "@effex/dom/server";
import {
  makeServerPlatformContext,
  PlatformContext,
  type PlatformContextType,
} from "../Platform.js";
import {
  type LoaderData,
  LoaderContextTag,
  makeLoaderContext,
} from "../routing/RouteLoader.js";
import { serializeForHtmlSync } from "../Serialization.js";
import {
  type ActionData,
  type ActionRouter,
  makeActionData,
} from "../actions/Actions.js";

/**
 * Router interface for SSR (avoids cross-package Effect type issues).
 *
 * @template LE - Loader error type
 * @template LR - Loader requirements (dependencies needed by loaders)
 * @template AE - Action error type
 * @template AR - Action requirements (dependencies needed by actions)
 *
 * When these are unions of services, TypeScript will enforce that all
 * required services are provided when performing SSR.
 */
export interface SSRRouter<
  LE = unknown,
  LR = unknown,
  AE = unknown,
  AR = unknown,
> extends ActionRouter<AE, AR> {
  executeLoader: () => Effect.Effect<
    { routeName: string; params: unknown; data: unknown } | null,
    LE,
    LR
  >;
  pathname: {
    get: Effect.Effect<string>;
    set: (path: string) => Effect.Effect<void>;
  };
}

/**
 * Result of server-side rendering
 */
export interface SSRResult {
  readonly html: string;
  readonly loaderData: LoaderData;
  readonly loaderDataScript: string;
  readonly actionData: ActionData | null;
  readonly actionDataScript: string;
  readonly headers: Headers;
  readonly platformContext: PlatformContextType;
}

/**
 * Perform SSR for a request and return the result.
 *
 * The requirements (R) are inferred from the router's loader and action dependencies.
 * If your loaders/actions require services like DatabaseService or UserService,
 * those will be required in the returned Effect's R type parameter.
 *
 * @template LE - Loader error type
 * @template LR - Loader requirements
 * @template AE - Action error type
 * @template AR - Action requirements
 */
export const performSSR = <LE = never, LR = never, AE = never, AR = never>(
  request: Request,
  element: Element<never, RendererContext>,
  router: SSRRouter<LE, LR, AE, AR> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providedLayer: Layer.Layer<any, never, never> | undefined,
): Effect.Effect<SSRResult, LE | AE, LR | AR> =>
  Effect.gen(function* () {
    const platformContext = makeServerPlatformContext(request);
    const loaderDataCache = new Map<string, unknown>();

    const { routeName: currentRouteName, params: currentParams } =
      yield* Effect.fromNullable(router).pipe(
        Effect.flatMap((r) => r.executeLoader()),
        Effect.tap((loaderResult) => {
          if (loaderResult) {
            loaderDataCache.set(loaderResult.routeName, loaderResult.data);
          }
        }),
        Effect.map(
          (loaderResult) => loaderResult ?? { routeName: "", params: {} },
        ),
        Effect.catchAll(() => Effect.succeed({})),
      ) as Effect.Effect<
        { routeName: string; params: Record<string, string> },
        LE,
        LR
      >;

    const actionData = yield* makeActionData(router, request);

    // Update router pathname to match request URL for SSR
    if (router) {
      const url = new URL(request.url);
      yield* router.pathname.set(url.pathname);
    }

    const paramsReadable = {
      get: Effect.succeed(currentParams),
    };

    const loaderContext = makeLoaderContext({
      routeId: currentRouteName ?? "",
      params: paramsReadable,
      loaderDataCache,
      isHydrating: false,
    });

    const loaderLayer = Layer.succeed(LoaderContextTag, loaderContext);
    const platformLayer = Layer.succeed(PlatformContext, platformContext);
    const baseLayers = Layer.merge(loaderLayer, platformLayer);

    const effectiveLayers = providedLayer
      ? Layer.merge(baseLayers, providedLayer)
      : baseLayers;

    const html = yield* Effect.provide(
      renderToString(element),
      effectiveLayers,
    );

    const loaderData: LoaderData = {};
    for (const [routeId, data] of loaderDataCache) {
      loaderData[routeId] = {
        data,
        timestamp: Date.now(),
        params: currentParams,
      };
    }

    const loaderDataScript = serializeForHtmlSync(loaderData);
    const actionDataScript = serializeForHtmlSync(actionData);

    return {
      html,
      loaderData,
      loaderDataScript,
      actionData,
      actionDataScript,
      headers: platformContext.responseHeaders,
      platformContext,
    };
  });
