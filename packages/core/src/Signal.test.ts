import { Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Readable } from "./Readable.js";
import { Signal } from "./Signal.js";

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

describe("Signal reactivity", () => {
  it("should emit values on the values stream after set", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);

          const emissions: number[] = [];
          yield* Stream.runForEach(sig.values, (val) =>
            Effect.sync(() => {
              emissions.push(val);
            }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("20 millis");

          yield* sig.set(1);
          yield* Effect.sleep("20 millis");

          yield* sig.set(2);
          yield* Effect.sleep("20 millis");

          yield* sig.set(3);
          yield* Effect.sleep("20 millis");

          expect(emissions).toEqual([0, 1, 2, 3]);
        }),
      ),
    );
  });

  it("should emit only future changes on the changes stream (not current value)", async () => {
    // Note: Signal.changes does NOT include the current value - only future changes.
    // Use Signal.values if you need the current value followed by changes.
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);

          const emissions: number[] = [];
          yield* Stream.runForEach(sig.changes, (val) =>
            Effect.sync(() => {
              emissions.push(val);
            }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("20 millis");

          yield* sig.set(1);
          yield* Effect.sleep("20 millis");

          yield* sig.set(2);
          yield* Effect.sleep("20 millis");

          // changes only includes future changes (1, 2), not the current value (0)
          expect(emissions).toEqual([1, 2]);
        }),
      ),
    );
  });

  it("should support multiple subscribers", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);

          const emissions1: number[] = [];
          const emissions2: number[] = [];

          yield* Stream.runForEach(sig.values, (val) =>
            Effect.sync(() => {
              emissions1.push(val);
            }),
          ).pipe(Effect.fork);

          yield* Stream.runForEach(sig.values, (val) =>
            Effect.sync(() => {
              emissions2.push(val);
            }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("20 millis");

          yield* sig.set(1);
          yield* Effect.sleep("20 millis");

          yield* sig.set(2);
          yield* Effect.sleep("20 millis");

          expect(emissions1).toEqual([0, 1, 2]);
          expect(emissions2).toEqual([0, 1, 2]);
        }),
      ),
    );
  });

  it("should handle rapid sequential updates", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);

          const emissions: number[] = [];
          yield* Stream.runForEach(sig.values, (val) =>
            Effect.sync(() => {
              emissions.push(val);
            }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("10 millis");

          // Rapid updates
          for (let i = 1; i <= 10; i++) {
            yield* sig.set(i);
          }

          yield* Effect.sleep("50 millis");

          // Should have initial + all 10 updates
          expect(emissions.length).toBe(11);
          expect(emissions[0]).toBe(0);
          expect(emissions[10]).toBe(10);
        }),
      ),
    );
  });

  it("should properly clean up subscriptions when scope closes", async () => {
    let emissionsAfterScopeClose = 0;
    const sig = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);

          yield* Stream.runForEach(sig.values, (_val) =>
            Effect.sync(() => {
              emissionsAfterScopeClose++;
            }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("10 millis");
          yield* sig.set(1);
          yield* Effect.sleep("10 millis");

          // Return the ref (not the signal since it's scope-bound)
          return sig;
        }),
      ),
    );

    // Scope closed, subscription should be cleaned up
    const countBeforeSet = emissionsAfterScopeClose;

    // This set should NOT trigger the subscription (it was cleaned up)
    await Effect.runPromise(sig.set(99));
    await new Promise((r) => setTimeout(r, 50));

    // The subscription should NOT have received the value after scope closed
    // Note: This tests that forked fibers are properly interrupted on scope close
    expect(emissionsAfterScopeClose).toBe(countBeforeSet);
  });
});

describe("Signal memory stress tests", () => {
  it("should handle many signals in sequence without memory issues", async () => {
    // Create and destroy many signals in sequence
    for (let i = 0; i < 50; i++) {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const sig = yield* Signal.make(i);
            const emissions: number[] = [];

            yield* Stream.runForEach(sig.values, (val) =>
              Effect.sync(() => {
                emissions.push(val);
              }),
            ).pipe(Effect.fork);

            yield* Effect.sleep("5 millis");
            yield* sig.set(i + 1);
            yield* Effect.sleep("5 millis");

            expect(emissions).toEqual([i, i + 1]);
          }),
        ),
      );
    }
    // If we get here without heap overflow, the test passes
    expect(true).toBe(true);
  });

  it("should handle many subscriptions without memory issues", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);
          const allEmissions: number[][] = [];

          // Create 20 subscribers
          for (let i = 0; i < 20; i++) {
            const emissions: number[] = [];
            allEmissions.push(emissions);

            yield* Stream.runForEach(sig.values, (val) =>
              Effect.sync(() => {
                emissions.push(val);
              }),
            ).pipe(Effect.fork);
          }

          yield* Effect.sleep("20 millis");

          // Update the signal
          yield* sig.set(1);
          yield* Effect.sleep("20 millis");

          yield* sig.set(2);
          yield* Effect.sleep("20 millis");

          // All subscribers should have received the values
          for (const emissions of allEmissions) {
            expect(emissions).toEqual([0, 1, 2]);
          }
        }),
      ),
    );
  });

  it("should handle many updates without memory issues", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);
          const emissions: number[] = [];

          yield* Stream.runForEach(sig.values, (val) =>
            Effect.sync(() => {
              emissions.push(val);
            }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("10 millis");

          // Many updates
          for (let i = 1; i <= 100; i++) {
            yield* sig.set(i);
          }

          yield* Effect.sleep("50 millis");

          // Should have initial + 100 updates
          expect(emissions.length).toBe(101);
          expect(emissions[0]).toBe(0);
          expect(emissions[100]).toBe(100);
        }),
      ),
    );
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
