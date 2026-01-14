import { Effect, Fiber } from "effect";
import { describe, expect, it } from "vitest";

import { Ref } from "./Ref";

describe("Ref", () => {
  it("should create a ref with null current initially", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLDivElement>();

          expect(ref.current).toBeNull();
        }),
      ),
    );
  });

  it("should update current when set is called", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLDivElement>();
          const div = document.createElement("div");

          ref.set(div);

          expect(ref.current).toBe(div);
        }),
      ),
    );
  });

  it("should resolve value Effect when set is called", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLDivElement>();
          const div = document.createElement("div");

          // Set the element
          ref.set(div);

          // Now value should resolve immediately
          const element = yield* ref.value;

          expect(element).toBe(div);
        }),
      ),
    );
  });

  it("should wait for value when accessed before set", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLInputElement>();
          const input = document.createElement("input");

          let resolved = false;

          // Start waiting for value in background
          const fiber = yield* Effect.fork(
            ref.value.pipe(
              Effect.tap(() =>
                Effect.sync(() => {
                  resolved = true;
                }),
              ),
            ),
          );

          // Not resolved yet
          expect(resolved).toBe(false);

          // Set the element
          ref.set(input);

          // Wait for the fiber to complete
          const element = yield* Fiber.join(fiber);

          expect(resolved).toBe(true);
          expect(element).toBe(input);
        }),
      ),
    );
  });

  it("should work with specific element types", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const inputRef = yield* Ref.make<HTMLInputElement>();
          const buttonRef = yield* Ref.make<HTMLButtonElement>();

          const input = document.createElement("input");
          const button = document.createElement("button");

          inputRef.set(input);
          buttonRef.set(button);

          expect(inputRef.current).toBe(input);
          expect(buttonRef.current).toBe(button);

          const inputEl = yield* inputRef.value;
          const buttonEl = yield* buttonRef.value;

          expect(inputEl.tagName).toBe("INPUT");
          expect(buttonEl.tagName).toBe("BUTTON");
        }),
      ),
    );
  });
});
