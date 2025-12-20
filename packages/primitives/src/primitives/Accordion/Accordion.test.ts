import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { $ } from "@effex/dom";
import { Accordion } from "./Accordion";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("Accordion", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Toggle"),
              Accordion.Content({}, [$.div("Content")]),
            ]),
          ]);

          expect(el.tagName).toBe("DIV");
          expect(el.children.length).toBe(1);
        }),
      );
    });

    it("should set data-orientation to vertical by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, []);

          expect(el.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });

    it("should set data-state based on value presence", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", defaultValue: "item-1" },
            [],
          );

          expect(el.getAttribute("data-state")).toBe("has-value");
        }),
      );
    });

    it("should set data-state to empty when no value", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, []);

          expect(el.getAttribute("data-state")).toBe("empty");
        }),
      );
    });
  });

  describe("single mode", () => {
    it("should open the default value item", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", defaultValue: "item-1" },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
                Accordion.Content({}, [$.div("Content 1")]),
              ]),
              Accordion.Item({ value: "item-2" }, [
                Accordion.Trigger({}, "Section 2"),
                Accordion.Content({}, [$.div("Content 2")]),
              ]),
            ],
          );

          // Use el.children to get only direct item children, not the root
          const items = el.children;
          expect(items[0]?.getAttribute("data-state")).toBe("open");
          expect(items[1]?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should toggle items on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", defaultValue: "item-1", collapsible: true },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
              Accordion.Item({ value: "item-2" }, [
                Accordion.Trigger({}, "Section 2"),
              ]),
            ],
          );

          const triggers = el.querySelectorAll("button");
          const items = el.children;

          // Click second trigger to open it
          triggers[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("data-state")).toBe("closed");
          expect(items[1]?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should not collapse when collapsible=false", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", defaultValue: "item-1", collapsible: false },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
            ],
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          const item = el.children[0];

          // Click to try to collapse
          trigger.click();
          yield* Effect.sleep("10 millis");

          // Should still be open
          expect(item?.getAttribute("data-state")).toBe("open");
        }),
      );
    });

    it("should collapse when collapsible=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", defaultValue: "item-1", collapsible: true },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
            ],
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          const item = el.children[0];

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(item?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });
  });

  describe("multiple mode", () => {
    it("should allow multiple items open", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "multiple", defaultValue: ["item-1", "item-2"] },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
              Accordion.Item({ value: "item-2" }, [
                Accordion.Trigger({}, "Section 2"),
              ]),
              Accordion.Item({ value: "item-3" }, [
                Accordion.Trigger({}, "Section 3"),
              ]),
            ],
          );

          const items = el.children;
          expect(items[0]?.getAttribute("data-state")).toBe("open");
          expect(items[1]?.getAttribute("data-state")).toBe("open");
          expect(items[2]?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });

    it("should toggle items independently", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "multiple", defaultValue: ["item-1"] },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
              Accordion.Item({ value: "item-2" }, [
                Accordion.Trigger({}, "Section 2"),
              ]),
            ],
          );

          const triggers = el.querySelectorAll("button");
          const items = el.children;

          // Open second item
          triggers[1]?.click();
          yield* Effect.sleep("10 millis");

          // Both should be open
          expect(items[0]?.getAttribute("data-state")).toBe("open");
          expect(items[1]?.getAttribute("data-state")).toBe("open");

          // Close first item
          triggers[0]?.click();
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("data-state")).toBe("closed");
          expect(items[1]?.getAttribute("data-state")).toBe("open");
        }),
      );
    });
  });

  describe("Trigger", () => {
    it("should have aria-expanded attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", defaultValue: "item-1" },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
              Accordion.Item({ value: "item-2" }, [
                Accordion.Trigger({}, "Section 2"),
              ]),
            ],
          );

          const triggers = el.querySelectorAll("button");
          expect(triggers[0]?.getAttribute("aria-expanded")).toBe("true");
          expect(triggers[1]?.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });

    it("should have aria-controls pointing to content", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Toggle"),
              Accordion.Content({}, [$.div("Content")]),
            ]),
          ]);

          const trigger = el.querySelector("button");
          const content = el.querySelector("[role='region']");
          expect(trigger?.getAttribute("aria-controls")).toBe(content?.id);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({ class: "my-trigger" }, "Toggle"),
            ]),
          ]);

          const trigger = el.querySelector("button");
          expect(trigger?.className).toBe("my-trigger");
        }),
      );
    });
  });

  describe("Content", () => {
    it("should have role=region", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Toggle"),
              Accordion.Content({}, [$.div("Content")]),
            ]),
          ]);

          const content = el.querySelector("[role='region']");
          expect(content).not.toBeNull();
        }),
      );
    });

    it("should have aria-labelledby pointing to trigger", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Toggle"),
              Accordion.Content({}, [$.div("Content")]),
            ]),
          ]);

          const trigger = el.querySelector("button");
          const content = el.querySelector("[role='region']");
          expect(content?.getAttribute("aria-labelledby")).toBe(trigger?.id);
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Toggle"),
              Accordion.Content({ class: "my-content" }, [$.div("Content")]),
            ]),
          ]);

          const content = el.querySelector("[role='region']");
          expect(content?.className).toBe("my-content");
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should disable all triggers when root is disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root(
            { type: "single", disabled: true },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
              Accordion.Item({ value: "item-2" }, [
                Accordion.Trigger({}, "Section 2"),
              ]),
            ],
          );

          const triggers = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;
          expect(triggers[0]?.disabled).toBe(true);
          expect(triggers[1]?.disabled).toBe(true);
        }),
      );
    });

    it("should disable individual items", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Accordion.Root({ type: "single" }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Section 1"),
            ]),
            Accordion.Item({ value: "item-2", disabled: true }, [
              Accordion.Trigger({}, "Section 2"),
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
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make<string | null>("item-2");

          const el = yield* Accordion.Root({ type: "single", value }, [
            Accordion.Item({ value: "item-1" }, [
              Accordion.Trigger({}, "Section 1"),
            ]),
            Accordion.Item({ value: "item-2" }, [
              Accordion.Trigger({}, "Section 2"),
            ]),
          ]);

          const items = el.children;
          expect(items[0]?.getAttribute("data-state")).toBe("closed");
          expect(items[1]?.getAttribute("data-state")).toBe("open");

          yield* value.set("item-1");
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("data-state")).toBe("open");
          expect(items[1]?.getAttribute("data-state")).toBe("closed");
        }),
      );
    });
  });

  describe("onValueChange callback", () => {
    it("should call onValueChange when value changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: (string | string[] | null)[] = [];

          const el = yield* Accordion.Root(
            {
              type: "single",
              collapsible: true,
              onValueChange: (value) =>
                Effect.sync(() => {
                  changes.push(value);
                }),
            },
            [
              Accordion.Item({ value: "item-1" }, [
                Accordion.Trigger({}, "Section 1"),
              ]),
            ],
          );

          const trigger = el.querySelector("button") as HTMLButtonElement;
          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["item-1"]);

          trigger.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["item-1", null]);
        }),
      );
    });
  });
});
