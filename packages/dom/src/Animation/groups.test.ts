import { Deferred, Effect } from "effect";
import { describe, expect, it } from "vitest";

import {
  _awaitGate,
  _complete,
  _register,
  group,
  parallel,
  sequence,
} from "./groups.js";

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
      const gates = await Effect.runPromise(
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
      const events = await Effect.runPromise(
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
      const doneStates = await Effect.runPromise(
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
      const doneAfterEach = await Effect.runPromise(
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
      const parentState = await Effect.runPromise(
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
      const events = await Effect.runPromise(
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
      const gates = await Effect.runPromise(
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
      const openedTogether = await Effect.runPromise(
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
      const doneStates = await Effect.runPromise(
        Effect.gen(function* () {
          const parent = yield* group();
          const [c0, c1] = yield* parallel(2, { group: parent });

          yield* Deferred.succeed(parent._gate, void 0);
          parent._state.gateResolved = true;
          yield* Effect.sleep(2);

          _register(c0);
          _register(c1);
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
      const parentState = await Effect.runPromise(
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
});
