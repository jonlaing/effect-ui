import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Combobox } from "./Combobox";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
  );

describe("Combobox", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          expect(el.tagName).toBe("DIV");
          expect(el.querySelector("[data-combobox-input]")).not.toBeNull();
        }),
      );
    });

    it("should be closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should respect defaultOpen=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
          ]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Input", () => {
    it("should render as input with combobox-input data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input).not.toBeNull();
          expect(input?.tagName).toBe("INPUT");
        }),
      );
    });

    it("should have role=combobox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("role")).toBe("combobox");
        }),
      );
    });

    it("should have aria-haspopup=listbox", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("aria-haspopup")).toBe("listbox");
        }),
      );
    });

    it("should have aria-autocomplete=list", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("aria-autocomplete")).toBe("list");
        }),
      );
    });

    it("should have aria-expanded=false when closed", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should have aria-expanded=true when open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
          ]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("aria-expanded")).toBe("true");
        }),
      );
    });

    it("should apply placeholder", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [
            Combobox.Input({ placeholder: "Search..." }),
          ]);

          const input = el.querySelector(
            "[data-combobox-input]",
          ) as HTMLInputElement;
          expect(input.placeholder).toBe("Search...");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({}, [
            Combobox.Input({ class: "my-input" }),
          ]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.className).toBe("my-input");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Combobox.Root({ disabled: true }, [
            Combobox.Input({}),
          ]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });
  });

  describe("Content", () => {
    it("should render with combobox-content data attribute when open", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-combobox-content]");
          expect(content).not.toBeNull();
        }),
      );
    });

    it("should have role=listbox", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-combobox-content]");
          expect(content?.getAttribute("role")).toBe("listbox");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({ class: "my-content" }, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-combobox-content]");
          expect(content?.className).toBe("my-content");
        }),
      );
    });

    it("should have data-state=open when open", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, []),
          ]);

          yield* Effect.sleep("50 millis");
          const content = document.querySelector("[data-combobox-content]");
          expect(content?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render with combobox-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple" }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have role=option", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple" }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item?.getAttribute("role")).toBe("option");
        }),
      );
    });

    it("should have data-value attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple" }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item?.getAttribute("data-value")).toBe("apple");
        }),
      );
    });

    it("should have data-state=unchecked by default", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple" }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item?.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });

    it("should have data-state=checked when selected", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root(
            {
              defaultOpen: true,
              defaultValue: "apple",
            },
            [
              Combobox.Input({}),
              Combobox.Content({}, [
                Combobox.Item({ value: "apple" }, [
                  Combobox.ItemText({}, "Apple"),
                ]),
              ]),
            ],
          );

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item?.getAttribute("data-state")).toBe("checked");
          expect(item?.getAttribute("aria-selected")).toBe("true");
        }),
      );
    });

    it("should have data-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple", disabled: true }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple", class: "my-item" }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const item = document.querySelector("[data-combobox-item]");
          expect(item?.className).toBe("my-item");
        }),
      );
    });
  });

  describe("ItemText", () => {
    it("should render with combobox-item-text data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple" }, [
                Combobox.ItemText({}, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const itemText = document.querySelector("[data-combobox-item-text]");
          expect(itemText).not.toBeNull();
          expect(itemText?.textContent).toBe("Apple");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Item({ value: "apple" }, [
                Combobox.ItemText({ class: "my-text" }, "Apple"),
              ]),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const itemText = document.querySelector("[data-combobox-item-text]");
          expect(itemText?.className).toBe("my-text");
        }),
      );
    });
  });

  describe("Group", () => {
    it("should render with combobox-group data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [Combobox.Group({}, [])]),
          ]);

          yield* Effect.sleep("50 millis");
          const group = document.querySelector("[data-combobox-group]");
          expect(group).not.toBeNull();
        }),
      );
    });

    it("should have role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [Combobox.Group({}, [])]),
          ]);

          yield* Effect.sleep("50 millis");
          const group = document.querySelector("[data-combobox-group]");
          expect(group?.getAttribute("role")).toBe("group");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [Combobox.Group({ class: "my-group" }, [])]),
          ]);

          yield* Effect.sleep("50 millis");
          const group = document.querySelector("[data-combobox-group]");
          expect(group?.className).toBe("my-group");
        }),
      );
    });
  });

  describe("Label", () => {
    it("should render with combobox-label data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [Combobox.Label({}, "Category")]),
          ]);

          yield* Effect.sleep("50 millis");
          const label = document.querySelector("[data-combobox-label]");
          expect(label).not.toBeNull();
          expect(label?.textContent).toBe("Category");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          yield* Combobox.Root({ defaultOpen: true }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Label({ class: "my-label" }, "Label"),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const label = document.querySelector("[data-combobox-label]");
          expect(label?.className).toBe("my-label");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled open value", async () => {
      await runTest(
        Effect.gen(function* () {
          const open = yield* Signal.make(false);

          const el = yield* Combobox.Root({ open }, [Combobox.Input({})]);

          const input = el.querySelector("[data-combobox-input]");
          expect(input?.getAttribute("data-state")).toBe("closed");

          yield* open.set(true);
          yield* Effect.sleep("10 millis");

          expect(input?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should reflect controlled inputValue", async () => {
      await runTest(
        Effect.gen(function* () {
          const inputValue = yield* Signal.make("test");

          const el = yield* Combobox.Root({ inputValue }, [Combobox.Input({})]);

          const input = el.querySelector(
            "[data-combobox-input]",
          ) as HTMLInputElement;
          expect(input.value).toBe("test");

          yield* inputValue.set("updated");
          yield* Effect.sleep("10 millis");

          expect(input.value).toBe("updated");
        }),
      );
    });
  });

  describe("onValueChange callback", () => {
    it("should call onValueChange when item is selected", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: string[] = [];

          yield* Combobox.Root(
            {
              defaultOpen: true,
              onValueChange: (val) =>
                Effect.sync(() => {
                  changes.push(val);
                }),
            },
            [
              Combobox.Input({}),
              Combobox.Content({}, [
                Combobox.Item({ value: "apple" }, [
                  Combobox.ItemText({}, "Apple"),
                ]),
              ]),
            ],
          );

          yield* Effect.sleep("50 millis");

          const item = document.querySelector(
            "[data-combobox-item]",
          ) as HTMLElement;
          item.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["apple"]);
        }),
      );
    });
  });

  describe("onOpenChange callback", () => {
    it("should call onOpenChange when input typed", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Combobox.Root(
            {
              onOpenChange: (isOpen) =>
                Effect.sync(() => {
                  changes.push(isOpen);
                }),
            },
            [Combobox.Input({})],
          );

          const input = el.querySelector(
            "[data-combobox-input]",
          ) as HTMLInputElement;
          // Simulate typing which triggers open
          input.value = "a";
          input.dispatchEvent(new InputEvent("input", { bubbles: true }));
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);
        }),
      );
    });
  });

  describe("Loading", () => {
    it("should render with combobox-loading data attribute when loading", async () => {
      await runTest(
        Effect.gen(function* () {
          const isLoading = yield* Signal.make(true);

          yield* Combobox.Root({ defaultOpen: true, isLoading }, [
            Combobox.Input({}),
            Combobox.Content({}, [Combobox.Loading({}, "Loading...")]),
          ]);

          yield* Effect.sleep("50 millis");
          const loading = document.querySelector("[data-combobox-loading]");
          expect(loading).not.toBeNull();
          expect(loading?.textContent).toBe("Loading...");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const isLoading = yield* Signal.make(true);

          yield* Combobox.Root({ defaultOpen: true, isLoading }, [
            Combobox.Input({}),
            Combobox.Content({}, [
              Combobox.Loading({ class: "my-loading" }, "Loading..."),
            ]),
          ]);

          yield* Effect.sleep("50 millis");
          const loading = document.querySelector("[data-combobox-loading]");
          expect(loading?.className).toBe("my-loading");
        }),
      );
    });
  });
});
