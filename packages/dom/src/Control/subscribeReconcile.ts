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
 * That forks the stream reader into the parent scope. The problem: if the
 * handler ever fails — a route render throws, a data-provider dies, a slot
 * insertion errors — the forked fiber dies with a defect and the failure
 * is invisible. The user sees a frozen UI (blank Outlet, stale content) with
 * nothing in the console pointing at the cause.
 *
 * This helper wraps the pattern with two behaviours:
 *   1. Every failed handler run is logged via {@link Console.error} with a
 *      full Effect Cause (fiber trace + inner errors) so navigation/reconcile
 *      failures surface. Uses Effect's Console service (not plain
 *      `console.error`) so tests can swap the sink via Layer.
 *   2. The failure is swallowed at the per-value boundary so a single bad
 *      update doesn't kill the subscription — subsequent state changes
 *      still trigger the handler. A user who navigates to a broken route
 *      and back can recover; without this, one error would freeze all
 *      future updates too.
 */

import { Cause, Console, Effect, Stream } from "effect";

import type { Readable } from "@effex/core";

export const subscribeReconcile = <V, E, R>(
  readable: Readable.Readable<V>,
  handler: (value: V) => Effect.Effect<void, E, R>,
): Effect.Effect<void, E, R> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    yield* readable.changes.pipe(
      Stream.runForEach((value) =>
        handler(value).pipe(
          Effect.tapErrorCause((cause) =>
            Console.error(
              `[@effex/dom] Reconcile handler failed for value:`,
              value,
              `\nCause:\n${Cause.pretty(cause)}`,
            ),
          ),
          // Swallow so the subscription survives; the error is already
          // logged, and subsequent updates should still be applied.
          Effect.catchAllCause(() => Effect.void),
        ),
      ),
      Effect.forkIn(scope),
    );
  }) as Effect.Effect<void, E, R>;
