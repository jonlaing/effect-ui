import { Effect } from "effect";
import { Router, Routes, makeRouterLayer } from "@effex/platform";
import { render } from "@effex/dom";
import { routes, components } from "./generated/routes.js";

// Mount the application
const app = async () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root element not found");
  }

  await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        // Create the router
        const router = yield* Router.make(routes);
        const routerLayer = makeRouterLayer(router);

        // Create the app element
        const appElement = Routes({ components }).pipe(
          Effect.provide(routerLayer),
        );

        // Mount to DOM
        yield* render(appElement as Parameters<typeof render>[0], container);
      }),
    ),
  );

  console.log("Effex app mounted!");
};

app().catch(console.error);
