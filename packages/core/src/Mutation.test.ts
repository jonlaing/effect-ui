import { Effect, Option, Scope } from "effect";
import { describe, expect, it } from "vitest";

import { Mutation } from "./Mutation.js";
import { Signal } from "./Signal.js";

const runTest = <A>(effect: Effect.Effect<A, never, Scope.Scope>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("Mutation", () => {
  describe("make", () => {
    it("should create with initial idle state", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((_input: string) =>
            Effect.succeed(42),
          );

          const isLoading = yield* mutation.isLoading.get;
          const data = yield* mutation.data.get;
          const error = yield* mutation.error.get;

          expect(isLoading).toBe(false);
          expect(Option.isNone(data)).toBe(true);
          expect(Option.isNone(error)).toBe(true);
        }),
      ));

    it("should execute and return result", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n * 2),
          );

          const result = yield* mutation.run(5);
          expect(result).toBe(10);
        }),
      ));

    it("should update data on success", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n * 2),
          );

          yield* mutation.run(5);

          const data = yield* mutation.data.get;
          expect(Option.getOrThrow(data)).toBe(10);
        }),
      ));

    it("should set isLoading false after completion", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n * 2),
          );

          yield* mutation.run(5);

          const isLoading = yield* mutation.isLoading.get;
          expect(isLoading).toBe(false);
        }),
      ));

    it("should capture errors", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((_n: number) =>
            Effect.fail("mutation failed" as const),
          );

          const result = yield* Effect.either(mutation.run(5));

          expect(result._tag).toBe("Left");
          if (result._tag === "Left") {
            expect(result.left).toBe("mutation failed");
          }

          const error = yield* mutation.error.get;
          expect(Option.getOrThrow(error)).toBe("mutation failed");
        }),
      ));

    it("should clear error on successful run", () =>
      runTest(
        Effect.gen(function* () {
          let shouldFail = true;
          const mutation = yield* Mutation.make((_n: number) =>
            shouldFail ? Effect.fail("error") : Effect.succeed(42),
          );

          // First run fails
          yield* Effect.either(mutation.run(1));
          const error1 = yield* mutation.error.get;
          expect(Option.isSome(error1)).toBe(true);

          // Second run succeeds
          shouldFail = false;
          yield* Effect.either(mutation.run(2));

          const error2 = yield* mutation.error.get;
          expect(Option.isNone(error2)).toBe(true);

          const data = yield* mutation.data.get;
          expect(Option.getOrThrow(data)).toBe(42);
        }),
      ));

    it("should update data on subsequent runs", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n * 2),
          );

          yield* mutation.run(5);
          const data1 = yield* mutation.data.get;
          expect(Option.getOrThrow(data1)).toBe(10);

          yield* mutation.run(10);
          const data2 = yield* mutation.data.get;
          expect(Option.getOrThrow(data2)).toBe(20);
        }),
      ));
  });

  describe("reset", () => {
    it("should reset to initial state after success", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n * 2),
          );

          yield* mutation.run(5);
          yield* mutation.reset();

          const isLoading = yield* mutation.isLoading.get;
          const data = yield* mutation.data.get;
          const error = yield* mutation.error.get;

          expect(isLoading).toBe(false);
          expect(Option.isNone(data)).toBe(true);
          expect(Option.isNone(error)).toBe(true);
        }),
      ));

    it("should reset to initial state after error", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((_n: number) =>
            Effect.fail("error"),
          );

          yield* Effect.either(mutation.run(5));
          const error1 = yield* mutation.error.get;
          expect(Option.isSome(error1)).toBe(true);

          yield* mutation.reset();

          const error2 = yield* mutation.error.get;
          expect(Option.isNone(error2)).toBe(true);
        }),
      ));
  });

  describe("promise", () => {
    it("should create from a promise", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.promise((n: number) =>
            Promise.resolve(n * 2),
          );

          const result = yield* mutation.run(5);
          expect(result).toBe(10);
        }),
      ));
  });

  describe("tryPromise", () => {
    it("should create from a promise with error handling", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.tryPromise(
            (_n: number) => Promise.reject(new Error("oops")),
            (e) => `caught: ${(e as Error).message}`,
          );

          const result = yield* Effect.either(mutation.run(5));

          expect(result._tag).toBe("Left");
          if (result._tag === "Left") {
            expect(result.left).toBe("caught: oops");
          }
        }),
      ));
  });

  describe("map", () => {
    it("should map the successful data", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed({ value: n * 2 }),
          );
          const mapped = mutation.pipe(Mutation.map((obj) => obj.value));

          const result = yield* mapped.run(5);
          expect(result).toBe(10);

          const data = yield* mapped.data.get;
          expect(Option.getOrThrow(data)).toBe(10);
        }),
      ));

    it("should preserve error state", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((_n: number) =>
            Effect.fail("error" as const),
          );
          const mapped = mutation.pipe(Mutation.map((n: number) => n * 2));

          yield* Effect.either(mapped.run(5));

          const error = yield* mapped.error.get;
          expect(Option.getOrThrow(error)).toBe("error");
        }),
      ));

    it("should delegate reset to source", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n),
          );
          const mapped = mutation.pipe(Mutation.map((n) => n * 10));

          yield* mapped.run(5);
          yield* mapped.reset();

          // Check source was reset
          const data = yield* mutation.data.get;
          expect(Option.isNone(data)).toBe(true);
        }),
      ));
  });

  describe("type guard", () => {
    it("should identify Mutation instances", () =>
      runTest(
        Effect.gen(function* () {
          const mutation = yield* Mutation.make((n: number) =>
            Effect.succeed(n),
          );
          const signal = yield* Signal.make(42);

          expect(Mutation.isMutation(mutation)).toBe(true);
          expect(Mutation.isMutation(signal)).toBe(false);
          expect(Mutation.isMutation({})).toBe(false);
          expect(Mutation.isMutation(null)).toBe(false);
        }),
      ));
  });

  describe("complex input types", () => {
    it("should work with object inputs", () =>
      runTest(
        Effect.gen(function* () {
          interface CreateUserInput {
            name: string;
            email: string;
          }
          interface User {
            id: number;
            name: string;
            email: string;
          }

          let nextId = 1;
          const createUser = yield* Mutation.make((input: CreateUserInput) =>
            Effect.succeed<User>({
              id: nextId++,
              name: input.name,
              email: input.email,
            }),
          );

          const user = yield* createUser.run({
            name: "Alice",
            email: "alice@example.com",
          });

          expect(user.id).toBe(1);
          expect(user.name).toBe("Alice");
          expect(user.email).toBe("alice@example.com");
        }),
      ));
  });
});
