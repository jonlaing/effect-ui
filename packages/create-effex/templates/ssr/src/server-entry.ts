/**
 * Server entry for Vite SSR dev mode.
 * This is a thin wrapper around renderRequest that's loaded via vite.ssrLoadModule.
 */
import { Effect, Option } from "effect";
import { $, Router, Routes, makeRouterLayer, Link } from "@effex/platform";
import { renderRequest, type ActionData } from "@effex/platform/server";
import { routes, components } from "./generated/routes.js";

// 404 fallback component
const NotFound = () =>
  $.div({ class: "page" }, [
    $.h1({}, ["404 - Page Not Found"]),
    $.p({}, ["The page you're looking for doesn't exist."]),
    $.p({}, [Link({ href: "/" }, "Go Home")]),
  ]);

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
          app: Routes({ components, fallback: NotFound }),
          router,
          document: {
            title: "Effex App",
            styles: ["/styles.css"],
            scripts: ["/src/client.ts"],
          },
          provide: makeRouterLayer(router),
        });
      }),
    ),
  );
}
