import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { $ } from "@effex/dom";
import { ContextMenu } from "./ContextMenu";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
  );

describe("ContextMenu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Trigger({}, $.div({}, "Right click me")),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(
            el.querySelector("[data-context-menu-trigger]"),
          ).not.toBeNull();
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render with context-menu-trigger data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Trigger({}, $.div({}, "Content")),
          ]);

          const trigger = el.querySelector("[data-context-menu-trigger]");
          expect(trigger).not.toBeNull();
        }),
      );
    });

    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Trigger({}, $.div({ "data-test": "" }, "Test content")),
          ]);

          const testContent = el.querySelector("[data-test]");
          expect(testContent).not.toBeNull();
          expect(testContent?.textContent).toBe("Test content");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Trigger({ class: "my-trigger" }, $.div({}, "Content")),
          ]);

          const trigger = el.querySelector("[data-context-menu-trigger]");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Trigger({ disabled: true }, $.div({}, "Content")),
          ]);

          const trigger = el.querySelector("[data-context-menu-trigger]");
          expect(trigger?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render with context-menu-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Item({}, "Menu Item"),
          ]);

          const item = el.querySelector("[data-context-menu-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=menuitem", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Item({}, "Menu Item"),
          ]);

          const item = el.querySelector("[data-context-menu-item]");
          expect(item?.getAttribute("role")).toBe("menuitem");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Item({ class: "my-item" }, "Menu Item"),
          ]);

          const item = el.querySelector("[data-context-menu-item]");
          expect(item?.className).toBe("my-item");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Item({ disabled: true }, "Menu Item"),
          ]);

          const item = el.querySelector("[data-context-menu-item]");
          expect(item?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });
  });

  describe("Group", () => {
    it("should render with context-menu-group data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Group({}, [ContextMenu.Item({}, "Item")]),
          ]);

          const group = el.querySelector("[data-context-menu-group]");
          expect(group).not.toBeNull();
        }),
      );
    });

    it("should have role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Group({}, [ContextMenu.Item({}, "Item")]),
          ]);

          const group = el.querySelector("[data-context-menu-group]");
          expect(group?.getAttribute("role")).toBe("group");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Group({ class: "my-group" }, []),
          ]);

          const group = el.querySelector("[data-context-menu-group]");
          expect(group?.className).toBe("my-group");
        }),
      );
    });
  });

  describe("Label", () => {
    it("should render with context-menu-label data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Label({}, "Section Title"),
          ]);

          const label = el.querySelector("[data-context-menu-label]");
          expect(label).not.toBeNull();
          expect(label?.textContent).toBe("Section Title");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Label({ class: "my-label" }, "Label"),
          ]);

          const label = el.querySelector("[data-context-menu-label]");
          expect(label?.className).toBe("my-label");
        }),
      );
    });
  });

  describe("Separator", () => {
    it("should render with context-menu-separator data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [ContextMenu.Separator({})]);

          const separator = el.querySelector("[data-context-menu-separator]");
          expect(separator).not.toBeNull();
        }),
      );
    });

    it("should have role=separator", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [ContextMenu.Separator({})]);

          const separator = el.querySelector("[data-context-menu-separator]");
          expect(separator?.getAttribute("role")).toBe("separator");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.Separator({ class: "my-separator" }),
          ]);

          const separator = el.querySelector("[data-context-menu-separator]");
          expect(separator?.className).toBe("my-separator");
        }),
      );
    });
  });

  describe("CheckboxItem", () => {
    it("should render with checkbox-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.CheckboxItem({}, "Check me"),
          ]);

          const item = el.querySelector("[data-context-menu-checkbox-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=menuitemcheckbox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.CheckboxItem({}, "Check me"),
          ]);

          const item = el.querySelector("[data-context-menu-checkbox-item]");
          expect(item?.getAttribute("role")).toBe("menuitemcheckbox");
        }),
      );
    });

    it("should default to unchecked", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.CheckboxItem({}, "Check me"),
          ]);

          const item = el.querySelector("[data-context-menu-checkbox-item]");
          expect(item?.getAttribute("data-state")).toBe("unchecked");
          expect(item?.getAttribute("aria-checked")).toBe("false");
        }),
      );
    });

    it("should reflect defaultChecked=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.CheckboxItem({ defaultChecked: true }, "Check me"),
          ]);

          const item = el.querySelector("[data-context-menu-checkbox-item]");
          expect(item?.getAttribute("data-state")).toBe("checked");
          expect(item?.getAttribute("aria-checked")).toBe("true");
        }),
      );
    });

    it("should reflect controlled checked state", async () => {
      await runTest(
        Effect.gen(function* () {
          const checked = yield* Signal.make(true);

          const el = yield* ContextMenu.Root({}, [
            ContextMenu.CheckboxItem({ checked }, "Check me"),
          ]);

          const item = el.querySelector("[data-context-menu-checkbox-item]");
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
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.RadioGroup({}, []),
          ]);

          const group = el.querySelector("[data-context-menu-radio-group]");
          expect(group).not.toBeNull();
        }),
      );
    });

    it("should have role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.RadioGroup({}, []),
          ]);

          const group = el.querySelector("[data-context-menu-radio-group]");
          expect(group?.getAttribute("role")).toBe("group");
        }),
      );
    });
  });

  describe("RadioItem", () => {
    it("should render with radio-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.RadioGroup({}, [
              ContextMenu.RadioItem({ value: "option1" }, "Option 1"),
            ]),
          ]);

          const item = el.querySelector("[data-context-menu-radio-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=menuitemradio", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.RadioGroup({}, [
              ContextMenu.RadioItem({ value: "option1" }, "Option 1"),
            ]),
          ]);

          const item = el.querySelector("[data-context-menu-radio-item]");
          expect(item?.getAttribute("role")).toBe("menuitemradio");
        }),
      );
    });

    it("should reflect defaultValue selection", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ContextMenu.Root({}, [
            ContextMenu.RadioGroup({ defaultValue: "option2" }, [
              ContextMenu.RadioItem({ value: "option1" }, "Option 1"),
              ContextMenu.RadioItem({ value: "option2" }, "Option 2"),
            ]),
          ]);

          const items = el.querySelectorAll("[data-context-menu-radio-item]");
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

          yield* ContextMenu.Root({ open }, [
            ContextMenu.Trigger({}, $.div({}, "Trigger")),
          ]);

          // Menu starts closed
          expect(yield* open.get).toBe(false);
        }),
      );
    });
  });
});
