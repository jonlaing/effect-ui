import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { $ } from "@effex/dom";
import { RadioGroup } from "./RadioGroup";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("RadioGroup", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with radiogroup role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, []);

          expect(el.tagName).toBe("DIV");
          expect(el.getAttribute("role")).toBe("radiogroup");
        }),
      );
    });

    it("should set aria-orientation to vertical by default", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, []);

          expect(el.getAttribute("aria-orientation")).toBe("vertical");
        }),
      );
    });

    it("should set aria-orientation to horizontal", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ orientation: "horizontal" }, []);

          expect(el.getAttribute("aria-orientation")).toBe("horizontal");
        }),
      );
    });

    it("should set aria-required when required", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ required: true }, []);

          expect(el.getAttribute("aria-required")).toBe("true");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ class: "my-group" }, []);

          expect(el.className).toBe("my-group");
        }),
      );
    });
  });

  describe("Item", () => {
    it("should render as button with radio role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1" }),
          ]);

          const item = el.querySelector("button");
          expect(item).not.toBeNull();
          expect(item?.getAttribute("role")).toBe("radio");
        }),
      );
    });

    it("should have aria-checked=false when not selected", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1" }),
          ]);

          const item = el.querySelector("button");
          expect(item?.getAttribute("aria-checked")).toBe("false");
          expect(item?.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });

    it("should have aria-checked=true when selected", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ defaultValue: "option1" }, [
            RadioGroup.Item({ value: "option1" }),
          ]);

          const item = el.querySelector("button");
          expect(item?.getAttribute("aria-checked")).toBe("true");
          expect(item?.getAttribute("data-state")).toBe("checked");
        }),
      );
    });

    it("should set data-value attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "my-value" }),
          ]);

          const item = el.querySelector("button");
          expect(item?.getAttribute("data-value")).toBe("my-value");
        }),
      );
    });

    it("should contain an indicator element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1" }),
          ]);

          const indicator = el.querySelector("[data-radio-indicator]");
          expect(indicator).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1", class: "my-item" }),
          ]);

          const item = el.querySelector("button");
          expect(item?.className).toBe("my-item");
        }),
      );
    });

    it("should apply custom id", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1", id: "my-radio" }),
          ]);

          const item = el.querySelector("button");
          expect(item?.id).toBe("my-radio");
        }),
      );
    });
  });

  describe("selection", () => {
    it("should select item on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
          ]);

          const items = el.querySelectorAll("button");

          items[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("data-state")).toBe("unchecked");
          expect(items[1]?.getAttribute("data-state")).toBe("checked");
        }),
      );
    });

    it("should change selection on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ defaultValue: "option1" }, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
          ]);

          const items = el.querySelectorAll("button");

          expect(items[0]?.getAttribute("data-state")).toBe("checked");
          expect(items[1]?.getAttribute("data-state")).toBe("unchecked");

          items[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("data-state")).toBe("unchecked");
          expect(items[1]?.getAttribute("data-state")).toBe("checked");
        }),
      );
    });
  });

  describe("roving tabindex", () => {
    it("should set tabIndex=0 on selected item only", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ defaultValue: "option2" }, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
            RadioGroup.Item({ value: "option3" }),
          ]);

          const items = el.querySelectorAll("button");
          expect(items[0]?.tabIndex).toBe(-1);
          expect(items[1]?.tabIndex).toBe(0);
          expect(items[2]?.tabIndex).toBe(-1);
        }),
      );
    });

    it("should update tabIndex when selection changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ defaultValue: "option1" }, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
          ]);

          const items = el.querySelectorAll("button");

          expect(items[0]?.tabIndex).toBe(0);
          expect(items[1]?.tabIndex).toBe(-1);

          items[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(items[0]?.tabIndex).toBe(-1);
          expect(items[1]?.tabIndex).toBe(0);
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should disable all items when group is disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ disabled: true }, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
          ]);

          const items = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;
          expect(items[0]?.disabled).toBe(true);
          expect(items[1]?.disabled).toBe(true);
        }),
      );
    });

    it("should disable individual items", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2", disabled: true }),
          ]);

          const items = el.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>;
          expect(items[0]?.disabled).toBe(false);
          expect(items[1]?.disabled).toBe(true);
        }),
      );
    });

    it("should not select disabled item on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({}, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2", disabled: true }),
          ]);

          const items = el.querySelectorAll("button");
          items[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(items[1]?.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });
  });

  describe("form attributes", () => {
    it("should set name attribute on items", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* RadioGroup.Root({ name: "spacing" }, [
            RadioGroup.Item({ value: "option1" }),
          ]);

          const item = el.querySelector("button");
          expect(item?.getAttribute("name")).toBe("spacing");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", async () => {
      await runTest(
        Effect.gen(function* () {
          const value = yield* Signal.make("option2");

          const el = yield* RadioGroup.Root({ value }, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
          ]);

          const items = el.querySelectorAll("button");
          expect(items[0]?.getAttribute("data-state")).toBe("unchecked");
          expect(items[1]?.getAttribute("data-state")).toBe("checked");

          yield* value.set("option1");
          yield* Effect.sleep("10 millis");

          expect(items[0]?.getAttribute("data-state")).toBe("checked");
          expect(items[1]?.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });
  });

  describe("onValueChange callback", () => {
    it("should call onValueChange when selection changes", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: string[] = [];

          const el = yield* RadioGroup.Root({
            onValueChange: (value) =>
              Effect.sync(() => {
                changes.push(value);
              }),
          }, [
            RadioGroup.Item({ value: "option1" }),
            RadioGroup.Item({ value: "option2" }),
          ]);

          const items = el.querySelectorAll("button");

          items[0]?.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["option1"]);

          items[1]?.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual(["option1", "option2"]);
        }),
      );
    });
  });
});
