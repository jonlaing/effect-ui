import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Boundary } from "./Boundary";
import { div } from "./Element";
import { DOMRendererLive } from "./DOMRenderer";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
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
          const container = yield* Boundary.suspense({
            render: () =>
              Effect.gen(function* () {
                yield* Effect.sleep(20);
                return yield* div("Loaded!");
              }),
            fallback: () => div("Loading..."),
          });

          // Should show fallback initially
          expect(container.textContent).toBe("Loading...");

          // Wait for async content
          yield* Effect.sleep(50);

          // Should now show loaded content
          expect(container.textContent).toBe("Loaded!");

          return container;
        }),
      );

      expect(el).toBeTruthy();
    });
  });
});
