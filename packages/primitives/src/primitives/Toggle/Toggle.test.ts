import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Toggle } from "./Toggle";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
  );

describe("Toggle", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("rendering", () => {
    it("should render as a button", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({}, "Toggle me");

          expect(el.tagName).toBe("BUTTON");
          expect(el.getAttribute("type")).toBe("button");
          expect(el.textContent).toBe("Toggle me");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({ class: "my-toggle" }, "Toggle");

          expect(el.className).toBe("my-toggle");
        }),
      );
    });

    it("should apply custom id", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({ id: "my-toggle" }, "Toggle");

          expect(el.id).toBe("my-toggle");
        }),
      );
    });
  });

  describe("uncontrolled mode", () => {
    it("should default to unpressed state", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({}, "Toggle");

          expect(el.getAttribute("data-state")).toBe("off");
          expect(el.getAttribute("aria-pressed")).toBe("false");
        }),
      );
    });

    it("should respect defaultPressed=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({ defaultPressed: true }, "Toggle");

          expect(el.getAttribute("data-state")).toBe("on");
          expect(el.getAttribute("aria-pressed")).toBe("true");
        }),
      );
    });

    it("should toggle state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({ defaultPressed: false }, "Toggle");

          expect(el.getAttribute("data-state")).toBe("off");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("on");
          expect(el.getAttribute("aria-pressed")).toBe("true");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("off");
          expect(el.getAttribute("aria-pressed")).toBe("false");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled state", async () => {
      await runTest(
        Effect.gen(function* () {
          const pressed = yield* Signal.make(true);
          const el = yield* Toggle({ pressed }, "Toggle");

          expect(el.getAttribute("data-state")).toBe("on");

          yield* pressed.set(false);
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("off");
        }),
      );
    });

    it("should update controlled state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const pressed = yield* Signal.make(false);
          const el = yield* Toggle({ pressed }, "Toggle");

          el.click();
          yield* Effect.sleep("10 millis");

          const value = yield* pressed.get;
          expect(value).toBe(true);
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should set disabled attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle({ disabled: true }, "Toggle");

          expect((el as HTMLButtonElement).disabled).toBe(true);
          expect(el.getAttribute("data-disabled")).toBe("");
        }),
      );
    });

    it("should not toggle when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toggle(
            { disabled: true, defaultPressed: false },
            "Toggle",
          );

          expect(el.getAttribute("data-state")).toBe("off");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("off");
        }),
      );
    });

    it("should support reactive disabled state", async () => {
      await runTest(
        Effect.gen(function* () {
          const disabled = yield* Signal.make(false);
          const el = yield* Toggle({ disabled }, "Toggle");

          expect((el as HTMLButtonElement).disabled).toBe(false);

          yield* disabled.set(true);
          yield* Effect.sleep("10 millis");

          expect((el as HTMLButtonElement).disabled).toBe(true);
        }),
      );
    });
  });

  describe("onPressedChange callback", () => {
    it("should call onPressedChange when toggled", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Toggle(
            {
              defaultPressed: false,
              onPressedChange: (pressed) =>
                Effect.sync(() => {
                  changes.push(pressed);
                }),
            },
            "Toggle",
          );

          el.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);

          el.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true, false]);
        }),
      );
    });
  });
});
