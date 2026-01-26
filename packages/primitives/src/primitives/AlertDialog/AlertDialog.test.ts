import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { $, collect, DOMRendererLive, Signal } from "@effex/dom";

import { AlertDialog } from "./AlertDialog";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("AlertDialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Trigger({}, $.of("Open"))),
          );

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("button")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Trigger({}, $.of("Open"))),
          );

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            { defaultOpen: true },
            collect(AlertDialog.Trigger({}, $.of("Open"))),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Trigger({}, $.of("Delete"))),
          );

          const trigger = el.querySelector("button");
          expect(trigger).not.toBeNull();
          expect(trigger?.textContent).toBe("Delete");
        }),
      );
    });

    it("should have aria-haspopup=alertdialog", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Trigger({}, $.of("Delete"))),
          );

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("alertdialog");
        }),
      );
    });

    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Trigger({}, $.of("Delete"))),
          );

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(
              AlertDialog.Trigger({ class: "my-trigger" }, $.of("Delete")),
            ),
          );

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should open dialog on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Trigger({}, $.of("Delete"))),
          );

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
          const el = yield* AlertDialog.Root(
            { defaultOpen: true },
            collect(AlertDialog.Cancel({}, $.of("Cancel"))),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Cancel({ class: "my-cancel" }, $.of("Cancel"))),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Action({}, $.of("Delete"))),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Action({ class: "my-action" }, $.of("Delete"))),
          );

          const action = el.querySelector("[data-alertdialog-action]");
          expect(action?.className).toBe("my-action");
        }),
      );
    });

    it("should call onClick callback", async () => {
      await runTest(
        Effect.gen(function* () {
          const clicks: string[] = [];

          const el = yield* AlertDialog.Root(
            {},
            collect(
              AlertDialog.Action(
                {
                  onClick: () =>
                    Effect.sync(() => {
                      clicks.push("clicked");
                    }),
                },
                $.of("Delete"),
              ),
            ),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Title({}, $.of("Are you sure?"))),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(AlertDialog.Title({}, $.of("Are you sure?"))),
          );

          const title = el.querySelector("[data-alertdialog-title]");
          expect(title?.id).toMatch(/alertdialog-title-/);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(
              AlertDialog.Title({ class: "my-title" }, $.of("Are you sure?")),
            ),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(
              AlertDialog.Description(
                {},
                $.of("This action cannot be undone."),
              ),
            ),
          );

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
          const el = yield* AlertDialog.Root(
            {},
            collect(
              AlertDialog.Description(
                {},
                $.of("This action cannot be undone."),
              ),
            ),
          );

          const desc = el.querySelector("[data-alertdialog-description]");
          expect(desc?.id).toMatch(/alertdialog-description-/);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* AlertDialog.Root(
            {},
            collect(
              AlertDialog.Description(
                { class: "my-desc" },
                $.of("This action cannot be undone."),
              ),
            ),
          );

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

          const el = yield* AlertDialog.Root(
            { open },
            collect(AlertDialog.Trigger({}, $.of("Open"))),
          );

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

          const el = yield* AlertDialog.Root(
            {
              onOpenChange: (open) =>
                Effect.sync(() => {
                  changes.push(open);
                }),
            },
            collect(AlertDialog.Trigger({}, $.of("Open"))),
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);
        }),
      );
    });
  });
});
