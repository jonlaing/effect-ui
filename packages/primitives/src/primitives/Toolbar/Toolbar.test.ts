import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { $, collect, DOMRendererLive, Signal } from "@effex/dom";

import { Toolbar } from "./Toolbar";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("Toolbar", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with toolbar role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            { "aria-label": "Formatting" },
            collect(Toolbar.Button({}, $.of("Bold"))),
          );

          expect(el.tagName).toBe("DIV");
          expect(el.getAttribute("role")).toBe("toolbar");
        }),
      );
    });

    it("should set aria-label", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            { "aria-label": "Text formatting" },
            collect(),
          );

          expect(el.getAttribute("aria-label")).toBe("Text formatting");
        }),
      );
    });

    it("should set aria-orientation to horizontal by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root({}, collect());

          expect(el.getAttribute("aria-orientation")).toBe("horizontal");
          expect(el.getAttribute("data-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should set aria-orientation to vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            { orientation: "vertical" },
            collect(),
          );

          expect(el.getAttribute("aria-orientation")).toBe("vertical");
          expect(el.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });
  });

  describe("Button", () => {
    it("should render as button", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(Toolbar.Button({}, $.of("Bold"))),
          );

          const button = el.querySelector("button");
          expect(button).not.toBeNull();
          expect(button?.textContent).toBe("Bold");
        }),
      );
    });

    it("should have data-toolbar-item attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(Toolbar.Button({}, $.of("Bold"))),
          );

          const button = el.querySelector("button");
          expect(button?.hasAttribute("data-toolbar-item")).toBe(true);
        }),
      );
    });

    it("should call onPress when clicked", async () => {
      await runTest(
        Effect.gen(function* () {
          let pressed = false;

          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.Button(
                {
                  onPress: () =>
                    Effect.sync(() => {
                      pressed = true;
                    }),
                },
                $.of("Bold"),
              ),
            ),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          button.click();
          yield* Effect.sleep("10 millis");

          expect(pressed).toBe(true);
        }),
      );
    });

    it("should be disabled when disabled prop is true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(Toolbar.Button({ disabled: true }, $.of("Bold"))),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          expect(button.disabled).toBe(true);
          expect(button.hasAttribute("data-disabled")).toBe(true);
        }),
      );
    });

    it("should not call onPress when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          let pressed = false;

          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.Button(
                {
                  disabled: true,
                  onPress: () =>
                    Effect.sync(() => {
                      pressed = true;
                    }),
                },
                $.of("Bold"),
              ),
            ),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          button.click();
          yield* Effect.sleep("10 millis");

          expect(pressed).toBe(false);
        }),
      );
    });
  });

  describe("ToggleItem", () => {
    it("should render with aria-pressed", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleItem({ defaultPressed: false }, $.of("Bold")),
            ),
          );

          const button = el.querySelector("button");
          expect(button?.getAttribute("aria-pressed")).toBe("false");
        }),
      );
    });

    it("should toggle on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleItem({ defaultPressed: false }, $.of("Bold")),
            ),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          expect(button.getAttribute("aria-pressed")).toBe("false");
          expect(button.getAttribute("data-state")).toBe("off");

          button.click();
          yield* Effect.sleep("10 millis");

          expect(button.getAttribute("aria-pressed")).toBe("true");
          expect(button.getAttribute("data-state")).toBe("on");
        }),
      );
    });

    it("should work in controlled mode", async () => {
      await runTest(
        Effect.gen(function* () {
          const pressed = yield* Signal.make(true);

          const el = yield* Toolbar.Root(
            {},
            collect(Toolbar.ToggleItem({ pressed }, $.of("Bold"))),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          expect(button.getAttribute("aria-pressed")).toBe("true");

          yield* pressed.set(false);
          yield* Effect.sleep("10 millis");

          expect(button.getAttribute("aria-pressed")).toBe("false");
        }),
      );
    });

    it("should call onPressedChange", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleItem(
                {
                  defaultPressed: false,
                  onPressedChange: (p) =>
                    Effect.sync(() => {
                      changes.push(p);
                    }),
                },
                $.of("Bold"),
              ),
            ),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          button.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);
        }),
      );
    });
  });

  describe("ToggleGroup", () => {
    it("should manage single selection", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleGroup(
                { type: "single", defaultValue: "left" },
                collect(
                  Toolbar.ToggleItem({ value: "left" }, $.of("Left")),
                  Toolbar.ToggleItem({ value: "center" }, $.of("Center")),
                  Toolbar.ToggleItem({ value: "right" }, $.of("Right")),
                ),
              ),
            ),
          );

          const buttons = el.querySelectorAll("button");
          expect(buttons[0]?.getAttribute("data-state")).toBe("on");
          expect(buttons[1]?.getAttribute("data-state")).toBe("off");
          expect(buttons[2]?.getAttribute("data-state")).toBe("off");
        }),
      );
    });

    it("should switch selection on click in single mode", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleGroup(
                { type: "single", defaultValue: "left" },
                collect(
                  Toolbar.ToggleItem({ value: "left" }, $.of("Left")),
                  Toolbar.ToggleItem({ value: "center" }, $.of("Center")),
                ),
              ),
            ),
          );

          const buttons = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;

          buttons[1].click();
          yield* Effect.sleep("10 millis");

          expect(buttons[0].getAttribute("data-state")).toBe("off");
          expect(buttons[1].getAttribute("data-state")).toBe("on");
        }),
      );
    });

    it("should deselect on clicking selected item in single mode", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleGroup(
                { type: "single", defaultValue: "left" },
                collect(
                  Toolbar.ToggleItem({ value: "left" }, $.of("Left")),
                  Toolbar.ToggleItem({ value: "center" }, $.of("Center")),
                ),
              ),
            ),
          );

          const buttons = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;

          buttons[0].click();
          yield* Effect.sleep("10 millis");

          expect(buttons[0].getAttribute("data-state")).toBe("off");
          expect(buttons[1].getAttribute("data-state")).toBe("off");
        }),
      );
    });

    it("should support multiple selection", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleGroup(
                { type: "multiple", defaultValues: ["bold"] },
                collect(
                  Toolbar.ToggleItem({ value: "bold" }, $.of("Bold")),
                  Toolbar.ToggleItem({ value: "italic" }, $.of("Italic")),
                ),
              ),
            ),
          );

          const buttons = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;

          expect(buttons[0].getAttribute("data-state")).toBe("on");
          expect(buttons[1].getAttribute("data-state")).toBe("off");

          // Select italic (bold stays selected)
          buttons[1].click();
          yield* Effect.sleep("10 millis");

          expect(buttons[0].getAttribute("data-state")).toBe("on");
          expect(buttons[1].getAttribute("data-state")).toBe("on");

          // Deselect bold
          buttons[0].click();
          yield* Effect.sleep("10 millis");

          expect(buttons[0].getAttribute("data-state")).toBe("off");
          expect(buttons[1].getAttribute("data-state")).toBe("on");
        }),
      );
    });

    it("should render with role=group", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.ToggleGroup(
                { "aria-label": "Alignment" },
                collect(Toolbar.ToggleItem({ value: "left" }, $.of("Left"))),
              ),
            ),
          );

          const group = el.querySelector("[role='group']");
          expect(group).not.toBeNull();
          expect(group?.getAttribute("aria-label")).toBe("Alignment");
        }),
      );
    });
  });

  describe("Separator", () => {
    it("should render with separator role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.Button({}, $.of("Bold")),
              Toolbar.Separator({}),
              Toolbar.Button({}, $.of("Link")),
            ),
          );

          const separator = el.querySelector("[role='separator']");
          expect(separator).not.toBeNull();
        }),
      );
    });

    it("should have opposite orientation to toolbar", async () => {
      await runTest(
        Effect.gen(function* () {
          // Horizontal toolbar -> vertical separator
          const el = yield* Toolbar.Root(
            { orientation: "horizontal" },
            collect(Toolbar.Separator({})),
          );

          const separator = el.querySelector("[role='separator']");
          expect(separator?.getAttribute("aria-orientation")).toBe("vertical");
        }),
      );
    });

    it("should be horizontal when toolbar is vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            { orientation: "vertical" },
            collect(Toolbar.Separator({})),
          );

          const separator = el.querySelector("[role='separator']");
          expect(separator?.getAttribute("aria-orientation")).toBe(
            "horizontal",
          );
        }),
      );
    });

    it("should have data-toolbar-separator attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root({}, collect(Toolbar.Separator({})));

          const separator = el.querySelector("[role='separator']");
          expect(separator?.hasAttribute("data-toolbar-separator")).toBe(true);
        }),
      );
    });
  });

  describe("Link", () => {
    it("should render as anchor", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(Toolbar.Link({ href: "/docs" }, $.of("Documentation"))),
          );

          const link = el.querySelector("a");
          expect(link).not.toBeNull();
          expect(link?.getAttribute("href")).toBe("/docs");
          expect(link?.textContent).toBe("Documentation");
        }),
      );
    });

    it("should have data-toolbar-item attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(Toolbar.Link({ href: "/docs" }, $.of("Docs"))),
          );

          const link = el.querySelector("a");
          expect(link?.hasAttribute("data-toolbar-item")).toBe(true);
        }),
      );
    });

    it("should set aria-disabled when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.Link({ href: "/docs", disabled: true }, $.of("Docs")),
            ),
          );

          const link = el.querySelector("a");
          expect(link?.getAttribute("aria-disabled")).toBe("true");
          expect(link?.hasAttribute("data-disabled")).toBe(true);
        }),
      );
    });
  });

  describe("roving tabindex", () => {
    it("should set tabIndex=0 on first button by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.Button({}, $.of("Bold")),
              Toolbar.Button({}, $.of("Italic")),
              Toolbar.Button({}, $.of("Underline")),
            ),
          );

          const buttons = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;
          expect(buttons[0].tabIndex).toBe(0);
          expect(buttons[1].tabIndex).toBe(-1);
          expect(buttons[2].tabIndex).toBe(-1);
        }),
      );
    });

    it("should move tabIndex when item is focused", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            {},
            collect(
              Toolbar.Button({}, $.of("Bold")),
              Toolbar.Button({}, $.of("Italic")),
            ),
          );

          document.body.appendChild(el);

          const buttons = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;

          buttons[1].focus();
          yield* Effect.sleep("10 millis");

          expect(buttons[0].tabIndex).toBe(-1);
          expect(buttons[1].tabIndex).toBe(0);
        }),
      );
    });
  });

  describe("disabled toolbar", () => {
    it("should disable all items when toolbar is disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            { disabled: true },
            collect(
              Toolbar.Button({}, $.of("Bold")),
              Toolbar.Button({}, $.of("Italic")),
            ),
          );

          const buttons = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;
          expect(buttons[0].disabled).toBe(true);
          expect(buttons[1].disabled).toBe(true);
        }),
      );
    });

    it("should disable toggle items when toolbar is disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toolbar.Root(
            { disabled: true },
            collect(Toolbar.ToggleItem({}, $.of("Bold"))),
          );

          const button = el.querySelector("button") as HTMLButtonElement;
          expect(button.disabled).toBe(true);
        }),
      );
    });
  });
});
