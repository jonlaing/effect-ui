import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { Effect, Layer } from "effect";
import { HttpServer, HttpServerResponse, HttpRouter } from "@effect/platform";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
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

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

// Static file handler
const serveStatic = (distDir: string) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const url = new URL(request.url, "http://localhost");
    const filePath = path.join(distDir, url.pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(distDir)) {
      return yield* Effect.fail("forbidden" as const);
    }

    // Check if file exists
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return yield* Effect.fail("not-found" as const);
    }

    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);

    return HttpServerResponse.raw(content, {
      headers: { "content-type": mimeType },
    });
  });

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
  const effexApp = EffexServer.makeHttpApp({
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

  // Resolve the dist directory (relative to the built server.js location)
  const distDir = path.resolve(process.cwd(), "dist");
  console.log("[6.1] Static files from:", distDir);

  // Combined app: try static files first, then Effex app
  const app = Effect.gen(function* () {
    // Try to serve static file
    const staticResult = yield* Effect.either(serveStatic(distDir));
    if (staticResult._tag === "Right") {
      return staticResult.right;
    }
    // Fall back to Effex app
    return yield* effexApp;
  });

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
