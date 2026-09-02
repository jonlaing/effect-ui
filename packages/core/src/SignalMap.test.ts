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

import { combine } from "./Readable.js";
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

describe("Signal.Map", () => {
  describe("make", () => {
    it("should create an empty map by default", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const value = yield* map.get;
          expect(value.size).toBe(0);
        }),
      ));

    it("should create with initial entries from Map", () =>
      runTest(
        Effect.gen(function* () {
          const initial = new Map([
            ["a", 1],
            ["b", 2],
          ]);
          const map = yield* Signal.Map.make(initial);
          const a = yield* map.at("a").get;
          const b = yield* map.at("b").get;
          expect(Option.getOrThrow(a)).toBe(1);
          expect(Option.getOrThrow(b)).toBe(2);
        }),
      ));

    it("should create with initial entries from iterable", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["x", 10],
            ["y", 20],
          ]);
          const x = yield* map.at("x").get;
          expect(Option.getOrThrow(x)).toBe(10);
        }),
      ));
  });

  describe("set", () => {
    it("should set a value", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          yield* map.set("key", 42);
          const value = yield* map.at("key").get;
          expect(Option.getOrThrow(value)).toBe(42);
        }),
      ));

    it("should trigger change notification", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const changes: number[] = [];

          const fiber = yield* map.changes.pipe(
            Stream.take(1),
            Stream.runForEach((m) => Effect.sync(() => changes.push(m.size))),
            Effect.fork,
          );

          // Yield to let the fiber subscribe before mutating
          yield* Effect.yieldNow();

          yield* map.set("a", 1);
          yield* Effect.yieldNow();

          expect(changes).toEqual([1]);
          yield* Fiber.interrupt(fiber);
        }),
      ));
  });

  describe("at", () => {
    it("should return Readable with Some for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const value = yield* map.at("a").get;
          expect(Option.isSome(value)).toBe(true);
          expect(Option.getOrThrow(value)).toBe(1);
        }),
      ));

    it("should return Readable with None for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const value = yield* map.at("missing").get;
          expect(Option.isNone(value)).toBe(true);
        }),
      ));

    it("should be reactive to changes", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const readable = map.at("a");

          // Initially None
          const before = yield* readable.get;
          expect(Option.isNone(before)).toBe(true);

          // After set, becomes Some
          yield* map.set("a", 42);
          const after = yield* readable.get;
          expect(Option.getOrThrow(after)).toBe(42);
        }),
      ));
  });

  describe("atOrElse", () => {
    it("should return value for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const value = yield* map.atOrElse("a", 0).get;
          expect(value).toBe(1);
        }),
      ));

    it("should return fallback for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const value = yield* map.atOrElse("missing", 99).get;
          expect(value).toBe(99);
        }),
      ));

    it("should be reactive to changes", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const readable = map.atOrElse("a", 0);

          // Initially fallback
          const before = yield* readable.get;
          expect(before).toBe(0);

          // After set, becomes value
          yield* map.set("a", 42);
          const after = yield* readable.get;
          expect(after).toBe(42);
        }),
      ));
  });

  describe("atEffect", () => {
    it("should return Some for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const value = yield* map.atEffect("a");
          expect(Option.isSome(value)).toBe(true);
          expect(Option.getOrThrow(value)).toBe(1);
        }),
      ));

    it("should return None for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const value = yield* map.atEffect("missing");
          expect(Option.isNone(value)).toBe(true);
        }),
      ));
  });

  describe("has", () => {
    it("should return Readable with true for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const exists = yield* map.has("a").get;
          expect(exists).toBe(true);
        }),
      ));

    it("should return Readable with false for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const exists = yield* map.has("missing").get;
          expect(exists).toBe(false);
        }),
      ));

    it("should be reactive to changes", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const hasA = map.has("a");

          // Initially false
          const before = yield* hasA.get;
          expect(before).toBe(false);

          // After set, becomes true
          yield* map.set("a", 42);
          const after = yield* hasA.get;
          expect(after).toBe(true);

          // After delete, becomes false again
          yield* map.delete("a");
          const afterDelete = yield* hasA.get;
          expect(afterDelete).toBe(false);
        }),
      ));
  });

  describe("hasEffect", () => {
    it("should return true for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const exists = yield* map.hasEffect("a");
          expect(exists).toBe(true);
        }),
      ));

    it("should return false for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const exists = yield* map.hasEffect("missing");
          expect(exists).toBe(false);
        }),
      ));
  });

  describe("delete", () => {
    it("should remove existing key and return true", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const deleted = yield* map.delete("a");
          expect(deleted).toBe(true);

          const exists = yield* map.has("a").get;
          expect(exists).toBe(false);
        }),
      ));

    it("should return false for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const deleted = yield* map.delete("missing");
          expect(deleted).toBe(false);
        }),
      ));
  });

  describe("clear", () => {
    it("should remove all entries", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          yield* map.clear();
          const size = yield* map.size.get;
          expect(size).toBe(0);
        }),
      ));
  });

  describe("replace", () => {
    it("should replace entire map", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          yield* map.replace(new Map([["x", 100]]));

          const a = yield* map.at("a").get;
          const x = yield* map.at("x").get;
          expect(Option.isNone(a)).toBe(true);
          expect(Option.getOrThrow(x)).toBe(100);
        }),
      ));
  });

  describe("update", () => {
    it("should transform map using function", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          yield* map.update((m) => new Map([...m].filter(([_, v]) => v > 1)));

          const a = yield* map.has("a").get;
          const b = yield* map.has("b").get;
          expect(a).toBe(false);
          expect(b).toBe(true);
        }),
      ));
  });

  describe("modifyAt", () => {
    it("should apply the function to the value at the given key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          yield* map.modifyAt("a", (n) => n + 10).pipe(Effect.orDie);
          const a = yield* map.atEffect("a");
          expect(Option.getOrThrow(a)).toBe(11);
        }),
      ));

    it("should fail with KeyNotFoundError when the key is missing", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const result = yield* Effect.exit(
            map.modifyAt("missing", (n) => n + 1),
          );
          expect(result._tag).toBe("Failure");
          const cause = result._tag === "Failure" ? result.cause : null;
          expect(String(cause)).toContain("stax/SignalMap/KeyNotFoundError");
        }),
      ));

    it("should trigger a reactive change on success", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, { done: boolean }>([
            ["a", { done: false }],
          ]);
          const seen: readonly boolean[] = [];

          const scope = yield* Effect.scope;
          yield* Effect.forkIn(
            map.entries.changes.pipe(
              Stream.runForEach((entries) =>
                Effect.sync(() => {
                  const item = entries.find(([k]) => k === "a")?.[1];
                  if (item) (seen as boolean[]).push(item.done);
                }),
              ),
            ),
            scope,
          );
          yield* Effect.sleep("10 millis");

          yield* map
            .modifyAt("a", (v) => ({ ...v, done: true }))
            .pipe(Effect.orDie);
          yield* Effect.sleep("10 millis");
          expect(seen.at(-1)).toBe(true);
        }),
      ));
  });

  describe("size", () => {
    it("should be a reactive readable", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const size1 = yield* map.size.get;
          expect(size1).toBe(0);

          yield* map.set("a", 1);
          const size2 = yield* map.size.get;
          expect(size2).toBe(1);
        }),
      ));
  });

  describe("entries", () => {
    it("should return entries as array", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          const entries = yield* map.entries.get;
          expect(entries).toEqual([
            ["a", 1],
            ["b", 2],
          ]);
        }),
      ));
  });

  describe("keys", () => {
    it("should return keys as array", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          const keys = yield* map.keys.get;
          expect(keys).toEqual(["a", "b"]);
        }),
      ));
  });

  describe("valuesArray", () => {
    it("should return values as array", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          const values = yield* map.valuesArray.get;
          expect(values).toEqual([1, 2]);
        }),
      ));
  });

  describe("Readable interface", () => {
    it("should be usable with Readable.combine", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const count = yield* Signal.make(10);

          const combined = combine([map, count] as const);

          const [m, c] = yield* combined.get;
          expect(m.get("a")).toBe(1);
          expect(c).toBe(10);
        }),
      ));
  });

  describe("trace", () => {
    it("logs every mutation method under stax.signal at Debug level", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const m = yield* Signal.Map.make<string, number>().pipe(
              Signal.Map.trace("users"),
            );
            yield* m.set("ada", 1);
            yield* m.delete("ada");
            yield* m.clear();
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
      expect(methods).toEqual(["set", "delete", "clear"]);
    });

    it("payload contains id, args, and callSite", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const m = yield* Signal.Map.make<string, number>().pipe(
              Signal.Map.trace("users"),
            );
            yield* m.set("ada", 42);
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
          l.message[0] === "set",
      );
      const payload = (write?.message as [string, Record<string, unknown>])[1];
      expect(payload.id).toBe("users");
      expect(payload.args).toEqual(["ada", 42]);
      expect(String(payload.callSite)).toContain("SignalMap.test.ts");
    });

    it("emits nothing when the log level is above Debug", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const m = yield* Signal.Map.make<string, number>().pipe(
              Signal.Map.trace("users"),
            );
            yield* m.set("a", 1);
          }),
        ).pipe(Effect.provide(layer)),
      );
      expect(sink.filter((l) => l.subsystem === "stax.signal")).toEqual([]);
    });

    it("still applies mutations — the wrapper is transparent", async () => {
      const { layer } = captureLogger();
      const finalSize = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const m = yield* Signal.Map.make<string, number>().pipe(
              Signal.Map.trace("users"),
            );
            yield* m.set("a", 1);
            yield* m.set("b", 2);
            yield* m.delete("a");
            const map = yield* m.get;
            return map.size;
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      expect(finalSize).toBe(1);
    });
  });
});
