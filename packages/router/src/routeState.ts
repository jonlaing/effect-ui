import { Effect, Option, Scope, type Schema } from "effect";

import { Derived } from "@effex/core";

import { RouterInternalsContext } from "./internals";
import { tryMatchSync } from "./matching";
import type { AnyRoute, Route, RouteState } from "./types";

/**
 * Create route-specific state (isActive, params) for each route.
 */
export const createRouteStates = <
  Routes extends Record<string, AnyRoute>,
>(): Effect.Effect<
  {
    [K in keyof Routes]: RouteState<
      Routes[K] extends Route<string, infer P>
        ? P extends Schema.Schema.AnyNoContext
          ? Schema.Schema.Type<P>
          : Record<string, never>
        : Record<string, never>
    >;
  },
  never,
  Scope.Scope | RouterInternalsContext
> =>
  Effect.gen(function* () {
    const { routes, currentRoute, pathnameSignal } =
      yield* RouterInternalsContext;

    const routeStates = {} as {
      [K in keyof Routes]: RouteState<
        Routes[K] extends Route<string, infer P>
          ? P extends Schema.Schema.AnyNoContext
            ? Schema.Schema.Type<P>
            : Record<string, never>
          : Record<string, never>
      >;
    };

    for (const [name, route] of Object.entries(routes)) {
      const isActive = yield* Derived.sync(
        [currentRoute],
        ([current]) => Option.isSome(current) && current.value === name,
      );

      // Derive params synchronously using the raw matching (without schema validation)
      // Schema validation happens on route.match() when explicitly called
      const params = yield* Derived.sync([pathnameSignal], (values) => {
        const pathname = values[0];
        const rawMatch = tryMatchSync(route, pathname);
        return rawMatch as unknown | null;
      });

      (routeStates as Record<string, RouteState<unknown>>)[name] = {
        isActive,
        params,
      };
    }

    return routeStates;
  });
