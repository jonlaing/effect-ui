import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { Readable } from "./Readable";
import { Signal } from "./Signal";

describe("Signal.fromNullable", () => {
  it("should return existing signal when provided", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const existing = yield* Signal.make(42);
          const signal = yield* Signal.fromNullable(existing, 0);
          return signal === existing;
        }),
      ),
    );
    expect(result).toBe(true);
  });

  it("should create new signal with default when existing is undefined", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.fromNullable(undefined, 42);
          return yield* signal.get;
        }),
      ),
    );
    expect(result).toBe(42);
  });

  it("should work with pipeable equals", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.fromNullable(undefined, { id: 1 }).pipe(
            Signal.equals((a, b) => a.id === b.id),
          );
          // Same id, should not update
          yield* signal.set({ id: 1 });
          const value = yield* signal.get;
          return value.id;
        }),
      ),
    );
    expect(result).toBe(1);
  });
});

describe("Signal.fromReactive", () => {
  it("should return existing Signal when provided", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const existing = yield* Signal.make(42);
          const signal = yield* Signal.fromReactive(existing, 0);
          return signal === existing;
        }),
      ),
    );
    expect(result).toBe(true);
  });

  it("should create Signal from Readable with its current value", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          // Create a pure Readable using Readable.of
          const readable = Readable.of(42);
          const signal = yield* Signal.fromReactive(readable, 0);
          return yield* signal.get;
        }),
      ),
    );
    expect(result).toBe(42);
  });

  it("should create Signal from plain value", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.fromReactive(42, 0);
          return yield* signal.get;
        }),
      ),
    );
    expect(result).toBe(42);
  });

  it("should use default when value is undefined", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.fromReactive(undefined, 99);
          return yield* signal.get;
        }),
      ),
    );
    expect(result).toBe(99);
  });

  it("should create writable Signal from Readable", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          // Create a pure Readable using Readable.of
          const readable = Readable.of(10);
          const signal = yield* Signal.fromReactive(readable, 0);
          yield* signal.set(20);
          return yield* signal.get;
        }),
      ),
    );
    expect(result).toBe(20);
  });
});

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
          const user = yield* Signal.make<User>({ id: 1, name: "Alice" }).pipe(
            Signal.equals((a: User, b: User) => a.id === b.id),
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
          const doubled = count.pipe(Readable.map((n) => n * 2));
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

  it("should be recognized by isSignal", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.make(0);
          return Signal.isSignal(signal);
        }),
      ),
    );
    expect(result).toBe(true);
  });

  it("should be recognized by isReadable", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.make(0);
          return Readable.isReadable(signal);
        }),
      ),
    );
    expect(result).toBe(true);
  });

  it("plain Readable should not be recognized as Signal", () => {
    const readable = Readable.of(42);
    expect(Signal.isSignal(readable)).toBe(false);
    expect(Readable.isReadable(readable)).toBe(true);
  });
});
