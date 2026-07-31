import * as fs from "node:fs";
import * as path from "node:path";

import type { Plugin, ViteDevServer } from "vite";

/**
 * Options for the Effex Platform Vite plugin.
 */
export interface EffexPlatformOptions {
  /**
   * Path to the SSR/SSG entry module.
   *
   * In SSR mode: exports a `render(request: Request) => Promise<Response>` function.
   * In SSG mode: exports `{ router, app?, document?, layers? }` for static site generation.
   *
   * When provided, the plugin runs an SSR dev server with HMR in dev mode.
   * When omitted, only the server-code stripping transform is applied.
   *
   * @example "src/vite-entry.ts"
   */
  readonly entry?: string;
  /**
   * Build mode.
   *
   * - `"ssr"` (default) — Standard SSR with live server
   * - `"ssg"` — Static site generation. After `vite build`, runs
   *   `Platform.buildStaticSite()` to pre-render all `Route.static` routes.
   *
   * In dev mode, both modes behave the same (SSR dev server with HMR).
   */
  readonly mode?: "ssr" | "ssg";
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
  const mode = options.mode ?? "ssr";
  let isSsr = false;
  let isDev = false;
  let root: string;
  let outDir: string;
  let entryPath: string | null = null;

  return {
    name: "effex-platform",

    config(config) {
      // Prevent the SSR build from wiping the client build's output
      if (config.build?.ssr) {
        return {
          build: {
            emptyOutDir: false,
          },
        };
      }
    },

    configResolved(config) {
      root = config.root;
      outDir = path.resolve(root, config.build?.outDir ?? "dist");
      isSsr = !!config.build?.ssr;
      isDev = config.command === "serve";
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
        !code.includes("Route.del") &&
        !code.includes("Route.static")
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

    // -------------------------------------------------------------------------
    // SSG build (production only, when mode is "ssg")
    // -------------------------------------------------------------------------

    async closeBundle() {
      if (mode !== "ssg" || !entryPath || !isSsr || isDev) return;

      try {
        // Dynamically import the built SSG entry.
        // The entry must export: { router, app?, document?, layers? }
        // Dynamic import — @effex/platform is an optional peer dependency
        // only needed for SSG mode at build time
        const platformModule = "@effex/platform";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { buildStaticSite } = (await import(platformModule)) as any;

        // Import the built SSR entry from the output directory.
        // Vite's SSR build outputs `src/entry.ts` as `entry.js` in outDir.
        const entryBasename = path.basename(entryPath, path.extname(entryPath));
        const builtEntry = path.resolve(outDir, `${entryBasename}.js`);
        const entryModule = await import(/* @vite-ignore */ builtEntry);

        if (!entryModule.router) {
          throw new Error(
            `SSG entry "${options.entry}" must export a "router"`,
          );
        }

        // Read the client-built index.html to extract actual asset paths.
        // Vite processes scripts/styles and outputs hashed filenames —
        // we need those real paths instead of the source paths in document options.
        const clientHtmlPath = path.resolve(outDir, "index.html");
        const documentOptions = { ...entryModule.document };

        if (fs.existsSync(clientHtmlPath)) {
          const clientHtml = fs.readFileSync(clientHtmlPath, "utf-8");

          // Extract script src attributes from the Vite-processed HTML
          const scriptMatches = [
            ...clientHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g),
          ];
          // Replace source paths with the real hashed asset paths.
          // If no scripts found in client HTML, keep the original (shouldn't happen).
          if (scriptMatches.length > 0) {
            documentOptions.scripts = scriptMatches.map(
              (m: RegExpMatchArray) => m[1],
            );
          }

          // Extract stylesheet href attributes.
          // Check both attribute orderings (rel before href, href before rel).
          const styleMatches = [
            ...clientHtml.matchAll(
              /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g,
            ),
            ...clientHtml.matchAll(
              /<link[^>]+href="([^"]+)"[^>]+rel="stylesheet"[^>]*>/g,
            ),
          ];
          // Always override — if Vite bundled CSS into JS (e.g. Tailwind),
          // there are no stylesheet links and we should clear the source paths.
          documentOptions.styles = styleMatches.map(
            (m: RegExpMatchArray) => m[1],
          );
        }

        await buildStaticSite({
          router: entryModule.router,
          app: entryModule.app,
          document: documentOptions,
          outDir,
          layers: entryModule.layers,
        });
      } catch (e) {
        console.error("[effex-platform] SSG build failed:", e);
        throw e;
      }
    },
  };
};

// =============================================================================
// Server-code stripping internals
// =============================================================================

/**
 * Remove import declarations whose specifiers are no longer referenced
 * in the rest of the code. This prevents server-only modules from being
 * evaluated after their call sites have been stripped.
 *
 * Only removes named imports (e.g. `import { a, b } from "..."`) where
 * every imported name is unreferenced. Side-effect imports (`import "..."`)
 * and namespace imports (`import * as x`) are left alone.
 */
const stripDeadImports = (code: string): string => {
  const importRe = /^import\s+\{([^}]+)\}\s+from\s+["'][^"']+["'];?\s*$/gm;
  let result = code;

  const toRemove: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;

  importRe.lastIndex = 0;

  while ((match = importRe.exec(code)) !== null) {
    const specifiers = match[1]
      .split(",")
      .map((s) => {
        const trimmed = s.trim().replace(/^type\s+/, "");
        const asMatch = trimmed.match(/\S+\s+as\s+(\S+)/);
        return asMatch ? asMatch[1] : trimmed;
      })
      .filter((s) => s.length > 0);

    if (specifiers.length === 0) continue;

    const importStart = match.index;
    const importEnd = match.index + match[0].length;
    const codeWithout = code.slice(0, importStart) + code.slice(importEnd);

    const allDead = specifiers.every((name) => {
      // `\b` is a `\w`↔`\W` boundary — it doesn't recognize identifier
      // characters that aren't in `\w`, notably `$`. A `\b$\b` pattern
      // never matches a real `$.foo` call site (the `$` sits between
      // whitespace and `.`, both `\W`). Match with lookarounds that
      // treat the full JS identifier alphabet as one side.
      const re = new RegExp(
        `(?<![A-Za-z0-9_$])${escapeRegExp(name)}(?![A-Za-z0-9_$])`,
      );
      return !re.test(codeWithout);
    });

    if (allDead) {
      toRemove.push({ start: importStart, end: importEnd });
    }
  }

  for (let i = toRemove.length - 1; i >= 0; i--) {
    const { start, end } = toRemove[i];
    const actualEnd =
      end < result.length && result[end] === "\n" ? end + 1 : end;
    result = result.slice(0, start) + result.slice(actualEnd);
  }

  return result;
};

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  result = stripStaticConfig(result);
  result = stripDeadImports(result);
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
 * Strip `Route.static(config)` to `Route.render(config.render)` in client builds.
 * The `paths` and `load` functions are server-only (build-time), so the client
 * only needs the `render` function for hydration.
 *
 * Transforms:
 * - `Route.static({ paths: ..., load: ..., render: (data) => El(data) })`
 *   → `Route.render((data) => El(data))`
 * - `Route.static({ load: ..., render: (data) => El(data) })`
 *   → `Route.render((data) => El(data))`
 */
const stripStaticConfig = (code: string): string => {
  const pattern = /Route\.static\s*\(/g;
  let result = code;
  let match: RegExpExecArray | null;
  let offset = 0;

  pattern.lastIndex = 0;

  while ((match = pattern.exec(code)) !== null) {
    const callStart = match.index + offset;
    const argsStart = callStart + match[0].length;

    // Find the full config object argument
    const configEnd = findArgEnd(result, argsStart);
    if (configEnd === -1) continue;

    const configStr = result.slice(argsStart, configEnd);

    // Extract the render function value from the config object.
    // Look for `render:` or `render :` followed by the function value.
    const renderMatch = configStr.match(/\brender\s*:\s*/);
    if (!renderMatch || renderMatch.index === undefined) continue;

    const renderValueStart = renderMatch.index + renderMatch[0].length;
    const renderValueEnd = findArgEnd(configStr, renderValueStart);
    if (renderValueEnd === -1) continue;

    const renderFn = configStr.slice(renderValueStart, renderValueEnd).trim();

    // Replace `Route.static({ ..., render: <fn> })` with `Route.render(<fn>)`.
    // The client's RouteDataProvider fetches loader data via `?_data=1`, so
    // the render fn does receive real data at runtime — we just need Route
    // to pass its argument through. Route.render's wrapper does that (see
    // `packages/router/src/Route.ts`).
    const replacement = `Route.render(${renderFn})`;
    const fullCallEnd = configEnd + 1; // +1 for closing paren of Route.static(...)
    const before = result.slice(0, callStart);
    const after = result.slice(fullCallEnd);
    const oldLen = fullCallEnd - callStart;
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
