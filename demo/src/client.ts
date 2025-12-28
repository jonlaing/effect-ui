import { Effect } from "effect";
import { Router, hydrateApp, Routes, makeRouterLayer } from "@effex/platform";
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

        // Create the app element with router context provided
        const app = Routes({ components }).pipe(Effect.provide(routerLayer));

        // Hydrate - cast types to work around cross-package Effect type issues
        yield* Effect.promise(() =>
          hydrateApp(app as Parameters<typeof hydrateApp>[0], container, {
            router: router as NonNullable<
              Parameters<typeof hydrateApp>[2]
            >["router"],
          }),
        );
      }),
    ),
  );

  console.log("Effex app hydrated!");
};

hydrate().catch(console.error);
