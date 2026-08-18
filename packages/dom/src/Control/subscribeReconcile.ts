/**
 * Shared subscription helper for ControlCtx implementations.
 *
 * `ctx.subscribe(readable, handler)` is how `reconcile` keeps a container in
 * sync with a reactive value — for `Outlet`, that means "when pathname
 * changes, re-run the sync loop that swaps slots." The pattern is:
 *
 * ```
 * const scope = yield* Effect.scope;
 * yield* readable.changes.pipe(
 *   Stream.runForEach(handler),
 *   Effect.forkIn(scope),
 * );
 * ```
 *
 * The handler passed by `reconcile` is already error-wrapped in core (see
 * `packages/core/src/Control.ts`) — this helper is intentionally thin, just
 * the fork/forever pattern.
 */

import { Effect, Stream } from "effect";

import type { Readable } from "@effex/core";

export const subscribeReconcile = <V, E, R>(
  readable: Readable.Readable<V>,
  handler: (value: V) => Effect.Effect<void, E, R>,
): Effect.Effect<void, E, R> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    yield* readable.changes.pipe(
      Stream.runForEach(handler),
      Effect.forkIn(scope),
    );
  }) as Effect.Effect<void, E, R>;
