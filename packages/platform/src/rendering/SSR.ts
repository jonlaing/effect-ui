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
 * Router interface for SSR (avoids cross-package Effect type issues)
 */
export interface SSRRouter extends ActionRouter {
  executeLoader: () => Effect.Effect<
    { routeName: string; params: unknown; data: unknown } | null,
    unknown,
    unknown
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
 * Perform SSR for a request and return the result
 */
export const performSSR = (
  request: Request,
  element: Element<never, RendererContext>,
  router: SSRRouter | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providedLayer: Layer.Layer<any, never, never> | undefined,
): Effect.Effect<SSRResult, never, never> =>
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
        Effect.catchAll(() => Effect.succeed({})),
      ) as Effect.Effect<{
        routeName: string;
        params: Record<string, string>;
      }>;

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
