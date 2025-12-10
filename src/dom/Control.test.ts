import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal } from "@core/Signal";
import { when, match, each, ErrorBoundary, Suspense } from "./Control";
import { div, li } from "./Element";

describe("Control", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("when", () => {
    it("should render onTrue when condition is true", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isVisible = yield* Signal.make(true);
            const el = yield* when(
              isVisible,
              () => div("Visible"),
              () => div("Hidden"),
            );

            expect(el.textContent).toBe("Visible");
          }),
        ),
      );
    });

    it("should render onFalse when condition is false", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isVisible = yield* Signal.make(false);
            const el = yield* when(
              isVisible,
              () => div("Visible"),
              () => div("Hidden"),
            );

            expect(el.textContent).toBe("Hidden");
          }),
        ),
      );
    });

    it("should switch rendering when condition changes", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isVisible = yield* Signal.make(true);
            const el = yield* when(
              isVisible,
              () => div("Visible"),
              () => div("Hidden"),
            );

            expect(el.textContent).toBe("Visible");

            yield* isVisible.set(false);
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("Hidden");

            yield* isVisible.set(true);
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("Visible");
          }),
        ),
      );
    });

    it("should not re-render when condition stays the same", async () => {
      let renderCount = 0;

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isVisible = yield* Signal.make(true);
            yield* when(
              isVisible,
              () => {
                renderCount++;
                return div("Visible");
              },
              () => div("Hidden"),
            );

            expect(renderCount).toBe(1);

            yield* isVisible.set(true); // Same value
            yield* Effect.sleep(10);

            // Should not re-render since condition didn't change
            expect(renderCount).toBe(1);
          }),
        ),
      );
    });
  });

  describe("match", () => {
    it("should render matching pattern", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const status = yield* Signal.make<"loading" | "success" | "error">(
              "loading",
            );
            const el = yield* match(status, [
              { pattern: "loading", render: () => div("Loading...") },
              { pattern: "success", render: () => div("Done!") },
              { pattern: "error", render: () => div("Failed") },
            ]);

            expect(el.textContent).toBe("Loading...");
          }),
        ),
      );
    });

    it("should switch when pattern changes", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const status = yield* Signal.make<"loading" | "success" | "error">(
              "loading",
            );
            const el = yield* match(status, [
              { pattern: "loading", render: () => div("Loading...") },
              { pattern: "success", render: () => div("Done!") },
              { pattern: "error", render: () => div("Failed") },
            ]);

            expect(el.textContent).toBe("Loading...");

            yield* status.set("success");
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("Done!");

            yield* status.set("error");
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("Failed");
          }),
        ),
      );
    });

    it("should render fallback when no pattern matches", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const value = yield* Signal.make(999);
            const el = yield* match(
              value,
              [
                { pattern: 1, render: () => div("One") },
                { pattern: 2, render: () => div("Two") },
              ],
              () => div("Unknown"),
            );

            expect(el.textContent).toBe("Unknown");
          }),
        ),
      );
    });
  });

  describe("each", () => {
    it("should render list items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make([
              { id: "1", name: "Alice" },
              { id: "2", name: "Bob" },
              { id: "3", name: "Charlie" },
            ]);

            const el = yield* each(
              items,
              (item) => item.id,
              (item) => li(item.map((i) => i.name)),
            );

            expect(el.children.length).toBe(3);
            expect(el.children[0].textContent).toBe("Alice");
            expect(el.children[1].textContent).toBe("Bob");
            expect(el.children[2].textContent).toBe("Charlie");
          }),
        ),
      );
    });

    it("should add new items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make([{ id: "1", name: "Alice" }]);

            const el = yield* each(
              items,
              (item) => item.id,
              (item) => li(item.map((i) => i.name)),
            );

            expect(el.children.length).toBe(1);

            yield* items.update((list) => [...list, { id: "2", name: "Bob" }]);
            yield* Effect.sleep(10);

            expect(el.children.length).toBe(2);
            expect(el.children[1].textContent).toBe("Bob");
          }),
        ),
      );
    });

    it("should remove items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make([
              { id: "1", name: "Alice" },
              { id: "2", name: "Bob" },
            ]);

            const el = yield* each(
              items,
              (item) => item.id,
              (item) => li(item.map((i) => i.name)),
            );

            expect(el.children.length).toBe(2);

            yield* items.update((list) => list.filter((i) => i.id !== "1"));
            yield* Effect.sleep(10);

            expect(el.children.length).toBe(1);
            expect(el.children[0].textContent).toBe("Bob");
          }),
        ),
      );
    });

    it("should update existing items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make([{ id: "1", name: "Alice" }]);

            const el = yield* each(
              items,
              (item) => item.id,
              (item) => li(item.map((i) => i.name)),
            );

            expect(el.children[0].textContent).toBe("Alice");

            yield* items.update((list) =>
              list.map((i) => (i.id === "1" ? { ...i, name: "Alicia" } : i)),
            );
            yield* Effect.sleep(10);

            expect(el.children[0].textContent).toBe("Alicia");
          }),
        ),
      );
    });

    it("should reorder items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make([
              { id: "1", name: "Alice" },
              { id: "2", name: "Bob" },
              { id: "3", name: "Charlie" },
            ]);

            const el = yield* each(
              items,
              (item) => item.id,
              (item) => li(item.map((i) => i.name)),
            );

            expect(el.children[0].textContent).toBe("Alice");
            expect(el.children[2].textContent).toBe("Charlie");

            yield* items.set([
              { id: "3", name: "Charlie" },
              { id: "2", name: "Bob" },
              { id: "1", name: "Alice" },
            ]);
            yield* Effect.sleep(10);

            expect(el.children[0].textContent).toBe("Charlie");
            expect(el.children[2].textContent).toBe("Alice");
          }),
        ),
      );
    });

    it("should handle empty list", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make<{ id: string; name: string }[]>(
              [],
            );

            const el = yield* each(
              items,
              (item) => item.id,
              (item) => li(item.map((i) => i.name)),
            );

            expect(el.children.length).toBe(0);
          }),
        ),
      );
    });
  });

  describe("ErrorBoundary", () => {
    it("should render content when no error", async () => {
      const el = await Effect.runPromise(
        Effect.scoped(
          ErrorBoundary(
            () => div("Success"),
            () => div("Error occurred"),
          ),
        ),
      );

      expect(el.textContent).toBe("Success");
    });

    it("should render fallback on error", async () => {
      interface TestError {
        readonly _tag: "TestError";
        readonly message: string;
      }

      const makeTestError = (message: string): TestError => ({
        _tag: "TestError",
        message,
      });

      const el = await Effect.runPromise(
        Effect.scoped(
          ErrorBoundary(
            () =>
              Effect.gen(function* () {
                yield* Effect.fail(makeTestError("oops"));
                return yield* div("Never reached");
              }),
            (error) => div(`Caught: ${error.message}`),
          ),
        ),
      );

      expect(el.textContent).toBe("Caught: oops");
    });
  });

  describe("Suspense", () => {
    it("should show fallback then content", async () => {
      const el = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const container = yield* Suspense({
              render: () =>
                Effect.gen(function* () {
                  yield* Effect.sleep(20);
                  return yield* div("Loaded!");
                }),
              fallback: () => div("Loading..."),
            });

            // Should show fallback initially
            expect(container.textContent).toBe("Loading...");

            // Wait for async content
            yield* Effect.sleep(50);

            // Should now show loaded content
            expect(container.textContent).toBe("Loaded!");

            return container;
          }),
        ),
      );

      expect(el).toBeTruthy();
    });
  });
});
