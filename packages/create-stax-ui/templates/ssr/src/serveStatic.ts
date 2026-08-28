/**
 * Static file server for the production build's `dist/` directory.
 *
 * Fails with `"not-found"` when the requested file is missing so the
 * caller can fall through to another handler (e.g. SSR).
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { HttpServerRequest, HttpServerResponse } from "@effect/platform";
import { Effect } from "effect";

const MIME_TYPES: Record<string, string> = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

export const serveStatic = (distDir: string) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const url = new URL(request.url, "http://localhost");
    const filePath = path.join(distDir, url.pathname);

    if (!filePath.startsWith(distDir)) {
      return yield* Effect.fail("forbidden" as const);
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return yield* Effect.fail("not-found" as const);
    }

    const mimeType =
      MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream";

    return HttpServerResponse.raw(fs.readFileSync(filePath), {
      headers: { "content-type": mimeType },
    });
  });
