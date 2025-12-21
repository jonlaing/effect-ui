import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Dialog } from "./Dialog";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Dialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Trigger({}, "Open")]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("button")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Trigger({}, "Open")]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({ defaultOpen: true }, [
            Dialog.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Trigger({}, "Open Dialog"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger).not.toBeNull();
          expect(trigger?.textContent).toBe("Open Dialog");
        }),
      );
    });

    it("should have aria-haspopup=dialog", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Trigger({}, "Open")]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
        }),
      );
    });

    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Trigger({}, "Open")]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should update aria-expanded when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({ defaultOpen: true }, [
            Dialog.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("true");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Trigger({ class: "my-trigger" }, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should open dialog on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Trigger({}, "Open")]);

          const trigger = el.querySelector("button") as HTMLButtonElement;
          expect(trigger.getAttribute("data-state")).toBe("closed");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Close", () => {
    it("should render as button with close data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Close({}, "Close")]);

          const close = el.querySelector("[data-dialog-close]");
          expect(close).not.toBeNull();
          expect(close?.tagName).toBe("BUTTON");
          expect(close?.textContent).toBe("Close");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Close({ class: "my-close" }, "Close"),
          ]);

          const close = el.querySelector("[data-dialog-close]");
          expect(close?.className).toBe("my-close");
        }),
      );
    });

    it("should close dialog on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({ defaultOpen: true }, [
            Dialog.Trigger({}, "Open"),
            Dialog.Close({}, "Close"),
          ]);

          const trigger = el.querySelector("button:not([data-dialog-close])");
          expect(trigger?.getAttribute("data-state")).toBe("open");

          const close = el.querySelector(
            "[data-dialog-close]",
          ) as HTMLButtonElement;
          close.click();
          yield* Effect.sleep("10 millis");

          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });
  });

  describe("Title", () => {
    it("should render as h2 with title data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Title({}, "Edit Profile")]);

          const title = el.querySelector("[data-dialog-title]");
          expect(title).not.toBeNull();
          expect(title?.tagName).toBe("H2");
          expect(title?.textContent).toBe("Edit Profile");
        }),
      );
    });

    it("should have unique id for aria-labelledby", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [Dialog.Title({}, "Edit Profile")]);

          const title = el.querySelector("[data-dialog-title]");
          expect(title?.id).toMatch(/dialog-title-/);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Title({ class: "my-title" }, "Edit Profile"),
          ]);

          const title = el.querySelector("[data-dialog-title]");
          expect(title?.className).toBe("my-title");
        }),
      );
    });
  });

  describe("Description", () => {
    it("should render as p with description data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Description({}, "Make changes to your profile."),
          ]);

          const desc = el.querySelector("[data-dialog-description]");
          expect(desc).not.toBeNull();
          expect(desc?.tagName).toBe("P");
          expect(desc?.textContent).toBe("Make changes to your profile.");
        }),
      );
    });

    it("should have unique id for aria-describedby", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Description({}, "Make changes to your profile."),
          ]);

          const desc = el.querySelector("[data-dialog-description]");
          expect(desc?.id).toMatch(/dialog-description-/);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Dialog.Root({}, [
            Dialog.Description(
              { class: "my-desc" },
              "Make changes to your profile.",
            ),
          ]);

          const desc = el.querySelector("[data-dialog-description]");
          expect(desc?.className).toBe("my-desc");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const open = yield* Signal.make(false);

          const el = yield* Dialog.Root({ open }, [Dialog.Trigger({}, "Open")]);

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

          const el = yield* Dialog.Root(
            {
              onOpenChange: (open) =>
                Effect.sync(() => {
                  changes.push(open);
                }),
            },
            [Dialog.Trigger({}, "Open")],
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);
        }),
      );
    });

    it("should call onOpenChange when close is clicked", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Dialog.Root(
            {
              defaultOpen: true,
              onOpenChange: (open) =>
                Effect.sync(() => {
                  changes.push(open);
                }),
            },
            [Dialog.Close({}, "Close")],
          );

          const close = el.querySelector(
            "[data-dialog-close]",
          ) as HTMLButtonElement;
          close.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([false]);
        }),
      );
    });
  });
});
