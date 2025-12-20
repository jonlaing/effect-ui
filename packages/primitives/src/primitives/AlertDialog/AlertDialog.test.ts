import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { AlertDialog } from "./AlertDialog";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("AlertDialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({}, "Open"),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("button")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({ defaultOpen: true }, [
            AlertDialog.Trigger({}, "Open"),
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
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({}, "Delete"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger).not.toBeNull();
          expect(trigger?.textContent).toBe("Delete");
        }),
      );
    });

    it("should have aria-haspopup=alertdialog", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({}, "Delete"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("alertdialog");
        }),
      );
    });

    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({}, "Delete"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({ class: "my-trigger" }, "Delete"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should open dialog on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Trigger({}, "Delete"),
          ]);

          const trigger = el.querySelector("button") as HTMLButtonElement;
          expect(trigger.getAttribute("data-state")).toBe("closed");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Cancel", () => {
    it("should render as button with cancel data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({ defaultOpen: true }, [
            AlertDialog.Cancel({}, "Cancel"),
          ]);

          const cancel = el.querySelector("[data-alertdialog-cancel]");
          expect(cancel).not.toBeNull();
          expect(cancel?.tagName).toBe("BUTTON");
          expect(cancel?.textContent).toBe("Cancel");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Cancel({ class: "my-cancel" }, "Cancel"),
          ]);

          const cancel = el.querySelector("[data-alertdialog-cancel]");
          expect(cancel?.className).toBe("my-cancel");
        }),
      );
    });
  });

  describe("Action", () => {
    it("should render as button with action data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Action({}, "Delete"),
          ]);

          const action = el.querySelector("[data-alertdialog-action]");
          expect(action).not.toBeNull();
          expect(action?.tagName).toBe("BUTTON");
          expect(action?.textContent).toBe("Delete");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Action({ class: "my-action" }, "Delete"),
          ]);

          const action = el.querySelector("[data-alertdialog-action]");
          expect(action?.className).toBe("my-action");
        }),
      );
    });

    it("should call onClick callback", async () => {
      await runTest(
        Effect.gen(function* () {
          const clicks: string[] = [];

          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Action(
              {
                onClick: () =>
                  Effect.sync(() => {
                    clicks.push("clicked");
                  }),
              },
              "Delete",
            ),
          ]);

          const action = el.querySelector(
            "[data-alertdialog-action]",
          ) as HTMLButtonElement;
          action.click();
          yield* Effect.sleep("10 millis");

          expect(clicks).toEqual(["clicked"]);
        }),
      );
    });
  });

  describe("Title", () => {
    it("should render as h2 with title data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Title({}, "Are you sure?"),
          ]);

          const title = el.querySelector("[data-alertdialog-title]");
          expect(title).not.toBeNull();
          expect(title?.tagName).toBe("H2");
          expect(title?.textContent).toBe("Are you sure?");
        }),
      );
    });

    it("should have unique id for aria-labelledby", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Title({}, "Are you sure?"),
          ]);

          const title = el.querySelector("[data-alertdialog-title]");
          expect(title?.id).toMatch(/alertdialog-title-/);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Title({ class: "my-title" }, "Are you sure?"),
          ]);

          const title = el.querySelector("[data-alertdialog-title]");
          expect(title?.className).toBe("my-title");
        }),
      );
    });
  });

  describe("Description", () => {
    it("should render as p with description data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Description({}, "This action cannot be undone."),
          ]);

          const desc = el.querySelector("[data-alertdialog-description]");
          expect(desc).not.toBeNull();
          expect(desc?.tagName).toBe("P");
          expect(desc?.textContent).toBe("This action cannot be undone.");
        }),
      );
    });

    it("should have unique id for aria-describedby", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Description({}, "This action cannot be undone."),
          ]);

          const desc = el.querySelector("[data-alertdialog-description]");
          expect(desc?.id).toMatch(/alertdialog-description-/);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root({}, [
            AlertDialog.Description(
              { class: "my-desc" },
              "This action cannot be undone.",
            ),
          ]);

          const desc = el.querySelector("[data-alertdialog-description]");
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

          const el = yield* AlertDialog.Root({ open }, [
            AlertDialog.Trigger({}, "Open"),
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

          const el = yield* AlertDialog.Root({
            onOpenChange: (open) =>
              Effect.sync(() => {
                changes.push(open);
              }),
          }, [AlertDialog.Trigger({}, "Open")]);

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);
        }),
      );
    });
  });
});
