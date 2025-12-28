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
  Element,
  RendererContext,
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
  console.log("[1] Starting server setup...");

  // Create the router
  console.log("[2] Creating router...");
  const router = yield* Router.make(routes);
  console.log("[3] Router created, making router layer...");
  const routerLayer = makeRouterLayer(router);
  console.log("[4] Router layer created");

  // Create the Effex HTTP app
  console.log("[5] Creating Effex HTTP app...");
  const app = EffexServer.makeHttpApp({
    app: () =>
      Routes({
        components,
        fallback: NotFound,
      }) as Element<never, RendererContext>,
    router: router as Parameters<typeof EffexServer.makeHttpApp>[0]["router"],
    document: {
      title: "Effex Demo",
      scripts: ["/client.js"],
      styles: ["/styles.css"],
    },
    provide: routerLayer as Layer.Layer<never, never, never>,
  });
  console.log("[6] Effex HTTP app created");

  const port = Number(process.env.PORT) || 5000;
  console.log(`[7] Port: ${port}`);

  // Test: plain Node server on port 5001
  const testServer = http.createServer((req, res) => {
    console.log("[TEST] Got request:", req.method, req.url);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from test server");
  });
  testServer.listen(5001, "127.0.0.1", () => {
    console.log("[TEST] Test server listening on http://127.0.0.1:5001");
  });

  // Serve the app
  console.log("[8] About to start HTTP server...");

  const serverLayer = NodeHttpServer.layer(
    () => {
      const server = http.createServer();
      server.on("listening", () => {
        const addr = server.address();
        console.log("[HTTP] Listening on:", addr);
      });
      return server;
    },
    { port, host: "127.0.0.1" },
  );

  console.log("[8.1] Creating server layer...");
  const fullServerLayer = HttpServer.serve(app).pipe(
    Layer.provide(serverLayer),
  );

  console.log("[8.2] Launching server layer...");
  yield* Layer.launch(fullServerLayer);
  console.log("[9] This should never print - Layer.launch should block...");
});

// Run the server
console.log("[0] Calling NodeRuntime.runMain...");
NodeRuntime.runMain(
  Effect.scoped(main).pipe(
    Effect.map(() => {
      console.log("[DONE] Server has shut down gracefully.");
    }),
    Effect.tapError((error) =>
      Effect.sync(() => console.error("[ERROR] Server error:", error)),
    ),
    Effect.catchAll((error) => {
      console.error("[CATCH] Caught error:", error);
      return Effect.void;
    }),
  ),
);
console.log("[0.5] NodeRuntime.runMain called (async)");
