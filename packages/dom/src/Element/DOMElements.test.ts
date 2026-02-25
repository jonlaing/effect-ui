import { describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { beforeEach, expect, vi } from "vitest";

import { Signal } from "@effex/core";

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

const TestLayer = DOMRendererLive;

describe("DOMElements", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("basic element creation", () => {
    it.scopedLive("should create a div with no args", () =>
      Effect.gen(function* () {
        const el = yield* div();
        expect(el).toBeInstanceOf(HTMLDivElement);
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create a div with attributes only", () =>
      Effect.gen(function* () {
        const el = yield* div({ id: "test", class: "foo bar" });
        expect(el.id).toBe("test");
        expect(el.className).toBe("foo bar");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create a div with child effect", () =>
      Effect.gen(function* () {
        const el = yield* div(Effect.succeed("Hello"));
        expect(el.textContent).toBe("Hello");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create a div with attrs and children", () =>
      Effect.gen(function* () {
        const el = yield* div(
          { class: "container" },
          Effect.succeed("Content"),
        );
        expect(el.className).toBe("container");
        expect(el.textContent).toBe("Content");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create nested elements", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("various HTML elements", () => {
    it.scopedLive("should create headings", () =>
      Effect.gen(function* () {
        const heading = yield* h1("Title");
        expect(heading).toBeInstanceOf(HTMLHeadingElement);
        expect(heading.textContent).toBe("Title");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create paragraphs", () =>
      Effect.gen(function* () {
        const para = yield* p("Some text");
        expect(para).toBeInstanceOf(HTMLParagraphElement);
        expect(para.textContent).toBe("Some text");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create buttons", () =>
      Effect.gen(function* () {
        const btn = yield* button(
          { type: "submit", disabled: true },
          Effect.succeed("Click"),
        );
        expect(btn).toBeInstanceOf(HTMLButtonElement);
        expect(btn.type).toBe("submit");
        expect(btn.disabled).toBe(true);
        expect(btn.textContent).toBe("Click");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create inputs", () =>
      Effect.gen(function* () {
        const inp = yield* input({ type: "text", placeholder: "Enter..." });
        expect(inp).toBeInstanceOf(HTMLInputElement);
        expect(inp.type).toBe("text");
        expect(inp.placeholder).toBe("Enter...");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create links", () =>
      Effect.gen(function* () {
        const link = yield* a(
          { href: "/page", target: "_blank" },
          Effect.succeed("Link"),
        );
        expect(link).toBeInstanceOf(HTMLAnchorElement);
        expect(link.href).toContain("/page");
        expect(link.target).toBe("_blank");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create images", () =>
      Effect.gen(function* () {
        const image = yield* img({ src: "/img.png", alt: "Image" });
        expect(image).toBeInstanceOf(HTMLImageElement);
        expect(image.src).toContain("/img.png");
        expect(image.alt).toBe("Image");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create forms", () =>
      Effect.gen(function* () {
        const frm = yield* form({ action: "/submit", method: "post" });
        expect(frm).toBeInstanceOf(HTMLFormElement);
        expect(frm.action).toContain("/submit");
        expect(frm.method).toBe("post");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create lists", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("SVG elements", () => {
    it.scopedLive("should create SVG element with namespace", () =>
      Effect.gen(function* () {
        const el = yield* svg({ viewBox: "0 0 100 100" });
        expect(el).toBeInstanceOf(SVGElement);
        expect(el.tagName.toLowerCase()).toBe("svg");
        expect(el.getAttribute("viewBox")).toBe("0 0 100 100");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should create SVG shapes", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("class attribute", () => {
    it.scopedLive("should handle string class", () =>
      Effect.gen(function* () {
        const el = yield* div({ class: "foo bar baz" });
        expect(el.className).toBe("foo bar baz");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle array class", () =>
      Effect.gen(function* () {
        const el = yield* div({ class: ["foo", "bar", "baz"] });
        expect(el.className).toBe("foo bar baz");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle reactive class", () =>
      Effect.gen(function* () {
        const className = yield* Signal.make("initial");
        const el = yield* div({ class: className });
        expect(el.className).toBe("initial");

        yield* Effect.sleep("20 millis");
        yield* className.set("updated");
        yield* Effect.sleep("20 millis");
        expect(el.className).toBe("updated");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("style attribute", () => {
    it.scopedLive("should handle style object", () =>
      Effect.gen(function* () {
        const el = yield* div({ style: { color: "red", fontSize: "14px" } });
        expect(el.style.color).toBe("red");
        expect(el.style.fontSize).toBe("14px");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle reactive style values", () =>
      Effect.gen(function* () {
        const color = yield* Signal.make("red");
        const el = yield* div({ style: { color } });
        expect(el.style.color).toBe("red");

        yield* Effect.sleep("20 millis");
        yield* color.set("blue");
        yield* Effect.sleep("20 millis");
        expect(el.style.color).toBe("blue");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("event handlers", () => {
    it.scopedLive("should handle onClick", () => {
      const clicked = vi.fn();
      return Effect.gen(function* () {
        const el = yield* button(
          { onClick: () => Effect.sync(() => clicked()) },
          Effect.succeed("Click"),
        );
        el.click();
        yield* Effect.sleep("10 millis");
        expect(clicked).toHaveBeenCalled();
      }).pipe(Effect.provide(TestLayer));
    });

    it.scopedLive("should handle onClick with sync effect", () => {
      let effectRan = false;
      return Effect.gen(function* () {
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
      }).pipe(Effect.provide(TestLayer));
    });

    it.scopedLive("should handle onInput", () => {
      const inputHandler = vi.fn();
      return Effect.gen(function* () {
        const el = yield* input({
          onInput: () => Effect.sync(() => inputHandler()),
        });
        el.dispatchEvent(new Event("input"));
        yield* Effect.sleep("10 millis");
        expect(inputHandler).toHaveBeenCalled();
      }).pipe(Effect.provide(TestLayer));
    });
  });

  describe("ref", () => {
    it.scopedLive("should bind element to ref", () =>
      Effect.gen(function* () {
        const myRef = yield* ref<HTMLDivElement>();
        const el = yield* div({ ref: myRef, id: "ref-test" });
        const refEl = getRef(myRef);
        expect(refEl).toBe(el);
        expect(refEl!.id).toBe("ref-test");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("reactive attributes", () => {
    it.scopedLive("should handle reactive id", () =>
      Effect.gen(function* () {
        const id = yield* Signal.make("initial-id");
        const el = yield* div({ id });
        expect(el.id).toBe("initial-id");

        yield* Effect.sleep("20 millis");
        yield* id.set("updated-id");
        yield* Effect.sleep("20 millis");
        expect(el.id).toBe("updated-id");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle reactive disabled", () =>
      Effect.gen(function* () {
        const disabled = yield* Signal.make(false);
        const el = yield* button({ disabled });
        expect(el.disabled).toBe(false);

        yield* Effect.sleep("20 millis");
        yield* disabled.set(true);
        yield* Effect.sleep("20 millis");
        expect(el.disabled).toBe(true);
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle reactive innerHTML", () =>
      Effect.gen(function* () {
        const html = yield* Signal.make("<b>Bold</b>");
        const el = yield* div({ innerHTML: html });
        expect(el.innerHTML).toBe("<b>Bold</b>");

        yield* Effect.sleep("20 millis");
        yield* html.set("<i>Italic</i>");
        yield* Effect.sleep("20 millis");
        expect(el.innerHTML).toBe("<i>Italic</i>");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("children", () => {
    it.scopedLive("should handle string child", () =>
      Effect.gen(function* () {
        const el = yield* div("Hello World");
        expect(el.textContent).toBe("Hello World");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle number child", () =>
      Effect.gen(function* () {
        const el = yield* div(42);
        expect(el.textContent).toBe("42");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle Readable child", () =>
      Effect.gen(function* () {
        const text = yield* Signal.make("initial");
        const el = yield* div(text);
        expect(el.textContent).toBe("initial");

        yield* Effect.sleep("20 millis");
        yield* text.set("updated");
        yield* Effect.sleep("20 millis");
        expect(el.textContent).toBe("updated");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle array of children", () =>
      Effect.gen(function* () {
        const el = yield* div(
          Effect.gen(function* () {
            return [yield* span("One"), yield* span("Two")];
          }),
        );
        expect(el.children.length).toBe(2);
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("input value", () => {
    it.scopedLive("should handle value attribute on input", () =>
      Effect.gen(function* () {
        const el = yield* input({ value: "initial" });
        expect(el.value).toBe("initial");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle reactive value on input", () =>
      Effect.gen(function* () {
        const value = yield* Signal.make("initial");
        const el = yield* input({ value });
        expect(el.value).toBe("initial");

        yield* Effect.sleep("20 millis");
        yield* value.set("updated");
        yield* Effect.sleep("20 millis");
        expect(el.value).toBe("updated");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("MergePropsCtx", () => {
    it.scopedLive("should merge props from context", () =>
      Effect.gen(function* () {
        const el = yield* Effect.provideService(
          div({ class: "user-class" }),
          MergePropsCtx,
          { id: "injected-id", "data-test": "injected" },
        );
        expect(el.id).toBe("injected-id");
        expect(el.className).toBe("user-class");
        expect(el.dataset.test).toBe("injected");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should allow user props to override merged props", () =>
      Effect.gen(function* () {
        const el = yield* Effect.provideService(
          div({ id: "user-id" }),
          MergePropsCtx,
          { id: "injected-id" },
        );
        // User prop should win
        expect(el.id).toBe("user-id");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should not propagate MergePropsCtx to children", () =>
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
      }).pipe(Effect.provide(TestLayer)),
    );
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
    it.scopedLive("of should wrap a value in an Effect", () =>
      Effect.gen(function* () {
        const el = yield* div(of("Wrapped"));
        expect(el.textContent).toBe("Wrapped");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("empty should return empty children", () =>
      Effect.gen(function* () {
        const el = yield* div(empty);
        expect(el.children.length).toBe(0);
        expect(el.textContent).toBe("");
      }).pipe(Effect.provide(TestLayer)),
    );
  });

  describe("data and aria attributes", () => {
    it.scopedLive("should handle data-* attributes", () =>
      Effect.gen(function* () {
        const el = yield* div({
          "data-testid": "my-div",
          "data-value": "123",
        });
        expect(el.dataset.testid).toBe("my-div");
        expect(el.dataset.value).toBe("123");
      }).pipe(Effect.provide(TestLayer)),
    );

    it.scopedLive("should handle aria-* attributes", () =>
      Effect.gen(function* () {
        const el = yield* button({
          "aria-label": "Close",
          "aria-expanded": "false",
        });
        expect(el.getAttribute("aria-label")).toBe("Close");
        expect(el.getAttribute("aria-expanded")).toBe("false");
      }).pipe(Effect.provide(TestLayer)),
    );
  });
});
