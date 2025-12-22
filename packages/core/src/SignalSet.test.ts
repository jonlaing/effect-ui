import { describe, it, expect } from "vitest";
import { Effect, Fiber, Stream } from "effect";
import { Signal } from "./Signal";
import { combine } from "./Readable";

const runTest = <A>(effect: Effect.Effect<A, never, never>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("Signal.Set", () => {
  describe("make", () => {
    it("should create an empty set by default", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          const size = yield* set.size.get;
          expect(size).toBe(0);
        }),
      ));

    it("should create with initial values from Set", () =>
      runTest(
        Effect.gen(function* () {
          const initial = new Set(["a", "b", "c"]);
          const set = yield* Signal.Set.make(initial);
          const size = yield* set.size.get;
          expect(size).toBe(3);
        }),
      ));

    it("should create with initial values from iterable", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["x", "y", "z"]);
          const hasX = yield* set.has("x");
          expect(hasX).toBe(true);
        }),
      ));
  });

  describe("add", () => {
    it("should add a value", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          yield* set.add("item");
          const exists = yield* set.has("item");
          expect(exists).toBe(true);
        }),
      ));

    it("should trigger change notification for new value", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          const changes: number[] = [];

          const fiber = yield* set.readable.changes.pipe(
            Stream.take(1),
            Stream.runForEach((s) => Effect.sync(() => changes.push(s.size))),
            Effect.fork,
          );

          yield* set.add("new");
          yield* Effect.yieldNow();

          expect(changes).toEqual([1]);
          yield* Fiber.interrupt(fiber);
        }),
      ));
  });

  describe("has", () => {
    it("should return true for existing value", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["a", "b"]);
          const exists = yield* set.has("a");
          expect(exists).toBe(true);
        }),
      ));

    it("should return false for missing value", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          const exists = yield* set.has("missing");
          expect(exists).toBe(false);
        }),
      ));
  });

  describe("delete", () => {
    it("should remove existing value and return true", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["a", "b"]);
          const deleted = yield* set.delete("a");
          expect(deleted).toBe(true);

          const exists = yield* set.has("a");
          expect(exists).toBe(false);
        }),
      ));

    it("should return false for missing value", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          const deleted = yield* set.delete("missing");
          expect(deleted).toBe(false);
        }),
      ));
  });

  describe("toggle", () => {
    it("should add value if missing and return true", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          const result = yield* set.toggle("item");
          expect(result).toBe(true);

          const exists = yield* set.has("item");
          expect(exists).toBe(true);
        }),
      ));

    it("should remove value if present and return false", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["item"]);
          const result = yield* set.toggle("item");
          expect(result).toBe(false);

          const exists = yield* set.has("item");
          expect(exists).toBe(false);
        }),
      ));

    it("should toggle back and forth", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();

          const r1 = yield* set.toggle("x");
          expect(r1).toBe(true);

          const r2 = yield* set.toggle("x");
          expect(r2).toBe(false);

          const r3 = yield* set.toggle("x");
          expect(r3).toBe(true);
        }),
      ));
  });

  describe("clear", () => {
    it("should remove all values", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["a", "b", "c"]);
          yield* set.clear();
          const size = yield* set.size.get;
          expect(size).toBe(0);
        }),
      ));
  });

  describe("replace", () => {
    it("should replace entire set with new Set", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["a", "b"]);
          yield* set.replace(new Set(["x", "y", "z"]));

          const hasA = yield* set.has("a");
          const hasX = yield* set.has("x");
          expect(hasA).toBe(false);
          expect(hasX).toBe(true);
        }),
      ));

    it("should replace with iterable", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["old"]);
          yield* set.replace(["new1", "new2"]);

          const values = yield* set.values.get;
          expect(values).toEqual(["new1", "new2"]);
        }),
      ));
  });

  describe("update", () => {
    it("should transform set using function", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make([1, 2, 3, 4, 5]);
          yield* set.update((s) => new Set([...s].filter((n) => n > 2)));

          const values = yield* set.values.get;
          expect(values.sort()).toEqual([3, 4, 5]);
        }),
      ));
  });

  describe("size", () => {
    it("should be a reactive readable", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make<string>();
          const size1 = yield* set.size.get;
          expect(size1).toBe(0);

          yield* set.add("a");
          const size2 = yield* set.size.get;
          expect(size2).toBe(1);

          yield* set.add("b");
          yield* set.add("c");
          const size3 = yield* set.size.get;
          expect(size3).toBe(3);
        }),
      ));
  });

  describe("values", () => {
    it("should return values as array", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["a", "b", "c"]);
          const values = yield* set.values.get;
          expect(values.sort()).toEqual(["a", "b", "c"]);
        }),
      ));

    it("should update when set changes", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["a"]);
          yield* set.add("b");
          const values = yield* set.values.get;
          expect(values.sort()).toEqual(["a", "b"]);
        }),
      ));
  });

  describe("readable", () => {
    it("should be usable with Readable.combine", () =>
      runTest(
        Effect.gen(function* () {
          const set = yield* Signal.Set.make(["tag1", "tag2"]);
          const count = yield* Signal.make(10);

          const combined = combine([set.readable, count]);

          const [s, c] = yield* combined.get;
          expect(s.has("tag1")).toBe(true);
          expect(c).toBe(10);
        }),
      ));
  });
});
