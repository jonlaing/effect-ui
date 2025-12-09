import { Effect, Schema } from "effect";
import type { PathSegment, RouteOptions } from "./types";
import type { Route as RouteType } from "./types";
import { RouteMatchError } from "./types";

/**
 * Parse a path pattern into segments.
 * Handles static segments, :param segments, and * catch-all.
 */
const parsePath = (path: string): PathSegment[] => {
  const segments: PathSegment[] = [];
  const parts = path.split("/").filter((p) => p.length > 0);

  for (const part of parts) {
    if (part === "*") {
      segments.push({ type: "catchAll" });
    } else if (part.startsWith(":")) {
      const name = part.slice(1).replace(/\?$/, ""); // Remove optional marker
      segments.push({ type: "param", name });
    } else {
      segments.push({ type: "static", value: part });
    }
  }

  return segments;
};

/**
 * Calculate route specificity for sorting.
 * Higher = more specific.
 * Static segments worth more than params, params worth more than catch-all.
 */
export const routeSpecificity = (segments: readonly PathSegment[]): number => {
  let score = 0;
  for (const segment of segments) {
    if (segment.type === "static") {
      score += 3;
    } else if (segment.type === "param") {
      score += 2;
    } else if (segment.type === "catchAll") {
      score += 1;
    }
  }
  // Bonus for length (longer more specific paths)
  score += segments.length * 0.1;
  return score;
};

/**
 * Try to match a pathname against route segments.
 * Returns extracted params if matched, or null if no match.
 */
const matchSegments = (
  segments: readonly PathSegment[],
  pathname: string,
): Record<string, string> | null => {
  const parts = pathname.split("/").filter((p) => p.length > 0);
  const params: Record<string, string> = {};

  let segmentIndex = 0;
  let partIndex = 0;

  while (segmentIndex < segments.length) {
    const segment = segments[segmentIndex];

    if (segment.type === "catchAll") {
      // Catch-all matches everything remaining
      return params;
    }

    if (partIndex >= parts.length) {
      // No more parts but still have segments - no match
      return null;
    }

    const part = parts[partIndex];

    if (segment.type === "static") {
      if (segment.value !== part) {
        return null;
      }
    } else if (segment.type === "param") {
      params[segment.name] = part;
    }

    segmentIndex++;
    partIndex++;
  }

  // If we have leftover parts and no catch-all, no match
  if (partIndex < parts.length) {
    return null;
  }

  return params;
};

/**
 * Create a route definition.
 *
 * @param path - The path pattern (e.g., "/users/:id")
 * @param options - Route configuration including params schema
 *
 * @example
 * ```ts
 * const UserRoute = Route.make("/users/:id", {
 *   params: Schema.Struct({ id: Schema.String })
 * })
 *
 * const HomeRoute = Route.make("/")
 *
 * const CatchAllRoute = Route.make("/*")
 * ```
 */
export const make = <
  Path extends string,
  P extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext,
>(
  path: Path,
  options?: RouteOptions<P>,
): RouteType<Path, P> => {
  const segments = parsePath(path);
  const paramsSchema = options?.params;

  const route: RouteType<Path, P> = {
    path,
    segments,
    paramsSchema,
    match: (pathname: string) =>
      Effect.gen(function* () {
        const rawParams = matchSegments(segments, pathname);

        if (rawParams === null) {
          return yield* Effect.fail(RouteMatchError(pathname, "no-match"));
        }

        if (paramsSchema) {
          const decode = Schema.decodeUnknown(paramsSchema);
          const result = yield* decode(rawParams).pipe(
            Effect.mapError((e) =>
              RouteMatchError(pathname, "validation-failed", String(e)),
            ),
          );
          return result as Schema.Schema.Type<P>;
        }

        return rawParams as Schema.Schema.Type<P>;
      }),
  };

  return route;
};

/**
 * Route module namespace.
 */
export const Route = {
  make,
};
