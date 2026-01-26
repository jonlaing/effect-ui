import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { isReadable, Signal } from "@effex/core";

import { DOMRenderer } from "../DOMRenderer";
import { $ } from "./Element";
import {
  applyClassWithRenderer,
  applyEventHandlerWithRenderer,
  applyGenericAttributeWithRenderer,
  applyInputValueWithRenderer,
  applyStyleWithRenderer,
  flattenChildren,
  isElement,
  subscribeToReadable,
} from "./helpers";

describe("isReadable", () => {
  it("should return true for Signal", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.make(0);
          return isReadable(signal);
        }),
      ),
    );
    expect(result).toBe(true);
  });

  it("should return false for primitive values", () => {
    expect(isReadable(null)).toBe(false);
    expect(isReadable(undefined)).toBe(false);
    expect(isReadable(42)).toBe(false);
    expect(isReadable("hello")).toBe(false);
    expect(isReadable(true)).toBe(false);
  });

  it("should return false for plain objects", () => {
    expect(isReadable({})).toBe(false);
    expect(isReadable({ get: true })).toBe(false);
    expect(isReadable({ get: true, changes: true })).toBe(false);
  });

  it("should return false for arrays", () => {
    expect(isReadable([])).toBe(false);
    expect(isReadable([1, 2, 3])).toBe(false);
  });
});

describe("isElement", () => {
  it("should return true for Element (Effect)", async () => {
    const element = $.div({}, $.of("hello"));
    expect(isElement(element)).toBe(true);
  });

  it("should return false for non-effects", () => {
    expect(isElement(null)).toBe(false);
    expect(isElement(42)).toBe(false);
    expect(isElement("hello")).toBe(false);
    expect(isElement({})).toBe(false);
  });
});

describe("flattenChildren", () => {
  it("should normalize single ChildNode to array", async () => {
    const children = Effect.succeed("a" as const);
    const result = await Effect.runPromise(flattenChildren(children));
    expect(result).toEqual(["a"]);
  });

  it("should handle empty arrays", async () => {
    const children = Effect.succeed([] as string[]);
    const result = await Effect.runPromise(flattenChildren(children));
    expect(result).toEqual([]);
  });

  it("should pass through arrays unchanged", async () => {
    const children = Effect.succeed(["a", "b", "c"]);
    const result = await Effect.runPromise(flattenChildren(children));
    expect(result).toEqual(["a", "b", "c"]);
  });
});

describe("subscribeToReadable", () => {
  it("should call onValue with initial value", async () => {
    const values: number[] = [];

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.make(42);
          yield* subscribeToReadable(signal, (v) => values.push(v));
          yield* Effect.sleep(10);
        }),
      ),
    );

    expect(values).toContain(42);
  });

  it("should call onValue when value changes", async () => {
    const values: number[] = [];

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const signal = yield* Signal.make(1);
          yield* subscribeToReadable(signal, (v) => values.push(v));
          yield* Effect.sleep(10);
          yield* signal.set(2);
          yield* Effect.sleep(10);
          yield* signal.set(3);
          yield* Effect.sleep(10);
        }),
      ),
    );

    // Initial value may appear twice (from get + values stream)
    // What matters is that we get all updates
    expect(values).toContain(1);
    expect(values).toContain(2);
    expect(values).toContain(3);
    expect(values[values.length - 1]).toBe(3);
  });
});

describe("applyClassWithRenderer", () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  it("should apply string class", async () => {
    await Effect.runPromise(
      Effect.scoped(
        applyClassWithRenderer(DOMRenderer, element, "my-class another-class"),
      ),
    );
    expect(element.className).toBe("my-class another-class");
  });

  it("should apply array of classes", async () => {
    await Effect.runPromise(
      Effect.scoped(
        applyClassWithRenderer(DOMRenderer, element, [
          "class-a",
          "class-b",
          "class-c",
        ]),
      ),
    );
    expect(element.className).toBe("class-a class-b class-c");
  });

  it("should apply reactive string class", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const className = yield* Signal.make("initial");
          yield* applyClassWithRenderer(DOMRenderer, element, className);
          expect(element.className).toBe("initial");

          yield* className.set("updated");
          yield* Effect.sleep(10);
          expect(element.className).toBe("updated");
        }),
      ),
    );
  });

  it("should apply mixed array with reactive classes", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const dynamicClass = yield* Signal.make("dynamic");
          yield* applyClassWithRenderer(DOMRenderer, element, [
            "static",
            dynamicClass,
          ]);
          expect(element.className).toBe("static dynamic");

          yield* dynamicClass.set("changed");
          yield* Effect.sleep(10);
          expect(element.className).toBe("static changed");
        }),
      ),
    );
  });

  it("should filter empty strings from class array", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const maybeClass = yield* Signal.make("");
          yield* applyClassWithRenderer(DOMRenderer, element, [
            "always",
            maybeClass,
          ]);
          expect(element.className).toBe("always");

          yield* maybeClass.set("now-present");
          yield* Effect.sleep(10);
          expect(element.className).toBe("always now-present");
        }),
      ),
    );
  });
});

describe("applyStyleWithRenderer", () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  it("should apply static style properties", async () => {
    await Effect.runPromise(
      Effect.scoped(
        applyStyleWithRenderer(DOMRenderer, element, {
          color: "red",
          "font-size": "16px",
        }),
      ),
    );
    expect(element.style.color).toBe("red");
    expect(element.style.fontSize).toBe("16px");
  });

  it("should apply reactive style properties", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const color = yield* Signal.make("blue");
          yield* applyStyleWithRenderer(DOMRenderer, element, { color });
          expect(element.style.color).toBe("blue");

          yield* color.set("green");
          yield* Effect.sleep(10);
          expect(element.style.color).toBe("green");
        }),
      ),
    );
  });

  it("should apply reactive style object", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const styles = yield* Signal.make<Record<string, string>>({
            color: "red",
          });
          yield* applyStyleWithRenderer(DOMRenderer, element, styles);
          expect(element.style.color).toBe("red");

          yield* styles.set({ color: "blue", "font-weight": "bold" });
          yield* Effect.sleep(10);
          expect(element.style.color).toBe("blue");
          expect(element.style.fontWeight).toBe("bold");
        }),
      ),
    );
  });

  it("should handle numeric style values", async () => {
    await Effect.runPromise(
      Effect.scoped(
        applyStyleWithRenderer(DOMRenderer, element, { "z-index": 100 }),
      ),
    );
    expect(element.style.zIndex).toBe("100");
  });
});

describe("applyEventHandlerWithRenderer", () => {
  let element: HTMLButtonElement;

  beforeEach(() => {
    element = document.createElement("button");
  });

  it("should add event listener for onClick", async () => {
    let clicked = false;
    await Effect.runPromise(
      applyEventHandlerWithRenderer(DOMRenderer, element, "onClick", () =>
        Effect.sync(() => {
          clicked = true;
        }),
      ),
    );

    element.click();
    expect(clicked).toBe(true);
  });

  it("should handle onMouseEnter event", async () => {
    let entered = false;
    await Effect.runPromise(
      applyEventHandlerWithRenderer(DOMRenderer, element, "onMouseEnter", () =>
        Effect.sync(() => {
          entered = true;
        }),
      ),
    );

    const event = new MouseEvent("mouseenter");
    element.dispatchEvent(event);
    expect(entered).toBe(true);
  });

  it("should pass event to handler", async () => {
    let receivedEvent: Event | null = null;
    await Effect.runPromise(
      applyEventHandlerWithRenderer(
        DOMRenderer,
        element,
        "onClick",
        (e: Event) =>
          Effect.sync(() => {
            receivedEvent = e;
          }),
      ),
    );

    element.click();
    expect(receivedEvent).toBeInstanceOf(MouseEvent);
  });

  it("should handle Effect-returning handlers", async () => {
    let effectRan = false;
    await Effect.runPromise(
      applyEventHandlerWithRenderer(DOMRenderer, element, "onClick", () =>
        Effect.sync(() => {
          effectRan = true;
        }),
      ),
    );

    element.click();
    await Effect.runPromise(Effect.sleep(10));
    expect(effectRan).toBe(true);
  });
});

describe("applyGenericAttributeWithRenderer", () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  it("should apply static attribute", async () => {
    await Effect.runPromise(
      Effect.scoped(
        applyGenericAttributeWithRenderer(
          DOMRenderer,
          element,
          "data-id",
          "123",
        ),
      ),
    );
    expect(element.getAttribute("data-id")).toBe("123");
  });

  it("should apply reactive attribute", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const value = yield* Signal.make("initial");
          yield* applyGenericAttributeWithRenderer(
            DOMRenderer,
            element,
            "data-value",
            value,
          );
          expect(element.getAttribute("data-value")).toBe("initial");

          yield* value.set("updated");
          yield* Effect.sleep(10);
          expect(element.getAttribute("data-value")).toBe("updated");
        }),
      ),
    );
  });

  it("should handle reactive boolean attribute", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const hidden = yield* Signal.make(true);
          yield* applyGenericAttributeWithRenderer(
            DOMRenderer,
            element,
            "hidden",
            hidden,
          );
          expect(element.hasAttribute("hidden")).toBe(true);

          yield* hidden.set(false);
          yield* Effect.sleep(10);
          expect(element.hasAttribute("hidden")).toBe(false);
        }),
      ),
    );
  });
});

describe("applyInputValueWithRenderer", () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    input = document.createElement("input");
  });

  it("should set static input value", async () => {
    await Effect.runPromise(
      Effect.scoped(
        applyInputValueWithRenderer(DOMRenderer, input, "hello world"),
      ),
    );
    expect(input.value).toBe("hello world");
  });

  it("should set reactive input value", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const value = yield* Signal.make("initial");
          yield* applyInputValueWithRenderer(DOMRenderer, input, value);
          expect(input.value).toBe("initial");

          yield* value.set("updated");
          yield* Effect.sleep(10);
          expect(input.value).toBe("updated");
        }),
      ),
    );
  });

  it("should not update if value is same (prevent cursor jump)", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const value = yield* Signal.make("test");
          yield* applyInputValueWithRenderer(DOMRenderer, input, value);

          // Manually set input value to same thing
          input.value = "test";

          // Signal update with same value shouldn't cause DOM update
          yield* value.set("test");
          yield* Effect.sleep(10);
          expect(input.value).toBe("test");
        }),
      ),
    );
  });

  it("should convert numbers to strings", async () => {
    await Effect.runPromise(
      Effect.scoped(applyInputValueWithRenderer(DOMRenderer, input, 42)),
    );
    expect(input.value).toBe("42");
  });

  it("should work with textarea", async () => {
    const textarea = document.createElement("textarea");
    await Effect.runPromise(
      Effect.scoped(
        applyInputValueWithRenderer(DOMRenderer, textarea, "multiline\ntext"),
      ),
    );
    expect(textarea.value).toBe("multiline\ntext");
  });

  it("should work with select", async () => {
    const select = document.createElement("select");
    select.innerHTML =
      '<option value="a">A</option><option value="b">B</option>';
    await Effect.runPromise(
      Effect.scoped(applyInputValueWithRenderer(DOMRenderer, select, "b")),
    );
    expect(select.value).toBe("b");
  });
});
