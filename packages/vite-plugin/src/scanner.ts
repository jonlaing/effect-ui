import * as path from "node:path";
import * as fg from "fast-glob";
import type { ScannedRoute, EffexPluginOptions } from "./types.js";
import { parseRouteExports } from "./parser.js";
import {
  filePathToRoutePath,
  filePathToRouteName,
  routeNameToImportName,
  routeNameToComponentImportName,
  calculateSpecificity,
} from "./utils/pathConversion.js";

const DEFAULT_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

/**
 * Scan a directory for route files and return route metadata.
 *
 * @param routesDir - Absolute path to the routes directory
 * @param options - Plugin options
 * @returns Array of scanned routes, sorted by specificity (most specific first)
 */
export const scanRoutes = async (
  routesDir: string,
  options?: Pick<EffexPluginOptions, "extensions">,
): Promise<ScannedRoute[]> => {
  const extensions = options?.extensions ?? DEFAULT_EXTENSIONS;

  // Create glob pattern for route files
  const patterns = extensions.map((ext) => `**/*${ext}`);

  // Find all matching files
  const files = await fg.glob(patterns, {
    cwd: routesDir,
    onlyFiles: true,
    ignore: ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"],
  });

  const routes: ScannedRoute[] = [];

  for (const filePath of files) {
    const absolutePath = path.join(routesDir, filePath);

    // Parse the file to detect exports
    const exports = await parseRouteExports(absolutePath);

    // Skip files without a default export (no component)
    if (!exports.hasDefaultExport) {
      continue;
    }

    // Get route metadata
    const routePath = filePathToRoutePath(filePath);

    // Skip layout files (they don't have navigable routes)
    if (routePath === null) {
      continue;
    }

    const routeName = filePathToRouteName(filePath);
    const importName = routeNameToImportName(routeName);
    const componentImportName = routeNameToComponentImportName(routeName);
    const isLayout =
      filePath.includes("_layout.") || filePath === "_layout.tsx";
    const isIndex = filePath.includes("_index.") || filePath === "_index.tsx";

    routes.push({
      filePath,
      routePath,
      routeName,
      importName,
      componentImportName,
      isLayout,
      isIndex,
      exports,
    });
  }

  // Sort by specificity (most specific first)
  return routes.sort((a, b) => {
    const specificityA = calculateSpecificity(a.routePath);
    const specificityB = calculateSpecificity(b.routePath);
    return specificityB - specificityA;
  });
};
