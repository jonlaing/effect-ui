import { Effect, Fiber, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Readable, Signal } from "@stax-ui/core";

import { t } from "./Template.js";

describe("Template (t)", () => {
  describe("static templates", () => {
    it("should handle template with no interpolations", async () => {
      const readable = await Effect.runPromise(t`Hello, World!`);

      const value = await Effect.runPromise(readable.get);

      expect(value).toBe("Hello, World!");
    });

    it("should handle template with static values", async () => {
      const name = "Alice";
      const count = 42;

      const readable = await Effect.runPromise(
        t`Hello, ${name}! Count: ${count}`,
      );

      const value = await Effect.runPromise(readable.get);

      expect(value).toBe("Hello, Alice! Count: 42");
    });

    it("should have empty changes stream for static templates", async () => {
      const readable = await Effect.runPromise(t`Static template`);

      const changes = await Effect.runPromise(
        readable.changes.pipe(Stream.runCollect),
      );

      expect(Array.from(changes)).toEqual([]);
    });

    it("should have single value in values stream for static templates", async () => {
      const readable = await Effect.runPromise(t`Static value`);

      const values = await Effect.runPromise(
        readable.values.pipe(Stream.take(1), Stream.runCollect),
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

            const readable = yield* t`Hello, ${name}!`;

            const value = yield* readable.get;
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

            const readable = yield* t`Name: ${firstName} ${lastName}`;

            const value = yield* readable.get;
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

            const readable =
              yield* t`You have ${count} ${staticLabel} remaining`;

            const value = yield* readable.get;
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

            const readable = yield* t`Count: ${count}`;

            // Initial value
            const initial = yield* readable.get;
            expect(initial).toBe("Count: 0");

            // Update the signal
            yield* count.set(10);

            // Get updated value
            const updated = yield* readable.get;
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

            const readable = yield* t`Count: ${count}`;

            // Collect first change in a fiber
            const fiber = yield* Effect.fork(
              readable.changes.pipe(Stream.take(1), Stream.runCollect),
            );

            // Yield to allow fiber to start and subscribe to the stream
            yield* Effect.yieldNow();

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

            const readable = yield* t`hello, ${name}!`;
            const upperResult = Readable.map(readable, (s) => s.toUpperCase());

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

            const readable = yield* t`${count}`;
            const doubled = Readable.map(readable, (s) => `${parseInt(s) * 2}`);

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
      const readable = await Effect.runPromise(t``);

      const value = await Effect.runPromise(readable.get);

      expect(value).toBe("");
    });

    it("should handle template with only reactive value", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const value = yield* Signal.make("solo");

            const readable = yield* t`${value}`;

            const str = yield* readable.get;
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

            const readable = yield* t`Number: ${num}`;

            const value = yield* readable.get;
            expect(value).toBe("Number: 123");
          }),
        ),
      );
    });

    it("should handle undefined static values", async () => {
      const undef = undefined;

      const readable = await Effect.runPromise(t`Value: ${undef}`);

      const value = await Effect.runPromise(readable.get);

      // undefined values are omitted in template output
      expect(value).toBe("Value: ");
    });

    it("should handle null static values", async () => {
      const nullVal = null;

      const readable = await Effect.runPromise(t`Value: ${nullVal}`);

      const value = await Effect.runPromise(readable.get);

      expect(value).toBe("Value: null");
    });
  });
});
