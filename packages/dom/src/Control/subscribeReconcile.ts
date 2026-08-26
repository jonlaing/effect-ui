/**
 * Shared subscription helper for ControlCtx implementations.
 *
 * `ctx.subscribe(readable, handler)` is how `reconcile` keeps a container in
 * sync with a reactive value — for `Outlet`, that means "when pathname
 * changes, re-run the sync loop that swaps slots." Forks the stream into
 * the ambient scope so container unmount tears the subscription down.
 *
 * The handler passed by `reconcile` is already error-wrapped in core (see
 * `packages/core/src/Control.ts`) — this helper is intentionally thin, just
 * the fork pattern.
 */

import { Effect, Scope, Stream } from "effect";

import type { Readable } from "@stax-ui/core";

export const subscribeReconcile = <V, E, R>(
  readable: Readable.Readable<V>,
  handler: (value: V) => Effect.Effect<void, E, R>,
): Effect.Effect<void, E, R | Scope.Scope> =>
  readable.changes.pipe(
    Stream.runForEach(handler),
    Effect.forkScoped,
    Effect.asVoid,
  );
