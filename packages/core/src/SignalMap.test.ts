import { Effect, Fiber, Option, Scope, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { combine } from "./Readable";
import { Signal } from "./Signal";

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
});
