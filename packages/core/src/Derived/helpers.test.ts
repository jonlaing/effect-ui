import { Chunk, Effect, Option, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Signal } from "../Signal";
import { combineReadables, defaultEquals, getCurrentValues } from "./helpers";

describe("defaultEquals", () => {
  it("should return true for identical primitives", () => {
    expect(defaultEquals(5, 5)).toBe(true);
    expect(defaultEquals("hello", "hello")).toBe(true);
    expect(defaultEquals(true, true)).toBe(true);
  });

  it("should return false for different primitives", () => {
    expect(defaultEquals(5, 6)).toBe(false);
    expect(defaultEquals("hello", "world")).toBe(false);
    expect(defaultEquals(true, false)).toBe(false);
  });

  it("should return false for equal objects (reference equality)", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1 };
    expect(defaultEquals(obj1, obj2)).toBe(false);
  });

  it("should return true for same object reference", () => {
    const obj = { a: 1 };
    expect(defaultEquals(obj, obj)).toBe(true);
  });
});

describe("combineReadables", () => {
  it("should return empty array stream for no readables", async () => {
    const result = await Effect.runPromise(
      Stream.runCollect(combineReadables([])).pipe(Effect.map(Chunk.toArray)),
    );
    expect(result).toEqual([[]]);
  });

  it("should handle single readable", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.make(42);
          const combined = combineReadables([signal]);
          const first = yield* Stream.runHead(combined);
          return Option.getOrThrow(first);
        }),
      ),
    );
    expect(result).toEqual([42]);
  });

  it("should combine multiple readables", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make(1);
          const b = yield* Signal.make(2);
          const c = yield* Signal.make(3);
          const combined = combineReadables([a, b, c]);
          const first = yield* Stream.runHead(combined);
          return Option.getOrThrow(first);
        }),
      ),
    );
    expect(result).toEqual([1, 2, 3]);
  });

  it("should emit when any dependency changes", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make(1);
          const b = yield* Signal.make(10);
          const combined = combineReadables([a, b]);

          // Get initial values
          const initial = yield* Stream.runHead(combined);
          expect(Option.getOrThrow(initial)).toEqual([1, 10]);

          // Update a and verify
          yield* a.set(2);
          const afterA = yield* Stream.runHead(combined);
          expect(Option.getOrThrow(afterA)).toEqual([2, 10]);

          // Update b and verify
          yield* b.set(20);
          const afterB = yield* Stream.runHead(combined);
          expect(Option.getOrThrow(afterB)).toEqual([2, 20]);

          return true;
        }),
      ),
    );
    expect(result).toBe(true);
  });
});

describe("getCurrentValues", () => {
  it("should get current values from all readables", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make("hello");
          const b = yield* Signal.make(42);
          const c = yield* Signal.make(true);
          return yield* getCurrentValues([a, b, c]);
        }),
      ),
    );
    expect(result).toEqual(["hello", 42, true]);
  });

  it("should return empty tuple for no readables", async () => {
    const result = await Effect.runPromise(getCurrentValues([]));
    expect(result).toEqual([]);
  });
});
