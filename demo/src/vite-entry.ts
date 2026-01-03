/**
 * Vite SSR entry point.
 * Loaded via vite.ssrLoadModule during development.
 */
import { Effect, Option } from "effect";
import { Router, makeRouterLayer } from "@effex/platform";
import { renderRequest, type ActionData } from "@effex/platform/server";
import { routes, App, baseDocumentConfig } from "./app.js";

/**
 * Handle an action request.
 * Called by the Vite SSR plugin for AJAX action requests.
 */
export async function action(request: Request): Promise<ActionData | null> {
  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const url = new URL(request.url);
        const router = yield* Router.make(routes, {
          initialPath: url.pathname,
          initialSearch: url.search,
        });

        // Get the current route name
        const routeNameOption = yield* router.currentRoute.get;
        if (Option.isNone(routeNameOption)) {
          return null;
        }
        const routeName = routeNameOption.value;

        // Execute the action
        const formData = yield* Effect.promise(() => request.formData());
        const result = yield* router.executeAction(
          routeName,
          formData,
          request,
        );

        return result
          ? {
              routeName: result.routeName,
              data: result.data,
              timestamp: Date.now(),
            }
          : null;
      }),
    ),
  );
}

/**
 * Render the app for a given request.
 * Called by the Vite SSR plugin on each request.
 */
export async function render(request: Request): Promise<string> {
  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const url = new URL(request.url);
        const router = yield* Router.make(routes, {
          initialPath: url.pathname,
          initialSearch: url.search,
        });

        return yield* renderRequest(request, {
          app: App(),
          router,
          document: {
            ...baseDocumentConfig,
            scripts: ["/src/client.ts"], // Dev uses source file
          },
          provide: makeRouterLayer(router),
        });
      }),
    ),
  );
}
