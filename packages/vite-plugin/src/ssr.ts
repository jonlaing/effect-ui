import * as path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Options for the Effex SSR plugin.
 */
export interface EffexSSROptions {
  /**
   * Path to the server entry module that exports a `render` function.
   * The render function should have the signature: (request: Request) => Promise<string>
   * @example "src/server-entry.ts"
   */
  readonly entry: string;
}

/**
 * Vite plugin that provides SSR dev server with HMR for Effex applications.
 *
 * In dev mode, this plugin:
 * - Intercepts HTML requests and uses `vite.ssrLoadModule` to load your server entry
 * - Injects Vite's HMR client into the rendered HTML
 * - Provides full HMR for both client and server code
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { effexRoutes, effexSSR } from "@effex/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     effexRoutes({ routesDir: "src/routes" }),
 *     effexSSR({ entry: "src/server-entry.ts" }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/server-entry.ts
 * import { Effect, Layer } from "effect";
 * import { Router, Routes, makeRouterLayer, renderToString } from "@effex/platform";
 * import { routes, components } from "./generated/routes.js";
 *
 * export async function render(request: Request): Promise<string> {
 *   return Effect.runPromise(
 *     Effect.scoped(
 *       Effect.gen(function* () {
 *         const router = yield* Router.make(routes);
 *         const routerLayer = makeRouterLayer(router);
 *         // ... render and return HTML
 *       })
 *     )
 *   );
 * }
 * ```
 */
export const effexSSR = (options: EffexSSROptions): Plugin => {
  let root: string;
  let entryPath: string;

  return {
    name: "effex-ssr",

    configResolved(config) {
      root = config.root;
      entryPath = path.resolve(root, options.entry);
    },

    configureServer(server: ViteDevServer) {
      // Return a function to run after Vite's internal middleware
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || "/";

          console.log("[effex-ssr] Request:", req.method, url);

          // Normalize index.html to root path (Vite's SPA fallback rewrites / to /index.html)
          const normalizedUrl = url === "/index.html" ? "/" : url;

          // Skip Vite internal requests and static assets (but not index.html)
          if (
            url.startsWith("/@") ||
            url.startsWith("/__vite") ||
            url.startsWith("/node_modules/") ||
            url.startsWith("/src/") || // Source files served by Vite
            (url.includes(".") && !url.endsWith("/") && url !== "/index.html") // Has file extension (static asset)
          ) {
            console.log("[effex-ssr] Skipping (static/internal):", url);
            return next();
          }

          try {
            console.log("[effex-ssr] SSR rendering:", normalizedUrl);

            // Load the server entry module with HMR
            const serverModule = await server.ssrLoadModule(entryPath);

            if (typeof serverModule.render !== "function") {
              throw new Error(
                `Server entry "${options.entry}" must export a "render" function`,
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
                req.on("data", (chunk) => (data += chunk));
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

            // Render the page
            const html = await serverModule.render(webRequest);

            // Transform HTML to inject Vite's HMR client
            const transformedHtml = await server.transformIndexHtml(
              normalizedUrl,
              html,
            );

            res.setHeader("Content-Type", "text/html");
            res.statusCode = 200;
            res.end(transformedHtml);
          } catch (e) {
            // Fix stack traces for SSR errors
            server.ssrFixStacktrace(e as Error);
            console.error("[effex-ssr] Error:", e);

            // Send error response
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
