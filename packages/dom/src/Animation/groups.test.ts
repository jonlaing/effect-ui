import { Deferred, Effect, Scope } from "effect";
import { describe, expect, it } from "vitest";

import {
  _awaitGate,
  _complete,
  _register,
  group,
  parallel,
  sequence,
  skip,
} from "./groups.js";

// `sequence(_, { group })` and `parallel(_, { group })` install a scope
// finalizer so branch swaps release the parent's virtual registration;
// tests exercising the nested overload run under `Effect.scoped`.
const runScoped = <A, E>(
  program: Effect.Effect<A, E, Scope.Scope>,
): Promise<A> => Effect.runPromise(Effect.scoped(program));

describe("Animation groups", () => {
  describe("group()", () => {
    it("creates a group whose gate is initially closed", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();
          expect(g._tag).toBe("AnimationGroup");
          expect(g._state.gateResolved).toBe(false);
          expect(g._state.doneResolved).toBe(false);
          expect(g._state.pending).toBe(0);
          const gateOpen = yield* Deferred.isDone(g._gate);
          return gateOpen;
        }),
      );
      expect(result).toBe(false);
    });
  });

  describe("sequence()", () => {
    it("opens the first group's gate immediately", async () => {
      const gateOpen = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0] = yield* sequence(1);
          return yield* Deferred.isDone(g0._gate);
        }),
      );
      expect(gateOpen).toBe(true);
    });

    it("keeps subsequent groups' gates closed until the prior finishes", async () => {
      const gates = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1, g2] = yield* sequence(3);
          const g0Open = yield* Deferred.isDone(g0._gate);
          const g1Open = yield* Deferred.isDone(g1._gate);
          const g2Open = yield* Deferred.isDone(g2._gate);
          return { g0Open, g1Open, g2Open };
        }),
      );
      expect(gates).toEqual({ g0Open: true, g1Open: false, g2Open: false });
    });

    it("opens the next gate when the prior group completes", async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1] = yield* sequence(2);

          // Register two animations under g0
          _register(g0);
          _register(g0);
          expect(g0._state.pending).toBe(2);
          expect(yield* Deferred.isDone(g1._gate)).toBe(false);

          // Complete one — g0 not done yet
          yield* _complete(g0);
          expect(g0._state.pending).toBe(1);
          expect(g0._state.doneResolved).toBe(false);

          // Complete the other — g0 done, g1 gate opens
          yield* _complete(g0);
          expect(g0._state.doneResolved).toBe(true);

          // Give the daemon fiber a tick to open g1's gate
          yield* Deferred.await(g1._gate);
          expect(g1._state.gateResolved).toBe(true);
        }),
      );
    });

    it("chains multiple gates end-to-end", async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1, g2] = yield* sequence(3);

          _register(g0);
          yield* _complete(g0);
          yield* Deferred.await(g1._gate);
          expect(yield* Deferred.isDone(g2._gate)).toBe(false);

          _register(g1);
          yield* _complete(g1);
          yield* Deferred.await(g2._gate);
          expect(g2._state.gateResolved).toBe(true);
        }),
      );
    });

    it("returns an empty array for count 0", async () => {
      const result = await Effect.runPromise(sequence(0));
      expect(result).toEqual([]);
    });
  });

  describe("parallel()", () => {
    it("opens every gate immediately", async () => {
      const gates = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1, g2] = yield* parallel(3);
          return [
            yield* Deferred.isDone(g0._gate),
            yield* Deferred.isDone(g1._gate),
            yield* Deferred.isDone(g2._gate),
          ];
        }),
      );
      expect(gates).toEqual([true, true, true]);
    });
  });

  describe("_complete()", () => {
    it("only resolves done after pending has been non-zero and returns to zero", async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();

          // Never registered — completing shouldn't resolve done
          expect(g._state.doneResolved).toBe(false);

          _register(g);
          expect(g._state.started).toBe(true);
          yield* _complete(g);
          expect(g._state.doneResolved).toBe(true);
        }),
      );
    });

    it("is idempotent past the first zero-crossing", async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();
          _register(g);
          yield* _complete(g);
          expect(g._state.doneResolved).toBe(true);

          // Late registration + completion — pending stays balanced but
          // doneResolved doesn't re-fire (Deferred.succeed is a no-op).
          _register(g);
          yield* _complete(g);
          expect(g._state.doneResolved).toBe(true);
        }),
      );
    });
  });

  describe("_awaitGate()", () => {
    it("returns immediately once the gate is open", async () => {
      const value = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0] = yield* sequence(1);
          yield* _awaitGate(g0);
          return "unblocked";
        }),
      );
      expect(value).toBe("unblocked");
    });

    it("blocks until the prior group completes", async () => {
      const events = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1] = yield* sequence(2);
          const log: string[] = [];

          const g1Fiber = yield* Effect.fork(
            Effect.gen(function* () {
              yield* _awaitGate(g1);
              log.push("g1-open");
            }),
          );

          log.push("registering-g0");
          _register(g0);
          yield* Effect.sleep(1);
          log.push("completing-g0");
          yield* _complete(g0);

          yield* g1Fiber.await;
          return log;
        }),
      );
      expect(events).toEqual(["registering-g0", "completing-g0", "g1-open"]);
    });
  });

  describe("sequence({ group: parent })", () => {
    it("keeps child 0's gate closed until parent's gate opens", async () => {
      const gates = await runScoped(
        Effect.gen(function* () {
          const [parent] = yield* sequence(1);
          // Immediately close and swap parent so its gate isn't yet open.
          // Actually — sequence's first group opens immediately. Use a
          // manually-constructed group instead so we control the parent's
          // gate state.
          const p = yield* group();
          const [c0, c1] = yield* sequence(2, { group: p });
          const beforeOpen = {
            c0: yield* Deferred.isDone(c0._gate),
            c1: yield* Deferred.isDone(c1._gate),
          };
          void parent;
          return beforeOpen;
        }),
      );
      expect(gates).toEqual({ c0: false, c1: false });
    });

    it("opens child 0's gate when parent's gate opens; children chain as usual", async () => {
      const events = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0, c1] = yield* sequence(2, { group: parent });
          const log: string[] = [];

          const c0Watcher = yield* Effect.fork(
            Effect.gen(function* () {
              yield* _awaitGate(c0);
              log.push("c0-open");
            }),
          );
          const c1Watcher = yield* Effect.fork(
            Effect.gen(function* () {
              yield* _awaitGate(c1);
              log.push("c1-open");
            }),
          );

          // Nothing should fire until we open parent's gate.
          yield* Effect.sleep(2);
          log.push("opening-parent");
          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          yield* c0Watcher.await;

          // Complete c0 to advance the chain.
          _register(c0);
          yield* _complete(c0);
          yield* c1Watcher.await;

          return log;
        }),
      );
      expect(events).toEqual(["opening-parent", "c0-open", "c1-open"]);
    });

    it("parent's `_done` waits for the child chain to complete", async () => {
      const doneStates = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0, c1] = yield* sequence(2, { group: parent });

          // Parent has been registered by the subsequence — pending is 1,
          // started is true.
          expect(parent._state.pending).toBe(1);
          expect(parent._state.started).toBe(true);

          // Open parent's gate to let the chain start.
          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          yield* _awaitGate(c0);

          // Run c0.
          _register(c0);
          yield* _complete(c0);

          const afterC0 = yield* Deferred.isDone(parent._done);

          // Now c1.
          yield* _awaitGate(c1);
          _register(c1);
          yield* _complete(c1);

          // Give the daemon a tick to observe c1's done and complete parent.
          yield* Effect.sleep(2);
          const afterC1 = yield* Deferred.isDone(parent._done);

          return { afterC0, afterC1 };
        }),
      );
      expect(doneStates).toEqual({ afterC0: false, afterC1: true });
    });

    it("parent with BOTH a direct animation AND a nested chain — waits for both", async () => {
      const doneAfterEach = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [child] = yield* sequence(1, { group: parent });

          // Simulate a direct animation attached to parent alongside the
          // subsequence. Two registrations should now be pending.
          _register(parent);
          expect(parent._state.pending).toBe(2);

          // Complete the direct animation — parent still has the
          // subsequence outstanding.
          yield* _complete(parent);
          const afterDirect = yield* Deferred.isDone(parent._done);

          // Open parent's gate so the child can start, then complete it.
          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          yield* _awaitGate(child);
          _register(child);
          yield* _complete(child);
          yield* Effect.sleep(2);
          const afterBoth = yield* Deferred.isDone(parent._done);

          return { afterDirect, afterBoth };
        }),
      );
      expect(doneAfterEach).toEqual({ afterDirect: false, afterBoth: true });
    });

    it("returns [] and does not touch parent when count is 0", async () => {
      const parentState = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const groups = yield* sequence(0, { group: parent });
          expect(groups).toEqual([]);
          return {
            pending: parent._state.pending,
            started: parent._state.started,
          };
        }),
      );
      expect(parentState).toEqual({ pending: 0, started: false });
    });

    it("nests arbitrarily — a sequence under a child of another sequence", async () => {
      const events = await runScoped(
        Effect.gen(function* () {
          const [outer0, outer1, outer2] = yield* sequence(3);
          const [inner0, inner1] = yield* sequence(2, { group: outer1 });
          const log: string[] = [];

          const track = (label: string, g: typeof outer0) =>
            Effect.fork(
              Effect.gen(function* () {
                yield* _awaitGate(g);
                log.push(label);
              }),
            );

          const w0 = yield* track("outer0", outer0);
          const wi0 = yield* track("inner0", inner0);
          const wi1 = yield* track("inner1", inner1);
          const w2 = yield* track("outer2", outer2);

          // outer0 gate opens immediately.
          yield* w0.await;
          _register(outer0);
          yield* _complete(outer0);

          // Now outer1's gate opens, which cascades to inner0.
          yield* wi0.await;
          _register(inner0);
          yield* _complete(inner0);

          // inner1 opens after inner0 completes.
          yield* wi1.await;
          _register(inner1);
          yield* _complete(inner1);

          // Once inner1 is done, the virtual registration on outer1 completes,
          // outer1's _done fires, and outer2 opens.
          yield* w2.await;
          return log;
        }),
      );
      expect(events).toEqual(["outer0", "inner0", "inner1", "outer2"]);
    });
  });

  describe("parallel({ group: parent })", () => {
    it("keeps every child's gate closed until parent's gate opens", async () => {
      const gates = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0, c1, c2] = yield* parallel(3, { group: parent });
          return {
            c0: yield* Deferred.isDone(c0._gate),
            c1: yield* Deferred.isDone(c1._gate),
            c2: yield* Deferred.isDone(c2._gate),
          };
        }),
      );
      expect(gates).toEqual({ c0: false, c1: false, c2: false });
    });

    it("opens all child gates in unison when parent's gate opens", async () => {
      const openedTogether = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0, c1, c2] = yield* parallel(3, { group: parent });

          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          // A single sleep should be enough for the daemon to open all three.
          yield* Effect.sleep(2);

          return {
            c0: yield* Deferred.isDone(c0._gate),
            c1: yield* Deferred.isDone(c1._gate),
            c2: yield* Deferred.isDone(c2._gate),
          };
        }),
      );
      expect(openedTogether).toEqual({ c0: true, c1: true, c2: true });
    });

    it("parent's `_done` waits until EVERY child finishes", async () => {
      const doneStates = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0, c1] = yield* parallel(2, { group: parent });

          // Register BEFORE opening the parent gate so the empty-group
          // fast-path on the children doesn't fire before we get a
          // chance to attach real animations.
          _register(c0);
          _register(c1);

          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          yield* Effect.sleep(2);

          yield* _complete(c0);
          yield* Effect.sleep(2);
          const afterOne = yield* Deferred.isDone(parent._done);

          yield* _complete(c1);
          yield* Effect.sleep(2);
          const afterBoth = yield* Deferred.isDone(parent._done);

          return { afterOne, afterBoth };
        }),
      );
      expect(doneStates).toEqual({ afterOne: false, afterBoth: true });
    });

    it("returns [] and does not touch parent when count is 0", async () => {
      const parentState = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const groups = yield* parallel(0, { group: parent });
          expect(groups).toEqual([]);
          return {
            pending: parent._state.pending,
            started: parent._state.started,
          };
        }),
      );
      expect(parentState).toEqual({ pending: 0, started: false });
    });
  });

  describe("empty groups", () => {
    it("completes automatically when nothing registers by the next tick", async () => {
      const done = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0] = yield* sequence(1);
          // Nobody registers. `_done` should fire once the empty-group
          // check runs on the next tick.
          yield* Effect.sleep(5);
          return yield* Deferred.isDone(g0._done);
        }),
      );
      expect(done).toBe(true);
    });

    it("unblocks a downstream sequence step when the current step is empty", async () => {
      const events = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1, g2] = yield* sequence(3);
          const log: string[] = [];

          const watch = (label: string, g: typeof g0) =>
            Effect.fork(
              Effect.gen(function* () {
                yield* _awaitGate(g);
                log.push(label);
              }),
            );

          const w0 = yield* watch("g0", g0);
          const w1 = yield* watch("g1", g1);
          const w2 = yield* watch("g2", g2);

          // g0's gate is already open. Register + complete a normal
          // animation on it.
          yield* w0.await;
          _register(g0);
          yield* _complete(g0);

          // g1 opens next. Nothing registers on it — empty-group
          // completion should fire and cascade to g2.
          yield* w1.await;
          yield* w2.await;

          return log;
        }),
      );
      expect(events).toEqual(["g0", "g1", "g2"]);
    });

    it("does not fire done prematurely when a registration arrives synchronously after gate open", async () => {
      const done = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0] = yield* sequence(1);
          // Register synchronously — same fiber, same tick as sequence()
          // returning. The empty-group check (forked on Effect.sleep(0))
          // must observe pending > 0 by the time it runs.
          _register(g0);
          yield* Effect.sleep(5);
          // Still pending — animation hasn't completed yet.
          return yield* Deferred.isDone(g0._done);
        }),
      );
      expect(done).toBe(false);
    });

    it("empty middle group in a longer sequence still advances", async () => {
      const events = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1, g2, g3] = yield* sequence(4);
          const log: string[] = [];

          const watch = (label: string, g: typeof g0) =>
            Effect.fork(
              Effect.gen(function* () {
                yield* _awaitGate(g);
                log.push(label);
              }),
            );

          const w0 = yield* watch("g0", g0);
          const w1 = yield* watch("g1", g1);
          const w2 = yield* watch("g2", g2);
          const w3 = yield* watch("g3", g3);

          yield* w0.await;
          _register(g0);
          yield* _complete(g0);

          // g1 is empty — cascades through.
          yield* w1.await;
          yield* w2.await;
          _register(g2);
          yield* _complete(g2);

          // g3 opens after g2 completes.
          yield* w3.await;

          return log;
        }),
      );
      expect(events).toEqual(["g0", "g1", "g2", "g3"]);
    });
  });

  describe("skip()", () => {
    it("fires done immediately without needing a registration", async () => {
      const done = await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();
          yield* skip(g);
          return yield* Deferred.isDone(g._done);
        }),
      );
      expect(done).toBe(true);
    });

    it("also opens a closed gate so downstream sequencing unblocks", async () => {
      const state = await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();
          expect(yield* Deferred.isDone(g._gate)).toBe(false);
          yield* skip(g);
          return {
            gate: yield* Deferred.isDone(g._gate),
            done: yield* Deferred.isDone(g._done),
          };
        }),
      );
      expect(state).toEqual({ gate: true, done: true });
    });

    it("is idempotent — safe to call multiple times", async () => {
      const done = await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();
          yield* skip(g);
          yield* skip(g);
          yield* skip(g);
          return yield* Deferred.isDone(g._done);
        }),
      );
      expect(done).toBe(true);
    });

    it("advances a sequence step past pending animations without cancelling them", async () => {
      const state = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0, g1] = yield* sequence(2);

          // Register on g0 but don't complete — an animation is "in flight".
          _register(g0);
          expect(g0._state.pending).toBe(1);

          // Explicitly skip — g0's done fires despite pending > 0.
          yield* skip(g0);
          yield* Effect.sleep(2);

          const g1Open = yield* Deferred.isDone(g1._gate);

          // The still-pending animation can complete later without
          // side effects.
          yield* _complete(g0);

          return {
            g0Done: yield* Deferred.isDone(g0._done),
            g1Open,
            g0PendingAfter: g0._state.pending,
          };
        }),
      );
      expect(state).toEqual({ g0Done: true, g1Open: true, g0PendingAfter: 0 });
    });
  });

  describe("scope-aware parent registration", () => {
    // Regression: a `when` branch swap that tears down a sub-scope
    // containing `sequence(_, { group: parent })` used to leak the
    // parent's virtual `_register`. Parent's `pending` never balanced
    // because the losing branch's last group never completed, and every
    // sibling downstream of `parent` hung forever.
    it("decrements parent's pending when the sub-scope closes before completion", async () => {
      const state = await Effect.runPromise(
        Effect.gen(function* () {
          const parent = yield* group();
          const outerScope = yield* Scope.make();

          // Build a nested sequence under `parent` inside `outerScope`.
          yield* sequence(3, { group: parent }).pipe(Scope.extend(outerScope));

          const pendingWhileOpen = parent._state.pending;

          // Close the sub-scope — no child ever completes.
          yield* Scope.close(
            outerScope,
            Effect.void
              .pipe(Effect.exit)
              .pipe(Effect.map(() => undefined)) as never,
          );

          const pendingAfterClose = parent._state.pending;
          return { pendingWhileOpen, pendingAfterClose };
        }),
      );
      // While the sub-scope is open, parent has our virtual registration.
      expect(state.pendingWhileOpen).toBe(1);
      // After the sub-scope closes, the finalizer decrements it back.
      expect(state.pendingAfterClose).toBe(0);
    });

    it("parent completes when the surviving branch's sub-sequence finishes after a swap", async () => {
      // Simulates the hydration branch-swap case:
      //   1. Sub-scope A opens → sequence(N, {group}) registers with parent
      //   2. Sub-scope A closes (branch swapped out) → finalizer decrements
      //   3. Sub-scope B opens → sequence(M, {group}) registers with parent
      //   4. B's chain runs to completion → _complete(parent) → parent done
      const state = await Effect.runPromise(
        Effect.gen(function* () {
          const parent = yield* group();

          // Branch A mounts under its own scope, then unmounts.
          const scopeA = yield* Scope.make();
          yield* sequence(2, { group: parent }).pipe(Scope.extend(scopeA));
          yield* Scope.close(
            scopeA,
            (yield* Effect.exit(Effect.void)) as never,
          );

          const pendingAfterAClosed = parent._state.pending;

          // Branch B mounts. Register with parent, then complete.
          const scopeB = yield* Scope.make();
          const [b0, b1] = yield* sequence(2, { group: parent }).pipe(
            Scope.extend(scopeB),
          );

          // Open parent's gate so b0 opens.
          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;

          // Register + complete an animation in each of B's groups so
          // b1._done ends up firing — which drives parent's virtual
          // completion via the daemon.
          _register(b0);
          yield* _complete(b0);
          // b1's gate opens off b0's done. Give the daemon a tick.
          yield* Effect.sleep(2);
          _register(b1);
          yield* _complete(b1);
          yield* Effect.sleep(2);

          const parentDone = yield* Deferred.isDone(parent._done);
          const pendingAtEnd = parent._state.pending;

          yield* Scope.close(
            scopeB,
            (yield* Effect.exit(Effect.void)) as never,
          );

          return { pendingAfterAClosed, parentDone, pendingAtEnd };
        }),
      );
      expect(state.pendingAfterAClosed).toBe(0);
      expect(state.parentDone).toBe(true);
      expect(state.pendingAtEnd).toBe(0);
    });

    it("normal completion path is unaffected by the scope finalizer", async () => {
      // Belt-and-suspenders: if the natural `_done` path wins, the
      // scope-close finalizer must NOT double-decrement.
      const state = await runScoped(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0] = yield* sequence(1, { group: parent });

          _register(c0);
          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          yield* _complete(c0);
          yield* Effect.sleep(2);

          return {
            parentDone: yield* Deferred.isDone(parent._done),
            pendingAfterNaturalCompletion: parent._state.pending,
          };
        }),
      );
      expect(state.parentDone).toBe(true);
      // The finalizer fires when the enclosing scope closes AFTER this
      // block, but by then `released` is already true so it's a no-op.
      expect(state.pendingAfterNaturalCompletion).toBe(0);
    });
  });

  describe("awaitDone", () => {
    // Public wrapper around `Deferred.await(g._done)` so downstream
    // code (custom `Router.scrollBehavior` fns, page components that
    // sequence off a parent transition) can coordinate off a group's
    // completion without dipping into internals.
    it("blocks until the group's `_done` fires, then resolves", async () => {
      const { awaitDone } = await import("./groups.js");
      const events = await Effect.runPromise(
        Effect.gen(function* () {
          const g = yield* group();
          _register(g);

          const log: string[] = [];
          const awaiter = yield* Effect.fork(
            Effect.gen(function* () {
              yield* awaitDone(g);
              log.push("resolved");
            }),
          );
          yield* Effect.sleep(5);
          log.push("before-complete");

          yield* _complete(g);
          yield* awaiter.await;
          return log;
        }),
      );
      // "before-complete" must land before "resolved" — awaitDone was
      // parked waiting for `_complete` to fire `_done`.
      expect(events).toEqual(["before-complete", "resolved"]);
    });

    it("resolves immediately when `_done` has already fired", async () => {
      const { awaitDone } = await import("./groups.js");
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const [g0] = yield* sequence(1);
          // Empty-group fast-path fires `_done` on the next tick.
          yield* Effect.sleep(5);
          const before = yield* Deferred.isDone(g0._done);
          yield* awaitDone(g0);
          return before;
        }),
      );
      expect(result).toBe(true);
    });
  });
});
