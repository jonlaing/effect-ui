import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { $, DOMRendererLive, Signal } from "@effex/dom";

import { Splitter } from "./Splitter";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Splitter", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with data-splitter-root", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, [$.div({}, "Panel 1")]),
            Splitter.Handle({}),
            Splitter.Panel({}, [$.div({}, "Panel 2")]),
          ]);

          expect(el.hasAttribute("data-splitter-root")).toBe(true);
        }),
      );
    });

    it("should set data-orientation to horizontal by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          expect(el.getAttribute("data-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should set data-orientation to vertical when specified", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ orientation: "vertical" }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          expect(el.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });

    it("should set aria-label when provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root(
            { "aria-label": "Resizable layout" },
            [
              Splitter.Panel({}, []),
              Splitter.Handle({}),
              Splitter.Panel({}, []),
            ],
          );

          expect(el.getAttribute("aria-label")).toBe("Resizable layout");
        }),
      );
    });

    it("should use flex layout", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          expect(el.style.display).toBe("flex");
          expect(el.style.flexDirection).toBe("row");
        }),
      );
    });

    it("should use column flex direction for vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ orientation: "vertical" }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          expect(el.style.flexDirection).toBe("column");
        }),
      );
    });
  });

  describe("Panel", () => {
    it("should render with data-splitter-panel", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, [$.div({}, "Content")]),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const panels = el.querySelectorAll("[data-splitter-panel]");
          expect(panels.length).toBe(2);
        }),
      );
    });

    it("should have unique IDs", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const panels = el.querySelectorAll("[data-splitter-panel]");
          const id1 = panels[0]?.getAttribute("id");
          const id2 = panels[1]?.getAttribute("id");

          expect(id1).not.toBeNull();
          expect(id2).not.toBeNull();
          expect(id1).not.toBe(id2);
        }),
      );
    });

    it("should apply default sizes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ defaultSizes: [30, 70] }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          // Wait for reactive style updates
          yield* Effect.sleep("10 millis");

          const panels = el.querySelectorAll(
            "[data-splitter-panel]",
          ) as NodeListOf<HTMLElement>;

          expect(panels[0]?.style.flexBasis).toBe("30%");
          expect(panels[1]?.style.flexBasis).toBe("70%");
        }),
      );
    });

    it("should apply flex properties to prevent reflow", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          // Wait for reactive style updates
          yield* Effect.sleep("10 millis");

          const panel = el.querySelector(
            "[data-splitter-panel]",
          ) as HTMLElement;

          expect(panel.style.flexGrow).toBe("0");
          expect(panel.style.flexShrink).toBe("0");
        }),
      );
    });

    it("should have data-panel-index", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const panels = el.querySelectorAll("[data-splitter-panel]");
          expect(panels[0]?.getAttribute("data-panel-index")).toBe("0");
          expect(panels[1]?.getAttribute("data-panel-index")).toBe("1");
          expect(panels[2]?.getAttribute("data-panel-index")).toBe("2");
        }),
      );
    });
  });

  describe("Handle", () => {
    it("should render with role=separator", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[role='separator']");
          expect(handle).not.toBeNull();
        }),
      );
    });

    it("should have aria-valuenow", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ defaultSizes: [30, 70] }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          // Wait for derived to compute
          yield* Effect.sleep("10 millis");

          const handle = el.querySelector("[role='separator']");
          expect(handle?.getAttribute("aria-valuenow")).toBe("30");
        }),
      );
    });

    it("should have aria-valuemin and aria-valuemax", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[role='separator']");
          expect(handle?.getAttribute("aria-valuemin")).toBe("0");
          expect(handle?.getAttribute("aria-valuemax")).toBe("100");
        }),
      );
    });

    it("should have aria-controls pointing to first panel", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[role='separator']");
          const panel = el.querySelector("[data-splitter-panel]");

          expect(handle?.getAttribute("aria-controls")).toBe(panel?.id);
        }),
      );
    });

    it("should have aria-orientation matching root", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ orientation: "vertical" }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[role='separator']");
          expect(handle?.getAttribute("aria-orientation")).toBe("vertical");
        }),
      );
    });

    it("should have data-splitter-handle", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[data-splitter-handle]");
          expect(handle).not.toBeNull();
        }),
      );
    });

    it("should have appropriate cursor style", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector(
            "[data-splitter-handle]",
          ) as HTMLElement;
          expect(handle.style.cursor).toBe("col-resize");
        }),
      );
    });

    it("should have row-resize cursor for vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ orientation: "vertical" }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector(
            "[data-splitter-handle]",
          ) as HTMLElement;
          expect(handle.style.cursor).toBe("row-resize");
        }),
      );
    });

    it("should be focusable", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector(
            "[data-splitter-handle]",
          ) as HTMLElement;
          expect(handle.tabIndex).toBe(0);
        }),
      );
    });

    it("should set aria-label when provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({}, [
            Splitter.Panel({}, []),
            Splitter.Handle({ "aria-label": "Resize sidebar" }),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[role='separator']");
          expect(handle?.getAttribute("aria-label")).toBe("Resize sidebar");
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should set data-disabled on root when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ disabled: true }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          expect(el.hasAttribute("data-disabled")).toBe(true);
        }),
      );
    });

    it("should set data-disabled on handle when root is disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ disabled: true }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector("[data-splitter-handle]");
          expect(handle?.hasAttribute("data-disabled")).toBe(true);
        }),
      );
    });

    it("should not be focusable when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ disabled: true }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          const handle = el.querySelector(
            "[data-splitter-handle]",
          ) as HTMLElement;
          expect(handle.tabIndex).toBe(-1);
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled sizes", async () => {
      await runTest(
        Effect.gen(function* () {
          const sizes = yield* Signal.make<number[]>([40, 60]);

          const el = yield* Splitter.Root({ sizes }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          // Wait for reactive style updates
          yield* Effect.sleep("10 millis");

          const panels = el.querySelectorAll(
            "[data-splitter-panel]",
          ) as NodeListOf<HTMLElement>;

          expect(panels[0]?.style.flexBasis).toBe("40%");
          expect(panels[1]?.style.flexBasis).toBe("60%");

          yield* sizes.set([25, 75]);
          yield* Effect.sleep("10 millis");

          expect(panels[0]?.style.flexBasis).toBe("25%");
          expect(panels[1]?.style.flexBasis).toBe("75%");
        }),
      );
    });
  });

  describe("three-panel layout", () => {
    it("should support three panels with two handles", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ defaultSizes: [25, 50, 25] }, [
            Splitter.Panel({}, [$.div({}, "Left")]),
            Splitter.Handle({}),
            Splitter.Panel({}, [$.div({}, "Center")]),
            Splitter.Handle({}),
            Splitter.Panel({}, [$.div({}, "Right")]),
          ]);

          const panels = el.querySelectorAll("[data-splitter-panel]");
          const handles = el.querySelectorAll("[role='separator']");

          expect(panels.length).toBe(3);
          expect(handles.length).toBe(2);
        }),
      );
    });

    it("should have correct aria-valuenow for each handle", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Splitter.Root({ defaultSizes: [25, 50, 25] }, [
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
            Splitter.Handle({}),
            Splitter.Panel({}, []),
          ]);

          yield* Effect.sleep("10 millis");

          const handles = el.querySelectorAll("[role='separator']");
          // First handle: after 25% (panel 0)
          expect(handles[0]?.getAttribute("aria-valuenow")).toBe("25");
          // Second handle: after 25% + 50% = 75% (panel 0 + panel 1)
          expect(handles[1]?.getAttribute("aria-valuenow")).toBe("75");
        }),
      );
    });
  });
});
