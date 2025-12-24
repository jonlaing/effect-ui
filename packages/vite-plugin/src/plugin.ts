import * as path from "node:path";
import * as fs from "node:fs";
import type { Plugin, ViteDevServer } from "vite";
import type { EffexPluginOptions } from "./types.js";
import { scanRoutes } from "./scanner.js";
import { generateRoutes } from "./generator.js";

const DEFAULT_ROUTES_DIR = "src/routes";
const DEFAULT_OUTPUT_PATH = "src/generated/routes.ts";

/**
 * Vite plugin for file-based routing in Effex applications.
 *
 * Scans a routes directory for route files and generates a typed routes object
 * at build time. Watches for changes in development mode.
 *
 * @param options - Plugin configuration
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { effexRoutes } from "@effex/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     effexRoutes({
 *       routesDir: "src/routes",
 *       outputPath: "src/generated/routes.ts",
 *     }),
 *   ],
 * });
 * ```
 */
export const effexRoutes = (options: EffexPluginOptions = {}): Plugin => {
  const routesDir = options.routesDir ?? DEFAULT_ROUTES_DIR;
  const outputPath = options.outputPath ?? DEFAULT_OUTPUT_PATH;

  let root: string;
  let absoluteRoutesDir: string;
  let absoluteOutputPath: string;
  let isGenerating = false;

  const generateRoutesFile = async (): Promise<void> => {
    // Prevent concurrent generation
    if (isGenerating) return;
    isGenerating = true;

    try {
      // Scan route files
      const routes = await scanRoutes(absoluteRoutesDir, {
        extensions: options.extensions,
      });

      // Generate code
      const code = generateRoutes(routes, {
        routesDir: absoluteRoutesDir,
        outputPath: absoluteOutputPath,
      });

      // Ensure output directory exists
      const outputDir = path.dirname(absoluteOutputPath);
      await fs.promises.mkdir(outputDir, { recursive: true });

      // Check if content changed to avoid unnecessary writes
      let existingContent = "";
      try {
        existingContent = await fs.promises.readFile(
          absoluteOutputPath,
          "utf-8",
        );
      } catch {
        // File doesn't exist yet
      }

      if (existingContent !== code) {
        await fs.promises.writeFile(absoluteOutputPath, code, "utf-8");
        console.log(`[effex-routes] Generated ${outputPath}`);
      }
    } catch (error) {
      console.error("[effex-routes] Error generating routes:", error);
    } finally {
      isGenerating = false;
    }
  };

  return {
    name: "effex-routes",

    configResolved(config) {
      root = config.root;
      absoluteRoutesDir = path.resolve(root, routesDir);
      absoluteOutputPath = path.resolve(root, outputPath);
    },

    async buildStart() {
      await generateRoutesFile();
    },

    configureServer(server: ViteDevServer) {
      // Watch routes directory for changes
      server.watcher.add(absoluteRoutesDir);

      const handleChange = async (changedPath: string) => {
        // Only react to changes in routes directory
        if (!changedPath.startsWith(absoluteRoutesDir)) return;

        // Ignore test files
        if (
          changedPath.includes(".test.") ||
          changedPath.includes(".spec.") ||
          changedPath.includes("__tests__")
        ) {
          return;
        }

        // Regenerate routes
        await generateRoutesFile();

        // Invalidate the generated routes module
        const mod = server.moduleGraph.getModuleById(absoluteOutputPath);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }
      };

      server.watcher.on("add", handleChange);
      server.watcher.on("unlink", handleChange);
      server.watcher.on("change", handleChange);
    },

    async handleHotUpdate({ file, server }) {
      // Only handle changes in routes directory
      if (!file.startsWith(absoluteRoutesDir)) return;

      // Ignore test files
      if (
        file.includes(".test.") ||
        file.includes(".spec.") ||
        file.includes("__tests__")
      ) {
        return;
      }

      // Regenerate routes
      await generateRoutesFile();

      // Invalidate the generated routes module
      const mod = server.moduleGraph.getModuleById(absoluteOutputPath);
      if (mod) {
        server.moduleGraph.invalidateModule(mod);
      }
    },
  };
};
