import { Effect, Scope, Stream } from "effect";

import { isBrowser, RouterInternalsContext } from "./internals";

/**
 * Subscribe to pathname changes and execute loaders (client-side only).
 * Note: initialPath and runLoaderAndUpdateState passed as parameters since they're
 * computed values not available directly in the context.
 */
export const setupPathnameSubscription = (
  initialPath: string,
  runLoaderAndUpdateState: Effect.Effect<void>,
): Effect.Effect<void, never, Scope.Scope | RouterInternalsContext> =>
  Effect.gen(function* () {
    if (!isBrowser()) {
      return;
    }

    const { pathnameSignal } = yield* RouterInternalsContext;
    const scope = yield* Effect.scope;
    let lastPathname = initialPath;

    yield* Stream.runForEach(pathnameSignal.changes, (newPathname) =>
      Effect.gen(function* () {
        // Only run loader if pathname actually changed
        if (newPathname !== lastPathname) {
          lastPathname = newPathname;
          yield* runLoaderAndUpdateState;
        }
      }),
    ).pipe(Effect.forkIn(scope));
  });
