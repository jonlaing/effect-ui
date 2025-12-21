import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { DropdownMenu } from "./DropdownMenu";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("DropdownMenu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({}, "Open Menu"),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("button")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({ defaultOpen: true }, [
            DropdownMenu.Trigger({}, "Open"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button with menu-trigger data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({}, "Actions"),
          ]);

          const trigger = el.querySelector("[data-menu-trigger]");
          expect(trigger).not.toBeNull();
          expect(trigger?.tagName).toBe("BUTTON");
        }),
      );
    });

    it("should have aria-haspopup=menu", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({}, "Actions"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("menu");
        }),
      );
    });

    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({}, "Actions"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should update aria-expanded when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({ defaultOpen: true }, [
            DropdownMenu.Trigger({}, "Actions"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-expanded")).toBe("true");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({ class: "my-trigger" }, "Actions"),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should toggle menu on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({}, "Actions"),
          ]);

          const trigger = el.querySelector("button") as HTMLButtonElement;
          expect(trigger.getAttribute("data-state")).toBe("closed");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should be disabled when disabled prop is true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Trigger({ disabled: true }, "Actions"),
          ]);

          const trigger = el.querySelector("button") as HTMLButtonElement;
          expect(trigger.disabled).toBe(true);
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render with menu-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Item({}, "Edit"),
          ]);

          const item = el.querySelector("[data-menu-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=menuitem", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Item({}, "Edit"),
          ]);

          const item = el.querySelector("[data-menu-item]");
          expect(item?.getAttribute("role")).toBe("menuitem");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Item({ class: "my-item" }, "Edit"),
          ]);

          const item = el.querySelector("[data-menu-item]");
          expect(item?.className).toBe("my-item");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Item({ disabled: true }, "Edit"),
          ]);

          const item = el.querySelector("[data-menu-item]");
          expect(item?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });
  });

  describe("Group", () => {
    it("should render with menu-group data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Group({}, [DropdownMenu.Item({}, "Item")]),
          ]);

          const group = el.querySelector("[data-menu-group]");
          expect(group).not.toBeNull();
        }),
      );
    });

    it("should have role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Group({}, [DropdownMenu.Item({}, "Item")]),
          ]);

          const group = el.querySelector("[data-menu-group]");
          expect(group?.getAttribute("role")).toBe("group");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Group({ class: "my-group" }, []),
          ]);

          const group = el.querySelector("[data-menu-group]");
          expect(group?.className).toBe("my-group");
        }),
      );
    });
  });

  describe("Label", () => {
    it("should render with menu-label data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Label({}, "Actions"),
          ]);

          const label = el.querySelector("[data-menu-label]");
          expect(label).not.toBeNull();
          expect(label?.textContent).toBe("Actions");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Label({ class: "my-label" }, "Label"),
          ]);

          const label = el.querySelector("[data-menu-label]");
          expect(label?.className).toBe("my-label");
        }),
      );
    });
  });

  describe("Separator", () => {
    it("should render with menu-separator data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [DropdownMenu.Separator({})]);

          const separator = el.querySelector("[data-menu-separator]");
          expect(separator).not.toBeNull();
        }),
      );
    });

    it("should have role=separator", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [DropdownMenu.Separator({})]);

          const separator = el.querySelector("[data-menu-separator]");
          expect(separator?.getAttribute("role")).toBe("separator");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.Separator({ class: "my-separator" }),
          ]);

          const separator = el.querySelector("[data-menu-separator]");
          expect(separator?.className).toBe("my-separator");
        }),
      );
    });
  });

  describe("CheckboxItem", () => {
    it("should render with checkbox-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.CheckboxItem({}, "Show Grid"),
          ]);

          const item = el.querySelector("[data-menu-checkbox-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=menuitemcheckbox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.CheckboxItem({}, "Show Grid"),
          ]);

          const item = el.querySelector("[data-menu-checkbox-item]");
          expect(item?.getAttribute("role")).toBe("menuitemcheckbox");
        }),
      );
    });

    it("should default to unchecked", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.CheckboxItem({}, "Show Grid"),
          ]);

          const item = el.querySelector("[data-menu-checkbox-item]");
          expect(item?.getAttribute("data-state")).toBe("unchecked");
          expect(item?.getAttribute("aria-checked")).toBe("false");
        }),
      );
    });

    it("should reflect defaultChecked=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.CheckboxItem({ defaultChecked: true }, "Show Grid"),
          ]);

          const item = el.querySelector("[data-menu-checkbox-item]");
          expect(item?.getAttribute("data-state")).toBe("checked");
          expect(item?.getAttribute("aria-checked")).toBe("true");
        }),
      );
    });

    it("should reflect controlled checked state", async () => {
      await runTest(
        Effect.gen(function* () {
          const checked = yield* Signal.make(true);

          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.CheckboxItem({ checked }, "Show Grid"),
          ]);

          const item = el.querySelector("[data-menu-checkbox-item]");
          expect(item?.getAttribute("data-state")).toBe("checked");

          yield* checked.set(false);
          yield* Effect.sleep("10 millis");

          expect(item?.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });
  });

  describe("RadioGroup", () => {
    it("should render with radio-group data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.RadioGroup({}, []),
          ]);

          const group = el.querySelector("[data-menu-radio-group]");
          expect(group).not.toBeNull();
        }),
      );
    });

    it("should have role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.RadioGroup({}, []),
          ]);

          const group = el.querySelector("[data-menu-radio-group]");
          expect(group?.getAttribute("role")).toBe("group");
        }),
      );
    });
  });

  describe("RadioItem", () => {
    it("should render with radio-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.RadioGroup({}, [
              DropdownMenu.RadioItem({ value: "name" }, "Name"),
            ]),
          ]);

          const item = el.querySelector("[data-menu-radio-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=menuitemradio", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.RadioGroup({}, [
              DropdownMenu.RadioItem({ value: "name" }, "Name"),
            ]),
          ]);

          const item = el.querySelector("[data-menu-radio-item]");
          expect(item?.getAttribute("role")).toBe("menuitemradio");
        }),
      );
    });

    it("should reflect defaultValue selection", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* DropdownMenu.Root({}, [
            DropdownMenu.RadioGroup({ defaultValue: "date" }, [
              DropdownMenu.RadioItem({ value: "name" }, "Name"),
              DropdownMenu.RadioItem({ value: "date" }, "Date"),
            ]),
          ]);

          const items = el.querySelectorAll("[data-menu-radio-item]");
          expect(items[0]?.getAttribute("data-state")).toBe("unchecked");
          expect(items[1]?.getAttribute("data-state")).toBe("checked");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled open value", async () => {
      await runTest(
        Effect.gen(function* () {
          const open = yield* Signal.make(false);

          const el = yield* DropdownMenu.Root({ open }, [
            DropdownMenu.Trigger({}, "Open"),
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

          const el = yield* DropdownMenu.Root(
            {
              onOpenChange: (isOpen) =>
                Effect.sync(() => {
                  changes.push(isOpen);
                }),
            },
            [DropdownMenu.Trigger({}, "Open")],
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
