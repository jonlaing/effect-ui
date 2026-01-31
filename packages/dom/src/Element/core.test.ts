import { Effect, Scope } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { RendererContext, Signal } from "@effex/core";

import { DOMRendererLive } from "../Render/DOMRenderer";
import * as Core from "./core";
import { make as makeRef } from "./ref";

const runTest = <A, E>(
  effect: Effect.Effect<A, E, Scope.Scope | RendererContext>,
) =>
  Effect.runPromise(
    effect.pipe(Effect.scoped, Effect.provide(DOMRendererLive)),
  );

describe("Element Core", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // ===========================================================================
  // Constructors
  // ===========================================================================

  describe("make", () => {
    it("should create an HTML element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div");
          expect(el).toBeInstanceOf(HTMLDivElement);
        }),
      );
    });

    it("should create different element types", async () => {
      await runTest(
        Effect.gen(function* () {
          const button = yield* Core.make("button");
          expect(button).toBeInstanceOf(HTMLButtonElement);

          const input = yield* Core.make("input");
          expect(input).toBeInstanceOf(HTMLInputElement);
        }),
      );
    });
  });

  describe("makeSVG", () => {
    it("should create an SVG element", async () => {
      await runTest(
        Effect.gen(function* () {
          const svg = yield* Core.makeSVG("svg");
          expect(svg).toBeInstanceOf(SVGSVGElement);
        }),
      );
    });

    it("should create SVG child elements", async () => {
      await runTest(
        Effect.gen(function* () {
          const path = yield* Core.makeSVG("path");
          expect(path).toBeInstanceOf(SVGElement);
          expect(path.tagName.toLowerCase()).toBe("path");

          const rect = yield* Core.makeSVG("rect");
          expect(rect).toBeInstanceOf(SVGElement);
          expect(rect.tagName.toLowerCase()).toBe("rect");
        }),
      );
    });
  });

  // ===========================================================================
  // Attributes
  // ===========================================================================

  describe("setAttribute", () => {
    it("should set an attribute (data-last)", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setAttribute("data-test", "value"),
          );
          expect(el.getAttribute("data-test")).toBe("value");
        }),
      );
    });

    it("should set an attribute (data-first)", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.setAttribute(
            Core.make("div"),
            "data-test",
            "value",
          );
          expect(el.getAttribute("data-test")).toBe("value");
        }),
      );
    });

    it("should convert numbers to strings", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setAttribute("data-count", 42),
          );
          expect(el.getAttribute("data-count")).toBe("42");
        }),
      );
    });
  });

  describe("removeAttribute", () => {
    it("should remove an attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setAttribute("data-test", "value"),
            Core.removeAttribute("data-test"),
          );
          expect(el.getAttribute("data-test")).toBeNull();
        }),
      );
    });
  });

  describe("toggleAttribute", () => {
    it("should toggle an attribute on", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("button").pipe(
            Core.toggleAttribute("disabled"),
          );
          expect(el.hasAttribute("disabled")).toBe(true);
        }),
      );
    });

    it("should toggle an attribute off", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("button").pipe(
            Core.setAttribute("disabled", ""),
            Core.toggleAttribute("disabled"),
          );
          expect(el.hasAttribute("disabled")).toBe(false);
        }),
      );
    });

    it("should force add with true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("button").pipe(
            Core.toggleAttribute("disabled", true),
          );
          expect(el.hasAttribute("disabled")).toBe(true);
        }),
      );
    });

    it("should force remove with false", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("button").pipe(
            Core.setAttribute("disabled", ""),
            Core.toggleAttribute("disabled", false),
          );
          expect(el.hasAttribute("disabled")).toBe(false);
        }),
      );
    });
  });

  // ===========================================================================
  // Classes
  // ===========================================================================

  describe("setClass", () => {
    it("should set the class attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(Core.setClass("foo bar"));
          expect(el.className).toBe("foo bar");
        }),
      );
    });

    it("should replace existing classes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setClass("old"),
            Core.setClass("new"),
          );
          expect(el.className).toBe("new");
        }),
      );
    });
  });

  describe("addClass", () => {
    it("should add a class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(Core.addClass("active"));
          expect(el.classList.contains("active")).toBe(true);
        }),
      );
    });

    it("should add multiple classes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.addClass("foo", "bar", "baz"),
          );
          expect(el.classList.contains("foo")).toBe(true);
          expect(el.classList.contains("bar")).toBe(true);
          expect(el.classList.contains("baz")).toBe(true);
        }),
      );
    });
  });

  describe("removeClass", () => {
    it("should remove a class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.addClass("active"),
            Core.removeClass("active"),
          );
          expect(el.classList.contains("active")).toBe(false);
        }),
      );
    });

    it("should remove multiple classes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.addClass("foo", "bar", "baz"),
            Core.removeClass("foo", "baz"),
          );
          expect(el.classList.contains("foo")).toBe(false);
          expect(el.classList.contains("bar")).toBe(true);
          expect(el.classList.contains("baz")).toBe(false);
        }),
      );
    });
  });

  describe("toggleClass", () => {
    it("should toggle a class on", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(Core.toggleClass("active"));
          expect(el.classList.contains("active")).toBe(true);
        }),
      );
    });

    it("should toggle a class off", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.addClass("active"),
            Core.toggleClass("active"),
          );
          expect(el.classList.contains("active")).toBe(false);
        }),
      );
    });

    it("should force with boolean", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.toggleClass("active", true),
            Core.toggleClass("active", true), // force keeps it on
          );
          expect(el.classList.contains("active")).toBe(true);
        }),
      );
    });
  });

  describe("replaceClass", () => {
    it("should replace one class with another", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.addClass("old"),
            Core.replaceClass("old", "new"),
          );
          expect(el.classList.contains("old")).toBe(false);
          expect(el.classList.contains("new")).toBe(true);
        }),
      );
    });
  });

  // ===========================================================================
  // Styles
  // ===========================================================================

  describe("setStyle", () => {
    it("should set a style property", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setStyle("color", "red"),
          );
          expect(el.style.color).toBe("red");
        }),
      );
    });

    it("should handle multiple styles via chaining", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setStyle("color", "red"),
            Core.setStyle("backgroundColor", "blue"),
          );
          expect(el.style.color).toBe("red");
          expect(el.style.backgroundColor).toBe("blue");
        }),
      );
    });
  });

  describe("removeStyle", () => {
    it("should remove a style property", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setStyle("color", "red"),
            Core.removeStyle("color"),
          );
          expect(el.style.color).toBe("");
        }),
      );
    });
  });

  // ===========================================================================
  // Data Attributes
  // ===========================================================================

  describe("setData", () => {
    it("should set a data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setData("test", "value"),
          );
          expect(el.dataset.test).toBe("value");
        }),
      );
    });
  });

  describe("removeData", () => {
    it("should remove a data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setData("test", "value"),
            Core.removeData("test"),
          );
          expect(el.dataset.test).toBeUndefined();
        }),
      );
    });
  });

  // ===========================================================================
  // Content
  // ===========================================================================

  describe("setTextContent", () => {
    it("should set text content", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setTextContent("Hello World"),
          );
          expect(el.textContent).toBe("Hello World");
        }),
      );
    });
  });

  describe("setInnerHTML", () => {
    it("should set inner HTML", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Core.make("div").pipe(
            Core.setInnerHTML("<span>Test</span>"),
          );
          expect(el.innerHTML).toBe("<span>Test</span>");
        }),
      );
    });
  });

  // ===========================================================================
  // Children
  // ===========================================================================

  describe("appendChild", () => {
    it("should append a child element", async () => {
      await runTest(
        Effect.gen(function* () {
          const child = yield* Core.make("span");
          const parent = yield* Core.make("div").pipe(
            Core.appendChild(Effect.succeed(child)),
          );
          expect(parent.children.length).toBe(1);
          expect(parent.children[0]).toBe(child);
        }),
      );
    });

    it("should append text content", async () => {
      await runTest(
        Effect.gen(function* () {
          const parent = yield* Core.make("div").pipe(
            Core.appendChild(Effect.succeed("Hello")),
          );
          expect(parent.textContent).toBe("Hello");
        }),
      );
    });

    it("should append numbers as text", async () => {
      await runTest(
        Effect.gen(function* () {
          const parent = yield* Core.make("div").pipe(
            Core.appendChild(Effect.succeed(42)),
          );
          expect(parent.textContent).toBe("42");
        }),
      );
    });
  });

  describe("clearChildren", () => {
    it("should remove all children", async () => {
      await runTest(
        Effect.gen(function* () {
          const child1 = yield* Core.make("span");
          const child2 = yield* Core.make("span");
          const parent = yield* Core.make("div").pipe(
            Core.appendChild(Effect.succeed(child1)),
            Core.appendChild(Effect.succeed(child2)),
          );
          expect(parent.children.length).toBe(2);

          const cleared = yield* Core.clearChildren(Effect.succeed(parent));
          expect(cleared.children.length).toBe(0);
        }),
      );
    });
  });

  // ===========================================================================
  // Element Reference
  // ===========================================================================

  describe("setRef", () => {
    it("should bind an ElementRef to the element", async () => {
      await runTest(
        Effect.gen(function* () {
          const ref = yield* makeRef<HTMLDivElement>();
          const el = yield* Core.make("div").pipe(Core.setRef(ref));

          const boundEl = yield* ref;
          expect(boundEl).toBe(el);
        }),
      );
    });
  });

  // ===========================================================================
  // Reactive Bindings
  // ===========================================================================

  describe("bindAttribute", () => {
    it("should set the initial attribute value from a Readable", async () => {
      await runTest(
        Effect.gen(function* () {
          const signal = yield* Signal.make("initial");
          const el = yield* Core.make("div").pipe(
            Core.bindAttribute("data-value", signal),
          );

          expect(el.getAttribute("data-value")).toBe("initial");
        }),
      );
    });
  });

  describe("bindClass", () => {
    it("should set the initial class state from a Readable", async () => {
      await runTest(
        Effect.gen(function* () {
          const isActive = yield* Signal.make(true);
          const el = yield* Core.make("div").pipe(
            Core.bindClass("active", isActive),
          );

          expect(el.classList.contains("active")).toBe(true);
        }),
      );
    });

    it("should not add class when Readable is false", async () => {
      await runTest(
        Effect.gen(function* () {
          const isActive = yield* Signal.make(false);
          const el = yield* Core.make("div").pipe(
            Core.bindClass("active", isActive),
          );

          expect(el.classList.contains("active")).toBe(false);
        }),
      );
    });
  });

  describe("bindStyle", () => {
    it("should set the initial style value from a Readable", async () => {
      await runTest(
        Effect.gen(function* () {
          const color = yield* Signal.make("red");
          const el = yield* Core.make("div").pipe(
            Core.bindStyle("color", color),
          );

          expect(el.style.color).toBe("red");
        }),
      );
    });
  });

  describe("bindData", () => {
    it("should set the initial data attribute value from a Readable", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make("initial");
          const el = yield* Core.make("div").pipe(Core.bindData("test", value));

          expect(el.dataset.test).toBe("initial");
        }),
      );
    });
  });

  describe("bindTextContent", () => {
    it("should set the initial text content from a Readable", async () => {
      await runTest(
        Effect.gen(function* () {
          const text = yield* Signal.make("Hello");
          const el = yield* Core.make("div").pipe(Core.bindTextContent(text));

          expect(el.textContent).toBe("Hello");
        }),
      );
    });
  });

  // ===========================================================================
  // Focus
  // ===========================================================================

  describe("focus", () => {
    it("should focus the element", async () => {
      await runTest(
        Effect.gen(function* () {
          const input = yield* Core.make("input");
          document.body.appendChild(input);

          yield* Core.focus(Effect.succeed(input));
          expect(document.activeElement).toBe(input);
        }),
      );
    });
  });

  describe("blur", () => {
    it("should blur the element", async () => {
      await runTest(
        Effect.gen(function* () {
          const input = yield* Core.make("input");
          document.body.appendChild(input);
          input.focus();
          expect(document.activeElement).toBe(input);

          yield* Core.blur(Effect.succeed(input));
          expect(document.activeElement).not.toBe(input);
        }),
      );
    });
  });

  // ===========================================================================
  // Events
  // ===========================================================================

  describe("on", () => {
    it("should add an event listener", async () => {
      await runTest(
        Effect.gen(function* () {
          let clicked = false;
          const el = yield* Core.make("button").pipe(
            Core.on("click", () =>
              Effect.sync(() => {
                clicked = true;
              }),
            ),
          );

          el.click();
          yield* Effect.sleep(10);
          expect(clicked).toBe(true);
        }),
      );
    });
  });

  describe("click", () => {
    it("should programmatically click the element", async () => {
      await runTest(
        Effect.gen(function* () {
          let clicked = false;
          const el = yield* Core.make("button");
          el.addEventListener("click", () => {
            clicked = true;
          });

          yield* Core.click(Effect.succeed(el));
          expect(clicked).toBe(true);
        }),
      );
    });
  });

  // ===========================================================================
  // Tap Utilities
  // ===========================================================================

  describe("tap", () => {
    it("should tap into the element for side effects", async () => {
      await runTest(
        Effect.gen(function* () {
          let tapped = false;
          const el = yield* Core.make("div").pipe(
            Core.tap(() => {
              tapped = true;
            }),
          );
          expect(tapped).toBe(true);
          expect(el).toBeInstanceOf(HTMLDivElement);
        }),
      );
    });
  });

  describe("tapEffect", () => {
    it("should tap with an Effect", async () => {
      await runTest(
        Effect.gen(function* () {
          let tapped = false;
          const el = yield* Core.make("div").pipe(
            Core.tapEffect(() =>
              Effect.sync(() => {
                tapped = true;
              }),
            ),
          );
          expect(tapped).toBe(true);
          expect(el).toBeInstanceOf(HTMLDivElement);
        }),
      );
    });
  });
});
