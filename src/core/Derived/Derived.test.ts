import { describe, it, expect } from "vitest";
import { Effect, Stream } from "effect";
import { Signal } from "../Signal";
import { Derived } from "./Derived";

describe("Derived.sync", () => {
  it("should compute derived value from single dependency", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          const doubled = yield* Derived.sync([count], ([n]) => n * 2);
          return yield* doubled.get;
        }),
      ),
    );
    expect(result).toBe(10);
  });

  it("should compute derived value from multiple dependencies", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make(3);
          const b = yield* Signal.make(4);
          const sum = yield* Derived.sync([a, b], ([x, y]) => x + y);
          return yield* sum.get;
        }),
      ),
    );
    expect(result).toBe(7);
  });

  it("should chain derived values", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(2);
          const doubled = yield* Derived.sync([count], ([n]) => n * 2);
          const quadrupled = yield* Derived.sync([doubled], ([n]) => n * 2);

          return yield* quadrupled.get;
        }),
      ),
    );
    expect(result).toBe(8);
  });

  it("should update nested Derived without glitches when base signal changes", async () => {
    // This test verifies the fix for the "glitch" problem where a Derived
    // depending on another Derived would see stale values during updates
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make(10);
          const b = yield* Signal.make(100);

          // derived1 depends on a and b
          const derived1 = yield* Derived.sync(
            [a, b],
            ([aVal, bVal]) => (aVal / bVal) * 100,
          );

          // derived2 depends on a AND derived1
          // When 'a' changes, both should update consistently
          const derived2 = yield* Derived.sync(
            [a, derived1],
            ([aVal, d1Val]) => ({ a: aVal, d1: d1Val, sum: aVal + d1Val }),
          );

          // Subscribe to derived2's stream and collect unique emissions
          // (duplicates can occur when changes propagate through multiple paths)
          const emissions: { a: number; d1: number; sum: number }[] = [];
          const seenKeys = new Set<string>();
          yield* Stream.runForEach(
            derived2.values,
            (val) =>
              Effect.sync(() => {
                const key = `${val.a}:${val.d1}:${val.sum}`;
                if (!seenKeys.has(key)) {
                  seenKeys.add(key);
                  emissions.push(val);
                }
              }),
          ).pipe(Effect.fork);

          yield* Effect.sleep("50 millis");

          // Update 'a' - this should NOT cause derived2 to see stale derived1 value
          yield* a.set(20);
          yield* Effect.sleep("50 millis");

          // Update 'b' - derived1 changes, derived2 should see the new value
          yield* b.set(200);
          yield* Effect.sleep("50 millis");

          return emissions;
        }),
      ),
    );

    // Initial emission
    expect(result[0]).toEqual({ a: 10, d1: 10, sum: 20 });

    // After a=20: derived1 = (20/100)*100 = 20, derived2 should see d1=20
    // CRITICAL: If there's a glitch, we'd see d1=10 (stale value) instead
    expect(result[1]).toEqual({ a: 20, d1: 20, sum: 40 });

    // After b=200: derived1 = (20/200)*100 = 10, derived2 should see d1=10
    expect(result[2]).toEqual({ a: 20, d1: 10, sum: 30 });
  });

  it("should map derived values", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(5);
          const doubled = yield* Derived.sync([count], ([n]) => n * 2);
          const asString = doubled.map((n) => `Value: ${n}`);

          return yield* asString.get;
        }),
      ),
    );
    expect(result).toBe("Value: 10");
  });

  it("should compute with complex transformation", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const items = yield* Signal.make([1, 2, 3, 4, 5]);
          const stats = yield* Derived.sync([items], ([arr]) => ({
            sum: arr.reduce((a, b) => a + b, 0),
            count: arr.length,
            avg: arr.reduce((a, b) => a + b, 0) / arr.length,
          }));

          return yield* stats.get;
        }),
      ),
    );
    expect(result).toEqual({ sum: 15, count: 5, avg: 3 });
  });
});

describe("Derived.async", () => {
  it("should handle async computation", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const userId = yield* Signal.make(1);

          const userData = yield* Derived.async([userId], ([id]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(10);
              return { id, name: `User ${id}` };
            }),
          );

          // Wait for initial computation
          yield* Effect.sleep(50);

          const state = yield* userData.get;
          return state.value;
        }),
      ),
    );

    expect(result._tag).toBe("Some");
    if (result._tag === "Some") {
      expect(result.value).toEqual({ id: 1, name: "User 1" });
    }
  });

  it("should track loading state", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const userId = yield* Signal.make(1);

          const userData = yield* Derived.async([userId], ([id]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(100);
              return { id, name: `User ${id}` };
            }),
          );

          // After computation completes
          yield* Effect.sleep(150);
          const state = yield* userData.get;
          return {
            isLoading: state.isLoading,
            hasValue: state.value._tag === "Some",
          };
        }),
      ),
    );

    expect(result).toEqual({ isLoading: false, hasValue: true });
  });

  it("should map async derived values", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const num = yield* Signal.make(5);

          const asyncDouble = yield* Derived.async([num], ([n]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(10);
              return n * 2;
            }),
          );

          yield* Effect.sleep(50);

          const mapped = asyncDouble.map((state) =>
            state.value._tag === "Some" ? state.value.value : 0,
          );

          return yield* mapped.get;
        }),
      ),
    );

    expect(result).toBe(10);
  });
});
