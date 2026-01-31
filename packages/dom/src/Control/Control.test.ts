import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { Readable, Signal } from "@effex/core";

import { ClientControlCtx, each, match, when } from ".";
import { collect } from "../Collect";
import { DOMRendererLive } from "../DOMRenderer";
import { $ } from "../Element";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(ClientControlCtx),
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Control", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("when", () => {
    it("should render onTrue when condition is true", async () => {
      await runTest(
        Effect.gen(function* () {
          const isVisible = yield* Signal.make(true);
          const el = yield* when(isVisible, {
            onTrue: () => $.div({}, $.of("Visible")),
            onFalse: () => $.div({}, $.of("Hidden")),
          });

          expect(el.textContent).toBe("Visible");
        }),
      );
    });

    it("should render onFalse when condition is false", async () => {
      await runTest(
        Effect.gen(function* () {
          const isVisible = yield* Signal.make(false);
          const el = yield* when(isVisible, {
            onTrue: () => $.div({}, $.of("Visible")),
            onFalse: () => $.div({}, $.of("Hidden")),
          });

          expect(el.textContent).toBe("Hidden");
        }),
      );
    });

    it("should switch rendering when condition changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const isVisible = yield* Signal.make(true);
          const el = yield* when(isVisible, {
            onTrue: () => $.div({}, $.of("Visible")),
            onFalse: () => $.div({}, $.of("Hidden")),
          });

          expect(el.textContent).toBe("Visible");

          yield* isVisible.set(false);
          yield* Effect.sleep(10);

          expect(el.textContent).toBe("Hidden");

          yield* isVisible.set(true);
          yield* Effect.sleep(10);

          expect(el.textContent).toBe("Visible");
        }),
      );
    });

    it("should not re-render when condition stays the same", async () => {
      let renderCount = 0;

      await runTest(
        Effect.gen(function* () {
          const isVisible = yield* Signal.make(true);
          yield* when(isVisible, {
            onTrue: () => {
              renderCount++;
              return $.div({}, $.of("Visible"));
            },
            onFalse: () => $.div({}, $.of("Hidden")),
          });

          expect(renderCount).toBe(1);

          yield* isVisible.set(true); // Same value
          yield* Effect.sleep(10);

          // Should not re-render since condition didn't change
          expect(renderCount).toBe(1);
        }),
      );
    });
  });

  describe("match", () => {
    it("should render matching pattern", async () => {
      await runTest(
        Effect.gen(function* () {
          const status = yield* Signal.make<"loading" | "success" | "error">(
            "loading",
          );
          const el = yield* match(status, {
            cases: [
              {
                pattern: "loading",
                render: () => $.div({}, $.of("Loading...")),
              },
              { pattern: "success", render: () => $.div({}, $.of("Done!")) },
              { pattern: "error", render: () => $.div({}, $.of("Failed")) },
            ],
          });

          expect(el.textContent).toBe("Loading...");
        }),
      );
    });

    it("should switch when pattern changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const status = yield* Signal.make<"loading" | "success" | "error">(
            "loading",
          );
          const el = yield* match(status, {
            cases: [
              {
                pattern: "loading",
                render: () => $.div({}, $.of("Loading...")),
              },
              { pattern: "success", render: () => $.div({}, $.of("Done!")) },
              { pattern: "error", render: () => $.div({}, $.of("Failed")) },
            ],
          });

          expect(el.textContent).toBe("Loading...");

          yield* status.set("success");
          yield* Effect.sleep(10);

          expect(el.textContent).toBe("Done!");

          yield* status.set("error");
          yield* Effect.sleep(10);

          expect(el.textContent).toBe("Failed");
        }),
      );
    });

    it("should render fallback when no pattern matches", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make(999);
          const el = yield* match(value, {
            cases: [
              { pattern: 1, render: () => $.div({}, $.of("One")) },
              { pattern: 2, render: () => $.div({}, $.of("Two")) },
            ],
            fallback: () => $.div({}, $.of("Unknown")),
          });

          expect(el.textContent).toBe("Unknown");
        }),
      );
    });
  });

  describe("each", () => {
    it("should render list items", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make([
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
            { id: "3", name: "Charlie" },
          ]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item, _index) =>
              $.li({}, $.of(Readable.map(item, (i) => i.name))),
          });

          expect(el.children.length).toBe(3);
          expect(el.children[0].textContent).toBe("Alice");
          expect(el.children[1].textContent).toBe("Bob");
          expect(el.children[2].textContent).toBe("Charlie");
        }),
      );
    });

    it("should add new items", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make([{ id: "1", name: "Alice" }]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item, _index) =>
              $.li({}, $.of(Readable.map(item, (i) => i.name))),
          });

          expect(el.children.length).toBe(1);

          yield* items.update((list) => [...list, { id: "2", name: "Bob" }]);
          yield* Effect.sleep(10);

          expect(el.children.length).toBe(2);
          expect(el.children[1].textContent).toBe("Bob");
        }),
      );
    });

    it("should remove items", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make([
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
          ]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item, _index) =>
              $.li({}, $.of(Readable.map(item, (i) => i.name))),
          });

          expect(el.children.length).toBe(2);

          yield* items.update((list) => list.filter((i) => i.id !== "1"));
          yield* Effect.sleep(10);

          expect(el.children.length).toBe(1);
          expect(el.children[0].textContent).toBe("Bob");
        }),
      );
    });

    it("should update existing items", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make([{ id: "1", name: "Alice" }]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item, _index) =>
              $.li({}, $.of(Readable.map(item, (i) => i.name))),
          });

          expect(el.children[0].textContent).toBe("Alice");

          yield* items.update((list) =>
            list.map((i) => (i.id === "1" ? { ...i, name: "Alicia" } : i)),
          );
          yield* Effect.sleep(10);

          expect(el.children[0].textContent).toBe("Alicia");
        }),
      );
    });

    it("should reorder items", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make([
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
            { id: "3", name: "Charlie" },
          ]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item, _index) =>
              $.li({}, $.of(Readable.map(item, (i) => i.name))),
          });

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
      );
    });

    it("should handle empty list", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make<{ id: string; name: string }[]>([]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item, _index) =>
              $.li({}, $.of(Readable.map(item, (i) => i.name))),
          });

          expect(el.children.length).toBe(0);
        }),
      );
    });
  });

  describe("nested control functions", () => {
    it("should handle when inside when", async () => {
      await runTest(
        Effect.gen(function* () {
          const outer = yield* Signal.make(true);
          const inner = yield* Signal.make(true);

          const el = yield* when(outer, {
            onTrue: () =>
              $.div(
                {},
                when(inner, {
                  onTrue: () => $.span({}, $.of("Both true")),
                  onFalse: () => $.span({}, $.of("Outer true, inner false")),
                }),
              ),
            onFalse: () => $.div({}, $.of("Outer false")),
          });

          expect(el.textContent).toBe("Both true");

          yield* inner.set(false);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Outer true, inner false");

          yield* outer.set(false);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Outer false");

          yield* outer.set(true);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Outer true, inner false");
        }),
      );
    });

    it("should handle match inside when", async () => {
      await runTest(
        Effect.gen(function* () {
          const showDetails = yield* Signal.make(true);
          const status = yield* Signal.make<"loading" | "success" | "error">(
            "loading",
          );

          const el = yield* when(showDetails, {
            onTrue: () =>
              $.div(
                {},
                match(status, {
                  cases: [
                    {
                      pattern: "loading",
                      render: () => $.span({}, $.of("Loading...")),
                    },
                    {
                      pattern: "success",
                      render: () => $.span({}, $.of("Done!")),
                    },
                    {
                      pattern: "error",
                      render: () => $.span({}, $.of("Failed")),
                    },
                  ],
                }),
              ),
            onFalse: () => $.div({}, $.of("Hidden")),
          });

          expect(el.textContent).toBe("Loading...");

          yield* status.set("success");
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Done!");

          yield* showDetails.set(false);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Hidden");
        }),
      );
    });

    it("should handle each inside when", async () => {
      await runTest(
        Effect.gen(function* () {
          const showList = yield* Signal.make(true);
          const items = yield* Signal.make([
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
          ]);

          const el = yield* when(showList, {
            onTrue: () =>
              $.div(
                {},
                each(items, {
                  key: (item) => item.id,
                  render: (item) =>
                    $.span({}, $.of(Readable.map(item, (i) => i.name))),
                }),
              ),
            onFalse: () => $.div({}, $.of("List hidden")),
          });

          // el = when's container, el.children[0] = div from onTrue
          // el.children[0].children[0] = each's container
          expect(el.children.length).toBe(1);
          const divWrapper = el.children[0];
          expect(divWrapper.children.length).toBe(1);
          const eachContainer = divWrapper.children[0];
          expect(eachContainer.children.length).toBe(2);
          expect(eachContainer.children[0].textContent).toBe("Alice");

          yield* items.update((list) => [
            ...list,
            { id: "3", name: "Charlie" },
          ]);
          yield* Effect.sleep(10);
          expect(eachContainer.children.length).toBe(3);

          yield* showList.set(false);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("List hidden");
        }),
      );
    });

    it("should handle when inside each", async () => {
      await runTest(
        Effect.gen(function* () {
          const items = yield* Signal.make([
            { id: "1", name: "Alice", active: true },
            { id: "2", name: "Bob", active: false },
          ]);

          const el = yield* each(items, {
            key: (item) => item.id,
            render: (item) =>
              $.li(
                {},
                when(
                  Readable.map(item, (i) => i.active),
                  {
                    onTrue: () =>
                      $.span(
                        {},
                        $.of(Readable.map(item, (i) => `${i.name} (active)`)),
                      ),
                    onFalse: () =>
                      $.span({}, $.of(Readable.map(item, (i) => i.name))),
                  },
                ),
              ),
          });

          expect(el.children[0].textContent).toBe("Alice (active)");
          expect(el.children[1].textContent).toBe("Bob");

          yield* items.set([
            { id: "1", name: "Alice", active: false },
            { id: "2", name: "Bob", active: true },
          ]);
          yield* Effect.sleep(10);

          expect(el.children[0].textContent).toBe("Alice");
          expect(el.children[1].textContent).toBe("Bob (active)");
        }),
      );
    });
  });

  describe("deeply nested control functions", () => {
    it("should handle three levels of nesting", async () => {
      await runTest(
        Effect.gen(function* () {
          const level1 = yield* Signal.make(true);
          const level2 = yield* Signal.make(true);
          const level3 = yield* Signal.make<"x" | "y">("x");

          const el = yield* when(level1, {
            onTrue: () =>
              $.div(
                { class: "level1" },
                when(level2, {
                  onTrue: () =>
                    $.div(
                      { class: "level2" },
                      match(level3, {
                        cases: [
                          {
                            pattern: "x",
                            render: () => $.span({}, $.of("Deep X")),
                          },
                          {
                            pattern: "y",
                            render: () => $.span({}, $.of("Deep Y")),
                          },
                        ],
                      }),
                    ),
                  onFalse: () => $.div({}, $.of("Level 2 false")),
                }),
              ),
            onFalse: () => $.div({}, $.of("Level 1 false")),
          });

          // Navigate to the deepest content
          const getDeepText = () => {
            const l1 = el;
            const l2 = l1.querySelector(".level2");
            return l2 ? l2.textContent : l1.textContent;
          };

          expect(getDeepText()).toBe("Deep X");

          yield* level3.set("y");
          yield* Effect.sleep(10);
          expect(getDeepText()).toBe("Deep Y");

          yield* level2.set(false);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Level 2 false");

          yield* level1.set(false);
          yield* Effect.sleep(10);
          expect(el.textContent).toBe("Level 1 false");
        }),
      );
    });
  });

  describe("sibling control functions with collect", () => {
    it("should handle multiple when in collect", async () => {
      await runTest(
        Effect.gen(function* () {
          const show1 = yield* Signal.make(true);
          const show2 = yield* Signal.make(false);

          const el = yield* $.div(
            {},
            collect(
              when(show1, {
                onTrue: () => $.span({}, $.of("First visible")),
                onFalse: () => $.span({}, $.of("First hidden")),
              }),
              when(show2, {
                onTrue: () => $.span({}, $.of("Second visible")),
                onFalse: () => $.span({}, $.of("Second hidden")),
              }),
            ),
          );

          // Each when creates its own container
          expect(el.children.length).toBe(2);
          expect(el.children[0].textContent).toBe("First visible");
          expect(el.children[1].textContent).toBe("Second hidden");

          yield* show1.set(false);
          yield* show2.set(true);
          yield* Effect.sleep(10);

          expect(el.children[0].textContent).toBe("First hidden");
          expect(el.children[1].textContent).toBe("Second visible");
        }),
      );
    });

    it("should handle when and match in collect", async () => {
      await runTest(
        Effect.gen(function* () {
          const isVisible = yield* Signal.make(true);
          const status = yield* Signal.make<"a" | "b">("a");

          const el = yield* $.div(
            {},
            collect(
              when(isVisible, {
                onTrue: () => $.span({}, $.of("Visible")),
                onFalse: () => $.span({}, $.of("Hidden")),
              }),
              match(status, {
                cases: [
                  { pattern: "a", render: () => $.span({}, $.of("Status A")) },
                  { pattern: "b", render: () => $.span({}, $.of("Status B")) },
                ],
              }),
            ),
          );

          expect(el.children[0].textContent).toBe("Visible");
          expect(el.children[1].textContent).toBe("Status A");

          yield* isVisible.set(false);
          yield* status.set("b");
          yield* Effect.sleep(10);

          expect(el.children[0].textContent).toBe("Hidden");
          expect(el.children[1].textContent).toBe("Status B");
        }),
      );
    });

    it("should handle when and each in collect", async () => {
      await runTest(
        Effect.gen(function* () {
          const showHeader = yield* Signal.make(true);
          const items = yield* Signal.make(["a", "b"]);

          const el = yield* $.div(
            {},
            collect(
              when(showHeader, {
                onTrue: () => $.h1({}, $.of("Header")),
                onFalse: () => $.h1({}, $.of("No Header")),
              }),
              each(items, {
                key: (item) => item,
                render: (item) => $.li({}, $.of(item)),
              }),
            ),
          );

          // when's container and each's container
          expect(el.children.length).toBe(2);
          expect(el.children[0].textContent).toBe("Header");
          expect(el.children[1].children.length).toBe(2);

          yield* showHeader.set(false);
          yield* items.update((list) => [...list, "c"]);
          yield* Effect.sleep(10);

          expect(el.children[0].textContent).toBe("No Header");
          expect(el.children[1].children.length).toBe(3);
        }),
      );
    });
  });
});
