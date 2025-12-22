import { describe, it, expect } from "vitest";
import { Effect, Fiber, Stream } from "effect";
import { Signal } from "./Signal";
import { combine } from "./Readable";

const runTest = <A>(effect: Effect.Effect<A, never, never>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("Signal.Map", () => {
  describe("make", () => {
    it("should create an empty map by default", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const value = yield* map.readable.get;
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
          const a = yield* map.get("a");
          const b = yield* map.get("b");
          expect(a).toBe(1);
          expect(b).toBe(2);
        }),
      ));

    it("should create with initial entries from iterable", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["x", 10],
            ["y", 20],
          ]);
          const x = yield* map.get("x");
          expect(x).toBe(10);
        }),
      ));
  });

  describe("set", () => {
    it("should set a value", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          yield* map.set("key", 42);
          const value = yield* map.get("key");
          expect(value).toBe(42);
        }),
      ));

    it("should trigger change notification", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const changes: number[] = [];

          const fiber = yield* map.readable.changes.pipe(
            Stream.take(1),
            Stream.runForEach((m) => Effect.sync(() => changes.push(m.size))),
            Effect.fork,
          );

          yield* map.set("a", 1);
          yield* Effect.yieldNow();

          expect(changes).toEqual([1]);
          yield* Fiber.interrupt(fiber);
        }),
      ));
  });

  describe("get", () => {
    it("should return value for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const value = yield* map.get("a");
          expect(value).toBe(1);
        }),
      ));

    it("should return undefined for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const value = yield* map.get("missing");
          expect(value).toBeUndefined();
        }),
      ));
  });

  describe("has", () => {
    it("should return true for existing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const exists = yield* map.has("a");
          expect(exists).toBe(true);
        }),
      ));

    it("should return false for missing key", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>();
          const exists = yield* map.has("missing");
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

          const exists = yield* map.has("a");
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

          const a = yield* map.get("a");
          const x = yield* map.get("x");
          expect(a).toBeUndefined();
          expect(x).toBe(100);
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

          const a = yield* map.has("a");
          const b = yield* map.has("b");
          expect(a).toBe(false);
          expect(b).toBe(true);
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

  describe("values", () => {
    it("should return values as array", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([
            ["a", 1],
            ["b", 2],
          ]);
          const values = yield* map.values.get;
          expect(values).toEqual([1, 2]);
        }),
      ));
  });

  describe("readable", () => {
    it("should be usable with Readable.combine", () =>
      runTest(
        Effect.gen(function* () {
          const map = yield* Signal.Map.make<string, number>([["a", 1]]);
          const count = yield* Signal.make(10);

          const combined = combine([map.readable, count]);

          const [m, c] = yield* combined.get;
          expect(m.get("a")).toBe(1);
          expect(c).toBe(10);
        }),
      ));
  });
});
