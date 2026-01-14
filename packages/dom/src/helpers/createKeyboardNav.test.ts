import { Effect, Option } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Signal } from "@effex/core";

import { createKeyboardNav } from "./createKeyboardNav";

const runTest = <A>(effect: Effect.Effect<A, never, never>) =>
  Effect.runPromise(effect);

describe("createKeyboardNav", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const setupItems = (count: number): HTMLElement[] => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const items: HTMLElement[] = [];
    for (let i = 0; i < count; i++) {
      const item = document.createElement("button");
      item.setAttribute("data-nav-item", "");
      item.setAttribute("tabindex", "0");
      item.textContent = `Item ${i}`;
      container.appendChild(item);
      items.push(item);
    }
    return items;
  };

  describe("horizontal navigation", () => {
    it("should move focus with ArrowRight", async () => {
      const items = setupItems(3);
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[1]);
    });

    it("should move focus with ArrowLeft", async () => {
      const items = setupItems(3);
      items[1].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });

    it("should loop from last to first with ArrowRight", async () => {
      const items = setupItems(3);
      items[2].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              loop: true,
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });

    it("should loop from first to last with ArrowLeft", async () => {
      const items = setupItems(3);
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              loop: true,
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[2]);
    });

    it("should not loop when loop is false", async () => {
      const items = setupItems(3);
      items[2].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              loop: false,
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[2]); // Stays at last
    });
  });

  describe("vertical navigation", () => {
    it("should move focus with ArrowDown", async () => {
      const items = setupItems(3);
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[1]);
    });

    it("should move focus with ArrowUp", async () => {
      const items = setupItems(3);
      items[1].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });
  });

  describe("Home and End keys", () => {
    it("should move to first item with Home", async () => {
      const items = setupItems(5);
      items[3].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });

    it("should move to last item with End", async () => {
      const items = setupItems(5);
      items[1].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "End", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[4]);
    });
  });

  describe("onFocus callback", () => {
    it("should call onFocus when navigating", async () => {
      const items = setupItems(3);
      items[0].focus();

      let focusedElement: HTMLElement | null = null;
      let focusedIndex = -1;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              onFocus: (el, idx) =>
                Effect.flatMap(el, (e) =>
                  Effect.sync(() => {
                    focusedElement = e;
                    focusedIndex = idx;
                  }),
                ),
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(focusedElement).toBe(items[1]);
      expect(focusedIndex).toBe(1);
    });
  });

  describe("onActivate callback", () => {
    it("should call onActivate on Enter", async () => {
      const items = setupItems(3);
      items[1].focus();

      let activatedElement: HTMLElement | null = null;
      let activatedIndex = -1;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              onActivate: (el, idx) =>
                Effect.flatMap(el, (e) =>
                  Effect.sync(() => {
                    activatedElement = e;
                    activatedIndex = idx;
                  }),
                ),
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
            );
          }),
        ),
      );

      expect(activatedElement).toBe(items[1]);
      expect(activatedIndex).toBe(1);
    });

    it("should call onActivate on Space", async () => {
      const items = setupItems(3);
      items[2].focus();

      let activatedElement: HTMLElement | null = null;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              onActivate: (el) =>
                Effect.flatMap(el, (e) =>
                  Effect.sync(() => {
                    activatedElement = e;
                  }),
                ),
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: " ", bubbles: true }),
            );
          }),
        ),
      );

      expect(activatedElement).toBe(items[2]);
    });
  });

  describe("reactive orientation", () => {
    it("should respond to orientation changes", async () => {
      const items = setupItems(3);
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const orientation = yield* Signal.make<"horizontal" | "vertical">(
              "horizontal",
            );

            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation,
            });

            // ArrowRight should work in horizontal mode
            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
            expect(document.activeElement).toBe(items[1]);

            // Switch to vertical
            yield* orientation.set("vertical");

            // Now ArrowDown should work
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
            );
            expect(document.activeElement).toBe(items[2]);
          }),
        ),
      );
    });
  });

  describe("disabled items", () => {
    it("should skip disabled items with selector", async () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const item0 = document.createElement("button");
      item0.setAttribute("data-nav-item", "");
      item0.textContent = "Item 0";

      const item1 = document.createElement("button");
      item1.setAttribute("data-nav-item", "");
      item1.setAttribute("data-disabled", "");
      item1.textContent = "Item 1 (disabled)";

      const item2 = document.createElement("button");
      item2.setAttribute("data-nav-item", "");
      item2.textContent = "Item 2";

      container.appendChild(item0);
      container.appendChild(item1);
      container.appendChild(item2);

      item0.focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            // Selector excludes disabled items
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]:not([data-disabled])",
              orientation: "horizontal",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      // Should skip item1 and go to item2
      expect(document.activeElement).toBe(item2);
    });
  });

  describe("unhandled keys", () => {
    it("should not affect focus for unrelated keys", async () => {
      const items = setupItems(3);
      items[1].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[1]); // Unchanged
    });
  });

  describe("onEscape callback", () => {
    it("should call onEscape when Escape is pressed", async () => {
      const items = setupItems(3);
      items[1].focus();

      let escapeCalled = false;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
              onEscape: () =>
                Effect.sync(() => {
                  escapeCalled = true;
                }),
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
            );
          }),
        ),
      );

      expect(escapeCalled).toBe(true);
    });

    it("should not do anything if onEscape is not provided", async () => {
      const items = setupItems(3);
      items[1].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "horizontal",
            });

            // Should not throw
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[1]); // Unchanged
    });
  });

  describe("typeahead", () => {
    const setupLabeledItems = (): HTMLElement[] => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const labels = ["Apple", "Banana", "Blueberry", "Cherry", "Date"];
      const items: HTMLElement[] = [];

      for (const label of labels) {
        const item = document.createElement("button");
        item.setAttribute("data-nav-item", "");
        item.setAttribute("tabindex", "0");
        item.textContent = label;
        container.appendChild(item);
        items.push(item);
      }
      return items;
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should focus item matching single character", async () => {
      const items = setupLabeledItems();
      items[0].focus(); // Apple

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "c", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[3]); // Cherry
    });

    it("should focus item matching multiple characters", async () => {
      const items = setupLabeledItems();
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
              },
            });

            // Type "bl" to match Blueberry, not Banana
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "b", bubbles: true }),
            );
            expect(document.activeElement).toBe(items[1]); // Banana (first B)

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "l", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[2]); // Blueberry
    });

    it("should reset buffer after timeout", async () => {
      const items = setupLabeledItems();
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
                timeout: 300,
              },
            });

            // Type "b" - matches Banana
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "b", bubbles: true }),
            );
            expect(document.activeElement).toBe(items[1]); // Banana

            // Wait for timeout
            vi.advanceTimersByTime(400);

            // Type "c" - should match Cherry (not look for "bc")
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "c", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[3]); // Cherry
    });

    it("should call onMatch callback", async () => {
      const items = setupLabeledItems();
      items[0].focus();

      let matchedElement: HTMLElement | null = null;
      let matchedIndex = -1;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
                onMatch: (el, idx) =>
                  Effect.flatMap(el, (e) =>
                    Effect.sync(() => {
                      matchedElement = e;
                      matchedIndex = idx;
                    }),
                  ),
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "d", bubbles: true }),
            );
          }),
        ),
      );

      expect(matchedElement).toBe(items[4]); // Date
      expect(matchedIndex).toBe(4);
    });

    it("should be case-insensitive", async () => {
      const items = setupLabeledItems();
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "C", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[3]); // Cherry
    });

    it("should start new search if no match found for continued buffer", async () => {
      const items = setupLabeledItems();
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
              },
            });

            // Type "a" - matches Apple
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "a", bubbles: true }),
            );
            expect(document.activeElement).toBe(items[0]); // Apple

            // Type "d" - "ad" doesn't match anything, so try "d" alone
            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "d", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[4]); // Date
    });

    it("should not trigger on control/meta key combinations", async () => {
      const items = setupLabeledItems();
      items[0].focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              typeahead: {
                getText: (el) => el.textContent ?? "",
              },
            });

            // Ctrl+C should not trigger typeahead
            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "c",
                ctrlKey: true,
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(items[0]); // Still Apple
    });
  });

  describe("hierarchy navigation", () => {
    const setupTreeItems = (): {
      items: HTMLElement[];
      expandedState: Map<HTMLElement, boolean>;
    } => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const expandedState = new Map<HTMLElement, boolean>();

      // Create a simple tree structure:
      // - Root 1
      //   - Child 1.1
      //   - Child 1.2
      // - Root 2

      const root1 = document.createElement("button");
      root1.setAttribute("data-nav-item", "");
      root1.setAttribute("data-level", "0");
      root1.textContent = "Root 1";
      root1.id = "root1";
      expandedState.set(root1, true);

      const child11 = document.createElement("button");
      child11.setAttribute("data-nav-item", "");
      child11.setAttribute("data-level", "1");
      child11.setAttribute("data-parent", "root1");
      child11.textContent = "Child 1.1";
      child11.id = "child11";
      expandedState.set(child11, false);

      const child12 = document.createElement("button");
      child12.setAttribute("data-nav-item", "");
      child12.setAttribute("data-level", "1");
      child12.setAttribute("data-parent", "root1");
      child12.textContent = "Child 1.2";
      child12.id = "child12";
      expandedState.set(child12, false);

      const root2 = document.createElement("button");
      root2.setAttribute("data-nav-item", "");
      root2.setAttribute("data-level", "0");
      root2.textContent = "Root 2";
      root2.id = "root2";
      expandedState.set(root2, false);

      container.appendChild(root1);
      container.appendChild(child11);
      container.appendChild(child12);
      container.appendChild(root2);

      return {
        items: [root1, child11, child12, root2],
        expandedState,
      };
    };

    it("should expand item on ArrowRight when collapsed", async () => {
      const { items, expandedState } = setupTreeItems();
      const [root1] = items;

      // Start collapsed
      expandedState.set(root1, false);
      root1.focus();

      let expandCalled = false;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              hierarchy: {
                getParent: () => Option.none(),
                getFirstChild: () => Option.none(),
                isExpanded: (el) => expandedState.get(el) ?? false,
                onExpand: (el) =>
                  Effect.sync(() => {
                    expandCalled = true;
                    expandedState.set(el, true);
                  }),
                onCollapse: () => Effect.void,
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(expandCalled).toBe(true);
    });

    it("should move to first child on ArrowRight when expanded", async () => {
      const { items, expandedState } = setupTreeItems();
      const [root1, child11] = items;

      // root1 is expanded
      expandedState.set(root1, true);
      root1.focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              hierarchy: {
                getParent: (el) => {
                  const parentId = el.getAttribute("data-parent");
                  if (parentId) {
                    const parent = document.getElementById(parentId);
                    return parent ? Option.some(parent) : Option.none();
                  }
                  return Option.none();
                },
                getFirstChild: (el) => {
                  // Find first child with data-parent matching this element's id
                  const children = document.querySelectorAll(
                    `[data-parent="${el.id}"]`,
                  );
                  return children.length > 0
                    ? Option.some(children[0] as HTMLElement)
                    : Option.none();
                },
                isExpanded: (el) => expandedState.get(el) ?? false,
                onExpand: () => Effect.void,
                onCollapse: () => Effect.void,
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(child11);
    });

    it("should collapse item on ArrowLeft when expanded", async () => {
      const { items, expandedState } = setupTreeItems();
      const [root1] = items;

      // root1 is expanded
      expandedState.set(root1, true);
      root1.focus();

      let collapseCalled = false;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              hierarchy: {
                getParent: () => Option.none(),
                getFirstChild: () => Option.none(),
                isExpanded: (el) => expandedState.get(el) ?? false,
                onExpand: () => Effect.void,
                onCollapse: (el) =>
                  Effect.sync(() => {
                    collapseCalled = true;
                    expandedState.set(el, false);
                  }),
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
            );
          }),
        ),
      );

      expect(collapseCalled).toBe(true);
    });

    it("should move to parent on ArrowLeft when collapsed", async () => {
      const { items, expandedState } = setupTreeItems();
      const [root1, child11] = items;

      // child11 is collapsed (no children anyway)
      expandedState.set(child11, false);
      child11.focus();

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              hierarchy: {
                getParent: (el) => {
                  const parentId = el.getAttribute("data-parent");
                  if (parentId) {
                    const parent = document.getElementById(parentId);
                    return parent ? Option.some(parent) : Option.none();
                  }
                  return Option.none();
                },
                getFirstChild: () => Option.none(),
                isExpanded: (el) => expandedState.get(el) ?? false,
                onExpand: () => Effect.void,
                onCollapse: () => Effect.void,
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
            );
          }),
        ),
      );

      expect(document.activeElement).toBe(root1);
    });

    it("should call onFocus when moving to child or parent", async () => {
      const { items, expandedState } = setupTreeItems();
      const [root1, child11] = items;

      expandedState.set(root1, true);
      root1.focus();

      let focusedElement: HTMLElement | null = null;
      let focusedIndex = -1;

      await runTest(
        Effect.scoped(
          Effect.gen(function* () {
            const handleKeyDown = yield* createKeyboardNav({
              selector: "[data-nav-item]",
              orientation: "vertical",
              onFocus: (el, idx) =>
                Effect.flatMap(el, (e) =>
                  Effect.sync(() => {
                    focusedElement = e;
                    focusedIndex = idx;
                  }),
                ),
              hierarchy: {
                getParent: (el) => {
                  const parentId = el.getAttribute("data-parent");
                  if (parentId) {
                    const parent = document.getElementById(parentId);
                    return parent ? Option.some(parent) : Option.none();
                  }
                  return Option.none();
                },
                getFirstChild: (el) => {
                  const children = document.querySelectorAll(
                    `[data-parent="${el.id}"]`,
                  );
                  return children.length > 0
                    ? Option.some(children[0] as HTMLElement)
                    : Option.none();
                },
                isExpanded: (el) => expandedState.get(el) ?? false,
                onExpand: () => Effect.void,
                onCollapse: () => Effect.void,
              },
            });

            yield* handleKeyDown(
              new KeyboardEvent("keydown", {
                key: "ArrowRight",
                bubbles: true,
              }),
            );
          }),
        ),
      );

      expect(focusedElement).toBe(child11);
      expect(focusedIndex).toBe(1);
    });
  });
});
