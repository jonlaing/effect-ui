import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
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

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[1]);
    });

    it("should move focus with ArrowLeft", async () => {
      const items = setupItems(3);
      items[1].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });

    it("should loop from last to first with ArrowRight", async () => {
      const items = setupItems(3);
      items[2].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
        loop: true,
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });

    it("should loop from first to last with ArrowLeft", async () => {
      const items = setupItems(3);
      items[0].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
        loop: true,
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[2]);
    });

    it("should not loop when loop is false", async () => {
      const items = setupItems(3);
      items[2].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
        loop: false,
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[2]); // Stays at last
    });
  });

  describe("vertical navigation", () => {
    it("should move focus with ArrowDown", async () => {
      const items = setupItems(3);
      items[0].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "vertical",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[1]);
    });

    it("should move focus with ArrowUp", async () => {
      const items = setupItems(3);
      items[1].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "vertical",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });
  });

  describe("Home and End keys", () => {
    it("should move to first item with Home", async () => {
      const items = setupItems(5);
      items[3].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[0]);
    });

    it("should move to last item with End", async () => {
      const items = setupItems(5);
      items[1].focus();

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "End", bubbles: true }),
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

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
        onFocus: (el, idx) =>
          Effect.sync(() => {
            focusedElement = el;
            focusedIndex = idx;
          }),
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
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

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
        onActivate: (el, idx) =>
          Effect.sync(() => {
            activatedElement = el;
            activatedIndex = idx;
          }),
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        ),
      );

      expect(activatedElement).toBe(items[1]);
      expect(activatedIndex).toBe(1);
    });

    it("should call onActivate on Space", async () => {
      const items = setupItems(3);
      items[2].focus();

      let activatedElement: HTMLElement | null = null;

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
        onActivate: (el) =>
          Effect.sync(() => {
            activatedElement = el;
          }),
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: " ", bubbles: true }),
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

            const handleKeyDown = createKeyboardNav({
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

      // Selector excludes disabled items
      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]:not([data-disabled])",
        orientation: "horizontal",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
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

      const handleKeyDown = createKeyboardNav({
        selector: "[data-nav-item]",
        orientation: "horizontal",
      });

      await runTest(
        handleKeyDown(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
        ),
      );

      expect(document.activeElement).toBe(items[1]); // Unchanged
    });
  });
});
