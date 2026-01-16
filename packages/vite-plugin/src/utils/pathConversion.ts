/**
 * Convert a file path to a route path.
 *
 * File naming conventions:
 * - Dots (`.`) separate path segments: `users.settings.tsx` → `/users/settings`
 * - `$param` for dynamic segments: `$id.tsx` → `/:id`
 * - `_index.tsx` for index routes
 * - `$.tsx` for catch-all routes
 * - `_` prefix segments are pathless (grouping only)
 * - `[xyz]` escapes special characters
 *
 * @param filePath - File path relative to routes directory (e.g., "users.$id.tsx")
 * @returns Route path (e.g., "/users/:id") or null for layout files
 */
export const filePathToRoutePath = (filePath: string): string | null => {
  // Remove extension
  let path = filePath.replace(/\.(tsx?|jsx?)$/, "");

  // Skip layout files - they don't have their own route
  if (path === "_layout" || path.endsWith("._layout")) {
    return null;
  }

  // Handle root index
  if (path === "_index") {
    return "/";
  }

  // Split by dots to get segments
  const segments = path.split(".");

  // Filter and transform segments
  const pathParts: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // Skip pathless segments (prefixed with _)
    if (segment.startsWith("_")) {
      // But handle _index specially - it means this is the index for the path so far
      if (segment === "_index") {
        continue;
      }
      // Otherwise skip this segment entirely (pathless grouping)
      continue;
    }

    // Handle escape sequences [xyz] -> xyz
    if (segment.startsWith("[") && segment.endsWith("]")) {
      pathParts.push(segment.slice(1, -1));
      continue;
    }

    // Catch-all segment
    if (segment === "$") {
      pathParts.push("*");
      continue;
    }

    // Dynamic parameter
    if (segment.startsWith("$")) {
      pathParts.push(":" + segment.slice(1));
      continue;
    }

    // Static segment
    pathParts.push(segment);
  }

  return "/" + pathParts.join("/");
};

/**
 * Convert a file path to a route name for the routes object.
 *
 * @param filePath - File path relative to routes directory (e.g., "users.$id.tsx")
 * @returns Route name (e.g., "users_$id")
 */
export const filePathToRouteName = (filePath: string): string => {
  // Remove extension
  let name = filePath.replace(/\.(tsx?|jsx?)$/, "");

  // Handle root index
  if (name === "_index") {
    return "index";
  }

  // Replace dots with underscores
  name = name.replace(/\./g, "_");

  // Handle _index suffix
  name = name.replace(/_?_index$/, "");

  // Handle _layout suffix
  name = name.replace(/_?_layout$/, "_layout");

  return name || "index";
};

/**
 * Convert a route name to an import name.
 *
 * @param routeName - Route name (e.g., "users_$id")
 * @returns Import name (e.g., "UsersIdRoute")
 */
export const routeNameToImportName = (routeName: string): string => {
  // Split by underscore and $ to get parts
  const parts = routeName.split(/[_$]+/).filter(Boolean);

  // Capitalize each part and join
  const pascalCase = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return pascalCase + "Route";
};

/**
 * Convert a route name to a component import name.
 *
 * @param routeName - Route name (e.g., "users_$id")
 * @returns Component import name (e.g., "UsersIdComponent")
 */
export const routeNameToComponentImportName = (routeName: string): string => {
  // Split by underscore and $ to get parts
  const parts = routeName.split(/[_$]+/).filter(Boolean);

  // Capitalize each part and join
  const pascalCase = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return pascalCase + "Component";
};

/**
 * Convert a layout file path to a layout name.
 *
 * @param filePath - File path relative to routes directory (e.g., "users._layout.tsx")
 * @returns Layout name (e.g., "users_layout", or "root_layout" for root layout)
 */
export const filePathToLayoutName = (filePath: string): string => {
  // Remove extension
  let name = filePath.replace(/\.(tsx?|jsx?)$/, "");

  // Root layout
  if (name === "_layout") {
    return "root_layout";
  }

  // Replace dots with underscores
  name = name.replace(/\./g, "_");

  return name;
};

/**
 * Convert a layout file path to the path prefix it applies to.
 *
 * @param filePath - File path relative to routes directory (e.g., "users._layout.tsx")
 * @returns Path prefix (e.g., "/users", or "/" for root layout)
 */
export const filePathToLayoutPathPrefix = (filePath: string): string => {
  // Remove extension
  let path = filePath.replace(/\.(tsx?|jsx?)$/, "");

  // Root layout applies to everything
  if (path === "_layout") {
    return "/";
  }

  // Remove the _layout suffix to get the path prefix
  path = path.replace(/\._layout$/, "");

  // Convert remaining segments to URL path
  const segments = path.split(".");
  const pathParts: string[] = [];

  for (const segment of segments) {
    // Skip pathless segments (prefixed with _)
    if (segment.startsWith("_")) {
      continue;
    }

    // Handle escape sequences [xyz] -> xyz
    if (segment.startsWith("[") && segment.endsWith("]")) {
      pathParts.push(segment.slice(1, -1));
      continue;
    }

    // Dynamic parameter
    if (segment.startsWith("$")) {
      pathParts.push(":" + segment.slice(1));
      continue;
    }

    // Static segment
    pathParts.push(segment);
  }

  return "/" + pathParts.join("/");
};

/**
 * Calculate route specificity for sorting.
 * Higher specificity = more specific route = should be matched first.
 *
 * Static segments worth more than params, params worth more than catch-all.
 *
 * @param routePath - Route path (e.g., "/users/:id")
 * @returns Specificity score
 */
export const calculateSpecificity = (routePath: string): number => {
  const segments = routePath.split("/").filter(Boolean);
  let score = 0;

  for (const segment of segments) {
    if (segment === "*") {
      // Catch-all - lowest specificity
      score += 1;
    } else if (segment.startsWith(":")) {
      // Dynamic param
      score += 2;
    } else {
      // Static segment
      score += 3;
    }
  }

  // Add small bonus for path length (longer paths are more specific)
  score += segments.length * 0.1;

  return score;
};
