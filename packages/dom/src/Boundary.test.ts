import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { Boundary } from "./Boundary";
import { DOMRendererLive } from "./DOMRenderer";
import { div } from "./Element";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Boundary", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("error", () => {
    it("should render content when no error", async () => {
      const el = await runTest(
        Boundary.error(
          () => div("Success"),
          () => div("Error occurred"),
        ),
      );

      expect(el.textContent).toBe("Success");
    });

    it("should render fallback on error", async () => {
      interface TestError {
        readonly _tag: "TestError";
        readonly message: string;
      }

      const makeTestError = (message: string): TestError => ({
        _tag: "TestError",
        message,
      });

      const el = await runTest(
        Boundary.error(
          () =>
            Effect.gen(function* () {
              yield* Effect.fail(makeTestError("oops"));
              return yield* div("Never reached");
            }),
          (error) => div(`Caught: ${error.message}`),
        ),
      );

      expect(el.textContent).toBe("Caught: oops");
    });
  });

  describe("suspense", () => {
    it("should show fallback then content", async () => {
      const el = await runTest(
        Effect.gen(function* () {
          // Create a parent container to hold the slot
          const parent = yield* div([]);
          document.body.appendChild(parent);

          const marker = yield* Boundary.suspense({
            render: () =>
              Effect.gen(function* () {
                yield* Effect.sleep(20);
                return yield* div("Loaded!");
              }),
            fallback: () => div("Loading..."),
          });

          // Append the marker to the parent
          parent.appendChild(marker);

          // Should show fallback initially (content is after the marker)
          expect(parent.textContent).toBe("Loading...");

          // Wait for async content
          yield* Effect.sleep(50);

          // Should now show loaded content
          expect(parent.textContent).toBe("Loaded!");

          return marker;
        }),
      );

      expect(el).toBeTruthy();
    });
  });
});
