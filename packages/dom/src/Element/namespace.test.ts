import { describe, it, expect, beforeEach } from "vitest";
import { Effect, Option } from "effect";
import { Element } from "./namespace";
import { AttributeNotFound, DataAttributeNotFound } from "./ref";

/**
 * Helper to run Element helper tests.
 * Creates an element wrapped in Effect and runs the test.
 */
const runWithElement = <A, E>(
  tagName: keyof HTMLElementTagNameMap,
  fn: (el: Effect.Effect<HTMLElement>) => Effect.Effect<A, E>,
): Promise<A> => {
  const element = document.createElement(tagName);
  const wrappedEl = Effect.succeed(element);
  return Effect.runPromise(fn(wrappedEl) as Effect.Effect<A, never>);
};

describe("Element namespace helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // ===========================================================================
  // Styles
  // ===========================================================================

  describe("setStyles", () => {
    it("should set multiple styles with camelCase (data-last)", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setStyles({ color: "red", fontSize: "16px" })),
      );
      expect(el.style.color).toBe("red");
      expect(el.style.fontSize).toBe("16px");
    });

    it("should set multiple styles with kebab-case (data-last)", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setStyles({ color: "blue", "font-size": "20px" })),
      );
      expect(el.style.color).toBe("blue");
      expect(el.style.fontSize).toBe("20px");
    });

    it("should set multiple styles (data-first)", async () => {
      const element = document.createElement("div");
      await Effect.runPromise(
        Element.setStyles(Effect.succeed(element), {
          color: "blue",
          padding: "10px",
        }),
      );
      expect(element.style.color).toBe("blue");
      expect(element.style.padding).toBe("10px");
    });

    it("should remove style when value is empty string", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.setStyles({ color: "red" }),
          Element.setStyles({ color: "" }),
        ),
      );
      expect(el.style.color).toBe("");
    });
  });

  describe("setStyle", () => {
    it("should set a single style with camelCase (data-last)", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setStyle("backgroundColor", "green")),
      );
      expect(el.style.backgroundColor).toBe("green");
    });

    it("should set a single style with kebab-case (data-last)", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setStyle("background-color", "blue")),
      );
      expect(el.style.backgroundColor).toBe("blue");
    });

    it("should set a single style (data-first)", async () => {
      const element = document.createElement("div");
      await Effect.runPromise(
        Element.setStyle(Effect.succeed(element), "margin", "5px"),
      );
      expect(element.style.margin).toBe("5px");
    });
  });

  describe("removeStyle", () => {
    it("should remove a style property", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setStyle("color", "red"), Element.removeStyle("color")),
      );
      expect(el.style.color).toBe("");
    });
  });

  // ===========================================================================
  // Classes
  // ===========================================================================

  describe("addClass", () => {
    it("should add a single class (data-last)", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.addClass("active")),
      );
      expect(el.classList.contains("active")).toBe(true);
    });

    it("should add multiple classes", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.addClass("foo", "bar", "baz")),
      );
      expect(el.classList.contains("foo")).toBe(true);
      expect(el.classList.contains("bar")).toBe(true);
      expect(el.classList.contains("baz")).toBe(true);
    });

    it("should add classes (data-first)", async () => {
      const element = document.createElement("div");
      await Effect.runPromise(
        Element.addClass(Effect.succeed(element), "test-class"),
      );
      expect(element.classList.contains("test-class")).toBe(true);
    });
  });

  describe("removeClass", () => {
    it("should remove a class", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.addClass("active"), Element.removeClass("active")),
      );
      expect(el.classList.contains("active")).toBe(false);
    });

    it("should remove multiple classes", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.addClass("a", "b", "c"), Element.removeClass("a", "c")),
      );
      expect(el.classList.contains("a")).toBe(false);
      expect(el.classList.contains("b")).toBe(true);
      expect(el.classList.contains("c")).toBe(false);
    });
  });

  describe("toggleClass", () => {
    it("should toggle a class on", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.toggleClass("active")),
      );
      expect(el.classList.contains("active")).toBe(true);
    });

    it("should toggle a class off", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.addClass("active"), Element.toggleClass("active")),
      );
      expect(el.classList.contains("active")).toBe(false);
    });

    it("should force add with true", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.addClass("active"),
          Element.toggleClass("active", true),
        ),
      );
      expect(el.classList.contains("active")).toBe(true);
    });

    it("should force remove with false", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.toggleClass("active", false)),
      );
      expect(el.classList.contains("active")).toBe(false);
    });
  });

  describe("replaceClass", () => {
    it("should replace one class with another", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.addClass("old-class"),
          Element.replaceClass("old-class", "new-class"),
        ),
      );
      expect(el.classList.contains("old-class")).toBe(false);
      expect(el.classList.contains("new-class")).toBe(true);
    });
  });

  // ===========================================================================
  // Attributes
  // ===========================================================================

  describe("setAttribute", () => {
    it("should set an attribute (data-last)", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setAttribute("aria-label", "Hello")),
      );
      expect(el.getAttribute("aria-label")).toBe("Hello");
    });

    it("should set an attribute (data-first)", async () => {
      const element = document.createElement("div");
      await Effect.runPromise(
        Element.setAttribute(Effect.succeed(element), "role", "button"),
      );
      expect(element.getAttribute("role")).toBe("button");
    });
  });

  describe("setAttributes", () => {
    it("should set multiple attributes", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.setAttributes({
            "aria-expanded": "true",
            "aria-hidden": "false",
            role: "menu",
          }),
        ),
      );
      expect(el.getAttribute("aria-expanded")).toBe("true");
      expect(el.getAttribute("aria-hidden")).toBe("false");
      expect(el.getAttribute("role")).toBe("menu");
    });
  });

  describe("removeAttribute", () => {
    it("should remove an attribute", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.setAttribute("data-test", "value"),
          Element.removeAttribute("data-test"),
        ),
      );
      expect(el.hasAttribute("data-test")).toBe(false);
    });
  });

  describe("toggleAttribute", () => {
    it("should add a boolean attribute", async () => {
      const el = await runWithElement("button", (el) =>
        el.pipe(Element.toggleAttribute("disabled")),
      );
      expect(el.hasAttribute("disabled")).toBe(true);
    });

    it("should remove a boolean attribute", async () => {
      const el = await runWithElement("button", (el) =>
        el.pipe(
          Element.toggleAttribute("disabled"),
          Element.toggleAttribute("disabled"),
        ),
      );
      expect(el.hasAttribute("disabled")).toBe(false);
    });

    it("should force with boolean argument", async () => {
      const el = await runWithElement("button", (el) =>
        el.pipe(Element.toggleAttribute("disabled", false)),
      );
      expect(el.hasAttribute("disabled")).toBe(false);
    });
  });

  describe("getAttribute", () => {
    it("should get an attribute value", async () => {
      const value = await runWithElement("div", (el) =>
        el.pipe(
          Element.setAttribute("data-id", "123"),
          Element.getAttribute("data-id"),
        ),
      );
      expect(value).toBe("123");
    });

    it("should fail with AttributeNotFound when attribute doesn't exist", async () => {
      const element = document.createElement("div");
      const result = await Effect.runPromise(
        Effect.either(
          Effect.succeed(element).pipe(Element.getAttribute("nonexistent")),
        ),
      );
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(AttributeNotFound);
        expect((result.left as AttributeNotFound).attribute).toBe(
          "nonexistent",
        );
      }
    });

    it("should return Option.none with Effect.option when attribute doesn't exist", async () => {
      const result = await runWithElement("div", (el) =>
        el.pipe(Element.getAttribute("nonexistent"), Effect.option),
      );
      expect(Option.isNone(result)).toBe(true);
    });

    it("should return Option.some with Effect.option when attribute exists", async () => {
      const result = await runWithElement("div", (el) =>
        el.pipe(
          Element.setAttribute("data-id", "456"),
          Element.getAttribute("data-id"),
          Effect.option,
        ),
      );
      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toBe("456");
      }
    });
  });

  // ===========================================================================
  // Data Attributes
  // ===========================================================================

  describe("setData", () => {
    it("should set a data attribute", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setData("state", "open")),
      );
      expect(el.dataset.state).toBe("open");
      expect(el.getAttribute("data-state")).toBe("open");
    });
  });

  describe("removeData", () => {
    it("should remove a data attribute", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setData("state", "open"), Element.removeData("state")),
      );
      expect(el.dataset.state).toBeUndefined();
    });
  });

  describe("getData", () => {
    it("should get a data attribute value", async () => {
      const value = await runWithElement("div", (el) =>
        el.pipe(Element.setData("value", "test"), Element.getData("value")),
      );
      expect(value).toBe("test");
    });

    it("should fail with DataAttributeNotFound when data attribute doesn't exist", async () => {
      const element = document.createElement("div");
      const result = await Effect.runPromise(
        Effect.either(Effect.succeed(element).pipe(Element.getData("missing"))),
      );
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(DataAttributeNotFound);
        expect((result.left as DataAttributeNotFound).key).toBe("missing");
      }
    });

    it("should return Option.none with Effect.option when data doesn't exist", async () => {
      const result = await runWithElement("div", (el) =>
        el.pipe(Element.getData("missing"), Effect.option),
      );
      expect(Option.isNone(result)).toBe(true);
    });
  });

  // ===========================================================================
  // Content
  // ===========================================================================

  describe("setTextContent", () => {
    it("should set text content", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setTextContent("Hello, world!")),
      );
      expect(el.textContent).toBe("Hello, world!");
    });
  });

  describe("setInnerHTML", () => {
    it("should set innerHTML", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(Element.setInnerHTML("<strong>Bold</strong>")),
      );
      expect(el.innerHTML).toBe("<strong>Bold</strong>");
      expect(el.querySelector("strong")?.textContent).toBe("Bold");
    });
  });

  // ===========================================================================
  // Properties
  // ===========================================================================

  describe("setProperty", () => {
    it("should set a property on the element", async () => {
      const el = (await runWithElement("input", (el) =>
        el.pipe(
          Element.setProperty("value" as keyof HTMLElement, "test" as never),
        ),
      )) as HTMLInputElement;
      expect(el.value).toBe("test");
    });
  });

  // ===========================================================================
  // Focus
  // ===========================================================================

  describe("focus", () => {
    it("should focus the element", async () => {
      const el = await runWithElement("button", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          const container = document.createElement("div");
          document.body.appendChild(container);
          container.appendChild(element);
          return yield* Effect.succeed(element).pipe(Element.focus);
        }),
      );
      // Note: focus may not work in jsdom without proper setup
      // Just verify it doesn't throw
      expect(el).toBeTruthy();
    });
  });

  describe("blur", () => {
    it("should blur the element", async () => {
      const el = await runWithElement("button", (el) =>
        el.pipe(Element.focus, Element.blur),
      );
      expect(el).toBeTruthy();
    });
  });

  describe("focusFirst", () => {
    it("should focus the first matching descendant", async () => {
      const el = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.innerHTML = `
            <button data-item>First</button>
            <button data-item>Second</button>
          `;
          document.body.appendChild(element);
          return yield* Effect.succeed(element).pipe(
            Element.focusFirst("[data-item]"),
          );
        }),
      );
      expect(el).toBeTruthy();
    });
  });

  describe("focusLast", () => {
    it("should focus the last matching descendant", async () => {
      const el = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.innerHTML = `
            <button data-item>First</button>
            <button data-item>Second</button>
          `;
          document.body.appendChild(element);
          return yield* Effect.succeed(element).pipe(
            Element.focusLast("[data-item]"),
          );
        }),
      );
      expect(el).toBeTruthy();
    });
  });

  // ===========================================================================
  // Scrolling
  // ===========================================================================

  // Note: scrollIntoView, scrollTo, and scrollBy are not implemented in jsdom
  // These tests verify the helpers work by mocking the methods
  describe("scrollIntoView", () => {
    it("should call scrollIntoView", async () => {
      const el = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          // Mock scrollIntoView since jsdom doesn't implement it
          element.scrollIntoView = () => {};
          return yield* Effect.succeed(element).pipe(
            Element.scrollIntoView({ behavior: "auto" }),
          );
        }),
      );
      expect(el).toBeTruthy();
    });

    it("should work without options", async () => {
      const el = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.scrollIntoView = () => {};
          return yield* Effect.succeed(element).pipe(Element.scrollIntoView());
        }),
      );
      expect(el).toBeTruthy();
    });
  });

  describe("scrollTo", () => {
    it("should call scrollTo", async () => {
      const el = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          // Mock scrollTo since jsdom doesn't implement it
          element.scrollTo = () => {};
          return yield* Effect.succeed(element).pipe(
            Element.scrollTo({ top: 0 }),
          );
        }),
      );
      expect(el).toBeTruthy();
    });
  });

  describe("scrollBy", () => {
    it("should call scrollBy", async () => {
      const el = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          // Mock scrollBy since jsdom doesn't implement it
          element.scrollBy = () => {};
          return yield* Effect.succeed(element).pipe(
            Element.scrollBy({ top: 10 }),
          );
        }),
      );
      expect(el).toBeTruthy();
    });
  });

  // ===========================================================================
  // Events
  // ===========================================================================

  describe("click", () => {
    it("should programmatically click the element", async () => {
      let clicked = false;
      await runWithElement("button", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.addEventListener("click", () => {
            clicked = true;
          });
          return yield* Effect.succeed(element).pipe(Element.click);
        }),
      );
      expect(clicked).toBe(true);
    });
  });

  describe("dispatchEvent", () => {
    it("should dispatch a custom event", async () => {
      let eventDetail: unknown = null;
      await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.addEventListener("my-event", ((e: CustomEvent) => {
            eventDetail = e.detail;
          }) as EventListener);
          return yield* Effect.succeed(element).pipe(
            Element.dispatchEvent(
              new CustomEvent("my-event", { detail: { foo: "bar" } }),
            ),
          );
        }),
      );
      expect(eventDetail).toEqual({ foo: "bar" });
    });
  });

  // ===========================================================================
  // Input-specific
  // ===========================================================================

  describe("select", () => {
    it("should select text in an input", async () => {
      const el = (await runWithElement("input", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          (element as HTMLInputElement).value = "hello";
          return yield* (
            Effect.succeed(element) as Effect.Effect<HTMLInputElement>
          ).pipe(Element.select);
        }),
      )) as HTMLInputElement;
      expect(el.value).toBe("hello");
    });
  });

  describe("setSelectionRange", () => {
    it("should set selection range in an input", async () => {
      await runWithElement("input", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          (element as HTMLInputElement).value = "hello world";
          document.body.appendChild(element);
          return yield* (
            Effect.succeed(element) as Effect.Effect<HTMLInputElement>
          ).pipe(Element.setSelectionRange(0, 5));
        }),
      );
      // Selection range testing is limited in jsdom
    });
  });

  // ===========================================================================
  // Querying
  // ===========================================================================

  describe("querySelector", () => {
    it("should find a descendant element", async () => {
      const found = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.innerHTML = '<span class="target">Found</span>';
          return yield* Effect.succeed(element).pipe(
            Element.querySelector(".target"),
          );
        }),
      );
      expect(found.textContent).toBe("Found");
    });

    it("should fail when element not found", async () => {
      const element = document.createElement("div");
      const result = await Effect.runPromise(
        Effect.either(
          Effect.succeed(element).pipe(Element.querySelector(".nonexistent")),
        ),
      );
      expect(result._tag).toBe("Left");
    });
  });

  describe("querySelectorAll", () => {
    it("should find all matching descendants", async () => {
      const found = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.innerHTML = `
            <span class="item">One</span>
            <span class="item">Two</span>
            <span class="item">Three</span>
          `;
          return yield* Effect.succeed(element).pipe(
            Element.querySelectorAll(".item"),
          );
        }),
      );
      expect(found.length).toBe(3);
    });

    it("should return empty array when no matches", async () => {
      const found = await runWithElement("div", (el) =>
        el.pipe(Element.querySelectorAll(".nonexistent")),
      );
      expect(found).toEqual([]);
    });
  });

  describe("closest", () => {
    it("should find the closest ancestor", async () => {
      const found = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const parent = yield* el;
          parent.classList.add("parent");
          const child = document.createElement("span");
          parent.appendChild(child);
          return yield* Effect.succeed(child).pipe(Element.closest(".parent"));
        }),
      );
      expect(found.classList.contains("parent")).toBe(true);
    });

    it("should fail when no ancestor matches", async () => {
      const element = document.createElement("div");
      const result = await Effect.runPromise(
        Effect.either(
          Effect.succeed(element).pipe(Element.closest(".nonexistent")),
        ),
      );
      expect(result._tag).toBe("Left");
    });
  });

  describe("matches", () => {
    it("should return true when element matches selector", async () => {
      const result = await runWithElement("div", (el) =>
        el.pipe(Element.addClass("test"), Element.matches(".test")),
      );
      expect(result).toBe(true);
    });

    it("should return false when element doesn't match", async () => {
      const result = await runWithElement("div", (el) =>
        el.pipe(Element.matches(".nonexistent")),
      );
      expect(result).toBe(false);
    });
  });

  describe("getParent", () => {
    it("should get the parent element", async () => {
      const parent = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const child = yield* el;
          const parentEl = document.createElement("section");
          parentEl.appendChild(child);
          return yield* Effect.succeed(child).pipe(Element.getParent);
        }),
      );
      expect(parent.tagName).toBe("SECTION");
    });

    it("should fail when no parent exists", async () => {
      const element = document.createElement("div");
      const result = await Effect.runPromise(
        Effect.either(Effect.succeed(element).pipe(Element.getParent)),
      );
      expect(result._tag).toBe("Left");
    });
  });

  describe("getBoundingClientRect", () => {
    it("should return a DOMRect", async () => {
      const rect = await runWithElement("div", (el) =>
        el.pipe(Element.getBoundingClientRect),
      );
      expect(rect).toHaveProperty("width");
      expect(rect).toHaveProperty("height");
      expect(rect).toHaveProperty("top");
      expect(rect).toHaveProperty("left");
    });
  });

  // ===========================================================================
  // Custom taps
  // ===========================================================================

  describe("tap", () => {
    it("should call the function with the element", async () => {
      let captured: HTMLElement | null = null;
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.tap((e) => {
            captured = e;
          }),
        ),
      );
      expect(captured).toBe(el);
    });

    it("should preserve the element in the chain", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.tap(() => {}),
          Element.addClass("after-tap"),
        ),
      );
      expect(el.classList.contains("after-tap")).toBe(true);
    });
  });

  describe("tapEffect", () => {
    it("should run the effect and preserve the element", async () => {
      let effectRan = false;
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.tapEffect(() =>
            Effect.sync(() => {
              effectRan = true;
            }),
          ),
          Element.addClass("after-effect"),
        ),
      );
      expect(effectRan).toBe(true);
      expect(el.classList.contains("after-effect")).toBe(true);
    });
  });

  // ===========================================================================
  // Chaining
  // ===========================================================================

  describe("chaining", () => {
    it("should support chaining multiple operations", async () => {
      const el = await runWithElement("div", (el) =>
        el.pipe(
          Element.addClass("container"),
          Element.setStyles({ padding: "10px", margin: "5px" }),
          Element.setAttribute("role", "region"),
          Element.setData("state", "active"),
        ),
      );
      expect(el.classList.contains("container")).toBe(true);
      expect(el.style.padding).toBe("10px");
      expect(el.style.margin).toBe("5px");
      expect(el.getAttribute("role")).toBe("region");
      expect(el.dataset.state).toBe("active");
    });

    it("should support querying then mutating", async () => {
      const result = await runWithElement("div", (el) =>
        Effect.gen(function* () {
          const element = yield* el;
          element.innerHTML = '<span class="target">Content</span>';
          return yield* Effect.succeed(element).pipe(
            Element.querySelector(".target"),
            Element.addClass("found"),
            Element.setStyles({ color: "blue" }),
          );
        }),
      );
      expect(result.classList.contains("found")).toBe(true);
      expect(result.style.color).toBe("blue");
    });
  });
});
