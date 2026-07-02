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
});
