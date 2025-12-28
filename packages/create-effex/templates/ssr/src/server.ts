import * as http from "node:http";
import { Effect, Layer } from "effect";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import {
  $,
  Router,
  EffexServer,
  Routes,
  makeRouterLayer,
  Link,
  type EffexAppOptions,
} from "@effex/platform";
import { routes, components } from "./generated/routes.js";

// 404 fallback component
const NotFound = () =>
  $.div({ class: "page" }, [
    $.h1({}, ["404 - Page Not Found"]),
    $.p({}, ["The page you're looking for doesn't exist."]),
    $.p({}, [Link({ href: "/" }, "Go Home")]),
  ]);

// Main server program
const main = Effect.gen(function* () {
  // Create the router
  const router = yield* Router.make(routes);
  const routerLayer = makeRouterLayer(router);

  // Create the Effex HTTP app
  // Note: Type casts are needed to work around cross-package Effect type issues
  const app = EffexServer.makeHttpApp({
    app: (() =>
      Routes({
        components,
        fallback: NotFound,
      })) as unknown as EffexAppOptions<never>["app"],
    router: router as Parameters<typeof EffexServer.makeHttpApp>[0]["router"],
    document: {
      title: "Effex App",
      scripts: ["/client.js"],
      styles: ["/styles.css"],
    },
    provide: routerLayer as Layer.Layer<never, never, never>,
  });

  const port = Number(process.env.PORT) || 3000;

  // Serve the app - fork the server and keep the process alive with Effect.never
  yield* HttpServer.serveEffect(app).pipe(
    Effect.provide(NodeHttpServer.layer(() => http.createServer(), { port })),
    Effect.forkScoped,
  );

  console.log(`Server running at http://localhost:${port}`);

  // Keep the process alive
  yield* Effect.never;
});

// Run the server
NodeRuntime.runMain(
  Effect.scoped(main).pipe(
    Effect.catchAll((error) => {
      console.error("Server error:", error);
      return Effect.void;
    }),
  ),
);
