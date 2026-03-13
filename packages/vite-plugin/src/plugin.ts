import * as path from "node:path";

import type { Plugin, ViteDevServer } from "vite";

/**
 * Options for the Effex Platform Vite plugin.
 */
export interface EffexPlatformOptions {
  /**
   * Path to the SSR entry module that exports a `render` function.
   * The render function should have the signature: (request: Request) => Promise<Response>
   *
   * When provided, the plugin runs an SSR dev server with HMR in dev mode.
   * When omitted, only the server-code stripping transform is applied.
   *
   * @example "src/vite-entry.ts"
   */
  readonly entry?: string;
  /**
   * File patterns to apply the server-code stripping transform to.
   * Defaults to all .ts/.tsx/.js/.jsx files.
   */
  readonly include?: RegExp;
  /**
   * File patterns to exclude from the transform.
   */
  readonly exclude?: RegExp;
}

/**
 * Vite plugin for @effex/platform SSR applications.
 *
 * Provides two capabilities:
 *
 * 1. **Server-code stripping** (build time) — Removes loader and handler function
 *    bodies from client builds so server-only dependencies (database services, etc.)
 *    don't get bundled into the client.
 *    - `Route.get(loader, render)` → `Route.get(null, render)`
 *    - `Route.post("key", handler)` → `Route.post("key", () => { throw ... })`
 *
 * 2. **SSR dev server** (dev mode, when `entry` is provided) — Intercepts requests,
 *    renders pages via `vite.ssrLoadModule`, and injects Vite's HMR client.
 *
 * Only needed when using @effex/platform for SSR. Pure SPAs that run loaders
 * client-side should NOT use this plugin.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { effexPlatform } from "@effex/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     effexPlatform({ entry: "src/server-entry.ts" }),
 *   ],
 * });
 * ```
 */
export const effexPlatform = (options: EffexPlatformOptions = {}): Plugin => {
  const include = options.include ?? /\.(tsx?|jsx?)$/;
  const exclude = options.exclude;
  let isSsr = false;
  let root: string;
  let entryPath: string | null = null;

  return {
    name: "effex-platform",

    configResolved(config) {
      root = config.root;
      isSsr = !!config.build?.ssr;
      if (options.entry) {
        entryPath = path.resolve(root, options.entry);
      }
    },

    // -------------------------------------------------------------------------
    // Server-code stripping (client builds only)
    // -------------------------------------------------------------------------

    transform(code, id, options) {
      // Never strip server code in SSR builds or SSR-loaded modules (dev)
      if (isSsr || options?.ssr) return null;

      // Filter by include/exclude patterns
      if (!include.test(id)) return null;
      if (exclude && exclude.test(id)) return null;

      // Quick bail — only transform files that reference Route
      if (
        !code.includes("Route.get") &&
        !code.includes("Route.post") &&
        !code.includes("Route.put") &&
        !code.includes("Route.del")
      ) {
        return null;
      }

      const transformed = stripServerCode(code);
      if (transformed === code) return null;

      return { code: transformed, map: null };
    },

    // -------------------------------------------------------------------------
    // SSR dev server (dev mode only, when entry is provided)
    // -------------------------------------------------------------------------

    configureServer(server: ViteDevServer) {
      if (!entryPath) return;

      const entry = entryPath;

      // Return a function to run after Vite's internal middleware
      return () => {
        server.middlewares.use(async (req, res, next) => {
          // Use originalUrl to get the URL before Vite's historyFallback rewrites it
          const url =
            (req as { originalUrl?: string }).originalUrl || req.url || "/";

          // Normalize index.html to root path
          const normalizedUrl =
            url === "/" || url === "/index.html" ? "/" : url;

          // Skip Vite internal requests and static assets
          if (
            url.startsWith("/@") ||
            url.startsWith("/__vite") ||
            url.startsWith("/node_modules/") ||
            url.startsWith("/src/") ||
            (url.includes(".") && !url.endsWith("/") && url !== "/index.html")
          ) {
            return next();
          }

          try {
            // Load the server entry module with HMR
            const serverModule = await server.ssrLoadModule(entry);

            if (typeof serverModule.render !== "function") {
              throw new Error(
                `Server entry "${options.entry}" must export a "render(request: Request) => Promise<Response>" function`,
              );
            }

            // Create a Web Request from the Node request
            const protocol = "http";
            const host = req.headers.host || "localhost";
            const webUrl = new URL(normalizedUrl, `${protocol}://${host}`);

            // Handle request body for POST/PUT/etc
            let body: string | undefined;
            if (req.method !== "GET" && req.method !== "HEAD") {
              body = await new Promise<string>((resolve) => {
                let data = "";
                req.on("data", (chunk: string) => (data += chunk));
                req.on("end", () => resolve(data));
              });
            }

            const webRequest = new Request(webUrl.href, {
              method: req.method,
              headers: Object.entries(req.headers).reduce(
                (acc, [key, value]) => {
                  if (value)
                    acc[key] = Array.isArray(value) ? value.join(", ") : value;
                  return acc;
                },
                {} as Record<string, string>,
              ),
              body: body,
            });

            // Call the render function — returns a Web Response
            const response: Response = await serverModule.render(webRequest);

            // Forward status and headers
            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });

            const responseBody = await response.text();
            const contentType = response.headers.get("content-type") || "";

            // Inject Vite's HMR client into HTML responses
            if (contentType.includes("text/html")) {
              const transformedHtml = await server.transformIndexHtml(
                normalizedUrl,
                responseBody,
              );
              // Recalculate content-length since transformIndexHtml may inject scripts
              res.setHeader(
                "content-length",
                Buffer.byteLength(transformedHtml),
              );
              res.end(transformedHtml);
            } else {
              res.end(responseBody);
            }
          } catch (e) {
            server.ssrFixStacktrace(e as Error);
            console.error("[effex-platform] Error:", e);

            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html");
            res.end(`
              <!DOCTYPE html>
              <html>
                <head><title>SSR Error</title></head>
                <body>
                  <h1>Server Error</h1>
                  <pre style="color: red; white-space: pre-wrap;">${escapeHtml((e as Error).stack || (e as Error).message)}</pre>
                </body>
              </html>
            `);
          }
        });
      };
    },
  };
};

// =============================================================================
// Server-code stripping internals
// =============================================================================

/**
 * Strip server-only code from route definitions.
 *
 * Transforms:
 * - `Route.get(loaderFn, renderFn)` → `Route.get(null, renderFn)`
 * - `Route.post("key", handlerFn)` → `Route.post("key", () => { throw new Error("server only"); })`
 * - Same for Route.put and Route.del
 */
export const stripServerCode = (code: string): string => {
  let result = code;
  result = stripLoaders(result);
  result = stripHandlers(result);
  return result;
};

/**
 * Replace the first argument (loader) in Route.get() calls with null.
 */
const stripLoaders = (code: string): string => {
  const pattern = /Route\.get\s*\(/g;
  let result = code;
  let match: RegExpExecArray | null;
  let offset = 0;

  pattern.lastIndex = 0;

  while ((match = pattern.exec(code)) !== null) {
    const callStart = match.index + offset;
    const argsStart = callStart + match[0].length;

    const firstArgEnd = findArgEnd(result, argsStart);
    if (firstArgEnd === -1) continue;

    const before = result.slice(0, argsStart);
    const after = result.slice(firstArgEnd);
    const replacement = "null";
    const oldLen = firstArgEnd - argsStart;
    result = before + replacement + after;
    offset += replacement.length - oldLen;

    pattern.lastIndex = match.index + match[0].length;
  }

  return result;
};

/**
 * Replace the handler function (second argument) in Route.post/put/del() calls with a no-op.
 * Keeps the key (first argument) since Outlet reads it to compute action paths.
 */
const stripHandlers = (code: string): string => {
  const pattern = /Route\.(post|put|del)\s*\(/g;
  let result = code;
  let match: RegExpExecArray | null;
  let offset = 0;

  pattern.lastIndex = 0;

  while ((match = pattern.exec(code)) !== null) {
    const callStart = match.index + offset;
    const argsStart = callStart + match[0].length;

    const firstArgEnd = findArgEnd(result, argsStart);
    if (firstArgEnd === -1) continue;

    let secondArgStart = firstArgEnd;
    while (
      secondArgStart < result.length &&
      /[\s,]/.test(result[secondArgStart])
    ) {
      secondArgStart++;
    }

    const secondArgEnd = findArgEnd(result, secondArgStart);
    if (secondArgEnd === -1) continue;

    const before = result.slice(0, secondArgStart);
    const after = result.slice(secondArgEnd);
    const replacement = '() => { throw new Error("server only"); }';
    const oldLen = secondArgEnd - secondArgStart;
    result = before + replacement + after;
    offset += replacement.length - oldLen;

    pattern.lastIndex = match.index + match[0].length;
  }

  return result;
};

/**
 * Find the end position of a single argument starting at `start`.
 * Handles nested parens, braces, brackets, template literals, and strings.
 * Returns the index right after the argument (at the comma or closing paren).
 */
const findArgEnd = (code: string, start: number): number => {
  let depth = 0;
  let i = start;

  while (i < code.length) {
    const ch = code[i];

    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(code, i);
      continue;
    }

    if (ch === "/" && code[i + 1] === "/") {
      i = code.indexOf("\n", i);
      if (i === -1) return -1;
      i++;
      continue;
    }

    if (ch === "/" && code[i + 1] === "*") {
      i = code.indexOf("*/", i);
      if (i === -1) return -1;
      i += 2;
      continue;
    }

    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
    } else if (ch === ")" || ch === "}" || ch === "]") {
      if (depth === 0) {
        return i;
      }
      depth--;
    } else if (ch === "," && depth === 0) {
      return i;
    }

    i++;
  }

  return -1;
};

/**
 * Skip past a string literal (single-quoted, double-quoted, or template).
 * Returns the index after the closing quote.
 */
const skipString = (code: string, start: number): number => {
  const quote = code[start];
  let i = start + 1;

  while (i < code.length) {
    const ch = code[i];

    if (ch === "\\") {
      i += 2;
      continue;
    }

    if (quote === "`" && ch === "$" && code[i + 1] === "{") {
      i += 2;
      let templateDepth = 1;
      while (i < code.length && templateDepth > 0) {
        if (code[i] === "{") templateDepth++;
        else if (code[i] === "}") templateDepth--;
        else if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
          i = skipString(code, i);
          continue;
        }
        i++;
      }
      continue;
    }

    if (ch === quote) {
      return i + 1;
    }

    i++;
  }

  return i;
};

// =============================================================================
// Utilities
// =============================================================================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
