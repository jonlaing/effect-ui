import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

import { HttpServer, HttpServerResponse } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { Effect, Layer } from "effect";

import { Element, RendererContext, Router } from "@effex/platform";
import { EffexServer } from "@effex/platform/server";

import { App, baseDocumentConfig, routes } from "./app.js";

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

// Main server program
const main = Effect.gen(function* () {
  // Create the router
  const router = yield* Router.make(routes);

  // Create the Effex HTTP app
  const effexApp = EffexServer.makeHttpApp({
    app: () => App() as Element.Element<never, RendererContext>,
    router: router as Parameters<typeof EffexServer.makeHttpApp>[0]["router"],
    document: {
      ...baseDocumentConfig,
      scripts: ["/client.js"],
    },
    provide: router.layer as Layer.Layer<never, never, never>,
  });

  // Resolve the dist directory
  const distDir = path.resolve(process.cwd(), "dist");

  // Combined app: try static files first, then Effex app
  const app = Effect.gen(function* () {
    const staticResult = yield* Effect.either(serveStatic(distDir));
    if (staticResult._tag === "Right") {
      return staticResult.right;
    }
    return yield* effexApp;
  });

  const port = Number(process.env.PORT) || 3000;

  const serverLayer = NodeHttpServer.layer(() => http.createServer(), { port });

  const fullServerLayer = HttpServer.serve(app).pipe(
    Layer.provide(serverLayer),
  );

  yield* Layer.launch(fullServerLayer);
});

// Run the server
NodeRuntime.runMain(
  Effect.scoped(main).pipe(
    Effect.tapError((error) =>
      Effect.sync(() => console.error("Server error:", error)),
    ),
    Effect.catchAll(() => Effect.void),
  ),
);
