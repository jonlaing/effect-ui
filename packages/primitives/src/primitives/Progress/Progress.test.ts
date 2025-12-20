import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Progress } from "./Progress";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("Progress", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with progressbar role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Progress.Root({ value: 50 }, []);

          expect(el.tagName).toBe("DIV");
          expect(el.getAttribute("role")).toBe("progressbar");
        }),
      );
    });

    it("should have data-progress-root attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Progress.Root({ value: 50 }, []);

          expect(el.getAttribute("data-progress-root")).toBe("");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Progress.Root(
            { value: 50, class: "my-progress" },
            [],
          );

          expect(el.className).toBe("my-progress");
        }),
      );
    });

    describe("ARIA attributes", () => {
      it("should set aria-valuenow for determinate progress", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 50 }, []);

            expect(el.getAttribute("aria-valuenow")).toBe("50");
          }),
        );
      });

      it("should not set aria-valuenow for indeterminate progress", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: null }, []);

            expect(el.getAttribute("aria-valuenow")).toBeNull();
          }),
        );
      });

      it("should set aria-valuemin to 0", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 50 }, []);

            expect(el.getAttribute("aria-valuemin")).toBe("0");
          }),
        );
      });

      it("should set aria-valuemax to max value", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 50, max: 200 }, []);

            expect(el.getAttribute("aria-valuemax")).toBe("200");
          }),
        );
      });

      it("should default max to 100", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 50 }, []);

            expect(el.getAttribute("aria-valuemax")).toBe("100");
          }),
        );
      });

      it("should set aria-valuetext with percentage", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 50 }, []);

            expect(el.getAttribute("aria-valuetext")).toBe("50%");
          }),
        );
      });

      it("should use custom getValueLabel", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root(
              {
                value: 50,
                max: 100,
                getValueLabel: (value, max) =>
                  `${value} of ${max} items complete`,
              },
              [],
            );

            expect(el.getAttribute("aria-valuetext")).toBe(
              "50 of 100 items complete",
            );
          }),
        );
      });
    });

    describe("data-state attribute", () => {
      it("should be 'loading' when value < max", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 50 }, []);

            expect(el.getAttribute("data-state")).toBe("loading");
          }),
        );
      });

      it("should be 'complete' when value >= max", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 100 }, []);

            expect(el.getAttribute("data-state")).toBe("complete");
          }),
        );
      });

      it("should be 'indeterminate' when value is null", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: null }, []);

            expect(el.getAttribute("data-state")).toBe("indeterminate");
          }),
        );
      });
    });

    describe("data-value attribute", () => {
      it("should set data-value for determinate progress", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: 75 }, []);

            expect(el.getAttribute("data-value")).toBe("75");
          }),
        );
      });

      it("should not set data-value for indeterminate progress", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Progress.Root({ value: null }, []);

            expect(el.getAttribute("data-value")).toBeNull();
          }),
        );
      });
    });

    describe("reactive value", () => {
      it("should update when value changes", async () => {
        await runTest(
          Effect.gen(function* () {
            const value = yield* Signal.make<number | null>(25);
            const el = yield* Progress.Root({ value }, []);

            expect(el.getAttribute("aria-valuenow")).toBe("25");
            expect(el.getAttribute("data-state")).toBe("loading");

            yield* value.set(100);
            yield* Effect.sleep("10 millis");

            expect(el.getAttribute("aria-valuenow")).toBe("100");
            expect(el.getAttribute("data-state")).toBe("complete");

            yield* value.set(null);
            yield* Effect.sleep("10 millis");

            expect(el.getAttribute("aria-valuenow")).toBeNull();
            expect(el.getAttribute("data-state")).toBe("indeterminate");
          }),
        );
      });
    });
  });

  describe("Indicator", () => {
    it("should render with data-progress-indicator attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Progress.Root({ value: 50 }, [
            Progress.Indicator({}),
          ]);

          const indicator = el.querySelector("[data-progress-indicator]");
          expect(indicator).not.toBeNull();
          expect(indicator?.tagName).toBe("DIV");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Progress.Root({ value: 50 }, [
            Progress.Indicator({ class: "my-indicator" }),
          ]);

          const indicator = el.querySelector("[data-progress-indicator]");
          expect(indicator?.className).toBe("my-indicator");
        }),
      );
    });

    it("should have transform style based on percentage", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Progress.Root({ value: 50 }, [
            Progress.Indicator({}),
          ]);

          const indicator = el.querySelector(
            "[data-progress-indicator]",
          ) as HTMLElement;
          expect(indicator?.style.transform).toBe("translateX(-50%)");
        }),
      );
    });

    it("should update transform when value changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make<number | null>(25);
          const el = yield* Progress.Root({ value }, [Progress.Indicator({})]);

          const indicator = el.querySelector(
            "[data-progress-indicator]",
          ) as HTMLElement;
          expect(indicator?.style.transform).toBe("translateX(-75%)");

          yield* value.set(75);
          yield* Effect.sleep("10 millis");

          expect(indicator?.style.transform).toBe("translateX(-25%)");

          yield* value.set(100);
          yield* Effect.sleep("10 millis");

          expect(indicator?.style.transform).toBe("translateX(-0%)");
        }),
      );
    });
  });
});
