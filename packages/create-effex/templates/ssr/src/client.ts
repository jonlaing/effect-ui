import { Effect } from "effect";
import { Router } from "@effex/router";
import { hydrateApp, Routes, makeRouterLayer } from "@effex/platform";
import { routes, components } from "./generated/routes.js";

// Hydrate the application
const hydrate = async () => {
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
        const app = Routes({ components }).pipe(Effect.provide(routerLayer));

        // Hydrate
        yield* Effect.promise(() => hydrateApp(app, container, { router }));
      }),
    ),
  );

  console.log("Effex app hydrated!");
};

hydrate().catch(console.error);
