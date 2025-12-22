import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Image } from "./Image";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Image", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render a span element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, []);

          expect(el.tagName).toBe("SPAN");
        }),
      );
    });

    it("should have data-image-root attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, []);

          expect(el.getAttribute("data-image-root")).toBe("");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({ class: "my-image" }, []);

          expect(el.className).toBe("my-image");
        }),
      );
    });

    it("should start with idle status", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, []);

          expect(el.getAttribute("data-state")).toBe("idle");
        }),
      );
    });
  });

  describe("Img", () => {
    it("should render an img element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test image" }),
          ]);

          const img = el.querySelector("img");
          expect(img).not.toBeNull();
          expect(img?.getAttribute("alt")).toBe("Test image");
        }),
      );
    });

    it("should have data-image-img attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
          ]);

          const img = el.querySelector("[data-image-img]");
          expect(img).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test", class: "my-img" }),
          ]);

          const img = el.querySelector("img");
          expect(img?.className).toBe("my-img");
        }),
      );
    });

    it("should set loading status when src is provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
          ]);

          yield* Effect.sleep("10 millis");
          expect(el.getAttribute("data-state")).toBe("loading");
        }),
      );
    });

    it("should set loaded status when image loads", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
          ]);

          const img = el.querySelector("img") as HTMLImageElement;
          yield* Effect.sleep("10 millis");

          // Simulate load event
          img.dispatchEvent(new Event("load"));
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("loaded");
        }),
      );
    });

    it("should set error status when image fails to load", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "invalid.jpg", alt: "Test" }),
          ]);

          const img = el.querySelector("img") as HTMLImageElement;
          yield* Effect.sleep("10 millis");

          // Simulate error event
          img.dispatchEvent(new Event("error"));
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("error");
        }),
      );
    });

    it("should hide image until loaded", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
          ]);

          const img = el.querySelector("img") as HTMLImageElement;
          yield* Effect.sleep("10 millis");

          // Before load - should be hidden
          expect(img.style.position).toBe("absolute");
          expect(img.style.opacity).toBe("0");

          // Simulate load
          img.dispatchEvent(new Event("load"));
          yield* Effect.sleep("10 millis");

          // After load - should be visible
          expect(img.style.position).toBe("");
        }),
      );
    });

    it("should reset to loading when src changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const src = yield* Signal.make("first.jpg");
          const el = yield* Image.Root({}, [Image.Img({ src, alt: "Test" })]);

          const img = el.querySelector("img") as HTMLImageElement;
          yield* Effect.sleep("10 millis");

          // Simulate first image load
          img.dispatchEvent(new Event("load"));
          yield* Effect.sleep("10 millis");
          expect(el.getAttribute("data-state")).toBe("loaded");

          // Change src
          yield* src.set("second.jpg");
          yield* Effect.sleep("10 millis");

          // Should be loading again
          expect(el.getAttribute("data-state")).toBe("loading");
        }),
      );
    });
  });

  describe("Fallback", () => {
    it("should render a span element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
            Image.Fallback({}, "FB"),
          ]);

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback).not.toBeNull();
          expect(fallback?.tagName).toBe("SPAN");
        }),
      );
    });

    it("should have data-image-fallback attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
            Image.Fallback({}, "FB"),
          ]);

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
            Image.Fallback({ class: "my-fallback" }, "FB"),
          ]);

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback?.className).toBe("my-fallback");
        }),
      );
    });

    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
            Image.Fallback({}, "JD"),
          ]);

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback?.textContent).toBe("JD");
        }),
      );
    });

    it("should be visible when loading", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
            Image.Fallback({}, "FB"),
          ]);

          yield* Effect.sleep("10 millis");

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback?.getAttribute("data-state")).toBe("visible");
        }),
      );
    });

    it("should be hidden when image loads", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "test.jpg", alt: "Test" }),
            Image.Fallback({}, "FB"),
          ]);

          const img = el.querySelector("img") as HTMLImageElement;
          yield* Effect.sleep("10 millis");

          // Simulate load
          img.dispatchEvent(new Event("load"));
          yield* Effect.sleep("10 millis");

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback?.getAttribute("data-state")).toBe("hidden");
        }),
      );
    });

    it("should remain visible on error", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Image.Root({}, [
            Image.Img({ src: "invalid.jpg", alt: "Test" }),
            Image.Fallback({}, "FB"),
          ]);

          const img = el.querySelector("img") as HTMLImageElement;
          yield* Effect.sleep("10 millis");

          // Simulate error
          img.dispatchEvent(new Event("error"));
          yield* Effect.sleep("10 millis");

          const fallback = el.querySelector("[data-image-fallback]");
          expect(fallback?.getAttribute("data-state")).toBe("visible");
        }),
      );
    });

    describe("delayMs", () => {
      it("should not show fallback before delay", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Image.Root({}, [
              Image.Img({ src: "test.jpg", alt: "Test" }),
              Image.Fallback({ delayMs: 100 }, "FB"),
            ]);

            yield* Effect.sleep("10 millis");

            const fallback = el.querySelector("[data-image-fallback]");
            expect(fallback?.getAttribute("data-state")).toBe("hidden");
          }),
        );
      });

      it("should show fallback after delay", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Image.Root({}, [
              Image.Img({ src: "test.jpg", alt: "Test" }),
              Image.Fallback({ delayMs: 50 }, "FB"),
            ]);

            yield* Effect.sleep("100 millis");

            const fallback = el.querySelector("[data-image-fallback]");
            expect(fallback?.getAttribute("data-state")).toBe("visible");
          }),
        );
      });

      it("should not show fallback if image loads before delay", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* Image.Root({}, [
              Image.Img({ src: "test.jpg", alt: "Test" }),
              Image.Fallback({ delayMs: 200 }, "FB"),
            ]);

            const img = el.querySelector("img") as HTMLImageElement;
            yield* Effect.sleep("10 millis");

            // Image loads quickly before delay
            img.dispatchEvent(new Event("load"));
            yield* Effect.sleep("10 millis");

            // Even after delay would have passed, fallback stays hidden
            yield* Effect.sleep("250 millis");

            const fallback = el.querySelector("[data-image-fallback]");
            expect(fallback?.getAttribute("data-state")).toBe("hidden");
          }),
        );
      });
    });
  });
});
