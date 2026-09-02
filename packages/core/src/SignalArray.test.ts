import {
  Effect,
  Fiber,
  HashMap,
  Logger,
  LogLevel,
  Option,
  Scope,
  Stream,
} from "effect";
import { describe, expect, it } from "vitest";

import { Readable } from "./Readable.js";
import { Signal } from "./Signal.js";

interface CapturedLog {
  readonly message: unknown;
  readonly subsystem: string | undefined;
}

const captureLogger = () => {
  const sink: CapturedLog[] = [];
  const layer = Logger.replace(
    Logger.defaultLogger,
    Logger.make((opts) => {
      const sub = HashMap.get(opts.annotations, "subsystem");
      sink.push({
        message: opts.message,
        subsystem: Option.isSome(sub) ? String(sub.value) : undefined,
      });
    }),
  );
  return { sink, layer };
};

const runTest = <A>(effect: Effect.Effect<A, never, Scope.Scope>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("Signal.Array", () => {
  describe("make", () => {
    it("should create an empty array by default", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make<number>();
          const value = yield* arr.get;
          expect(value).toEqual([]);
        }),
      ));

    it("should create with initial values", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3]);
        }),
      ));
  });

  describe("push", () => {
    it("should add elements to the end", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make<number>([1, 2]);
          yield* arr.push(3, 4);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3, 4]);
        }),
      ));

    it("should trigger change notification", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make<number>([1]);
          const changes: number[][] = [];

          const fiber = yield* arr.changes.pipe(
            Stream.take(1),
            Stream.runForEach((v) => Effect.sync(() => changes.push([...v]))),
            Effect.fork,
          );

          // Yield to let the fiber subscribe before mutating
          yield* Effect.yieldNow();

          yield* arr.push(2);
          yield* Effect.yieldNow();

          expect(changes).toEqual([[1, 2]]);
          yield* Fiber.interrupt(fiber);
        }),
      ));
  });

  describe("pop", () => {
    it("should remove and return Some with the last element", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const popped = yield* arr.pop();
          expect(Option.isSome(popped)).toBe(true);
          expect(Option.getOrThrow(popped)).toBe(3);

          const value = yield* arr.get;
          expect(value).toEqual([1, 2]);
        }),
      ));

    it("should return None for empty array", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make<number>([]);
          const popped = yield* arr.pop();
          expect(Option.isNone(popped)).toBe(true);
        }),
      ));
  });

  describe("unshift", () => {
    it("should add elements to the beginning", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([3, 4]);
          yield* arr.unshift(1, 2);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3, 4]);
        }),
      ));
  });

  describe("shift", () => {
    it("should remove and return Some with the first element", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const shifted = yield* arr.shift();
          expect(Option.isSome(shifted)).toBe(true);
          expect(Option.getOrThrow(shifted)).toBe(1);

          const value = yield* arr.get;
          expect(value).toEqual([2, 3]);
        }),
      ));
  });

  describe("splice", () => {
    it("should remove elements", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3, 4, 5]);
          const removed = yield* arr.splice(1, 2);
          expect(removed).toEqual([2, 3]);

          const value = yield* arr.get;
          expect(value).toEqual([1, 4, 5]);
        }),
      ));

    it("should insert elements", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 4]);
          yield* arr.splice(1, 0, 2, 3);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3, 4]);
        }),
      ));

    it("should replace elements", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.splice(1, 1, 99);
          const value = yield* arr.get;
          expect(value).toEqual([1, 99, 3]);
        }),
      ));
  });

  describe("insertAt", () => {
    it("should insert at specific index", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 3]);
          yield* arr.insertAt(1, 2);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3]);
        }),
      ));
  });

  describe("removeAt", () => {
    it("should remove at specific index and return Some", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const removed = yield* arr.removeAt(1);
          expect(Option.isSome(removed)).toBe(true);
          expect(Option.getOrThrow(removed)).toBe(2);

          const value = yield* arr.get;
          expect(value).toEqual([1, 3]);
        }),
      ));

    it("should return None for out of bounds", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2]);
          const removed = yield* arr.removeAt(5);
          expect(Option.isNone(removed)).toBe(true);
        }),
      ));
  });

  describe("replaceAt", () => {
    it("should replace the element at a specific index", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.replaceAt(1, 20).pipe(Effect.orDie);
          const value = yield* arr.get;
          expect(value).toEqual([1, 20, 3]);
        }),
      ));

    it("should fail with OutOfBoundsError when index is out of range", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2]);
          const result = yield* Effect.exit(arr.replaceAt(5, 99));
          expect(result._tag).toBe("Failure");
          const cause = result._tag === "Failure" ? result.cause : null;
          expect(String(cause)).toContain("stax/SignalArray/OutOfBoundsError");
        }),
      ));

    it("should fail on negative indices too", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1]);
          const result = yield* Effect.exit(arr.replaceAt(-1, 99));
          expect(result._tag).toBe("Failure");
        }),
      ));
  });

  describe("modifyAt", () => {
    it("should apply the function to the element at a specific index", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.modifyAt(1, (n) => n * 10).pipe(Effect.orDie);
          const value = yield* arr.get;
          expect(value).toEqual([1, 20, 3]);
        }),
      ));

    it("should fail with OutOfBoundsError when index is out of range", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2]);
          const result = yield* Effect.exit(arr.modifyAt(5, (n) => n * 2));
          expect(result._tag).toBe("Failure");
          const cause = result._tag === "Failure" ? result.cause : null;
          expect(String(cause)).toContain("stax/SignalArray/OutOfBoundsError");
        }),
      ));

    it("should trigger a reactive change on success", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([{ done: false }]);
          const seen: readonly { done: boolean }[][] = [];

          const scope = yield* Effect.scope;
          yield* Effect.forkIn(
            arr.changes.pipe(
              Stream.runForEach((v) =>
                Effect.sync(() => {
                  (seen as { done: boolean }[][]).push([...v]);
                }),
              ),
            ),
            scope,
          );
          yield* Effect.sleep("10 millis");

          yield* arr
            .modifyAt(0, (t) => ({ ...t, done: true }))
            .pipe(Effect.orDie);
          yield* Effect.sleep("10 millis");
          expect(seen.at(-1)).toEqual([{ done: true }]);
        }),
      ));
  });

  describe("remove", () => {
    it("should remove first occurrence", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3, 2]);
          const found = yield* arr.remove(2);
          expect(found).toBe(true);

          const value = yield* arr.get;
          expect(value).toEqual([1, 3, 2]);
        }),
      ));

    it("should return false if not found", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const found = yield* arr.remove(99);
          expect(found).toBe(false);
        }),
      ));
  });

  describe("move", () => {
    it("should move element forward", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3, 4]);
          yield* arr.move(0, 2);
          const value = yield* arr.get;
          expect(value).toEqual([2, 3, 1, 4]);
        }),
      ));

    it("should move element backward", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3, 4]);
          yield* arr.move(3, 1);
          const value = yield* arr.get;
          expect(value).toEqual([1, 4, 2, 3]);
        }),
      ));

    it("should do nothing for out of bounds", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.move(0, 10);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3]);
        }),
      ));
  });

  describe("swap", () => {
    it("should swap two elements", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3, 4]);
          yield* arr.swap(0, 2);
          const value = yield* arr.get;
          expect(value).toEqual([3, 2, 1, 4]);
        }),
      ));

    it("should swap adjacent elements", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.swap(1, 2);
          const value = yield* arr.get;
          expect(value).toEqual([1, 3, 2]);
        }),
      ));

    it("should do nothing for out of bounds", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.swap(0, 10);
          const value = yield* arr.get;
          expect(value).toEqual([1, 2, 3]);
        }),
      ));
  });

  describe("sort", () => {
    it("should sort in place", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([3, 1, 4, 1, 5]);
          yield* arr.sort((a, b) => a - b);
          const value = yield* arr.get;
          expect(value).toEqual([1, 1, 3, 4, 5]);
        }),
      ));
  });

  describe("reverse", () => {
    it("should reverse in place", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.reverse();
          const value = yield* arr.get;
          expect(value).toEqual([3, 2, 1]);
        }),
      ));
  });

  describe("clear", () => {
    it("should remove all elements", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.clear();
          const value = yield* arr.get;
          expect(value).toEqual([]);
        }),
      ));
  });

  describe("set", () => {
    it("should replace entire array", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.set([4, 5]);
          const value = yield* arr.get;
          expect(value).toEqual([4, 5]);
        }),
      ));
  });

  describe("update", () => {
    it("should transform entire array", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.update((a) => a.filter((x) => x > 1));
          const value = yield* arr.get;
          expect(value).toEqual([2, 3]);
        }),
      ));

    it("should support map transformations", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          yield* arr.update((a) => a.map((x) => x * 2));
          const value = yield* arr.get;
          expect(value).toEqual([2, 4, 6]);
        }),
      ));
  });

  describe("length", () => {
    it("should be a reactive readable", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const len = yield* arr.length.get;
          expect(len).toBe(3);

          yield* arr.push(4);
          const len2 = yield* arr.length.get;
          expect(len2).toBe(4);
        }),
      ));
  });

  describe("map", () => {
    it("should create derived readable", () =>
      runTest(
        Effect.gen(function* () {
          const arr = yield* Signal.Array.make([1, 2, 3]);
          const sum = arr.pipe(
            Readable.map((a) => a.reduce((acc, x) => acc + x, 0)),
          );
          const value = yield* sum.get;
          expect(value).toBe(6);
        }),
      ));
  });

  describe("trace", () => {
    it("logs every mutation method under stax.signal at Debug level", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const arr = yield* Signal.Array.make<number>().pipe(
              Signal.Array.trace("nums"),
            );
            yield* arr.push(1, 2);
            yield* arr.unshift(0);
            yield* arr.pop();
            yield* arr.reverse();
            yield* arr.clear();
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      const methods = sink
        .filter(
          (l) => l.subsystem === "stax.signal" && Array.isArray(l.message),
        )
        .map((l) => (l.message as [string, unknown])[0]);
      expect(methods).toEqual(["push", "unshift", "pop", "reverse", "clear"]);
    });

    it("payload contains id, args, and callSite", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const arr = yield* Signal.Array.make<number>().pipe(
              Signal.Array.trace("nums"),
            );
            yield* arr.push(7, 8, 9);
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      const write = sink.find(
        (l) =>
          l.subsystem === "stax.signal" &&
          Array.isArray(l.message) &&
          l.message[0] === "push",
      );
      const payload = (write?.message as [string, Record<string, unknown>])[1];
      expect(payload.id).toBe("nums");
      expect(payload.args).toEqual([7, 8, 9]);
      expect(typeof payload.callSite).toBe("string");
      expect(String(payload.callSite)).not.toMatch(/^Error/);
      expect(String(payload.callSite)).not.toContain("/packages/core/");
    });

    it("emits nothing when the log level is above Debug", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const arr = yield* Signal.Array.make<number>().pipe(
              Signal.Array.trace("nums"),
            );
            yield* arr.push(1);
            yield* arr.pop();
          }),
        ).pipe(Effect.provide(layer)),
      );
      expect(sink.filter((l) => l.subsystem === "stax.signal")).toEqual([]);
    });

    it("still applies mutations — the wrapper is transparent", async () => {
      const { layer } = captureLogger();
      const finalArr = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const arr = yield* Signal.Array.make<number>().pipe(
              Signal.Array.trace("nums"),
            );
            yield* arr.push(1, 2, 3);
            yield* arr.reverse();
            return yield* arr.get;
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      expect(finalArr).toEqual([3, 2, 1]);
    });
  });
});
