import { Effect } from "effect";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Router } from "@effex/router";
import {
  EffexServer,
  Routes,
  makeRouterLayer,
  div,
  h1,
  p,
  Link,
} from "@effex/platform";
import { routes, components } from "./generated/routes.js";

// 404 fallback component
const NotFound = () =>
  Effect.gen(function* () {
    return yield* div({ class: "page" }, [
      yield* h1({}, ["404 - Page Not Found"]),
      yield* p({}, ["The page you're looking for doesn't exist."]),
      yield* p({}, [yield* Link({ href: "/" }, "Go Home")]),
    ]);
  });

// Main server program
const main = Effect.gen(function* () {
  // Create the router
  const router = yield* Router.make(routes);
  const routerLayer = makeRouterLayer(router);

  // Create the Effex HTTP app
  const app = EffexServer.makeHttpApp({
    app: () =>
      Routes({
        components,
        fallback: NotFound,
      }).pipe(Effect.provide(routerLayer)),
    router: router as Parameters<typeof EffexServer.makeHttpApp>[0]["router"],
    document: {
      title: "Effex App",
      scripts: ["/client.js"],
      styles: ["/styles.css"],
    },
  });

  const port = Number(process.env.PORT) || 3000;
  console.log(`Server running at http://localhost:${port}`);

  // Serve the app
  yield* HttpServer.serveEffect(app).pipe(
    Effect.provide(NodeHttpServer.layer({ port })),
  );
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
