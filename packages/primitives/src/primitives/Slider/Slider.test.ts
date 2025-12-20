import { describe, it, expect, beforeEach } from "vitest";
import { Effect, Scope } from "effect";
import { Signal, DOMRendererLive, RendererContext } from "@effex/dom";
import { Slider } from "./Slider";

const runTest = <A>(
  effect: Effect.Effect<A, never, RendererContext | Scope.Scope>,
) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("Slider", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with slider data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, []);

          expect(el.tagName).toBe("DIV");
          expect(el.getAttribute("data-slider-root")).toBe("");
        }),
      );
    });

    it("should set data-orientation to horizontal by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, []);

          expect(el.getAttribute("data-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should set data-orientation to vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: 50, orientation: "vertical" },
            [],
          );

          expect(el.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: 50, class: "my-slider" },
            [],
          );

          expect(el.className).toBe("my-slider");
        }),
      );
    });

    it("should set aria-label", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: 50, "aria-label": "Volume" },
            [],
          );

          expect(el.getAttribute("aria-label")).toBe("Volume");
        }),
      );
    });

    it("should create hidden input when name is provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: 50, name: "volume" },
            [],
          );

          const input = el.querySelector(
            "input[type='hidden']",
          ) as HTMLInputElement;
          expect(input).not.toBeNull();
          expect(input?.name).toBe("volume");
          expect(input?.value).toBe("50");
        }),
      );
    });
  });

  describe("Track", () => {
    it("should render with track data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Track({}),
          ]);

          const track = el.querySelector("[data-slider-track]");
          expect(track).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Track({ class: "my-track" }),
          ]);

          const track = el.querySelector("[data-slider-track]");
          expect(track?.className).toBe("my-track");
        }),
      );
    });
  });

  describe("Range", () => {
    it("should render with range data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Track({}, [Slider.Range({})]),
          ]);

          const range = el.querySelector("[data-slider-range]");
          expect(range).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Track({}, [Slider.Range({ class: "my-range" })]),
          ]);

          const range = el.querySelector("[data-slider-range]");
          expect(range?.className).toBe("my-range");
        }),
      );
    });
  });

  describe("Thumb", () => {
    it("should render with slider role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb).not.toBeNull();
        }),
      );
    });

    it("should have aria-valuenow", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-valuenow")).toBe("50");
        }),
      );
    });

    it("should have aria-valuemin and aria-valuemax", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: 50, min: 0, max: 100 },
            [Slider.Thumb({})],
          );

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-valuemin")).toBe("0");
          expect(thumb?.getAttribute("aria-valuemax")).toBe("100");
        }),
      );
    });

    it("should have aria-orientation", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Thumb({ class: "my-thumb" }),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.className).toBe("my-thumb");
        }),
      );
    });

    it("should set aria-label", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Thumb({ "aria-label": "Volume control" }),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-label")).toBe("Volume control");
        }),
      );
    });

    it("should have role=slider", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50 }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("role")).toBe("slider");
        }),
      );
    });
  });

  describe("range mode", () => {
    it("should support range values", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: [25, 75] }, [
            Slider.Thumb({ "aria-label": "Min" }),
            Slider.Thumb({ "aria-label": "Max" }),
          ]);

          const thumbs = el.querySelectorAll("[role='slider']");
          expect(thumbs.length).toBe(2);
          expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("25");
          expect(thumbs[1]?.getAttribute("aria-valuenow")).toBe("75");
        }),
      );
    });

    it("should format range value for hidden input", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: [25, 75], name: "price-range" },
            [],
          );

          const input = el.querySelector(
            "input[type='hidden']",
          ) as HTMLInputElement;
          expect(input?.value).toBe("25,75");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make(30);

          const el = yield* Slider.Root({ value }, [Slider.Thumb({})]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-valuenow")).toBe("30");

          yield* value.set(70);
          yield* Effect.sleep("10 millis");

          expect(thumb?.getAttribute("aria-valuenow")).toBe("70");
        }),
      );
    });
  });

  describe("min/max/step", () => {
    it("should allow values outside min/max for defaultValue", async () => {
      await runTest(
        Effect.gen(function* () {
          // defaultValue is not clamped, but displayed as-is
          const el = yield* Slider.Root(
            { defaultValue: -10, min: 0, max: 100 },
            [Slider.Thumb({})],
          );

          const thumb = el.querySelector("[role='slider']");
          // The initial value is used as-is (clamping happens on user interaction)
          expect(thumb?.getAttribute("aria-valuenow")).toBe("-10");
        }),
      );
    });

    it("should use custom min and max", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root(
            { defaultValue: 500, min: 100, max: 1000 },
            [Slider.Thumb({})],
          );

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-valuemin")).toBe("100");
          expect(thumb?.getAttribute("aria-valuemax")).toBe("1000");
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should set aria-disabled on thumb", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50, disabled: true }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("aria-disabled")).toBe("true");
        }),
      );
    });

    it("should set data-disabled on thumb", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50, disabled: true }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });

    it("should not be focusable when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Slider.Root({ defaultValue: 50, disabled: true }, [
            Slider.Thumb({}),
          ]);

          const thumb = el.querySelector("[role='slider']");
          expect(thumb?.getAttribute("tabindex")).toBe("-1");
        }),
      );
    });
  });
});
