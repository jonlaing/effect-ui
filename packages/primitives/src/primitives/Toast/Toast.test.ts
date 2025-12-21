import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { DOMRendererLive } from "@effex/dom";
import { Toast, ToastCtx } from "./Toast";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(Effect.provide(DOMRendererLive)) as Effect.Effect<A, never, never>,
  );

describe("Toast", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Provider", () => {
    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Provider({}, [
            Effect.gen(function* () {
              yield* ToastCtx;
              return yield* Effect.succeed(document.createElement("div"));
            }),
          ]);

          expect(el.tagName).toBe("DIV");
        }),
      );
    });

    it("should use default position of bottom-right", async () => {
      await runTest(
        Effect.gen(function* () {
          let capturedPosition: string | null = null;

          yield* Toast.Provider({}, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              capturedPosition = ctx.position;
              return document.createElement("div");
            }),
          ]);

          expect(capturedPosition).toBe("bottom-right");
        }),
      );
    });

    it("should accept custom position", async () => {
      await runTest(
        Effect.gen(function* () {
          let capturedPosition: string | null = null;

          yield* Toast.Provider({ position: "top-center" }, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              capturedPosition = ctx.position;
              return document.createElement("div");
            }),
          ]);

          expect(capturedPosition).toBe("top-center");
        }),
      );
    });

    it("should use default maxVisible of 5", async () => {
      await runTest(
        Effect.gen(function* () {
          let capturedMaxVisible: number | null = null;

          yield* Toast.Provider({}, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              capturedMaxVisible = ctx.maxVisible;
              return document.createElement("div");
            }),
          ]);

          expect(capturedMaxVisible).toBe(5);
        }),
      );
    });

    it("should use default duration of 5000", async () => {
      await runTest(
        Effect.gen(function* () {
          let capturedDuration: number | null = null;

          yield* Toast.Provider({}, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              capturedDuration = ctx.defaultDuration;
              return document.createElement("div");
            }),
          ]);

          expect(capturedDuration).toBe(5000);
        }),
      );
    });

    it("should accept custom defaultDuration", async () => {
      await runTest(
        Effect.gen(function* () {
          let capturedDuration: number | null = null;

          yield* Toast.Provider({ defaultDuration: 3000 }, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              capturedDuration = ctx.defaultDuration;
              return document.createElement("div");
            }),
          ]);

          expect(capturedDuration).toBe(3000);
        }),
      );
    });
  });

  describe("Toast context operations", () => {
    it("should add toast via context", async () => {
      await runTest(
        Effect.gen(function* () {
          let toastId: string | null = null;

          yield* Toast.Provider({}, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              toastId = yield* ctx.add({
                title: "Test Toast",
                description: "Test description",
              });
              return document.createElement("div");
            }),
          ]);

          expect(toastId).not.toBeNull();
          expect(typeof toastId).toBe("string");
        }),
      );
    });

    it("should dismiss toast via context", async () => {
      await runTest(
        Effect.gen(function* () {
          let toastsAfterDismiss: number | null = null;

          yield* Toast.Provider({}, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              const id = yield* ctx.add({ title: "Test" });
              yield* ctx.dismiss(id);
              const toasts = yield* ctx.toasts.get;
              toastsAfterDismiss = toasts.length;
              return document.createElement("div");
            }),
          ]);

          expect(toastsAfterDismiss).toBe(0);
        }),
      );
    });

    it("should dismiss all toasts via context", async () => {
      await runTest(
        Effect.gen(function* () {
          let toastsAfterDismiss: number | null = null;

          yield* Toast.Provider({}, [
            Effect.gen(function* () {
              const ctx = yield* ToastCtx;
              yield* ctx.add({ title: "Toast 1" });
              yield* ctx.add({ title: "Toast 2" });
              yield* ctx.add({ title: "Toast 3" });
              yield* ctx.dismissAll();
              const toasts = yield* ctx.toasts.get;
              toastsAfterDismiss = toasts.length;
              return document.createElement("div");
            }),
          ]);

          expect(toastsAfterDismiss).toBe(0);
        }),
      );
    });
  });

  describe("Title", () => {
    it("should render with toast-title data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Provider({}, [Toast.Title({}, "Title Text")]);

          const title = el.querySelector("[data-toast-title]");
          expect(title).not.toBeNull();
          expect(title?.textContent).toBe("Title Text");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Provider({}, [
            Toast.Title({ class: "my-title" }, "Title"),
          ]);

          const title = el.querySelector("[data-toast-title]");
          expect(title?.className).toBe("my-title");
        }),
      );
    });
  });

  describe("Description", () => {
    it("should render with toast-description data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Provider({}, [
            Toast.Description({}, "Description text"),
          ]);

          const desc = el.querySelector("[data-toast-description]");
          expect(desc).not.toBeNull();
          expect(desc?.textContent).toBe("Description text");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Provider({}, [
            Toast.Description({ class: "my-desc" }, "Description"),
          ]);

          const desc = el.querySelector("[data-toast-description]");
          expect(desc?.className).toBe("my-desc");
        }),
      );
    });
  });
});
