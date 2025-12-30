/**
 * Server entry for Vite SSR dev mode.
 * This is a thin wrapper around renderRequest that's loaded via vite.ssrLoadModule.
 */
import { Effect } from "effect";
import {
  $,
  Router,
  Routes,
  makeRouterLayer,
  renderRequest,
  Link,
} from "@effex/platform";
import { routes, components } from "./generated/routes.js";

// 404 fallback component
const NotFound = () =>
  $.div({ class: "page" }, [
    $.h1({}, ["404 - Page Not Found"]),
    $.p({}, ["The page you're looking for doesn't exist."]),
    $.p({}, [Link({ href: "/" }, "Go Home")]),
  ]);

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
            title: "Effex Demo",
            styles: ["/styles.css"],
            scripts: ["/src/client.ts"],
          },
          provide: makeRouterLayer(router),
        });
      }),
    ),
  );
}
