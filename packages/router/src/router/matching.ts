import type { AnyRoute } from "./types";

/**
 * Synchronously try to match a route against a pathname.
 * Returns the raw params if matched, null if no match.
 * This doesn't validate with Schema - just checks if the path pattern matches.
 */
export const tryMatchSync = (
  route: AnyRoute,
  pathname: string,
): Record<string, string> | null => {
  const parts = pathname.split("/").filter((p) => p.length > 0);
  const params: Record<string, string> = {};

  for (let i = 0; i < route.segments.length; i++) {
    const segment = route.segments[i];

    // CatchAll matches everything remaining
    if (segment.type === "catchAll") {
      return params;
    }

    // Not enough path parts for this segment
    if (i >= parts.length) {
      return null;
    }

    const part = parts[i];

    // Static segments must match exactly
    if (segment.type === "static" && segment.value !== part) {
      return null;
    }

    // Param segments capture the value
    if (segment.type === "param") {
      params[segment.name] = part;
    }
  }

  matchResult._tag === "Left"; // Extra path parts that weren't matched
  if (parts.length > route.segments.length) {
    return null;
  }

  return params;
};
