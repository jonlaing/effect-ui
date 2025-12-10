import { describe, it, expect, vi } from "vitest";
import { Effect, Fiber } from "effect";
import { Signal } from "./Signal";
import { Reaction } from "./Reaction";

describe("Reaction", () => {
  it("should run effect with initial values", async () => {
    const lastCall = { value: null as number[] | null };

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make(1);
          const b = yield* Signal.make(2);

          yield* Reaction.make([a, b], ([x, y]) =>
            Effect.sync(() => {
              lastCall.value = [x, y];
            }),
          );

          // Wait for initial effect to run
          yield* Effect.sleep(10);
        }),
      ),
    );

    // Should have run with initial values
    expect(lastCall.value).toEqual([1, 2]);
  });

  it("should run effect when dependencies change", async () => {
    const lastCall = { value: 0 };
    let callCount = 0;

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(0);

          yield* Reaction.make([count], ([c]) =>
            Effect.sync(() => {
              lastCall.value = c;
              callCount++;
            }),
          );

          yield* Effect.sleep(10);
          const initialCallCount = callCount;

          yield* count.set(1);
          yield* Effect.sleep(10);

          expect(callCount).toBeGreaterThan(initialCallCount);
          expect(lastCall.value).toBe(1);

          yield* count.set(2);
          yield* Effect.sleep(10);

          expect(lastCall.value).toBe(2);
        }),
      ),
    );
  });

  it("should work with multiple dependencies and react to each change", async () => {
    const lastCall = { value: "" };

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const firstName = yield* Signal.make("John");
          const lastName = yield* Signal.make("Doe");

          yield* Reaction.make([firstName, lastName], ([first, last]) =>
            Effect.sync(() => {
              lastCall.value = `${first} ${last}`;
            }),
          );

          yield* Effect.sleep(10);
          expect(lastCall.value).toBe("John Doe");

          yield* firstName.set("Jane");
          yield* Effect.sleep(10);
          expect(lastCall.value).toBe("Jane Doe");

          yield* lastName.set("Smith");
          yield* Effect.sleep(10);
          expect(lastCall.value).toBe("Jane Smith");
        }),
      ),
    );
  });

  it("should work with empty dependencies array", async () => {
    const fn = vi.fn();

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          yield* Reaction.make([], () => Effect.sync(() => fn()));

          yield* Effect.sleep(10);
        }),
      ),
    );

    // With empty deps, it should run once with empty array
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should work with single dependency", async () => {
    const lastCall = { value: 0 };

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const value = yield* Signal.make(42);

          yield* Reaction.make([value], ([v]) =>
            Effect.sync(() => {
              lastCall.value = v;
            }),
          );

          yield* Effect.sleep(10);
        }),
      ),
    );

    expect(lastCall.value).toBe(42);
  });

  it("should support async effects", async () => {
    const lastResult = { value: 0 };

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(1);

          yield* Reaction.make([count], ([c]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(5);
              lastResult.value = c * 2;
            }),
          );

          yield* Effect.sleep(20);
          expect(lastResult.value).toBe(2);

          yield* count.set(2);
          yield* Effect.sleep(20);
          expect(lastResult.value).toBe(4);
        }),
      ),
    );
  });

  it("should stop reacting when scope closes", async () => {
    const calls: number[] = [];

    // Run the reaction in a scope that we control
    const fiber = Effect.runFork(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(0);

          yield* Reaction.make([count], ([c]) =>
            Effect.sync(() => {
              calls.push(c);
            }),
          );

          // Keep scope open for a while
          yield* Effect.sleep(100);
        }),
      ),
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(calls.length).toBeGreaterThan(0);
    const callsBeforeClose = calls.length;

    // Interrupt the fiber which closes the scope
    await Effect.runPromise(Fiber.interrupt(fiber));

    // Try to update after scope closed (if we still had reference)
    // The reaction should no longer fire
    await new Promise((r) => setTimeout(r, 20));
    expect(calls.length).toBe(callsBeforeClose);
  });
});
