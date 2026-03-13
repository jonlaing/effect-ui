/**
 * Production server.
 *
 * Serves the built client assets and handles SSR rendering.
 */

import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { Effect, Layer } from "effect";

import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

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

// Build the Effex HTTP routes
const effexRoutes = Platform.toHttpRoutes(router, {
  app: App,
  document: {
    title: "Effex App",
    scripts: ["/client.js"],
    styles: ["/styles.css"],
  },
});

const distDir = path.resolve(process.cwd(), "dist");

// Combined app: try static files first, then Effex SSR
const app = HttpRouter.empty.pipe(HttpRouter.concat(effexRoutes));

// Wrap with static file serving
const handler = Effect.gen(function* () {
  const staticResult = yield* Effect.either(serveStatic(distDir));
  if (staticResult._tag === "Right") {
    return staticResult.right;
  }
  return yield* app;
});

const port = Number(process.env.PORT) || 3000;

const serverLayer = NodeHttpServer.layer(() => http.createServer(), { port });

const fullServerLayer = HttpServer.serve(handler).pipe(
  Layer.provide(serverLayer),
);

NodeRuntime.runMain(
  Layer.launch(fullServerLayer).pipe(
    Effect.tap(() =>
      Effect.sync(() =>
        console.log(`Server running at http://localhost:${port}`),
      ),
    ),
  ),
);
