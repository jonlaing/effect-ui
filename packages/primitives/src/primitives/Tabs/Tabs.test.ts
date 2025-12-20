import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { $ } from "@effex/dom";
import { Tabs } from "./Tabs";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("Tabs", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [Tabs.Trigger({ value: "tab1" }, "Tab 1")]),
            Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.children.length).toBe(2);
        }),
      );
    });

    it("should set data-orientation to horizontal by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, []);

          expect(el.getAttribute("data-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should set data-orientation to vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root(
            { defaultValue: "tab1", orientation: "vertical" },
            [],
          );

          expect(el.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });
  });

  describe("List", () => {
    it("should render with tablist role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, []),
          ]);

          const list = el.querySelector("[role='tablist']");
          expect(list).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({ class: "my-list" }, []),
          ]);

          const list = el.querySelector("[role='tablist']");
          expect(list?.className).toBe("my-list");
        }),
      );
    });

    it("should have aria-orientation attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, []),
          ]);

          const list = el.querySelector("[role='tablist']");
          expect(list?.getAttribute("aria-orientation")).toBe("horizontal");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button with tab role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [Tabs.Trigger({ value: "tab1" }, "Tab 1")]),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger).not.toBeNull();
          expect(trigger?.getAttribute("role")).toBe("tab");
        }),
      );
    });

    it("should have aria-selected=true when active", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
          ]);

          const triggers = el.querySelectorAll("button");
          expect(triggers[0]?.getAttribute("aria-selected")).toBe("true");
          expect(triggers[1]?.getAttribute("aria-selected")).toBe("false");
        }),
      );
    });

    it("should have data-state attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
          ]);

          const triggers = el.querySelectorAll("button");
          expect(triggers[0]?.getAttribute("data-state")).toBe("active");
          expect(triggers[1]?.getAttribute("data-state")).toBe("inactive");
        }),
      );
    });

    it("should have aria-controls pointing to content", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [Tabs.Trigger({ value: "tab1" }, "Tab 1")]),
            Tabs.Content({ value: "tab1" }, [$.p("Content")]),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("aria-controls")).toBe(
            "tabs-content-tab1",
          );
        }),
      );
    });

    it("should switch tab on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
          ]);

          const triggers = el.querySelectorAll("button");

          triggers[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(triggers[0]?.getAttribute("data-state")).toBe("inactive");
          expect(triggers[1]?.getAttribute("data-state")).toBe("active");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1", class: "my-trigger" }, "Tab 1"),
            ]),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });
  });

  describe("roving tabindex", () => {
    it("should set tabIndex=0 on active trigger only", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab2" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
              Tabs.Trigger({ value: "tab3" }, "Tab 3"),
            ]),
          ]);

          const triggers = el.querySelectorAll("button");
          expect(triggers[0]?.tabIndex).toBe(-1);
          expect(triggers[1]?.tabIndex).toBe(0);
          expect(triggers[2]?.tabIndex).toBe(-1);
        }),
      );
    });
  });

  describe("Content", () => {
    it("should render with tabpanel role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [Tabs.Trigger({ value: "tab1" }, "Tab 1")]),
            Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
          ]);

          const content = el.querySelector("[role='tabpanel']");
          expect(content).not.toBeNull();
        }),
      );
    });

    it("should have aria-labelledby pointing to trigger", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [Tabs.Trigger({ value: "tab1" }, "Tab 1")]),
            Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
          ]);

          const content = el.querySelector("[role='tabpanel']");
          expect(content?.getAttribute("aria-labelledby")).toBe(
            "tabs-trigger-tab1",
          );
        }),
      );
    });

    it("should only render active content by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
            Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
            Tabs.Content({ value: "tab2" }, [$.p("Content 2")]),
          ]);

          const panels = el.querySelectorAll("[role='tabpanel']");
          // Only active panel should be rendered with full content
          expect(panels.length).toBeGreaterThanOrEqual(1);
          expect(panels[0]?.textContent).toBe("Content 1");
        }),
      );
    });

    it("should switch content when tab changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
            Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
            Tabs.Content({ value: "tab2" }, [$.p("Content 2")]),
          ]);

          const triggers = el.querySelectorAll("button");
          triggers[1]?.click();
          yield* Effect.sleep("10 millis");

          const activePanel = el.querySelector(
            "[role='tabpanel'][data-state='active']",
          );
          expect(activePanel?.textContent).toBe("Content 2");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [Tabs.Trigger({ value: "tab1" }, "Tab 1")]),
            Tabs.Content({ value: "tab1", class: "my-content" }, [
              $.p("Content"),
            ]),
          ]);

          const content = el.querySelector("[role='tabpanel']");
          expect(content?.className).toBe("my-content");
        }),
      );
    });

    it("should force mount when forceMount=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
            Tabs.Content({ value: "tab1", forceMount: true }, [
              $.p("Content 1"),
            ]),
            Tabs.Content({ value: "tab2", forceMount: true }, [
              $.p("Content 2"),
            ]),
          ]);

          // Both panels should exist
          const panels = el.querySelectorAll("[role='tabpanel']");
          expect(panels.length).toBe(2);
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should disable individual triggers", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2", disabled: true }, "Tab 2"),
            ]),
          ]);

          const triggers = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;
          expect(triggers[0]?.disabled).toBe(false);
          expect(triggers[1]?.disabled).toBe(true);
        }),
      );
    });

    it("should set data-disabled on disabled trigger", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1", disabled: true }, "Tab 1"),
            ]),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.getAttribute("data-disabled")).toBe("");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make("tab2");

          const el = yield* Tabs.Root({ value }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
          ]);

          const triggers = el.querySelectorAll("button");
          expect(triggers[0]?.getAttribute("data-state")).toBe("inactive");
          expect(triggers[1]?.getAttribute("data-state")).toBe("active");

          yield* value.set("tab1");
          yield* Effect.sleep("10 millis");

          expect(triggers[0]?.getAttribute("data-state")).toBe("active");
          expect(triggers[1]?.getAttribute("data-state")).toBe("inactive");
        }),
      );
    });
  });

  describe("onValueChange callback", () => {
    it("should call onValueChange when tab changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: string[] = [];

          const el = yield* Tabs.Root({
            defaultValue: "tab1",
            onValueChange: (value) =>
              Effect.sync(() => {
                changes.push(value);
              }),
          }, [
            Tabs.List({}, [
              Tabs.Trigger({ value: "tab1" }, "Tab 1"),
              Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            ]),
          ]);

          const triggers = el.querySelectorAll("button");
          triggers[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["tab2"]);
        }),
      );
    });
  });
});
