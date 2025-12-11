import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal } from "@core/Signal";
import { div, span, button, input, h1, p, ul, li } from "./Element";

describe("Element", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("basic element creation", () => {
    it("should create empty element", async () => {
      const element = await Effect.runPromise(Effect.scoped(div()));
      expect(element.tagName).toBe("DIV");
      expect(element.children.length).toBe(0);
    });

    it("should create element with string child", async () => {
      const element = await Effect.runPromise(Effect.scoped(span("Hello")));
      expect(element.textContent).toBe("Hello");
    });

    it("should create element with number child", async () => {
      const element = await Effect.runPromise(Effect.scoped(span(42)));
      expect(element.textContent).toBe("42");
    });

    it("should create element with array of children", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(div(["Hello", " ", "World"])),
      );
      expect(element.textContent).toBe("Hello World");
    });

    it("should create nested elements", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(div([h1("Title"), p("Content")])),
      );
      expect(element.children.length).toBe(2);
      expect(element.children[0].tagName).toBe("H1");
      expect(element.children[0].textContent).toBe("Title");
      expect(element.children[1].tagName).toBe("P");
      expect(element.children[1].textContent).toBe("Content");
    });
  });

  describe("attributes", () => {
    it("should apply class", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(div({ class: "container" })),
      );
      expect(element.className).toBe("container");
    });

    it("should apply id", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(div({ id: "main" })),
      );
      expect(element.id).toBe("main");
    });

    it("should apply style object", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(
          div({
            style: {
              color: "red",
              "font-size": "16px",
            },
          }),
        ),
      );
      expect(element.style.color).toBe("red");
      expect(element.style.fontSize).toBe("16px");
    });

    it("should apply attributes with children", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(div({ class: "wrapper" }, [span("content")])),
      );
      expect(element.className).toBe("wrapper");
      expect(element.children.length).toBe(1);
    });

    it("should apply attributes with single child", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(button({ class: "btn" }, "Click")),
      );
      expect(element.className).toBe("btn");
      expect(element.textContent).toBe("Click");
    });
  });

  describe("reactive attributes", () => {
    it("should update class reactively", async () => {
      const element = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isActive = yield* Signal.make(false);
            const el = yield* div({
              class: isActive.map((a) => (a ? "active" : "inactive")),
            });

            expect(el.className).toBe("inactive");

            yield* isActive.set(true);
            yield* Effect.sleep(10);

            expect(el.className).toBe("active");
            return el;
          }),
        ),
      );
      expect(element).toBeTruthy();
    });

    it("should update style reactively", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const width = yield* Signal.make(100);
            const el = yield* div({
              style: {
                width: width.map((w) => `${w}px`),
              },
            });

            expect(el.style.width).toBe("100px");

            yield* width.set(200);
            yield* Effect.sleep(10);

            expect(el.style.width).toBe("200px");
          }),
        ),
      );
    });
  });

  describe("reactive children", () => {
    it("should update text from Signal", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(0);
            const el = yield* span(count);

            expect(el.textContent).toBe("0");

            yield* count.set(42);
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("42");
          }),
        ),
      );
    });

    it("should update mapped Signal text", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(0);
            const el = yield* span(count.map((n) => `Count: ${n}`));

            expect(el.textContent).toBe("Count: 0");

            yield* count.set(5);
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("Count: 5");
          }),
        ),
      );
    });

    it("should handle mixed static and reactive children", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const count = yield* Signal.make(0);
            const el = yield* div(["Count: ", count, " items"]);

            expect(el.textContent).toBe("Count: 0 items");

            yield* count.set(3);
            yield* Effect.sleep(10);

            expect(el.textContent).toBe("Count: 3 items");
          }),
        ),
      );
    });
  });

  describe("event handlers", () => {
    it("should call onClick handler", async () => {
      let clicked = false;

      const element = await Effect.runPromise(
        Effect.scoped(
          button(
            {
              onClick: () =>
                Effect.sync(() => {
                  clicked = true;
                }),
            },
            "Click me",
          ),
        ),
      );

      element.click();
      expect(clicked).toBe(true);
    });

    it("should call Effect-returning onClick handler", async () => {
      let effectRan = false;

      const element = await Effect.runPromise(
        Effect.scoped(
          button(
            {
              onClick: () =>
                Effect.sync(() => {
                  effectRan = true;
                }),
            },
            "Click me",
          ),
        ),
      );

      element.click();
      // Give time for Effect to run
      await new Promise((r) => setTimeout(r, 10));
      expect(effectRan).toBe(true);
    });

    it("should update Signal from onInput", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const text = yield* Signal.make("");
            const el = yield* input({
              value: text,
              onInput: (e) => text.set((e.target as HTMLInputElement).value),
            });

            // Simulate input
            (el as HTMLInputElement).value = "hello";
            el.dispatchEvent(new InputEvent("input"));

            yield* Effect.sleep(10);
            const value = yield* text.get;
            expect(value).toBe("hello");
          }),
        ),
      );
    });
  });

  describe("element factories", () => {
    it("should create various HTML elements", async () => {
      const elements = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            return {
              div: yield* div(),
              span: yield* span(),
              button: yield* button(),
              input: yield* input(),
              h1: yield* h1(),
              p: yield* p(),
              ul: yield* ul(),
              li: yield* li(),
            };
          }),
        ),
      );

      expect(elements.div.tagName).toBe("DIV");
      expect(elements.span.tagName).toBe("SPAN");
      expect(elements.button.tagName).toBe("BUTTON");
      expect(elements.input.tagName).toBe("INPUT");
      expect(elements.h1.tagName).toBe("H1");
      expect(elements.p.tagName).toBe("P");
      expect(elements.ul.tagName).toBe("UL");
      expect(elements.li.tagName).toBe("LI");
    });
  });
});
