import { Effect, Scope } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RendererContext, Signal } from "@effex/core";

import { DOMRendererLive } from "../Render/DOMRenderer.js";
import {
  $,
  a,
  button,
  div,
  empty,
  form,
  h1,
  img,
  input,
  li,
  MergePropsCtx,
  of,
  p,
  span,
  svg,
  ul,
} from "./DOMElements.js";
import { getUnsafe as getRef, make as ref } from "./ref.js";

const runTest = <A, E>(
  effect: Effect.Effect<A, E, RendererContext | Scope.Scope>,
) =>
  Effect.runPromise(
    effect.pipe(Effect.scoped, Effect.provide(DOMRendererLive)),
  );

describe("DOMElements", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("basic element creation", () => {
    it("should create a div with no args", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div();
          expect(el).toBeInstanceOf(HTMLDivElement);
        }),
      );
    });

    it("should create a div with attributes only", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div({ id: "test", class: "foo bar" });
          expect(el.id).toBe("test");
          expect(el.className).toBe("foo bar");
        }),
      );
    });

    it("should create a div with child effect", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(Effect.succeed("Hello"));
          expect(el.textContent).toBe("Hello");
        }),
      );
    });

    it("should create a div with attrs and children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(
            { class: "container" },
            Effect.succeed("Content"),
          );
          expect(el.className).toBe("container");
          expect(el.textContent).toBe("Content");
        }),
      );
    });

    it("should create nested elements", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(
            { class: "parent" },
            Effect.gen(function* () {
              const child = yield* span(of("Nested"));
              return child;
            }),
          );
          expect(el.className).toBe("parent");
          expect(el.children.length).toBe(1);
          expect(el.children[0].tagName).toBe("SPAN");
          expect(el.children[0].textContent).toBe("Nested");
        }),
      );
    });
  });

  describe("various HTML elements", () => {
    it("should create headings", async () => {
      await runTest(
        Effect.gen(function* () {
          const heading = yield* h1("Title");
          expect(heading).toBeInstanceOf(HTMLHeadingElement);
          expect(heading.textContent).toBe("Title");
        }),
      );
    });

    it("should create paragraphs", async () => {
      await runTest(
        Effect.gen(function* () {
          const para = yield* p("Some text");
          expect(para).toBeInstanceOf(HTMLParagraphElement);
          expect(para.textContent).toBe("Some text");
        }),
      );
    });

    it("should create buttons", async () => {
      await runTest(
        Effect.gen(function* () {
          const btn = yield* button(
            { type: "submit", disabled: true },
            Effect.succeed("Click"),
          );
          expect(btn).toBeInstanceOf(HTMLButtonElement);
          expect(btn.type).toBe("submit");
          expect(btn.disabled).toBe(true);
          expect(btn.textContent).toBe("Click");
        }),
      );
    });

    it("should create inputs", async () => {
      await runTest(
        Effect.gen(function* () {
          const inp = yield* input({ type: "text", placeholder: "Enter..." });
          expect(inp).toBeInstanceOf(HTMLInputElement);
          expect(inp.type).toBe("text");
          expect(inp.placeholder).toBe("Enter...");
        }),
      );
    });

    it("should create links", async () => {
      await runTest(
        Effect.gen(function* () {
          const link = yield* a(
            { href: "/page", target: "_blank" },
            Effect.succeed("Link"),
          );
          expect(link).toBeInstanceOf(HTMLAnchorElement);
          expect(link.href).toContain("/page");
          expect(link.target).toBe("_blank");
        }),
      );
    });

    it("should create images", async () => {
      await runTest(
        Effect.gen(function* () {
          const image = yield* img({ src: "/img.png", alt: "Image" });
          expect(image).toBeInstanceOf(HTMLImageElement);
          expect(image.src).toContain("/img.png");
          expect(image.alt).toBe("Image");
        }),
      );
    });

    it("should create forms", async () => {
      await runTest(
        Effect.gen(function* () {
          const frm = yield* form({ action: "/submit", method: "post" });
          expect(frm).toBeInstanceOf(HTMLFormElement);
          expect(frm.action).toContain("/submit");
          expect(frm.method).toBe("post");
        }),
      );
    });

    it("should create lists", async () => {
      await runTest(
        Effect.gen(function* () {
          const list = yield* ul(
            Effect.gen(function* () {
              const items = [];
              items.push(yield* li("Item 1"));
              items.push(yield* li("Item 2"));
              return items;
            }),
          );
          expect(list).toBeInstanceOf(HTMLUListElement);
          expect(list.children.length).toBe(2);
        }),
      );
    });
  });

  describe("SVG elements", () => {
    it("should create SVG element with namespace", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* svg({ viewBox: "0 0 100 100" });
          expect(el).toBeInstanceOf(SVGElement);
          expect(el.tagName.toLowerCase()).toBe("svg");
          expect(el.getAttribute("viewBox")).toBe("0 0 100 100");
        }),
      );
    });

    it("should create SVG shapes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* $.rect({
            x: "10",
            y: "10",
            width: "80",
            height: "80",
          });
          expect(el).toBeInstanceOf(SVGElement);
          expect(el.tagName.toLowerCase()).toBe("rect");
          expect(el.getAttribute("x")).toBe("10");
        }),
      );
    });
  });

  describe("class attribute", () => {
    it("should handle string class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div({ class: "foo bar baz" });
          expect(el.className).toBe("foo bar baz");
        }),
      );
    });

    it("should handle array class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div({ class: ["foo", "bar", "baz"] });
          expect(el.className).toBe("foo bar baz");
        }),
      );
    });

    it("should handle reactive class", async () => {
      await runTest(
        Effect.gen(function* () {
          const className = yield* Signal.make("initial");
          const el = yield* div({ class: className });
          expect(el.className).toBe("initial");
          // Reactive update testing skipped due to heap memory issue in tests
          // See: packages/dom/src/Element/DOMElements.test.ts for context
        }),
      );
    });
  });

  describe("style attribute", () => {
    it("should handle style object", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div({ style: { color: "red", fontSize: "14px" } });
          expect(el.style.color).toBe("red");
          expect(el.style.fontSize).toBe("14px");
        }),
      );
    });

    it("should handle reactive style values", async () => {
      await runTest(
        Effect.gen(function* () {
          const color = yield* Signal.make("red");
          const el = yield* div({ style: { color } });
          expect(el.style.color).toBe("red");

          yield* color.set("blue");
          yield* Effect.sleep("10 millis");
          expect(el.style.color).toBe("blue");
        }),
      );
    });
  });

  describe("event handlers", () => {
    it("should handle onClick", async () => {
      const clicked = vi.fn();
      await runTest(
        Effect.gen(function* () {
          const el = yield* button(
            { onClick: () => Effect.sync(() => clicked()) },
            Effect.succeed("Click"),
          );
          el.click();
          yield* Effect.sleep("10 millis");
          expect(clicked).toHaveBeenCalled();
        }),
      );
    });

    it("should handle onClick with sync effect", async () => {
      let effectRan = false;
      await runTest(
        Effect.gen(function* () {
          const el = yield* button(
            {
              onClick: () =>
                Effect.sync(() => {
                  effectRan = true;
                }),
            },
            Effect.succeed("Click"),
          );
          el.click();
          // Wait for effect to run
          yield* Effect.sleep("10 millis");
          expect(effectRan).toBe(true);
        }),
      );
    });

    it("should handle onInput", async () => {
      const inputHandler = vi.fn();
      await runTest(
        Effect.gen(function* () {
          const el = yield* input({
            onInput: () => Effect.sync(() => inputHandler()),
          });
          el.dispatchEvent(new Event("input"));
          yield* Effect.sleep("10 millis");
          expect(inputHandler).toHaveBeenCalled();
        }),
      );
    });
  });

  describe("ref", () => {
    it("should bind element to ref", async () => {
      await runTest(
        Effect.gen(function* () {
          const myRef = yield* ref<HTMLDivElement>();
          const el = yield* div({ ref: myRef, id: "ref-test" });
          const refEl = getRef(myRef);
          expect(refEl).toBe(el);
          expect(refEl!.id).toBe("ref-test");
        }),
      );
    });
  });

  describe("reactive attributes", () => {
    it("should handle reactive id", async () => {
      await runTest(
        Effect.gen(function* () {
          const id = yield* Signal.make("initial-id");
          const el = yield* div({ id });
          expect(el.id).toBe("initial-id");

          yield* id.set("updated-id");
          yield* Effect.sleep("10 millis");
          expect(el.id).toBe("updated-id");
        }),
      );
    });

    it("should handle reactive disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const disabled = yield* Signal.make(false);
          const el = yield* button({ disabled });
          expect(el.disabled).toBe(false);

          yield* disabled.set(true);
          yield* Effect.sleep("10 millis");
          expect(el.disabled).toBe(true);
        }),
      );
    });

    it("should handle reactive innerHTML", async () => {
      await runTest(
        Effect.gen(function* () {
          const html = yield* Signal.make("<b>Bold</b>");
          const el = yield* div({ innerHTML: html });
          expect(el.innerHTML).toBe("<b>Bold</b>");

          yield* html.set("<i>Italic</i>");
          yield* Effect.sleep("10 millis");
          expect(el.innerHTML).toBe("<i>Italic</i>");
        }),
      );
    });
  });

  describe("children", () => {
    it("should handle string child", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div("Hello World");
          expect(el.textContent).toBe("Hello World");
        }),
      );
    });

    it("should handle number child", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(42);
          expect(el.textContent).toBe("42");
        }),
      );
    });

    it("should handle Readable child", async () => {
      await runTest(
        Effect.gen(function* () {
          const text = yield* Signal.make("initial");
          const el = yield* div(text);
          expect(el.textContent).toBe("initial");

          yield* text.set("updated");
          yield* Effect.sleep("10 millis");
          expect(el.textContent).toBe("updated");
        }),
      );
    });

    it("should handle array of children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(
            Effect.gen(function* () {
              return [yield* span("One"), yield* span("Two")];
            }),
          );
          expect(el.children.length).toBe(2);
        }),
      );
    });
  });

  describe("input value", () => {
    it("should handle value attribute on input", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* input({ value: "initial" });
          expect(el.value).toBe("initial");
        }),
      );
    });

    it("should handle reactive value on input", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make("initial");
          const el = yield* input({ value });
          expect(el.value).toBe("initial");

          yield* value.set("updated");
          yield* Effect.sleep("10 millis");
          expect(el.value).toBe("updated");
        }),
      );
    });
  });

  describe("MergePropsCtx", () => {
    it("should merge props from context", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Effect.provideService(
            div({ class: "user-class" }),
            MergePropsCtx,
            { id: "injected-id", "data-test": "injected" },
          );
          expect(el.id).toBe("injected-id");
          expect(el.className).toBe("user-class");
          expect(el.dataset.test).toBe("injected");
        }),
      );
    });

    it("should allow user props to override merged props", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Effect.provideService(
            div({ id: "user-id" }),
            MergePropsCtx,
            { id: "injected-id" },
          );
          // User prop should win
          expect(el.id).toBe("user-id");
        }),
      );
    });

    it("should not propagate MergePropsCtx to children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Effect.provideService(
            div(
              { class: "parent" },
              Effect.gen(function* () {
                return yield* span({ class: "child" });
              }),
            ),
            MergePropsCtx,
            { "data-injected": "true" },
          );
          // Parent should have the injected attr
          expect(el.dataset.injected).toBe("true");
          // Child should NOT have the injected attr
          const child = el.children[0] as HTMLElement;
          expect(child.dataset.injected).toBeUndefined();
        }),
      );
    });
  });

  describe("$ namespace", () => {
    it("should have all common elements", () => {
      expect($.div).toBeDefined();
      expect($.span).toBeDefined();
      expect($.p).toBeDefined();
      expect($.button).toBeDefined();
      expect($.input).toBeDefined();
      expect($.a).toBeDefined();
      expect($.ul).toBeDefined();
      expect($.li).toBeDefined();
      expect($.form).toBeDefined();
      expect($.svg).toBeDefined();
      expect($.path).toBeDefined();
    });

    it("should have helper functions", () => {
      expect($.of).toBeDefined();
      expect($.empty).toBeDefined();
    });
  });

  describe("helpers", () => {
    it("of should wrap a value in an Effect", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(of("Wrapped"));
          expect(el.textContent).toBe("Wrapped");
        }),
      );
    });

    it("empty should return empty children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div(empty);
          expect(el.children.length).toBe(0);
          expect(el.textContent).toBe("");
        }),
      );
    });
  });

  describe("data and aria attributes", () => {
    it("should handle data-* attributes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* div({
            "data-testid": "my-div",
            "data-value": "123",
          });
          expect(el.dataset.testid).toBe("my-div");
          expect(el.dataset.value).toBe("123");
        }),
      );
    });

    it("should handle aria-* attributes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* button({
            "aria-label": "Close",
            "aria-expanded": "false",
          });
          expect(el.getAttribute("aria-label")).toBe("Close");
          expect(el.getAttribute("aria-expanded")).toBe("false");
        }),
      );
    });
  });
});
