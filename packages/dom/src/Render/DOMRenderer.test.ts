import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { RendererContext } from "@effex/core";

import { DOMRenderer, DOMRendererLive } from "./DOMRenderer.js";

const runTest = <A>(effect: Effect.Effect<A, never, RendererContext>) =>
  Effect.runPromise(effect.pipe(Effect.provide(DOMRendererLive)));

describe("DOMRenderer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("createNode", () => {
    it("should create an HTML element", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          expect(div).toBeInstanceOf(HTMLDivElement);
        }),
      );
    });

    it("should create an SVG element with namespace", async () => {
      await runTest(
        Effect.gen(function* () {
          const svg = yield* DOMRenderer.createNode(
            "svg",
            "http://www.w3.org/2000/svg",
          );
          expect(svg).toBeInstanceOf(SVGSVGElement);
        }),
      );
    });
  });

  describe("createTextNode", () => {
    it("should create a text node", async () => {
      await runTest(
        Effect.gen(function* () {
          const text = yield* DOMRenderer.createTextNode("Hello");
          expect(text).toBeInstanceOf(Text);
          expect(text.textContent).toBe("Hello");
        }),
      );
    });
  });

  describe("appendChild / removeChild", () => {
    it("should append and remove children", async () => {
      await runTest(
        Effect.gen(function* () {
          const parent = yield* DOMRenderer.createNode("div");
          const child = yield* DOMRenderer.createNode("span");

          yield* DOMRenderer.appendChild(parent, child);
          expect((parent as HTMLElement).children.length).toBe(1);

          yield* DOMRenderer.removeChild(parent, child);
          expect((parent as HTMLElement).children.length).toBe(0);
        }),
      );
    });
  });

  describe("setAttribute / removeAttribute", () => {
    it("should set and remove attributes", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setAttribute(div, "data-test", "value");
          expect(el.getAttribute("data-test")).toBe("value");

          yield* DOMRenderer.removeAttribute(div, "data-test");
          expect(el.getAttribute("data-test")).toBeNull();
        }),
      );
    });

    it("should handle boolean attributes", async () => {
      await runTest(
        Effect.gen(function* () {
          const input = yield* DOMRenderer.createNode("input");
          const el = input as HTMLInputElement;

          yield* DOMRenderer.setAttribute(input, "disabled", true);
          expect(el.hasAttribute("disabled")).toBe(true);

          yield* DOMRenderer.setAttribute(input, "disabled", false);
          expect(el.hasAttribute("disabled")).toBe(false);
        }),
      );
    });
  });

  describe("setClassName", () => {
    it("should set the class name", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setClassName(div, "foo bar");
          expect(el.className).toBe("foo bar");
        }),
      );
    });
  });

  describe("setStyleProperty / removeStyleProperty", () => {
    it("should set a style property", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setStyleProperty(div, "color", "red");
          expect(el.style.color).toBe("red");
        }),
      );
    });

    it("should handle camelCase properties", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setStyleProperty(div, "backgroundColor", "blue");
          expect(el.style.backgroundColor).toBe("blue");
        }),
      );
    });

    it("should remove a style property", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setStyleProperty(div, "color", "red");
          expect(el.style.color).toBe("red");

          yield* DOMRenderer.removeStyleProperty(div, "color");
          expect(el.style.color).toBe("");
        }),
      );
    });

    it("should handle kebab-case when removing", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setStyleProperty(div, "backgroundColor", "blue");
          yield* DOMRenderer.removeStyleProperty(div, "backgroundColor");
          expect(el.style.backgroundColor).toBe("");
        }),
      );
    });
  });

  describe("toggleClass", () => {
    it("should toggle a class on", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.toggleClass(div, "active");
          expect(el.classList.contains("active")).toBe(true);
        }),
      );
    });

    it("should toggle a class off", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          el.classList.add("active");
          yield* DOMRenderer.toggleClass(div, "active");
          expect(el.classList.contains("active")).toBe(false);
        }),
      );
    });

    it("should force add with true", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.toggleClass(div, "active", true);
          expect(el.classList.contains("active")).toBe(true);

          // Force add again should keep it
          yield* DOMRenderer.toggleClass(div, "active", true);
          expect(el.classList.contains("active")).toBe(true);
        }),
      );
    });

    it("should force remove with false", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          el.classList.add("active");
          yield* DOMRenderer.toggleClass(div, "active", false);
          expect(el.classList.contains("active")).toBe(false);

          // Force remove again should keep it off
          yield* DOMRenderer.toggleClass(div, "active", false);
          expect(el.classList.contains("active")).toBe(false);
        }),
      );
    });
  });

  describe("setTextContent", () => {
    it("should set text content", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");

          yield* DOMRenderer.setTextContent(div, "Hello World");
          expect(div.textContent).toBe("Hello World");
        }),
      );
    });
  });

  describe("setInnerHTML", () => {
    it("should set inner HTML", async () => {
      await runTest(
        Effect.gen(function* () {
          const div = yield* DOMRenderer.createNode("div");
          const el = div as HTMLElement;

          yield* DOMRenderer.setInnerHTML(div, "<span>Test</span>");
          expect(el.innerHTML).toBe("<span>Test</span>");
        }),
      );
    });
  });

  describe("setInputValue", () => {
    it("should set input value", async () => {
      await runTest(
        Effect.gen(function* () {
          const input = yield* DOMRenderer.createNode("input");
          const el = input as HTMLInputElement;

          yield* DOMRenderer.setInputValue(input, "test value");
          expect(el.value).toBe("test value");
        }),
      );
    });

    it("should not update if value is the same", async () => {
      await runTest(
        Effect.gen(function* () {
          const input = yield* DOMRenderer.createNode("input");
          const el = input as HTMLInputElement;

          el.value = "test";
          // This should be a no-op since value is the same
          yield* DOMRenderer.setInputValue(input, "test");
          expect(el.value).toBe("test");
        }),
      );
    });
  });

  describe("getChildren", () => {
    it("should return child nodes", async () => {
      await runTest(
        Effect.gen(function* () {
          const parent = yield* DOMRenderer.createNode("div");
          const child1 = yield* DOMRenderer.createNode("span");
          const child2 = yield* DOMRenderer.createTextNode("text");

          yield* DOMRenderer.appendChild(parent, child1);
          yield* DOMRenderer.appendChild(parent, child2);

          const children = yield* DOMRenderer.getChildren(parent);
          expect(children.length).toBe(2);
          expect(children[0]).toBe(child1);
          expect(children[1]).toBe(child2);
        }),
      );
    });
  });

  describe("isHydrating", () => {
    it("should return false for DOM renderer", async () => {
      await runTest(
        Effect.gen(function* () {
          const hydrating = yield* DOMRenderer.isHydrating;
          expect(hydrating).toBe(false);
        }),
      );
    });
  });
});
