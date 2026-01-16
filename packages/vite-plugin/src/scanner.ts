import * as path from "node:path";

import fg from "fast-glob";

import { parseRouteExports } from "./parser.js";
import type {
  EffexPluginOptions,
  ScannedLayout,
  ScannedRoute,
  ScanResult,
} from "./types.js";
import {
  calculateSpecificity,
  filePathToLayoutName,
  filePathToLayoutPathPrefix,
  filePathToRouteName,
  filePathToRoutePath,
  routeNameToComponentImportName,
  routeNameToImportName,
} from "./utils/pathConversion.js";

const DEFAULT_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

/**
 * Check if a file path represents a layout file.
 */
const isLayoutFile = (filePath: string): boolean => {
  const withoutExt = filePath.replace(/\.(tsx?|jsx?)$/, "");
  return withoutExt === "_layout" || withoutExt.endsWith("._layout");
};

/**
 * Find which layouts apply to a route based on its file path.
 * Returns layout names ordered from outermost to innermost.
 */
const findLayoutsForRoute = (
  routeFilePath: string,
  layouts: ScannedLayout[],
): string[] => {
  const routeWithoutExt = routeFilePath.replace(/\.(tsx?|jsx?)$/, "");

  // Find all layouts that are parents of this route
  const applicableLayouts = layouts.filter((layout) => {
    // Root layout applies to everything
    if (layout.pathPrefix === "/") {
      return true;
    }

    // Layout at "users._layout" applies to routes starting with "users."
    // The prefix is derived from the layout file path
    const layoutFilePrefix = layout.filePath
      .replace(/\.(tsx?|jsx?)$/, "")
      .replace(/\._layout$/, "");

    // Route must start with this prefix (either exact match or followed by .)
    return (
      routeWithoutExt === layoutFilePrefix ||
      routeWithoutExt.startsWith(layoutFilePrefix + ".")
    );
  });

  // Sort by specificity (root first, then more specific)
  // Root layout has pathPrefix "/", others have longer prefixes
  applicableLayouts.sort((a, b) => {
    if (a.pathPrefix === "/") return -1;
    if (b.pathPrefix === "/") return 1;
    return a.pathPrefix.length - b.pathPrefix.length;
  });

  return applicableLayouts.map((l) => l.layoutName);
};

/**
 * Build the parent layout relationship for each layout.
 */
const findParentLayout = (
  layout: ScannedLayout,
  allLayouts: ScannedLayout[],
): string | null => {
  if (layout.pathPrefix === "/") {
    return null; // Root layout has no parent
  }

  // Find the most specific layout that is a parent of this one
  let parent: ScannedLayout | null = null;

  for (const candidate of allLayouts) {
    if (candidate.layoutName === layout.layoutName) continue;

    // Check if candidate is a parent (its prefix is a prefix of ours)
    if (
      candidate.pathPrefix === "/" ||
      layout.pathPrefix.startsWith(candidate.pathPrefix + "/") ||
      layout.pathPrefix.startsWith(candidate.pathPrefix)
    ) {
      // Is this more specific than current parent?
      if (
        !parent ||
        (candidate.pathPrefix !== "/" &&
          candidate.pathPrefix.length > parent.pathPrefix.length)
      ) {
        parent = candidate;
      }
    }
  }

  return parent?.layoutName ?? null;
};

/**
 * Scan a directory for route files and return route metadata.
 *
 * @param routesDir - Absolute path to the routes directory
 * @param options - Plugin options
 * @returns ScanResult with routes and layouts
 */
export const scanRoutes = async (
  routesDir: string,
  options?: Pick<EffexPluginOptions, "extensions">,
): Promise<ScanResult> => {
  const extensions = options?.extensions ?? DEFAULT_EXTENSIONS;

  // Create glob pattern for route files
  const patterns = extensions.map((ext) => `**/*${ext}`);

  // Find all matching files
  const files = await fg(patterns, {
    cwd: routesDir,
    onlyFiles: true,
    ignore: ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"],
  });

  const routes: ScannedRoute[] = [];
  const layouts: ScannedLayout[] = [];

  // First pass: collect layouts
  for (const filePath of files) {
    if (!isLayoutFile(filePath)) continue;

    const absolutePath = path.join(routesDir, filePath);
    const exports = await parseRouteExports(absolutePath);

    // Skip files without a default export (no component)
    if (!exports.hasDefaultExport) continue;

    const layoutName = filePathToLayoutName(filePath);
    const importName = routeNameToImportName(layoutName);
    const componentImportName = routeNameToComponentImportName(layoutName);
    const pathPrefix = filePathToLayoutPathPrefix(filePath);

    layouts.push({
      filePath,
      layoutName,
      importName,
      componentImportName,
      pathPrefix,
      parentLayout: null, // Will be set in second pass
      exports,
    });
  }

  // Set parent layouts
  for (let i = 0; i < layouts.length; i++) {
    const layout = layouts[i];
    const parentLayout = findParentLayout(layout, layouts);
    if (parentLayout) {
      layouts[i] = { ...layout, parentLayout };
    }
  }

  // Second pass: collect routes and assign layouts
  for (const filePath of files) {
    if (isLayoutFile(filePath)) continue;

    const absolutePath = path.join(routesDir, filePath);
    const exports = await parseRouteExports(absolutePath);

    // Skip files without a default export (no component)
    if (!exports.hasDefaultExport) continue;

    const routePath = filePathToRoutePath(filePath);
    if (routePath === null) continue;

    const routeName = filePathToRouteName(filePath);
    const importName = routeNameToImportName(routeName);
    const componentImportName = routeNameToComponentImportName(routeName);
    const isIndex = filePath.includes("_index.") || filePath === "_index.tsx";
    const routeLayouts = findLayoutsForRoute(filePath, layouts);

    routes.push({
      filePath,
      routePath,
      routeName,
      importName,
      componentImportName,
      isLayout: false,
      isIndex,
      exports,
      layouts: routeLayouts,
    });
  }

  // Sort routes by specificity (most specific first)
  const sortedRoutes = routes.sort((a, b) => {
    const specificityA = calculateSpecificity(a.routePath);
    const specificityB = calculateSpecificity(b.routePath);
    return specificityB - specificityA;
  });

  return {
    routes: sortedRoutes,
    layouts,
  };
};
