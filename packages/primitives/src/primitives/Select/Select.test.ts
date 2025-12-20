import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Select } from "./Select";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("Select", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [
            Select.Trigger({}, [Select.Value({})]),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("[data-select-trigger]")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [Select.Trigger({}, [])]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
          ]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button with select-trigger data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [Select.Trigger({}, [])]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger).not.toBeNull();
          expect(trigger?.tagName).toBe("BUTTON");
        }),
      );
    });

    it("should have role=combobox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [Select.Trigger({}, [])]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("role")).toBe("combobox");
        }),
      );
    });

    it("should have aria-haspopup=listbox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [Select.Trigger({}, [])]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("listbox");
        }),
      );
    });

    it("should have aria-expanded=false when closed", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [Select.Trigger({}, [])]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should have aria-expanded=true when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
          ]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("aria-expanded")).toBe("true");
        }),
      );
    });

    it("should toggle on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [Select.Trigger({}, [])]);

          const trigger = el.querySelector(
            "[data-select-trigger]",
          ) as HTMLButtonElement;
          expect(trigger.getAttribute("data-state")).toBe("closed");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [
            Select.Trigger({ class: "my-trigger" }, []),
          ]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ disabled: true }, [
            Select.Trigger({}, []),
          ]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });
  });

  describe("Value", () => {
    it("should render with select-value data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [
            Select.Trigger({}, [Select.Value({})]),
          ]);

          const value = el.querySelector("[data-select-value]");
          expect(value).not.toBeNull();
          expect(value?.tagName).toBe("SPAN");
        }),
      );
    });

    it("should show placeholder when no value", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ placeholder: "Pick one" }, [
            Select.Trigger({}, [Select.Value({})]),
          ]);

          const value = el.querySelector("[data-select-value]");
          expect(value?.textContent).toBe("Pick one");
        }),
      );
    });

    it("should have data-placeholder when showing placeholder", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [
            Select.Trigger({}, [Select.Value({})]),
          ]);

          const value = el.querySelector("[data-select-value]");
          // Boolean true is serialized as empty string in data attribute
          expect(value?.hasAttribute("data-placeholder")).toBe(true);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({}, [
            Select.Trigger({}, [Select.Value({ class: "my-value" })]),
          ]);

          const value = el.querySelector("[data-select-value]");
          expect(value?.className).toBe("my-value");
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render with select-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=option", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item?.getAttribute("role")).toBe("option");
        }),
      );
    });

    it("should have data-value attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item?.getAttribute("data-value")).toBe("apple");
        }),
      );
    });

    it("should have data-state=unchecked by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item?.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });

    it("should have data-state=checked when selected", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({
            defaultOpen: true,
            defaultValue: "apple",
          }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item?.getAttribute("data-state")).toBe("checked");
          expect(item?.getAttribute("aria-selected")).toBe("true");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple", disabled: true }, [
                Select.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple", class: "my-item" }, [
                Select.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-select-item]");
          expect(item?.className).toBe("my-item");
        }),
      );
    });
  });

  describe("ItemText", () => {
    it("should render with select-item-text data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const itemText = document.querySelector("[data-select-item-text]");
          expect(itemText).not.toBeNull();
          expect(itemText?.textContent).toBe("Apple");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [
                Select.ItemText({ class: "my-text" }, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const itemText = document.querySelector("[data-select-item-text]");
          expect(itemText?.className).toBe("my-text");
        }),
      );
    });
  });

  describe("Content", () => {
    it("should render with select-content data attribute when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-select-content]");
          expect(content).not.toBeNull();
        }),
      );
    });

    it("should have role=listbox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-select-content]");
          expect(content?.getAttribute("role")).toBe("listbox");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({ class: "my-content" }, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-select-content]");
          expect(content?.className).toBe("my-content");
        }),
      );
    });
  });

  describe("Group", () => {
    it("should render with select-group data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Group({}, [])]),
          ]);

          yield* Effect.sleep("50 millis");
          const group = document.querySelector("[data-select-group]");
          expect(group).not.toBeNull();
        }),
      );
    });

    it("should have role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Group({}, [])]),
          ]);

          yield* Effect.sleep("50 millis");
          const group = document.querySelector("[data-select-group]");
          expect(group?.getAttribute("role")).toBe("group");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Group({ class: "my-group" }, [])]),
          ]);

          yield* Effect.sleep("50 millis");
          const group = document.querySelector("[data-select-group]");
          expect(group?.className).toBe("my-group");
        }),
      );
    });
  });

  describe("Label", () => {
    it("should render with select-label data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Label({}, "Category")]),
          ]);

          yield* Effect.sleep("50 millis");
          const label = document.querySelector("[data-select-label]");
          expect(label).not.toBeNull();
          expect(label?.textContent).toBe("Category");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Label({ class: "my-label" }, "Label")]),
          ]);

          yield* Effect.sleep("50 millis");
          const label = document.querySelector("[data-select-label]");
          expect(label?.className).toBe("my-label");
        }),
      );
    });
  });

  describe("Separator", () => {
    it("should render with select-separator data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Separator({})]),
          ]);

          yield* Effect.sleep("50 millis");
          const separator = document.querySelector("[data-select-separator]");
          expect(separator).not.toBeNull();
        }),
      );
    });

    it("should have role=separator", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Separator({})]),
          ]);

          yield* Effect.sleep("50 millis");
          const separator = document.querySelector("[data-select-separator]");
          expect(separator?.getAttribute("role")).toBe("separator");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Select.Root({ defaultOpen: true }, [
            Select.Trigger({}, []),
            Select.Content({}, [Select.Separator({ class: "my-separator" })]),
          ]);

          yield* Effect.sleep("50 millis");
          const separator = document.querySelector("[data-select-separator]");
          expect(separator?.className).toBe("my-separator");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled open value", async () => {
      await runTest(
        Effect.gen(function* () {
          const open = yield* Signal.make(false);

          const el = yield* Select.Root({ open }, [Select.Trigger({}, [])]);

          const trigger = el.querySelector("[data-select-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");

          yield* open.set(true);
          yield* Effect.sleep("10 millis");

          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make("");

          const el = yield* Select.Root({ value, defaultOpen: true }, [
            Select.Trigger({}, [Select.Value({})]),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
              Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");

          yield* value.set("apple");
          yield* Effect.sleep("50 millis");

          const valueEl = el.querySelector("[data-select-value]");
          expect(valueEl?.textContent).toBe("Apple");
        }),
      );
    });
  });

  describe("onValueChange callback", () => {
    it("should call onValueChange when item is selected", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: string[] = [];

          const el = yield* Select.Root({
            defaultOpen: true,
            onValueChange: (val) =>
              Effect.sync(() => {
                changes.push(val);
              }),
          }, [
            Select.Trigger({}, []),
            Select.Content({}, [
              Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");

          const item = document.querySelector(
            "[data-select-item]",
          ) as HTMLElement;
          item.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["apple"]);
        }),
      );
    });
  });

  describe("onOpenChange callback", () => {
    it("should call onOpenChange when toggled", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Select.Root({
            onOpenChange: (isOpen) =>
              Effect.sync(() => {
                changes.push(isOpen);
              }),
          }, [Select.Trigger({}, [])]);

          const trigger = el.querySelector(
            "[data-select-trigger]",
          ) as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);
        }),
      );
    });
  });
});
