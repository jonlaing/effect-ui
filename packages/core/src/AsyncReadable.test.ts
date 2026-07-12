import { Effect, Option, Scope } from "effect";
import { describe, expect, it } from "vitest";

import { AsyncReadable } from "./AsyncReadable.js";
import { Signal } from "./Signal.js";

const runTest = <A>(effect: Effect.Effect<A, never, Scope.Scope>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("AsyncReadable", () => {
  describe("make", () => {
    it("should create with initial fetched value", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.succeed(42));

          const value = yield* ar.value.get;
          expect(Option.getOrThrow(value)).toBe(42);
        }),
      ));

    it("should start with isLoading false after initial fetch", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.succeed(42));

          const isLoading = yield* ar.isLoading.get;
          expect(isLoading).toBe(false);
        }),
      ));

    it("should start with no error on success", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.succeed(42));

          const error = yield* ar.error.get;
          expect(Option.isNone(error)).toBe(true);
        }),
      ));

    it("should capture errors", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() =>
            Effect.fail("fetch failed" as const),
          );

          const error = yield* ar.error.get;
          expect(Option.getOrThrow(error)).toBe("fetch failed");
        }),
      ));

    it("should have no value on error", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() =>
            Effect.fail("fetch failed"),
          );

          const value = yield* ar.value.get;
          expect(Option.isNone(value)).toBe(true);
        }),
      ));
  });

  describe("refetch", () => {
    it("should refetch when called", () =>
      runTest(
        Effect.gen(function* () {
          let counter = 0;
          const ar = yield* AsyncReadable.make(() =>
            Effect.sync(() => ++counter),
          );

          const value1 = yield* ar.value.get;
          expect(Option.getOrThrow(value1)).toBe(1);

          yield* ar.refetch();

          const value2 = yield* ar.value.get;
          expect(Option.getOrThrow(value2)).toBe(2);
        }),
      ));

    it("should clear error on successful refetch", () =>
      runTest(
        Effect.gen(function* () {
          let shouldFail = true;
          const ar = yield* AsyncReadable.make(() =>
            shouldFail ? Effect.fail("error") : Effect.succeed(42),
          );

          // Initially has error
          const error1 = yield* ar.error.get;
          expect(Option.isSome(error1)).toBe(true);

          // Fix and refetch
          shouldFail = false;
          yield* ar.refetch();

          // Error cleared, value available
          const error2 = yield* ar.error.get;
          expect(Option.isNone(error2)).toBe(true);

          const value = yield* ar.value.get;
          expect(Option.getOrThrow(value)).toBe(42);
        }),
      ));
  });

  describe("reset", () => {
    it("should reset to initial state", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.succeed(42));

          // Has value after creation
          const value1 = yield* ar.value.get;
          expect(Option.isSome(value1)).toBe(true);

          // Reset
          yield* ar.reset();

          // All cleared
          const isLoading = yield* ar.isLoading.get;
          const value = yield* ar.value.get;
          const error = yield* ar.error.get;

          expect(isLoading).toBe(false);
          expect(Option.isNone(value)).toBe(true);
          expect(Option.isNone(error)).toBe(true);
        }),
      ));

    it("should reset error state", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.fail("error"));

          // Has error
          const error1 = yield* ar.error.get;
          expect(Option.isSome(error1)).toBe(true);

          // Reset
          yield* ar.reset();

          // Error cleared
          const error2 = yield* ar.error.get;
          expect(Option.isNone(error2)).toBe(true);
        }),
      ));
  });

  describe("promise", () => {
    it("should create from a promise", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.promise(() => Promise.resolve(42));

          const value = yield* ar.value.get;
          expect(Option.getOrThrow(value)).toBe(42);
        }),
      ));
  });

  describe("tryPromise", () => {
    it("should create from a promise with error handling", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.tryPromise(
            () => Promise.reject(new Error("oops")),
            (e) => `caught: ${(e as Error).message}`,
          );

          const error = yield* ar.error.get;
          expect(Option.getOrThrow(error)).toBe("caught: oops");
        }),
      ));
  });

  describe("fromReadable", () => {
    it("should compute from a readable value", () =>
      runTest(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          const ar = yield* AsyncReadable.fromReadable(count, (n) =>
            Effect.succeed(n * 2),
          );

          const value = yield* ar.value.get;
          expect(Option.getOrThrow(value)).toBe(10);
        }),
      ));

    it("should recompute when readable changes", () =>
      runTest(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          const ar = yield* AsyncReadable.fromReadable(count, (n) =>
            Effect.succeed(n * 2),
          );

          // Initial value
          const value1 = yield* ar.value.get;
          expect(Option.getOrThrow(value1)).toBe(10);

          // Update and wait for recomputation
          yield* count.set(10);
          yield* Effect.sleep(10);

          const value2 = yield* ar.value.get;
          expect(Option.getOrThrow(value2)).toBe(20);
        }),
      ));

    it("should work with pipeable syntax", () =>
      runTest(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          const ar = yield* count.pipe(
            AsyncReadable.fromReadable((n) => Effect.succeed(n * 2)),
          );

          const value = yield* ar.value.get;
          expect(Option.getOrThrow(value)).toBe(10);
        }),
      ));

    it("should capture errors from computation", () =>
      runTest(
        Effect.gen(function* () {
          const shouldFail = yield* Signal.make(true);
          const ar = yield* AsyncReadable.fromReadable(shouldFail, (fail) =>
            fail ? Effect.fail("computation failed") : Effect.succeed(42),
          );

          const error = yield* ar.error.get;
          expect(Option.getOrThrow(error)).toBe("computation failed");
        }),
      ));

    it("should clear error on successful recomputation", () =>
      runTest(
        Effect.gen(function* () {
          const shouldFail = yield* Signal.make(true);
          const ar = yield* AsyncReadable.fromReadable(shouldFail, (fail) =>
            fail ? Effect.fail("error") : Effect.succeed(42),
          );

          // Initially has error
          const error1 = yield* ar.error.get;
          expect(Option.isSome(error1)).toBe(true);

          // Fix and trigger recomputation
          yield* shouldFail.set(false);
          yield* Effect.sleep(10);

          // Error cleared, value available
          const error2 = yield* ar.error.get;
          expect(Option.isNone(error2)).toBe(true);

          const value = yield* ar.value.get;
          expect(Option.getOrThrow(value)).toBe(42);
        }),
      ));
  });

  describe("map", () => {
    it("should map the successful value", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() =>
            Effect.succeed({ name: "Alice", age: 30 }),
          );
          const mapped = ar.pipe(AsyncReadable.map((user) => user.name));

          const value = yield* mapped.value.get;
          expect(Option.getOrThrow(value)).toBe("Alice");
        }),
      ));

    it("should preserve isLoading state", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.succeed(42));
          const mapped = ar.pipe(AsyncReadable.map((n) => n * 2));

          const isLoading = yield* mapped.isLoading.get;
          expect(isLoading).toBe(false);
        }),
      ));

    it("should preserve error state", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() =>
            Effect.fail("error" as const),
          );
          const mapped = ar.pipe(AsyncReadable.map((n: number) => n * 2));

          const error = yield* mapped.error.get;
          expect(Option.getOrThrow(error)).toBe("error");
        }),
      ));

    it("should delegate refetch to source", () =>
      runTest(
        Effect.gen(function* () {
          let counter = 0;
          const ar = yield* AsyncReadable.make(() =>
            Effect.sync(() => ++counter),
          );
          const mapped = ar.pipe(AsyncReadable.map((n) => n * 10));

          const value1 = yield* mapped.value.get;
          expect(Option.getOrThrow(value1)).toBe(10);

          yield* mapped.refetch();

          const value2 = yield* mapped.value.get;
          expect(Option.getOrThrow(value2)).toBe(20);
        }),
      ));
  });

  describe("type guard", () => {
    it("should identify AsyncReadable instances", () =>
      runTest(
        Effect.gen(function* () {
          const ar = yield* AsyncReadable.make(() => Effect.succeed(42));
          const signal = yield* Signal.make(42);

          expect(AsyncReadable.isAsyncReadable(ar)).toBe(true);
          expect(AsyncReadable.isAsyncReadable(signal)).toBe(false);
          expect(AsyncReadable.isAsyncReadable({})).toBe(false);
          expect(AsyncReadable.isAsyncReadable(null)).toBe(false);
        }),
      ));
  });
});
