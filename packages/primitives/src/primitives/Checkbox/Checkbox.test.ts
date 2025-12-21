import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Checkbox } from "./Checkbox";
import type { CheckedState } from "./Checkbox";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
  );

describe("Checkbox", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("rendering", () => {
    it("should render as a button with checkbox role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({});

          expect(el.tagName).toBe("BUTTON");
          expect(el.getAttribute("type")).toBe("button");
          expect(el.getAttribute("role")).toBe("checkbox");
        }),
      );
    });

    it("should contain an indicator element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({});

          const indicator = el.querySelector("[data-checkbox-indicator]");
          expect(indicator).not.toBeNull();
          expect(indicator?.tagName).toBe("SPAN");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ class: "my-checkbox" });

          expect(el.className).toBe("my-checkbox");
        }),
      );
    });

    it("should apply custom id", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ id: "my-checkbox" });

          expect(el.id).toBe("my-checkbox");
        }),
      );
    });
  });

  describe("uncontrolled mode", () => {
    it("should default to unchecked state", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({});

          expect(el.getAttribute("data-state")).toBe("unchecked");
          expect(el.getAttribute("aria-checked")).toBe("false");
        }),
      );
    });

    it("should respect defaultChecked=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ defaultChecked: true });

          expect(el.getAttribute("data-state")).toBe("checked");
          expect(el.getAttribute("aria-checked")).toBe("true");
        }),
      );
    });

    it("should respect defaultChecked='indeterminate'", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ defaultChecked: "indeterminate" });

          expect(el.getAttribute("data-state")).toBe("indeterminate");
          expect(el.getAttribute("aria-checked")).toBe("mixed");
        }),
      );
    });

    it("should toggle state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ defaultChecked: false });

          expect(el.getAttribute("data-state")).toBe("unchecked");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("checked");
          expect(el.getAttribute("aria-checked")).toBe("true");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("unchecked");
          expect(el.getAttribute("aria-checked")).toBe("false");
        }),
      );
    });

    it("should toggle from indeterminate to checked", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ defaultChecked: "indeterminate" });

          expect(el.getAttribute("data-state")).toBe("indeterminate");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("checked");
        }),
      );
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled state", async () => {
      await runTest(
        Effect.gen(function* () {
          const checked = yield* Signal.make<CheckedState>(true);
          const el = yield* Checkbox({ checked });

          expect(el.getAttribute("data-state")).toBe("checked");

          yield* checked.set(false);
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("unchecked");

          yield* checked.set("indeterminate");
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("indeterminate");
          expect(el.getAttribute("aria-checked")).toBe("mixed");
        }),
      );
    });

    it("should update controlled state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const checked = yield* Signal.make<CheckedState>(false);
          const el = yield* Checkbox({ checked });

          el.click();
          yield* Effect.sleep("10 millis");

          const value = yield* checked.get;
          expect(value).toBe(true);
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("should set disabled attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ disabled: true });

          expect((el as HTMLButtonElement).disabled).toBe(true);
          expect(el.getAttribute("data-disabled")).toBe("");
        }),
      );
    });

    it("should not toggle when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ disabled: true, defaultChecked: false });

          expect(el.getAttribute("data-state")).toBe("unchecked");

          el.click();
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });
  });

  describe("form attributes", () => {
    it("should set name attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ name: "terms" });

          expect(el.getAttribute("name")).toBe("terms");
        }),
      );
    });

    it("should default value to 'on'", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({});

          expect(el.getAttribute("value")).toBe("on");
        }),
      );
    });

    it("should set custom value", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ value: "accepted" });

          expect(el.getAttribute("value")).toBe("accepted");
        }),
      );
    });

    it("should set aria-required", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Checkbox({ required: true });

          expect(el.getAttribute("aria-required")).toBe("true");
        }),
      );
    });
  });

  describe("onCheckedChange callback", () => {
    it("should call onCheckedChange when toggled", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: CheckedState[] = [];

          const el = yield* Checkbox({
            defaultChecked: false,
            onCheckedChange: (checked) =>
              Effect.sync(() => {
                changes.push(checked);
              }),
          });

          el.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true]);

          el.click();
          yield* Effect.sleep("10 millis");

          expect(changes).toEqual([true, false]);
        }),
      );
    });
  });
});
