import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { Signal } from "./Signal";

describe("Signal", () => {
  it("should create a signal with initial value", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(0);
          return yield* count.get;
        }),
      ),
    );
    expect(result).toBe(0);
  });

  it("should update value with set", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(0);
          yield* count.set(5);
          return yield* count.get;
        }),
      ),
    );
    expect(result).toBe(5);
  });

  it("should update value with update function", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(10);
          yield* count.update((n) => n + 5);
          return yield* count.get;
        }),
      ),
    );
    expect(result).toBe(15);
  });

  it("should skip update if value equals (default ===)", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          yield* count.set(5); // Same value, should not change
          yield* count.set(5); // Same value again
          return yield* count.get;
        }),
      ),
    );
    expect(result).toBe(5);
  });

  it("should use custom equality function", async () => {
    interface User {
      id: number;
      name: string;
    }

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const user = yield* Signal.make<User>(
            { id: 1, name: "Alice" },
            { equals: (a, b) => a.id === b.id },
          );
          // Same id, different name - should NOT update (considered equal)
          yield* user.set({ id: 1, name: "Alice Updated" });
          const current = yield* user.get;
          return current.name;
        }),
      ),
    );
    expect(result).toBe("Alice"); // Original value kept since ids are equal
  });

  it("should map to a new Readable", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          const doubled = count.map((n) => n * 2);
          return yield* doubled.get;
        }),
      ),
    );
    expect(result).toBe(10);
  });

  it("should chain multiple updates", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(0);
          yield* count.update((n) => n + 1);
          yield* count.update((n) => n + 1);
          yield* count.update((n) => n + 1);
          return yield* count.get;
        }),
      ),
    );
    expect(result).toBe(3);
  });
});
