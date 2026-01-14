import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { DOMRendererLive, Signal } from "@effex/dom";

import { TreeView } from "./TreeView";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("TreeView", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with role=tree", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({}, [
            TreeView.Item({ id: "item-1" }, [TreeView.ItemLabel({}, "Item 1")]),
          ]);

          expect(el.getAttribute("role")).toBe("tree");
        }),
      );
    });

    it("should set aria-label when provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ "aria-label": "File browser" }, []);

          expect(el.getAttribute("aria-label")).toBe("File browser");
        }),
      );
    });

    it("should set aria-multiselectable for multiple selection mode", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ selectionMode: "multiple" }, []);

          expect(el.getAttribute("aria-multiselectable")).toBe("true");
        }),
      );
    });

    it("should not set aria-multiselectable for single selection mode", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ selectionMode: "single" }, []);

          expect(el.getAttribute("aria-multiselectable")).toBeNull();
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render with role=treeitem", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({}, [
            TreeView.Item({ id: "item-1" }, [TreeView.ItemLabel({}, "Item 1")]),
          ]);

          const item = el.querySelector("[role='treeitem']");
          expect(item).not.toBeNull();
        }),
      );
    });

    it("should have correct aria-level for nested items", async () => {
      await runTest(
        Effect.gen(function* () {
          // Need to expand parent to render nested items
          const el = yield* TreeView.Root({ defaultExpanded: ["folder-1"] }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const items = el.querySelectorAll("[role='treeitem']");
          expect(items[0]?.getAttribute("aria-level")).toBe("1");
          expect(items[1]?.getAttribute("aria-level")).toBe("2");
        }),
      );
    });

    it("should have data-state=closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({}, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const item = el.querySelector("[role='treeitem']");
          expect(item?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should have data-state=open when expanded", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ defaultExpanded: ["folder-1"] }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const item = el.querySelector("[role='treeitem']");
          expect(item?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should only have aria-expanded when item has children", async () => {
      await runTest(
        Effect.gen(function* () {
          // Need to expand parent to render nested items
          const el = yield* TreeView.Root({ defaultExpanded: ["folder-1"] }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder (has children)"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File (no children)"),
                ]),
              ]),
            ]),
          ]);

          // Wait for hasChildren signal to propagate
          yield* Effect.sleep("10 millis");

          const items = el.querySelectorAll("[role='treeitem']");
          // Parent item should have aria-expanded
          expect(items[0]?.getAttribute("aria-expanded")).toBe("true");
          // Leaf item should NOT have aria-expanded
          expect(items[1]?.getAttribute("aria-expanded")).toBeNull();
        }),
      );
    });
  });

  describe("ItemContent", () => {
    it("should have role=group when expanded", async () => {
      await runTest(
        Effect.gen(function* () {
          // Group is only rendered when parent is expanded
          const el = yield* TreeView.Root({ defaultExpanded: ["folder-1"] }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const group = el.querySelector("[role='group']");
          expect(group).toBeTruthy();
        }),
      );
    });

    it("should not render group when parent is collapsed", async () => {
      await runTest(
        Effect.gen(function* () {
          // When collapsed, ItemContent renders a hidden placeholder, not the group
          const el = yield* TreeView.Root({}, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const group = el.querySelector("[role='group']");
          expect(group).toBeNull();
        }),
      );
    });

    it("should have data-state=open when parent is expanded", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ defaultExpanded: ["folder-1"] }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const group = el.querySelector("[role='group']");
          expect(group?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("expand/collapse", () => {
    it("should toggle expanded state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({}, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const label = el.querySelector("[data-tree-label]") as HTMLElement;
          const item = el.querySelector("[role='treeitem']");

          // Initially closed
          expect(item?.getAttribute("data-state")).toBe("closed");

          // Click to expand
          label.click();
          yield* Effect.sleep("10 millis");

          expect(item?.getAttribute("data-state")).toBe("open");

          // Click to collapse
          label.click();
          yield* Effect.sleep("10 millis");

          expect(item?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should call onExpandedChange when expansion changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: Set<string>[] = [];

          const el = yield* TreeView.Root(
            {
              onExpandedChange: (expanded) =>
                Effect.sync(() => {
                  changes.push(expanded);
                }),
            },
            [
              TreeView.Item({ id: "folder-1" }, [
                TreeView.ItemLabel({}, "Folder 1"),
                TreeView.ItemContent({}, [
                  TreeView.Item({ id: "file-1" }, [
                    TreeView.ItemLabel({}, "File 1"),
                  ]),
                ]),
              ]),
            ],
          );

          const label = el.querySelector("[data-tree-label]") as HTMLElement;

          label.click();
          yield* Effect.sleep("10 millis");

          expect(changes.length).toBe(1);
          expect(changes[0]?.has("folder-1")).toBe(true);
        }),
      );
    });
  });

  describe("selection modes", () => {
    describe("none mode (default)", () => {
      it("should not select items on click", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* TreeView.Root({}, [
              TreeView.Item({ id: "item-1" }, [
                TreeView.ItemLabel({}, "Item 1"),
              ]),
            ]);

            const label = el.querySelector("[data-tree-label]") as HTMLElement;
            const item = el.querySelector("[role='treeitem']");

            label.click();
            yield* Effect.sleep("10 millis");

            expect(item?.getAttribute("aria-selected")).toBeNull();
          }),
        );
      });
    });

    describe("single mode", () => {
      it("should select item on click", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* TreeView.Root({ selectionMode: "single" }, [
              TreeView.Item({ id: "item-1" }, [
                TreeView.ItemLabel({}, "Item 1"),
              ]),
              TreeView.Item({ id: "item-2" }, [
                TreeView.ItemLabel({}, "Item 2"),
              ]),
            ]);

            const labels = el.querySelectorAll("[data-tree-label]");
            const items = el.querySelectorAll("[role='treeitem']");

            (labels[0] as HTMLElement).click();
            yield* Effect.sleep("10 millis");

            expect(items[0]?.getAttribute("aria-selected")).toBe("true");
            expect(items[1]?.getAttribute("aria-selected")).toBeNull();
          }),
        );
      });

      it("should replace selection when clicking another item", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* TreeView.Root(
              { selectionMode: "single", defaultSelected: ["item-1"] },
              [
                TreeView.Item({ id: "item-1" }, [
                  TreeView.ItemLabel({}, "Item 1"),
                ]),
                TreeView.Item({ id: "item-2" }, [
                  TreeView.ItemLabel({}, "Item 2"),
                ]),
              ],
            );

            const labels = el.querySelectorAll("[data-tree-label]");
            const items = el.querySelectorAll("[role='treeitem']");

            (labels[1] as HTMLElement).click();
            yield* Effect.sleep("10 millis");

            expect(items[0]?.getAttribute("aria-selected")).toBeNull();
            expect(items[1]?.getAttribute("aria-selected")).toBe("true");
          }),
        );
      });
    });

    describe("multiple mode", () => {
      it("should allow multiple items to be selected", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* TreeView.Root(
              { selectionMode: "multiple", defaultSelected: ["item-1"] },
              [
                TreeView.Item({ id: "item-1" }, [
                  TreeView.ItemLabel({}, "Item 1"),
                ]),
                TreeView.Item({ id: "item-2" }, [
                  TreeView.ItemLabel({}, "Item 2"),
                ]),
              ],
            );

            const labels = el.querySelectorAll("[data-tree-label]");
            const items = el.querySelectorAll("[role='treeitem']");

            (labels[1] as HTMLElement).click();
            yield* Effect.sleep("10 millis");

            expect(items[0]?.getAttribute("aria-selected")).toBe("true");
            expect(items[1]?.getAttribute("aria-selected")).toBe("true");
          }),
        );
      });

      it("should toggle selection on click", async () => {
        await runTest(
          Effect.gen(function* () {
            const el = yield* TreeView.Root(
              { selectionMode: "multiple", defaultSelected: ["item-1"] },
              [
                TreeView.Item({ id: "item-1" }, [
                  TreeView.ItemLabel({}, "Item 1"),
                ]),
              ],
            );

            const label = el.querySelector("[data-tree-label]") as HTMLElement;
            const item = el.querySelector("[role='treeitem']");

            // Click to deselect
            label.click();
            yield* Effect.sleep("10 millis");

            expect(item?.getAttribute("aria-selected")).toBeNull();
          }),
        );
      });
    });

    it("should call onSelectedChange when selection changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: Set<string>[] = [];

          const el = yield* TreeView.Root(
            {
              selectionMode: "single",
              onSelectedChange: (selected) =>
                Effect.sync(() => {
                  changes.push(selected);
                }),
            },
            [
              TreeView.Item({ id: "item-1" }, [
                TreeView.ItemLabel({}, "Item 1"),
              ]),
            ],
          );

          const label = el.querySelector("[data-tree-label]") as HTMLElement;

          label.click();
          yield* Effect.sleep("10 millis");

          expect(changes.length).toBe(1);
          expect(changes[0]?.has("item-1")).toBe(true);
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should set data-disabled on root when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ disabled: true }, []);

          expect(el.hasAttribute("data-disabled")).toBe(true);
        }),
      );
    });

    it("should prevent expand when root is disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ disabled: true }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const label = el.querySelector("[data-tree-label]") as HTMLElement;
          const item = el.querySelector("[role='treeitem']");

          label.click();
          yield* Effect.sleep("10 millis");

          expect(item?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should disable individual items", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ selectionMode: "single" }, [
            TreeView.Item({ id: "item-1" }, [TreeView.ItemLabel({}, "Item 1")]),
            TreeView.Item({ id: "item-2", disabled: true }, [
              TreeView.ItemLabel({}, "Item 2"),
            ]),
          ]);

          const labels = el.querySelectorAll("[data-tree-label]");
          const items = el.querySelectorAll("[role='treeitem']");

          // Click disabled item
          (labels[1] as HTMLElement).click();
          yield* Effect.sleep("10 millis");

          // Should not be selected
          expect(items[1]?.getAttribute("aria-selected")).toBeNull();
          expect(items[1]?.hasAttribute("data-disabled")).toBe(true);
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled expanded state", async () => {
      await runTest(
        Effect.gen(function* () {
          const expanded = yield* Signal.Set.make<string>(["folder-1"]);

          const el = yield* TreeView.Root({ expanded }, [
            TreeView.Item({ id: "folder-1" }, [
              TreeView.ItemLabel({}, "Folder 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "file-1" }, [
                  TreeView.ItemLabel({}, "File 1"),
                ]),
              ]),
            ]),
          ]);

          const item = el.querySelector("[role='treeitem']");
          expect(item?.getAttribute("data-state")).toBe("open");

          yield* expanded.delete("folder-1");
          yield* Effect.sleep("10 millis");

          expect(item?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should reflect controlled selected state", async () => {
      await runTest(
        Effect.gen(function* () {
          const selected = yield* Signal.Set.make<string>(["item-1"]);

          const el = yield* TreeView.Root(
            { selectionMode: "single", selected },
            [
              TreeView.Item({ id: "item-1" }, [
                TreeView.ItemLabel({}, "Item 1"),
              ]),
              TreeView.Item({ id: "item-2" }, [
                TreeView.ItemLabel({}, "Item 2"),
              ]),
            ],
          );

          const items = el.querySelectorAll("[role='treeitem']");
          expect(items[0]?.getAttribute("aria-selected")).toBe("true");
          expect(items[1]?.getAttribute("aria-selected")).toBeNull();

          yield* selected.replace(["item-2"]);
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("aria-selected")).toBeNull();
          expect(items[1]?.getAttribute("aria-selected")).toBe("true");
        }),
      );
    });
  });

  describe("deeply nested structure", () => {
    it("should render 3+ levels of nesting correctly", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* TreeView.Root({ defaultExpanded: ["l1", "l2"] }, [
            TreeView.Item({ id: "l1" }, [
              TreeView.ItemLabel({}, "Level 1"),
              TreeView.ItemContent({}, [
                TreeView.Item({ id: "l2" }, [
                  TreeView.ItemLabel({}, "Level 2"),
                  TreeView.ItemContent({}, [
                    TreeView.Item({ id: "l3" }, [
                      TreeView.ItemLabel({}, "Level 3"),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]);

          const items = el.querySelectorAll("[role='treeitem']");
          expect(items.length).toBe(3);
          expect(items[0]?.getAttribute("aria-level")).toBe("1");
          expect(items[1]?.getAttribute("aria-level")).toBe("2");
          expect(items[2]?.getAttribute("aria-level")).toBe("3");
        }),
      );
    });
  });
});
