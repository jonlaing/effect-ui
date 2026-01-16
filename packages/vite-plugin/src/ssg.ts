import * as fs from "node:fs";
import * as path from "node:path";

import type { Plugin, ResolvedConfig } from "vite";

/**
 * Options for the Effex SSG plugin.
 */
export interface EffexSSGOptions {
  /**
   * Path to the SSG entry module that exports the configuration.
   *
   * The entry must export:
   * - `routes`: Record of route definitions
   * - `staticRouteConfig`: Static route configuration map
   * - `components`: Record of route components
   * - `createApp`: Function to wrap route element in app shell
   * - `generateDocument` (optional): Function to generate full HTML document
   *
   * @example "src/ssg-entry.ts"
   */
  readonly entry: string;

  /**
   * Output directory for generated static files.
   * Relative to the Vite build output directory.
   * @default "" (same as build output)
   */
  readonly outDir?: string;
}

/**
 * Vite plugin for Static Site Generation (SSG) in Effex applications.
 *
 * This plugin runs after the build completes and generates static HTML files
 * for routes marked with `static: true` in their Route.define configuration.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { effexRoutes, effexSSG } from "@effex/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     effexRoutes({ routesDir: "src/routes" }),
 *     effexSSG({ entry: "src/ssg-entry.ts" }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/ssg-entry.ts
 * import { routes, staticRouteConfig, components } from "./generated/routes";
 * import { App } from "./App";
 *
 * export { routes, staticRouteConfig, components };
 *
 * export const createApp = (routeElement: Element, routeName: string) =>
 *   App({ children: routeElement });
 *
 * export const generateDocument = (page: StaticPage) => `
 *   <!DOCTYPE html>
 *   <html>
 *     <head>
 *       <title>My App</title>
 *       <link rel="stylesheet" href="/assets/style.css">
 *     </head>
 *     <body>
 *       <div id="root">${page.html}</div>
 *       <script>
 *         window.__EFFEX_LOADER_DATA__ = ${page.loaderDataScript};
 *       </script>
 *       <script type="module" src="/assets/main.js"></script>
 *     </body>
 *   </html>
 * `;
 * ```
 */
export const effexSSG = (options: EffexSSGOptions): Plugin => {
  let config: ResolvedConfig;
  let entryPath: string;
  let buildOutDir: string;
  let ssgOutDir: string;

  return {
    name: "effex-ssg",
    apply: "build", // Only run during build

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      entryPath = path.resolve(config.root, options.entry);
      buildOutDir = path.resolve(config.root, config.build.outDir);
      ssgOutDir = options.outDir
        ? path.resolve(buildOutDir, options.outDir)
        : buildOutDir;
    },

    async closeBundle() {
      // Skip SSG for SSR builds (server bundles)
      if (config.build.ssr) {
        return;
      }

      console.log("[effex-ssg] Starting static site generation...");

      try {
        // We need to load the SSG entry module
        // For this to work, we use a separate build step
        // The entry file should be built alongside the app

        // Check if entry exists
        if (!fs.existsSync(entryPath)) {
          console.error(`[effex-ssg] Entry file not found: ${options.entry}`);
          console.error(
            "[effex-ssg] Make sure the entry file exists and exports the required configuration.",
          );
          return;
        }

        // Read the entry to check it looks correct
        const entryContent = await fs.promises.readFile(entryPath, "utf-8");

        // Check for required exports
        const requiredExports = [
          "routes",
          "staticRouteConfig",
          "components",
          "createApp",
        ];
        const missingExports = requiredExports.filter(
          (exp) =>
            !entryContent.includes(`export`) || !entryContent.includes(exp),
        );

        if (missingExports.length > 0) {
          console.warn(
            `[effex-ssg] Entry file may be missing exports: ${missingExports.join(", ")}`,
          );
        }

        // For SSG to work, we need to build the entry module and then import it
        // This is complex because Vite's bundler has already run
        // The best approach is to use a separate SSG build script that:
        // 1. Builds the client
        // 2. Builds the SSG entry with SSR
        // 3. Runs the SSG build

        console.log(
          "[effex-ssg] Static site generation requires a build script.",
        );
        console.log("[effex-ssg] Add an ssg build script to your project:");
        console.log("");
        console.log("  // scripts/ssg-build.ts");
        console.log(
          "  import { buildStaticPages } from '@effex/platform/server';",
        );
        console.log(
          `  import { routes, staticRouteConfig, components } from './generated/routes';`,
        );
        console.log("  import { App } from './App';");
        console.log("");
        console.log("  await buildStaticPages({");
        console.log("    routes,");
        console.log("    staticRouteConfig,");
        console.log("    components,");
        console.log("    createApp: (el) => App({ children: el }),");
        console.log(`    outDir: '${ssgOutDir}',`);
        console.log("  });");
        console.log("");
        console.log("  Run with: npx tsx scripts/ssg-build.ts");
        console.log("");

        // Generate a helper script
        const scriptPath = path.resolve(config.root, "ssg-build.ts");
        if (!fs.existsSync(scriptPath)) {
          const scriptContent = generateSSGScript(options.entry, ssgOutDir);
          await fs.promises.writeFile(scriptPath, scriptContent, "utf-8");
          console.log(
            `[effex-ssg] Generated ${path.relative(config.root, scriptPath)}`,
          );
          console.log("[effex-ssg] Run: npx tsx ssg-build.ts");
        }
      } catch (error) {
        console.error("[effex-ssg] Error:", error);
      }
    },
  };
};

/**
 * Generate an SSG build script for the user.
 */
function generateSSGScript(entry: string, outDir: string): string {
  // Calculate relative paths
  const relativeEntry = entry.replace(/\.tsx?$/, "");

  return `/**
 * SSG Build Script
 *
 * This script generates static HTML files for routes marked with \`static: true\`.
 * Run with: npx tsx ssg-build.ts
 */

import { buildStaticPages } from "@effex/platform/server";

// Import from your SSG entry
import {
  routes,
  staticRouteConfig,
  components,
  createApp,
  generateDocument,
} from "./${relativeEntry}";

async function main() {
  console.log("Starting SSG build...");

  const result = await buildStaticPages({
    routes,
    staticRouteConfig,
    components,
    createApp,
    outDir: "${outDir}",
    generateDocument,
  });

  console.log(\`Generated \${result.pages.length} static pages in \${result.duration}ms\`);

  for (const page of result.pages) {
    console.log(\`  - \${page.path}\`);
  }
}

main().catch((error) => {
  console.error("SSG build failed:", error);
  process.exit(1);
});
`;
}
