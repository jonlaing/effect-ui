import { describe, it, expect } from "vitest";
import { Effect, Fiber, Stream } from "effect";
import { Signal } from "@core/Signal";
import { t } from "./Template";

describe("Template (t)", () => {
  describe("static templates", () => {
    it("should handle template with no interpolations", async () => {
      const result = t`Hello, World!`;

      const value = await Effect.runPromise(result.get);

      expect(value).toBe("Hello, World!");
    });

    it("should handle template with static values", async () => {
      const name = "Alice";
      const count = 42;

      const result = t`Hello, ${name}! Count: ${count}`;

      const value = await Effect.runPromise(result.get);

      expect(value).toBe("Hello, Alice! Count: 42");
    });

    it("should have empty changes stream for static templates", async () => {
      const result = t`Static template`;

      const changes = await Effect.runPromise(
        result.changes.pipe(Stream.runCollect),
      );

      expect(Array.from(changes)).toEqual([]);
    });

    it("should have single value in values stream for static templates", async () => {
      const result = t`Static value`;

      const values = await Effect.runPromise(
        result.values.pipe(Stream.take(1), Stream.runCollect),
      );

      expect(Array.from(values)).toEqual(["Static value"]);
    });
  });

  describe("reactive templates", () => {
    it("should handle template with single reactive value", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const name = yield* Signal.make("World");

            const result = t`Hello, ${name}!`;

            const value = yield* result.get;
            expect(value).toBe("Hello, World!");
          }),
        ),
      );
    });

    it("should handle template with multiple reactive values", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const firstName = yield* Signal.make("John");
            const lastName = yield* Signal.make("Doe");

            const result = t`Name: ${firstName} ${lastName}`;

            const value = yield* result.get;
            expect(value).toBe("Name: John Doe");
          }),
        ),
      );
    });

    it("should handle mixed static and reactive values", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(5);
            const staticLabel = "items";

            const result = t`You have ${count} ${staticLabel} remaining`;

            const value = yield* result.get;
            expect(value).toBe("You have 5 items remaining");
          }),
        ),
      );
    });

    it("should update when reactive value changes", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(0);

            const result = t`Count: ${count}`;

            // Initial value
            const initial = yield* result.get;
            expect(initial).toBe("Count: 0");

            // Update the signal
            yield* count.set(10);

            // Get updated value
            const updated = yield* result.get;
            expect(updated).toBe("Count: 10");
          }),
        ),
      );
    });

    it("should emit changes when reactive values update", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(0);

            const result = t`Count: ${count}`;

            // Collect first change in a fiber
            const fiber = yield* Effect.fork(
              result.changes.pipe(Stream.take(1), Stream.runCollect),
            );

            // Update the signal
            yield* count.set(42);

            const changes = yield* Fiber.join(fiber);
            expect(Array.from(changes)).toEqual(["Count: 42"]);
          }),
        ),
      );
    });
  });

  describe("map", () => {
    it("should support mapping over template result", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const name = yield* Signal.make("world");

            const result = t`hello, ${name}!`;
            const upperResult = result.map((s) => s.toUpperCase());

            const value = yield* upperResult.get;
            expect(value).toBe("HELLO, WORLD!");
          }),
        ),
      );
    });

    it("should propagate changes through map", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(1);

            const result = t`${count}`;
            const doubled = result.map((s) => `${parseInt(s) * 2}`);

            yield* count.set(5);

            const value = yield* doubled.get;
            expect(value).toBe("10");
          }),
        ),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty template", async () => {
      const result = t``;

      const value = await Effect.runPromise(result.get);

      expect(value).toBe("");
    });

    it("should handle template with only reactive value", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const value = yield* Signal.make("solo");

            const result = t`${value}`;

            const str = yield* result.get;
            expect(str).toBe("solo");
          }),
        ),
      );
    });

    it("should handle numbers in reactive values", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const num = yield* Signal.make(123);

            const result = t`Number: ${num}`;

            const value = yield* result.get;
            expect(value).toBe("Number: 123");
          }),
        ),
      );
    });

    it("should handle undefined static values", async () => {
      const undef = undefined;

      const result = t`Value: ${undef}`;

      const value = await Effect.runPromise(result.get);

      // undefined values are omitted in template output
      expect(value).toBe("Value: ");
    });

    it("should handle null static values", async () => {
      const nullVal = null;

      const result = t`Value: ${nullVal}`;

      const value = await Effect.runPromise(result.get);

      expect(value).toBe("Value: null");
    });
  });
});
