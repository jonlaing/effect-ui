import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { $ } from "@effex/dom";
import { Collapsible } from "./Collapsible";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
  );

describe("Collapsible", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({}, [$.div("Content")]),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.children.length).toBe(2);
        }),
      );
    });

    it("should set data-state based on open state", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
          ]);

          expect(el.dataset.state).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: true }, [
            Collapsible.Trigger({}, "Toggle"),
          ]);

          expect(el.dataset.state).toBe("open");
        }),
      );
    });

    it("should support controlled mode", async () => {
      await runTest(
        Effect.gen(function* () {
          const isOpen = yield* Signal.make(true);

          const el = yield* Collapsible.Root({ open: isOpen }, [
            Collapsible.Trigger({}, "Toggle"),
          ]);

          expect(el.dataset.state).toBe("open");

          yield* isOpen.set(false);
          // Give reaction time to run
          yield* Effect.sleep("10 millis");
          expect(el.dataset.state).toBe("closed");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger).not.toBeNull();
          expect(trigger?.textContent).toBe("Toggle");
        }),
      );
    });

    it("should render as div when as='div'", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({ as: "div" }, "Toggle"),
          ]);

          const trigger = el.firstElementChild as HTMLElement;
          expect(trigger.tagName).toBe("DIV");
          expect(trigger.getAttribute("role")).toBe("button");
        }),
      );
    });

    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should have aria-controls pointing to content", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: true }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({}, [$.div("Content")]),
          ]);

          const trigger = el.querySelector("button");
          const content = el.querySelector("[role='region']");
          expect(trigger?.getAttribute("aria-controls")).toBe(content?.id);
        }),
      );
    });

    it("should toggle state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
          ]);

          expect(el.dataset.state).toBe("closed");

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();

          // Give reaction time to run
          yield* Effect.sleep("10 millis");
          expect(el.dataset.state).toBe("open");

          trigger.click();
          yield* Effect.sleep("10 millis");
          expect(el.dataset.state).toBe("closed");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({ class: "my-trigger" }, "Toggle"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });
  });

  describe("Content", () => {
    it("should have data-state='closed' when closed", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({}, [$.div("Content")]),
          ]);

          // Content is always rendered, visibility controlled by CSS via data-state
          const content = el.querySelector("[role='region']");
          expect(content).not.toBeNull();
          expect(content?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should be visible when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: true }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({}, [$.div("Content")]),
          ]);

          const content = el.querySelector("[role='region']");
          expect(content).not.toBeNull();
          expect(content?.textContent).toBe("Content");
        }),
      );
    });

    it("should have role='region'", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: true }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({}, [$.div("Content")]),
          ]);

          const content = el.querySelector("[role='region']");
          expect(content?.getAttribute("role")).toBe("region");
        }),
      );
    });

    it("should always render content (for CSS animations)", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({}, [$.div("Content")]),
          ]);

          // Content should always be in DOM with data-state="closed"
          const content = el.querySelector("[role='region']") as HTMLElement;
          expect(content).not.toBeNull();
          expect(content.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root({ defaultOpen: true }, [
            Collapsible.Trigger({}, "Toggle"),
            Collapsible.Content({ class: "my-content" }, [$.div("Content")]),
          ]);

          const content = el.querySelector("[role='region']");
          expect(content?.className).toBe("my-content");
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should disable the trigger button", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root(
            { defaultOpen: false, disabled: true },
            [Collapsible.Trigger({}, "Toggle")],
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          expect(trigger.disabled).toBe(true);
        }),
      );
    });

    it("should set data-disabled on root", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root(
            { defaultOpen: false, disabled: true },
            [Collapsible.Trigger({}, "Toggle")],
          );

          expect(el.dataset.disabled).toBe("");
        }),
      );
    });

    it("should not toggle when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Collapsible.Root(
            { defaultOpen: false, disabled: true },
            [Collapsible.Trigger({}, "Toggle")],
          );

          expect(el.dataset.state).toBe("closed");

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();

          yield* Effect.sleep("10 millis");
          // Should still be closed
          expect(el.dataset.state).toBe("closed");
        }),
      );
    });
  });

  describe("onOpenChange callback", () => {
    it("should call onOpenChange when toggled", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Collapsible.Root(
            {
              defaultOpen: false,
              onOpenChange: (open) =>
                Effect.sync(() => {
                  changes.push(open);
                }),
            },
            [Collapsible.Trigger({}, "Toggle")],
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
