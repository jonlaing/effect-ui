import { Effect } from "effect";

import { Router, Routes } from "@effex/platform";
import { hydrateApp } from "@effex/platform/client";

import { components, routes } from "./generated/routes.js";

// Hydrate the application
const hydrate = async () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root element not found");
  }

  // Use runFork to keep the scope alive for the lifetime of the app
  // This ensures router subscriptions stay active
  Effect.runFork(
    Effect.scoped(
      Effect.gen(function* () {
        // Create the router
        const router = yield* Router.make(routes);

        // Create the app element with router context provided
        const app = Routes({ components }).pipe(Effect.provide(router.layer));

        // Hydrate - cast types to work around cross-package Effect type issues
        yield* Effect.promise(() =>
          hydrateApp(app as Parameters<typeof hydrateApp>[0], container, {
            router: router as NonNullable<
              Parameters<typeof hydrateApp>[2]
            >["router"],
          }),
        );

        console.log("Effex app hydrated!");

        // Keep the scope alive indefinitely
        yield* Effect.never;
      }),
    ),
  );
};

hydrate().catch(console.error);
