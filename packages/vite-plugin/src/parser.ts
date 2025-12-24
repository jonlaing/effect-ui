import type { RouteExports } from "./types.js";
import * as fs from "node:fs";

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
  // Detect named exports
  // Matches: export const params, export const loader, etc.
  // Also handles: export { params }, export { loader as default }, etc.
  const hasParams =
    /export\s+(const|let|var|function)\s+params\b/.test(content) ||
    /export\s*\{\s*[^}]*\bparams\b/.test(content);

  const hasLoader =
    /export\s+(const|let|var|function)\s+loader\b/.test(content) ||
    /export\s*\{\s*[^}]*\bloader\b/.test(content);

  const hasAction =
    /export\s+(const|let|var|function)\s+action\b/.test(content) ||
    /export\s*\{\s*[^}]*\baction\b/.test(content);

  // Detect default export
  // Matches: export default, export { X as default }
  const hasDefaultExport =
    /export\s+default\b/.test(content) ||
    /export\s*\{[^}]*\bas\s+default\b/.test(content);

  return {
    hasParams,
    hasLoader,
    hasAction,
    hasDefaultExport,
  };
};
