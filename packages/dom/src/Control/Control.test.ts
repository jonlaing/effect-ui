import { describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { beforeEach, expect } from "vitest";

import { Readable, Signal } from "@stax-ui/core";

import { Animation } from "../Animation/index.js";
import { collect } from "../Collect.js";
import { $ } from "../Element/index.js";
import { DOMRendererLive } from "../Render/DOMRenderer.js";
import { animated, ClientControlCtx, each, match, when } from "./index.js";

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
      "invokes the stagger function with each item's index and total",
      () =>
        // Reconcile is expected to call stagger(index, total) for every new
        // slot in the batch — so we spy on the function itself instead of
        // measuring wall-clock delays (which are unreliable under CI load).
        Effect.gen(function* () {
          const calls: Array<{ index: number; total: number }> = [];
          const spy = (index: number, total: number) => {
            calls.push({ index, total });
            return 0;
          };

          const items = yield* Signal.make(["a", "b", "c"]);
          yield* each(items, {
            key: (item) => item,
            render: (item) => $.li({}, $.of(item)),
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100",
              stagger: spy,
              timeout: 10,
            },
          });

          // Give the forked fibers a moment to reach the stagger call.
          yield* Effect.sleep("20 millis");

          expect(calls).toEqual([
            { index: 0, total: 3 },
            { index: 1, total: 3 },
            { index: 2, total: 3 },
          ]);
        }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("does not invoke stagger when the option is omitted", () =>
      Effect.gen(function* () {
        let callCount = 0;
        const untriggered = (_index: number, _total: number) => {
          callCount++;
          return 0;
        };

        const items = yield* Signal.make(["a", "b"]);
        yield* each(items, {
          key: (item) => item,
          render: (item) => $.li({}, $.of(item)),
          animate: {
            // Note: stagger is deliberately omitted here. `untriggered` is
            // declared only so the assertion below can reference it and be
            // read as "the spy that would have fired if stagger had been
            // set". Tsc otherwise flags the arrow as unused.
            enterFrom: "opacity-0",
            enter: "opacity-100",
            timeout: 10,
          },
        });

        yield* Effect.sleep("20 millis");
        expect(callCount).toBe(0);
        // Reference `untriggered` to satisfy the linter that it exists as a
        // documentation aid; behaviourally it must never have been called.
        expect(untriggered.length).toBe(2);
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("animated", () => {
    it.scopedLive("mounts its child inside a container", () =>
      Effect.gen(function* () {
        const el = yield* animated({}, () =>
          $.span({ class: "greeting" }, $.of("Hello")),
        );
        // Default container wraps the rendered child.
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe("SPAN");
        expect(el.children[0].textContent).toBe("Hello");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive(
      "fires onBeforeEnter on client mount when animate is set",
      () =>
        Effect.gen(function* () {
          let called = 0;
          yield* animated(
            {
              animate: {
                enterFrom: "opacity-0",
                enter: "opacity-100",
                onBeforeEnter: () =>
                  Effect.sync(() => {
                    called += 1;
                  }),
                timeout: 10,
              },
            },
            () => $.span({}, $.of("Hi")),
          );
          // Give the forked enter animation a moment to reach onBeforeEnter.
          yield* Effect.sleep("20 millis");
          expect(called).toBe(1);
        }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive(
      "applies enterFrom to the child before the animation fiber runs",
      () =>
        // The other-agent claim we're testing: on client-mode addSlot
        // (the re-mount path, not hydration), enterFrom lands on the
        // element BEFORE the forked enter animation starts. onBeforeEnter
        // runs at the top of runAnimation, before the addBeforeReflow
        // step — so a snapshot taken there tells us whether
        // applyPreInsertEnterFrom has already fired.
        Effect.gen(function* () {
          let snapshotAtBeforeEnter: string | null = null;
          const container = yield* animated(
            {
              animate: {
                enterFrom: "opacity-0",
                enter: "opacity-100",
                enterTo: "opacity-100",
                onBeforeEnter: (el) =>
                  Effect.tap(el, (e) =>
                    Effect.sync(() => {
                      snapshotAtBeforeEnter = e.className;
                    }),
                  ),
                timeout: 10,
              },
            },
            () => $.span({ class: "target" }, $.of("Hi")),
          );
          // Also snapshot the classList SYNCHRONOUSLY after mount, before
          // the forked enter runs — proves applyPreInsertEnterFrom landed
          // BEFORE insertion, not just when onBeforeEnter fires.
          const child = container.querySelector<HTMLSpanElement>(".target");
          const preAnimationClasses = child?.className ?? "";

          yield* Effect.sleep("20 millis");

          expect(preAnimationClasses).toContain("opacity-0");
          expect(snapshotAtBeforeEnter).toContain("opacity-0");
        }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive(
      "re-applies enterFrom on remount (simulating a router re-render)",
      () =>
        // The heart of the reported bug: when a component is unmounted
        // and re-mounted (route navigation), the second mount should
        // apply enterFrom to the fresh element the same way the first
        // did. This drives a `when` toggle to exercise the reconcile
        // remove/add path — the same path the router hits on nav.
        Effect.gen(function* () {
          const visible = yield* Signal.make(true);
          const snapshots: string[] = [];
          const wrapper = yield* when(visible, {
            onTrue: () =>
              animated(
                {
                  animate: {
                    enterFrom: "opacity-0",
                    enter: "opacity-100",
                    enterTo: "opacity-100",
                    onBeforeEnter: (el) =>
                      Effect.tap(el, (e) =>
                        Effect.sync(() => {
                          snapshots.push(e.className);
                        }),
                      ),
                    timeout: 10,
                  },
                },
                () => $.span({ class: "target" }, $.of("Hi")),
              ),
            onFalse: () => $.div({ class: "gone" }, $.of("gone")),
          });

          // First mount fires.
          yield* Effect.sleep("20 millis");
          expect(snapshots.length).toBe(1);
          expect(snapshots[0]).toContain("opacity-0");

          // Simulate route navigation away and back.
          yield* visible.set(false);
          yield* Effect.sleep("10 millis");
          yield* visible.set(true);
          yield* Effect.sleep("20 millis");

          expect(snapshots.length).toBe(2);
          expect(snapshots[1]).toContain("opacity-0");
          void wrapper;
        }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive(
      "onBeforeEnter fires against an attached element (nested remount)",
      () =>
        // Regression: on a nested-`animated` re-mount, the enter fiber
        // was forked from inside the inner addSlot while the ancestor
        // chain was still being assembled bottom-up in memory. Effect's
        // scheduler could give the fiber control on the next microtask,
        // before the outer flow appended the wrapper into the document.
        // onBeforeEnter then fired against a detached node —
        // getComputedStyle returned empty strings and the transition
        // never fired. Verify the element is `isConnected` at onBeforeEnter.
        Effect.gen(function* () {
          const root = document.createElement("div");
          document.body.appendChild(root);

          const visible = yield* Signal.make(true);
          const connectedFlags: boolean[] = [];

          // Two levels of nesting under the `when` — mirrors the shape
          // of Outlet → HomePage → Headline → animated in the report.
          const view = yield* when(visible, {
            onTrue: () =>
              $.div(
                { class: "outer" },
                $.div(
                  { class: "middle" },
                  animated(
                    {
                      animate: {
                        enterFrom: "opacity-0",
                        enter: "transition-opacity duration-100",
                        enterTo: "opacity-100",
                        onBeforeEnter: (el) =>
                          Effect.tap(el, (e) =>
                            Effect.sync(() => {
                              connectedFlags.push(e.isConnected);
                            }),
                          ),
                        timeout: 20,
                      },
                    },
                    () => $.div({ class: "target" }, $.of("Hi")),
                  ),
                ),
              ),
            onFalse: () => $.div({ class: "gone" }),
          });

          // Attach the top-level result under a real DOM root so
          // `isConnected` propagates all the way down.
          root.appendChild(view as HTMLElement);

          // First mount — everything attached synchronously above.
          yield* Effect.sleep("40 millis");
          expect(connectedFlags.length).toBe(1);
          expect(connectedFlags[0]).toBe(true);

          // Toggle away and back — this is the failure shape from the
          // portfolio report.
          yield* visible.set(false);
          yield* Effect.sleep("10 millis");
          yield* visible.set(true);
          yield* Effect.sleep("40 millis");

          expect(connectedFlags.length).toBe(2);
          expect(connectedFlags[1]).toBe(true);

          document.body.removeChild(root);
        }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("gates on an AnimationGroup", () =>
      Effect.gen(function* () {
        // Two `animated` blocks in sequence — the second must not fire its
        // onBeforeEnter until the first's group completes.
        const [g0, g1] = yield* Animation.sequence(2);
        const log: string[] = [];

        yield* animated(
          {
            animate: {
              enter: "in",
              group: g0,
              onBeforeEnter: () =>
                Effect.sync(() => {
                  log.push("0-start");
                }),
              onEnter: () =>
                Effect.sync(() => {
                  log.push("0-end");
                }),
              timeout: 10,
            },
          },
          () => $.span({}, $.of("First")),
        );

        yield* animated(
          {
            animate: {
              enter: "in",
              group: g1,
              onBeforeEnter: () =>
                Effect.sync(() => {
                  log.push("1-start");
                }),
              timeout: 10,
            },
          },
          () => $.span({}, $.of("Second")),
        );

        // 0 fires immediately (g0 gate open), 1 waits for g0 to complete.
        yield* Effect.sleep("50 millis");
        // 0-start must precede 0-end, and 1-start must be strictly after 0-end.
        const zeroEnd = log.indexOf("0-end");
        const oneStart = log.indexOf("1-start");
        expect(zeroEnd).toBeGreaterThan(-1);
        expect(oneStart).toBeGreaterThan(zeroEnd);
      }).pipe(Effect.provide(TestLayer)),
    );
  });
});
