import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { DOMRendererLive } from "@effex/dom";

import { Toast, ToastCtx, ToastItemCtx, type ToastItemContext } from "./Toast";

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

// Mock item context for testing individual components
const mockItemCtx: ToastItemContext = {
  toast: {
    id: "test-toast",
    title: "Test Title",
    description: "Test Description",
    type: "default",
  },
  dismiss: () => Effect.void,
  pauseTimer: () => undefined,
  resumeTimer: () => undefined,
};

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
          const el = yield* Toast.Title({}, "Title Text").pipe(
            Effect.provideService(ToastItemCtx, mockItemCtx),
          );

          expect(el.dataset.toastTitle).toBe("");
          expect(el.textContent).toBe("Title Text");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Title({ class: "my-title" }, "Title").pipe(
            Effect.provideService(ToastItemCtx, mockItemCtx),
          );

          expect(el.className).toBe("my-title");
        }),
      );
    });

    it("should render title from context when no children provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Title({}).pipe(
            Effect.provideService(ToastItemCtx, mockItemCtx),
          );

          expect(el.textContent).toBe("Test Title");
        }),
      );
    });
  });

  describe("Description", () => {
    it("should render with toast-description data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Description({}, "Description text").pipe(
            Effect.provideService(ToastItemCtx, mockItemCtx),
          );

          expect(el.dataset.toastDescription).toBe("");
          expect(el.textContent).toBe("Description text");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Description(
            { class: "my-desc" },
            "Description",
          ).pipe(Effect.provideService(ToastItemCtx, mockItemCtx));

          expect(el.className).toBe("my-desc");
        }),
      );
    });

    it("should render description from context when no children provided", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* Toast.Description({}).pipe(
            Effect.provideService(ToastItemCtx, mockItemCtx),
          );

          expect(el.textContent).toBe("Test Description");
        }),
      );
    });
  });
});
