import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { NavigationMenu } from "./NavigationMenu";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("NavigationMenu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render as nav with navigationmenu-root data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, []);

          expect(el.tagName).toBe("NAV");
          expect(el.getAttribute("data-navigationmenu-root")).toBe("");
        }),
      );
    });

    it("should have default aria-label of Main", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, []);

          expect(el.getAttribute("aria-label")).toBe("Main");
        }),
      );
    });

    it("should accept custom aria-label", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({ "aria-label": "Site" }, []);

          expect(el.getAttribute("aria-label")).toBe("Site");
        }),
      );
    });

    it("should have horizontal orientation by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, []);

          expect(el.getAttribute("data-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should accept vertical orientation", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root(
            { orientation: "vertical" },
            [],
          );

          expect(el.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({ class: "my-nav" }, []);

          expect(el.className).toBe("my-nav");
        }),
      );
    });
  });

  describe("List", () => {
    it("should render as ol with navigationmenu-list data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [NavigationMenu.List({}, [])]);

          const list = el.querySelector("[data-navigationmenu-list]");
          expect(list).not.toBeNull();
          expect(list?.tagName).toBe("OL");
        }),
      );
    });

    it("should have role=menubar", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [NavigationMenu.List({}, [])]);

          const list = el.querySelector("[data-navigationmenu-list]");
          expect(list?.getAttribute("role")).toBe("menubar");
        }),
      );
    });

    it("should have aria-orientation", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [NavigationMenu.List({}, [])]);

          const list = el.querySelector("[data-navigationmenu-list]");
          expect(list?.getAttribute("aria-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({ class: "my-list" }, []),
          ]);

          const list = el.querySelector("[data-navigationmenu-list]");
          expect(list?.className).toBe("my-list");
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render as li with navigationmenu-item data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, []),
            ]),
          ]);

          const item = el.querySelector("[data-navigationmenu-item]");
          expect(item).not.toBeNull();
          expect(item?.tagName).toBe("LI");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1", class: "my-item" }, []),
            ]),
          ]);

          const item = el.querySelector("[data-navigationmenu-item]");
          expect(item?.className).toBe("my-item");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should render as button with navigationmenu-trigger data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector("[data-navigationmenu-trigger]");
          expect(trigger).not.toBeNull();
          expect(trigger?.tagName).toBe("BUTTON");
          expect(trigger?.textContent).toBe("Products");
        }),
      );
    });

    it("should have aria-haspopup=menu", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector("[data-navigationmenu-trigger]");
          expect(trigger?.getAttribute("aria-haspopup")).toBe("menu");
        }),
      );
    });

    it("should have aria-expanded=false when closed", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector("[data-navigationmenu-trigger]");
          expect(trigger?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should have data-state=closed by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector("[data-navigationmenu-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({ class: "my-trigger" }, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector("[data-navigationmenu-trigger]");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });

    it("should open on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector(
            "[data-navigationmenu-trigger]",
          ) as HTMLButtonElement;
          expect(trigger.getAttribute("data-state")).toBe("closed");

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(trigger.getAttribute("data-state")).toBe("open");
          expect(trigger.getAttribute("aria-expanded")).toBe("true");
        }),
      );
    });
  });

  describe("Content", () => {
    it("should render with navigationmenu-content data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
                NavigationMenu.Content({}, "Content here"),
              ]),
            ]),
          ]);

          const content = el.querySelector("[data-navigationmenu-content]");
          expect(content).not.toBeNull();
          expect(content?.textContent).toBe("Content here");
        }),
      );
    });

    it("should have data-state matching item state", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
                NavigationMenu.Content({}, "Content"),
              ]),
            ]),
          ]);

          const content = el.querySelector("[data-navigationmenu-content]");
          expect(content?.getAttribute("data-state")).toBe("closed");

          const trigger = el.querySelector(
            "[data-navigationmenu-trigger]",
          ) as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(content?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Content({ class: "my-content" }, "Content"),
              ]),
            ]),
          ]);

          const content = el.querySelector("[data-navigationmenu-content]");
          expect(content?.className).toBe("my-content");
        }),
      );
    });
  });

  describe("Viewport", () => {
    it("should render with navigationmenu-viewport data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, []),
            NavigationMenu.Viewport({}),
          ]);

          const viewport = el.querySelector("[data-navigationmenu-viewport]");
          expect(viewport).not.toBeNull();
        }),
      );
    });

    it("should have data-state=closed when no item is active", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, []),
            NavigationMenu.Viewport({}),
          ]);

          const viewport = el.querySelector("[data-navigationmenu-viewport]");
          expect(viewport?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.Viewport({ class: "my-viewport" }),
          ]);

          const viewport = el.querySelector("[data-navigationmenu-viewport]");
          expect(viewport?.className).toBe("my-viewport");
        }),
      );
    });
  });

  describe("Indicator", () => {
    it("should render with navigationmenu-indicator data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.List({}, []),
            NavigationMenu.Indicator({}),
          ]);

          const indicator = el.querySelector("[data-navigationmenu-indicator]");
          expect(indicator).not.toBeNull();
        }),
      );
    });

    it("should have data-state=hidden when no item is active", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.Indicator({}),
          ]);

          const indicator = el.querySelector("[data-navigationmenu-indicator]");
          expect(indicator?.getAttribute("data-state")).toBe("hidden");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* NavigationMenu.Root({}, [
            NavigationMenu.Indicator({ class: "my-indicator" }),
          ]);

          const indicator = el.querySelector("[data-navigationmenu-indicator]");
          expect(indicator?.className).toBe("my-indicator");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make<string | null>(null);

          const el = yield* NavigationMenu.Root({ value }, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector("[data-navigationmenu-trigger]");
          expect(trigger?.getAttribute("data-state")).toBe("closed");

          yield* value.set("item1");
          yield* Effect.sleep("10 millis");

          expect(trigger?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("onValueChange callback", () => {
    it("should call onValueChange when item is clicked", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: (string | null)[] = [];

          const el = yield* NavigationMenu.Root({
            onValueChange: (val) =>
              Effect.sync(() => {
                changes.push(val);
              }),
          }, [
            NavigationMenu.List({}, [
              NavigationMenu.Item({ value: "item1" }, [
                NavigationMenu.Trigger({}, "Products"),
              ]),
            ]),
          ]);

          const trigger = el.querySelector(
            "[data-navigationmenu-trigger]",
          ) as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["item1"]);
        }),
      );
    });
  });
});
