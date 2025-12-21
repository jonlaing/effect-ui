import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { $ } from "@effex/dom";
import { Tooltip } from "./Tooltip";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Tooltip", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("[data-tooltip-trigger]")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({ defaultOpen: true }, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should use custom delayDuration", async () => {
      await runTest(
        Effect.gen(function* () {
          // Just verify it renders without error with custom delay
          const el = yield* Tooltip.Root({ delayDuration: 300 }, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          expect(el.querySelector("[data-tooltip-trigger]")).not.toBeNull();
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as span wrapper with trigger data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger).not.toBeNull();
          expect(trigger?.tagName).toBe("SPAN");
        }),
      );
    });

    it("should contain children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({}, $.button({}, "Click me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          const button = trigger?.querySelector("button");
          expect(button).not.toBeNull();
          expect(button?.textContent).toBe("Click me");
        }),
      );
    });

    it("should have data-state attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should update data-state when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({ defaultOpen: true }, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({ class: "my-trigger" }, $.button({}, "Hover")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should have aria-describedby when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({ defaultOpen: true }, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("aria-describedby")).toMatch(
            /tooltip-content-/,
          );
        }),
      );
    });

    it("should not have aria-describedby when closed", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tooltip.Root({}, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("aria-describedby")).toBeNull();
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const open = yield* Signal.make(false);

          const el = yield* Tooltip.Root({ open }, [
            Tooltip.Trigger({}, $.button({}, "Hover me")),
          ]);

          const trigger = el.querySelector("[data-tooltip-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");

          yield* open.set(true);
          yield* Effect.sleep("10 millis");

          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("onOpenChange callback", () => {
    it("should call onOpenChange when internal state changes via focus", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Tooltip.Root(
            {
              onOpenChange: (isOpen) =>
                Effect.sync(() => {
                  changes.push(isOpen);
                }),
            },
            [Tooltip.Trigger({}, $.button({}, "Hover me"))],
          );

          // Focus the trigger to open tooltip (focus opens immediately)
          const trigger = el.querySelector(
            "[data-tooltip-trigger]",
          ) as HTMLElement;
          trigger.dispatchEvent(new FocusEvent("focus"));
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);

          // Blur to close
          trigger.dispatchEvent(new FocusEvent("blur"));
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true, false]);
        }),
      );
    });
  });
});
