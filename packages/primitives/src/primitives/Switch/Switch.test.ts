import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { Signal, DOMRendererLive } from "@effex/dom";
import { Switch } from "./Switch";

const runTest = <A>(effect: Effect.Effect<A, never, any>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)),
  );

describe("Switch", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("rendering", () => {
    it("should render as a button with switch role", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({});

          expect(el.tagName).toBe("BUTTON");
          expect(el.getAttribute("type")).toBe("button");
          expect(el.getAttribute("role")).toBe("switch");
        }),
      );
    });

    it("should contain a thumb element", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({});

          const thumb = el.querySelector("[data-switch-thumb]");
          expect(thumb).not.toBeNull();
          expect(thumb?.tagName).toBe("SPAN");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ class: "my-switch" });

          expect(el.className).toBe("my-switch");
        }),
      );
    });

    it("should apply custom id", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ id: "my-switch" });

          expect(el.id).toBe("my-switch");
        }),
      );
    });
  });

  describe("uncontrolled mode", () => {
    it("should default to unchecked state", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({});

          expect(el.getAttribute("data-state")).toBe("unchecked");
          expect(el.getAttribute("aria-checked")).toBe("false");
        }),
      );
    });

    it("should respect defaultChecked=true", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ defaultChecked: true });

          expect(el.getAttribute("data-state")).toBe("checked");
          expect(el.getAttribute("aria-checked")).toBe("true");
        }),
      );
    });

    it("should toggle state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ defaultChecked: false });

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
  });

  describe("controlled mode", () => {
    it("should reflect controlled state", async () => {
      await runTest(
        Effect.gen(function* () {
          const checked = yield* Signal.make(true);
          const el = yield* Switch({ checked });

          expect(el.getAttribute("data-state")).toBe("checked");

          yield* checked.set(false);
          yield* Effect.sleep("10 millis");

          expect(el.getAttribute("data-state")).toBe("unchecked");
        }),
      );
    });

    it("should update controlled state on click", async () => {
      await runTest(
        Effect.gen(function* () {
          const checked = yield* Signal.make(false);
          const el = yield* Switch({ checked });

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
          const el = yield* Switch({ disabled: true });

          expect((el as HTMLButtonElement).disabled).toBe(true);
          expect(el.getAttribute("data-disabled")).toBe("");
        }),
      );
    });

    it("should not toggle when disabled", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ disabled: true, defaultChecked: false });

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
          const el = yield* Switch({ name: "notifications" });

          expect(el.getAttribute("name")).toBe("notifications");
        }),
      );
    });

    it("should default value to 'on'", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({});

          expect(el.getAttribute("value")).toBe("on");
        }),
      );
    });

    it("should set custom value", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ value: "enabled" });

          expect(el.getAttribute("value")).toBe("enabled");
        }),
      );
    });

    it("should set aria-required", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Switch({ required: true });

          expect(el.getAttribute("aria-required")).toBe("true");
        }),
      );
    });
  });

  describe("onCheckedChange callback", () => {
    it("should call onCheckedChange when toggled", async () => {
      await runTest(
        Effect.gen(function* () {
          const changes: boolean[] = [];

          const el = yield* Switch({
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
