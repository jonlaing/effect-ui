import { Effect, Option } from "effect";

import { $, match, mount, runApp } from "@effex/dom";
import { Router, RouterContext } from "@effex/router";

import { components, routes } from "./generated/routes.js";

// Simple Routes component for SPA (no loader context needed)
const Routes = () =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    const currentRoute = router.currentRoute.map((opt) =>
      Option.isSome(opt) ? opt.value : null,
    );

    const cases = Object.entries(components).map(
      ([routeName, componentFn]) => ({
        pattern: routeName,
        render: componentFn,
      }),
    );

    return yield* match(currentRoute, {
      cases,
      fallback: () => $.div({ class: "page" }, "Page not found"),
    });
  });

// Mount the application
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);

    const app = Routes().pipe(Effect.provide(router.layer));

    yield* mount(app as Parameters<typeof mount>[0], container);

    console.log("Effex app mounted!");
  }),
);
