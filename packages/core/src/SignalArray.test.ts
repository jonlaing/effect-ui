import { Effect, Fiber, Option, Scope, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Readable } from "./Readable";
import { Signal } from "./Signal";

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
});
