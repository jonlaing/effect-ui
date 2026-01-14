import * as fs from "node:fs";
import * as path from "node:path";

import type { Plugin, ViteDevServer } from "vite";

import { generateRoutes } from "./generator.js";
import { scanRoutes } from "./scanner.js";
import type { EffexPluginOptions } from "./types.js";
import {
  filePathToRouteName,
  filePathToRoutePath,
  routeNameToComponentImportName,
} from "./utils/pathConversion.js";

const DEFAULT_ROUTES_DIR = "src/routes";
const DEFAULT_OUTPUT_PATH = "src/generated/routes.ts";

/**
 * Generate scaffold content for a new route file.
 *
 * @param filePath - File path relative to routes directory
 * @returns Scaffold code for the route file
 */
export const generateScaffold = (filePath: string): string => {
  const routePath = filePathToRoutePath(filePath);
  const routeName = filePathToRouteName(filePath);
  const componentName = routeNameToComponentImportName(routeName).replace(
    /Component$/,
    "Page",
  );

  // Check if route has params
  const hasParams = routePath?.includes(":") ?? false;

  // Build imports
  const imports = ['import { Effect } from "effect";'];
  imports.push('import { Route } from "@effex/router";');
  imports.push('import { component, $ } from "@effex/dom";');

  if (hasParams) {
    imports.push('import { Schema } from "effect";');
  }

  // Build route definition
  let routeDefine: string;
  if (hasParams && routePath) {
    // Extract param names from path
    const paramNames = routePath.match(/:(\w+)/g)?.map((p) => p.slice(1)) ?? [];
    const schemaFields = paramNames
      .map((name) => `  ${name}: Schema.String,`)
      .join("\n");

    routeDefine = `export const route = Route.define({
  params: Schema.Struct({
${schemaFields}
  }),
});`;
  } else {
    routeDefine = `export const route = Route.define();`;
  }

  // Build component
  let componentBody: string;
  if (hasParams) {
    componentBody = `export default component("${componentName}", () =>
  Effect.gen(function* () {
    const params = yield* route.params();

    return yield* $.div([
      $.h1(["${componentName}"]),
    ]);
  })
);`;
  } else {
    componentBody = `export default component("${componentName}", () =>
  Effect.gen(function* () {
    return yield* $.div([
      $.h1(["${componentName}"]),
    ]);
  })
);`;
  }

  return `${imports.join("\n")}

${routeDefine}

${componentBody}
`;
};

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

      const handleAdd = async (addedPath: string) => {
        // Only react to changes in routes directory
        if (!addedPath.startsWith(absoluteRoutesDir)) return;

        // Ignore test files
        if (
          addedPath.includes(".test.") ||
          addedPath.includes(".spec.") ||
          addedPath.includes("__tests__")
        ) {
          return;
        }

        // Skip non-route files
        if (!/\.(tsx?|jsx?)$/.test(addedPath)) return;

        // Scaffold new empty files if enabled
        if (options.scaffold) {
          try {
            const content = await fs.promises.readFile(addedPath, "utf-8");
            // Only scaffold if file is empty or just whitespace
            if (content.trim().length === 0) {
              const relativePath = path.relative(absoluteRoutesDir, addedPath);
              const scaffold = generateScaffold(relativePath);
              await fs.promises.writeFile(addedPath, scaffold, "utf-8");
              console.log(`[effex-routes] Scaffolded ${relativePath}`);
            }
          } catch {
            // File might not exist yet or be locked, ignore
          }
        }

        // Regenerate routes
        await generateRoutesFile();

        // Invalidate the generated routes module
        const mod = server.moduleGraph.getModuleById(absoluteOutputPath);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }
      };

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

      server.watcher.on("add", handleAdd);
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

    transform(code, id) {
      // Only transform files in routes directory
      if (!id.startsWith(absoluteRoutesDir)) return null;

      // Skip non-JS/TS files
      if (!/\.(tsx?|jsx?)$/.test(id)) return null;

      // Skip test files
      if (
        id.includes(".test.") ||
        id.includes(".spec.") ||
        id.includes("__tests__")
      ) {
        return null;
      }

      // Check if file contains Route.define
      if (!code.includes("Route.define")) return null;

      // Calculate route path from file path
      const relativePath = path.relative(absoluteRoutesDir, id);
      const routePath = filePathToRoutePath(relativePath);

      // Skip layout files (they return null)
      if (routePath === null) return null;

      // Transform Route.define calls to inject __path
      const transformed = injectRouteDefinePath(code, routePath);

      if (transformed === code) return null;

      return {
        code: transformed,
        map: null, // TODO: generate source map for better debugging
      };
    },
  };
};

/**
 * Inject __path into Route.define calls.
 *
 * Handles these patterns:
 * - Route.define() -> Route.define({ __path: "/..." })
 * - Route.define({}) -> Route.define({ __path: "/..." })
 * - Route.define({ params: ... }) -> Route.define({ __path: "/...", params: ... })
 *
 * @param code - Source code
 * @param routePath - The route path to inject
 * @returns Transformed code
 */
export const injectRouteDefinePath = (
  code: string,
  routePath: string,
): string => {
  // Pattern to match Route.define with optional options
  // This handles:
  // - Route.define()
  // - Route.define({...})
  const pattern = /Route\.define\s*\(\s*(\{)?/g;

  return code.replace(pattern, (_match, hasOpenBrace) => {
    const escapedPath = JSON.stringify(routePath);

    if (hasOpenBrace) {
      // Has opening brace: Route.define({ -> Route.define({ __path: "...",
      return `Route.define({ __path: ${escapedPath}, `;
    } else {
      // No arguments or empty parens: Route.define() -> Route.define({ __path: "..." })
      // But we need to check if there's a closing paren right after
      return `Route.define({ __path: ${escapedPath} }`;
    }
  });
};
