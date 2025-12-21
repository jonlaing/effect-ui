import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Popover } from "./Popover";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Popover", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [Popover.Trigger({}, "Open")]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("button")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [Popover.Trigger({}, "Open")]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({ defaultOpen: true }, [
            Popover.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button with popover-trigger data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [
            Popover.Trigger({}, "Open Popover"),
          ]);

          const trigger = el.querySelector("[data-popover-trigger]");
          expect(trigger).not.toBeNull();
          expect(trigger?.tagName).toBe("BUTTON");
          expect(trigger?.textContent).toBe("Open Popover");
        }),
      );
    });

    it("should have aria-haspopup=dialog", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [Popover.Trigger({}, "Open")]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
        }),
      );
    });

    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [Popover.Trigger({}, "Open")]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should update aria-expanded when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({ defaultOpen: true }, [
            Popover.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("true");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [
            Popover.Trigger({ class: "my-trigger" }, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should toggle popover on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [Popover.Trigger({}, "Open")]);

          const trigger = el.querySelector("button") as HTMLButtonElement;
          expect(trigger.getAttribute("data-state")).toBe("closed");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("open");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("closed");
        }),
      );
    });
  });

  describe("Anchor", () => {
    it("should render with anchor data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [
            Popover.Anchor({}, "Anchor point"),
          ]);

          const anchor = el.querySelector("[data-popover-anchor]");
          expect(anchor).not.toBeNull();
          expect(anchor?.tagName).toBe("DIV");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [
            Popover.Anchor({ class: "my-anchor" }, "Anchor"),
          ]);

          const anchor = el.querySelector("[data-popover-anchor]");
          expect(anchor?.className).toBe("my-anchor");
        }),
      );
    });
  });

  describe("Close", () => {
    it("should render as button with close data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [Popover.Close({}, "Close")]);

          const close = el.querySelector("[data-popover-close]");
          expect(close).not.toBeNull();
          expect(close?.tagName).toBe("BUTTON");
          expect(close?.textContent).toBe("Close");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({}, [
            Popover.Close({ class: "my-close" }, "Close"),
          ]);

          const close = el.querySelector("[data-popover-close]");
          expect(close?.className).toBe("my-close");
        }),
      );
    });

    it("should close popover on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Popover.Root({ defaultOpen: true }, [
            Popover.Trigger({}, "Open"),
            Popover.Close({}, "Close"),
          ]);

          const trigger = el.querySelector("[data-popover-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("open");

          const close = el.querySelector(
            "[data-popover-close]",
          ) as HTMLButtonElement;
          close.click();
          yield* Effect.sleep("10 millis");

          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const open = yield* Signal.make(false);

          const el = yield* Popover.Root({ open }, [
            Popover.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("closed");

          yield* open.set(true);
          yield* Effect.sleep("10 millis");

          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("onOpenChange callback", () => {
    it("should call onOpenChange when trigger is clicked", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Popover.Root(
            {
              onOpenChange: (open) =>
                Effect.sync(() => {
                  changes.push(open);
                }),
            },
            [Popover.Trigger({}, "Open")],
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true, false]);
        }),
      );
    });
  });
});
