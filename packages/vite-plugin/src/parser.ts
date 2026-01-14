import * as fs from "node:fs";

import type { RouteExports } from "./types.js";

/**
 * Parse a route file to detect which exports it has.
 *
 * Uses regex-based detection which handles most common patterns.
 * This avoids the need for a full AST parser like Babel.
 *
 * @param filePath - Absolute path to the route file
 * @returns Object indicating which exports are present
 */
export const parseRouteExports = async (
  filePath: string,
): Promise<RouteExports> => {
  const content = await fs.promises.readFile(filePath, "utf-8");
  return parseRouteExportsFromContent(content);
};

/**
 * Parse route exports from file content (for testing).
 */
export const parseRouteExportsFromContent = (content: string): RouteExports => {
  // Detect default export
  // Matches: export default, export { X as default }
  const hasDefaultExport =
    /export\s+default\b/.test(content) ||
    /export\s*\{[^}]*\bas\s+default\b/.test(content);

  // Detect route export (DefinedRoute from Route.define)
  // Matches: export const route, export { route }
  const hasRoute =
    /export\s+(const|let|var)\s+route\b/.test(content) ||
    /export\s*\{\s*[^}]*\broute\b/.test(content);

  return {
    hasDefaultExport,
    hasRoute,
  };
};
