import { describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { beforeEach, expect } from "vitest";

import { Readable, Signal } from "@effex/core";

import { stagger } from "../Animation/index.js";
import { collect } from "../Collect.js";
import { $ } from "../Element/index.js";
import { DOMRendererLive } from "../Render/DOMRenderer.js";
import { ClientControlCtx, each, match, when } from "./index.js";

const TestLayer = Layer.mergeAll(ClientControlCtx, DOMRendererLive);

describe("Control", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("when", () => {
    it.scopedLive("should render onTrue when condition is true", () =>
      Effect.gen(function* () {
        const isVisible = yield* Signal.make(true);
        const el = yield* when(isVisible, {
          onTrue: () => $.div({}, $.of("Visible")),
          onFalse: () => $.div({}, $.of("Hidden")),
        });

        expect(el.textContent).toBe("Visible");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should render onFalse when condition is false", () =>
      Effect.gen(function* () {
        const isVisible = yield* Signal.make(false);
        const el = yield* when(isVisible, {
          onTrue: () => $.div({}, $.of("Visible")),
          onFalse: () => $.div({}, $.of("Hidden")),
        });

        expect(el.textContent).toBe("Hidden");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should switch rendering when condition changes", () =>
      Effect.gen(function* () {
        const isVisible = yield* Signal.make(true);
        const el = yield* when(isVisible, {
          onTrue: () => $.div({}, $.of("Visible")),
          onFalse: () => $.div({}, $.of("Hidden")),
        });

        expect(el.textContent).toBe("Visible");

        // Wait for forked subscription fiber to start
        yield* Effect.sleep("20 millis");

        yield* isVisible.set(false);
        yield* Effect.sleep("20 millis");

        expect(el.textContent).toBe("Hidden");

        yield* isVisible.set(true);
        yield* Effect.sleep("20 millis");

        expect(el.textContent).toBe("Visible");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should not re-render when condition stays the same", () =>
      Effect.gen(function* () {
        let renderCount = 0;
        const isVisible = yield* Signal.make(true);
        yield* when(isVisible, {
          onTrue: () => {
            renderCount++;
            return $.div({}, $.of("Visible"));
          },
          onFalse: () => $.div({}, $.of("Hidden")),
        });

        expect(renderCount).toBe(1);

        yield* Effect.sleep("20 millis");
        yield* isVisible.set(true); // Same value
        yield* Effect.sleep("20 millis");

        // Should not re-render since condition didn't change
        expect(renderCount).toBe(1);
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("match", () => {
    it.scopedLive("should render matching pattern", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should switch when pattern changes", () =>
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

        yield* Effect.sleep("20 millis");
        yield* status.set("success");
        yield* Effect.sleep("20 millis");

        expect(el.textContent).toBe("Done!");

        yield* status.set("error");
        yield* Effect.sleep("20 millis");

        expect(el.textContent).toBe("Failed");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should render fallback when no pattern matches", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("each", () => {
    it.scopedLive("should render list items", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should add new items", () =>
      Effect.gen(function* () {
        const items = yield* Signal.make([{ id: "1", name: "Alice" }]);

        const el = yield* each(items, {
          key: (item) => item.id,
          render: (item, _index) =>
            $.li({}, $.of(Readable.map(item, (i) => i.name))),
        });

        expect(el.children.length).toBe(1);

        yield* Effect.sleep("20 millis");
        yield* items.update((list) => [...list, { id: "2", name: "Bob" }]);
        yield* Effect.sleep("20 millis");

        expect(el.children.length).toBe(2);
        expect(el.children[1].textContent).toBe("Bob");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should remove items", () =>
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

        yield* Effect.sleep("20 millis");
        yield* items.update((list) => list.filter((i) => i.id !== "1"));
        yield* Effect.sleep("20 millis");

        expect(el.children.length).toBe(1);
        expect(el.children[0].textContent).toBe("Bob");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should update existing items", () =>
      Effect.gen(function* () {
        const items = yield* Signal.make([{ id: "1", name: "Alice" }]);

        const el = yield* each(items, {
          key: (item) => item.id,
          render: (item, _index) =>
            $.li({}, $.of(Readable.map(item, (i) => i.name))),
        });

        expect(el.children[0].textContent).toBe("Alice");

        yield* Effect.sleep("20 millis");
        yield* items.update((list) =>
          list.map((i) => (i.id === "1" ? { ...i, name: "Alicia" } : i)),
        );
        yield* Effect.sleep("20 millis");

        expect(el.children[0].textContent).toBe("Alicia");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should reorder items", () =>
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

        yield* Effect.sleep("20 millis");
        yield* items.set([
          { id: "3", name: "Charlie" },
          { id: "2", name: "Bob" },
          { id: "1", name: "Alice" },
        ]);
        yield* Effect.sleep("20 millis");

        expect(el.children[0].textContent).toBe("Charlie");
        expect(el.children[2].textContent).toBe("Alice");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle empty list", () =>
      Effect.gen(function* () {
        const items = yield* Signal.make<{ id: string; name: string }[]>([]);

        const el = yield* each(items, {
          key: (item) => item.id,
          render: (item, _index) =>
            $.li({}, $.of(Readable.map(item, (i) => i.name))),
        });

        expect(el.children.length).toBe(0);
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("nested control functions", () => {
    it.scopedLive("should handle when inside when", () =>
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

        yield* Effect.sleep("20 millis");
        yield* inner.set(false);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Outer true, inner false");

        yield* outer.set(false);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Outer false");

        yield* outer.set(true);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Outer true, inner false");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle match inside when", () =>
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

        yield* Effect.sleep("20 millis");
        yield* status.set("success");
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Done!");

        yield* showDetails.set(false);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Hidden");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle each inside when", () =>
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

        yield* Effect.sleep("20 millis");
        yield* items.update((list) => [...list, { id: "3", name: "Charlie" }]);
        yield* Effect.sleep("20 millis");
        expect(eachContainer.children.length).toBe(3);

        yield* showList.set(false);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("List hidden");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle when inside each", () =>
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

        yield* Effect.sleep("20 millis");
        yield* items.set([
          { id: "1", name: "Alice", active: false },
          { id: "2", name: "Bob", active: true },
        ]);
        yield* Effect.sleep("20 millis");

        expect(el.children[0].textContent).toBe("Alice");
        expect(el.children[1].textContent).toBe("Bob (active)");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("deeply nested control functions", () => {
    it.scopedLive("should handle three levels of nesting", () =>
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

        yield* Effect.sleep("20 millis");
        yield* level3.set("y");
        yield* Effect.sleep("20 millis");
        expect(getDeepText()).toBe("Deep Y");

        yield* level2.set(false);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Level 2 false");

        yield* level1.set(false);
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("Level 1 false");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("sibling control functions with collect", () => {
    it.scopedLive("should handle multiple when in collect", () =>
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

        yield* Effect.sleep("20 millis");
        yield* show1.set(false);
        yield* show2.set(true);
        yield* Effect.sleep("20 millis");

        expect(el.children[0].textContent).toBe("First hidden");
        expect(el.children[1].textContent).toBe("Second visible");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle when and match in collect", () =>
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

        yield* Effect.sleep("20 millis");
        yield* isVisible.set(false);
        yield* status.set("b");
        yield* Effect.sleep("20 millis");

        expect(el.children[0].textContent).toBe("Hidden");
        expect(el.children[1].textContent).toBe("Status B");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle when and each in collect", () =>
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

        yield* Effect.sleep("20 millis");
        yield* showHeader.set(false);
        yield* items.update((list) => [...list, "c"]);
        yield* Effect.sleep("20 millis");

        expect(el.children[0].textContent).toBe("No Header");
        expect(el.children[1].children.length).toBe(3);
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("each animation stagger", () => {
    it.scopedLive(
      "runs onBeforeEnter with per-item delays matching the stagger function",
      () =>
        Effect.gen(function* () {
          // Record hook invocations against a monotonic clock. jsdom doesn't
          // fire real transitionend, so animations complete via the timeout;
          // we only care that onBeforeEnter fires with the expected spacing.
          const start = performance.now();
          const timings: number[] = [];
          const onBeforeEnter = () =>
            Effect.sync(() => {
              timings.push(performance.now() - start);
            });

          const items = yield* Signal.make(["a", "b", "c"]);
          yield* each(items, {
            key: (item) => item,
            render: (item) => $.li({}, $.of(item)),
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100",
              stagger: stagger(40),
              onBeforeEnter,
              timeout: 20,
            },
          });

          // Longest expected delay is 2 * 40ms; wait a bit past that.
          yield* Effect.sleep("150 millis");

          expect(timings).toHaveLength(3);
          // Item 0 fires ~immediately, item 1 near 40ms, item 2 near 80ms.
          // Generous tolerance for scheduler jitter under jsdom.
          expect(timings[0]).toBeLessThan(20);
          expect(timings[1]).toBeGreaterThanOrEqual(30);
          expect(timings[1]).toBeLessThan(70);
          expect(timings[2]).toBeGreaterThanOrEqual(70);
          expect(timings[2]).toBeLessThan(120);
        }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive(
      "runs all items simultaneously when no stagger is configured",
      () =>
        Effect.gen(function* () {
          const start = performance.now();
          const timings: number[] = [];
          const onBeforeEnter = () =>
            Effect.sync(() => {
              timings.push(performance.now() - start);
            });

          const items = yield* Signal.make(["a", "b", "c"]);
          yield* each(items, {
            key: (item) => item,
            render: (item) => $.li({}, $.of(item)),
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100",
              onBeforeEnter,
              timeout: 20,
            },
          });

          yield* Effect.sleep("50 millis");

          expect(timings).toHaveLength(3);
          for (const t of timings) expect(t).toBeLessThan(20);
        }).pipe(Effect.provide(TestLayer)),
    );
  });
});
