import { Effect } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { $, collect, DOMRendererLive } from "@effex/dom";

import { ScrollArea } from "./ScrollArea";

// Mock ResizeObserver for jsdom
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

const runTest = <A, R>(effect: Effect.Effect<A, never, R>) =>
  Effect.runPromise(
    Effect.scoped(effect).pipe(
      Effect.provide(DOMRendererLive),
    ) as Effect.Effect<A, never, never>,
  );

describe("ScrollArea", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Root", () => {
    it("should render with scrollarea-root data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(ScrollArea.Viewport({}, collect())),
          );

          expect(el.getAttribute("data-scrollarea-root")).toBe("");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({ class: "my-scroll" }, collect());

          expect(el.className).toBe("my-scroll");
        }),
      );
    });

    it("should have relative positioning", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({}, collect());

          expect(el.style.position).toBe("relative");
        }),
      );
    });

    it("should have overflow hidden", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({}, collect());

          expect(el.style.overflow).toBe("hidden");
        }),
      );
    });
  });

  describe("Viewport", () => {
    it("should render with viewport data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(ScrollArea.Viewport({}, collect())),
          );

          const viewport = el.querySelector("[data-scrollarea-viewport]");
          expect(viewport).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(ScrollArea.Viewport({ class: "my-viewport" }, collect())),
          );

          const viewport = el.querySelector("[data-scrollarea-viewport]");
          expect(viewport?.className).toBe("my-viewport");
        }),
      );
    });

    it("should render children", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Viewport(
                {},
                collect($.div({ "data-test-content": "" }, $.of("Content"))),
              ),
            ),
          );

          const content = el.querySelector("[data-test-content]");
          expect(content).not.toBeNull();
          expect(content?.textContent).toBe("Content");
        }),
      );
    });
  });

  describe("Scrollbar", () => {
    it("should render with scrollbar data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Viewport({}, collect()),
              ScrollArea.Scrollbar({ orientation: "vertical" }, collect()),
            ),
          );

          const scrollbar = el.querySelector("[data-scrollarea-scrollbar]");
          expect(scrollbar).not.toBeNull();
        }),
      );
    });

    it("should set data-orientation to vertical", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Scrollbar({ orientation: "vertical" }, collect()),
            ),
          );

          const scrollbar = el.querySelector("[data-scrollarea-scrollbar]");
          expect(scrollbar?.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });

    it("should set data-orientation to horizontal", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Scrollbar({ orientation: "horizontal" }, collect()),
            ),
          );

          const scrollbar = el.querySelector("[data-scrollarea-scrollbar]");
          expect(scrollbar?.getAttribute("data-orientation")).toBe(
            "horizontal",
          );
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Scrollbar(
                { orientation: "vertical", class: "my-scrollbar" },
                collect(),
              ),
            ),
          );

          const scrollbar = el.querySelector("[data-scrollarea-scrollbar]");
          expect(scrollbar?.className).toBe("my-scrollbar");
        }),
      );
    });
  });

  describe("Thumb", () => {
    it("should render with thumb data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Scrollbar(
                { orientation: "vertical" },
                collect(ScrollArea.Thumb({})),
              ),
            ),
          );

          const thumb = el.querySelector("[data-scrollarea-thumb]");
          expect(thumb).not.toBeNull();
        }),
      );
    });

    it("should have data-orientation matching parent scrollbar", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Scrollbar(
                { orientation: "vertical" },
                collect(ScrollArea.Thumb({})),
              ),
            ),
          );

          const thumb = el.querySelector("[data-scrollarea-thumb]");
          expect(thumb?.getAttribute("data-orientation")).toBe("vertical");
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(
              ScrollArea.Scrollbar(
                { orientation: "vertical" },
                collect(ScrollArea.Thumb({ class: "my-thumb" })),
              ),
            ),
          );

          const thumb = el.querySelector("[data-scrollarea-thumb]");
          expect(thumb?.className).toBe("my-thumb");
        }),
      );
    });
  });

  describe("Corner", () => {
    it("should render with corner data attribute", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({}, collect(ScrollArea.Corner({})));

          const corner = el.querySelector("[data-scrollarea-corner]");
          expect(corner).not.toBeNull();
        }),
      );
    });

    it("should apply custom class", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root(
            {},
            collect(ScrollArea.Corner({ class: "my-corner" })),
          );

          const corner = el.querySelector("[data-scrollarea-corner]");
          expect(corner?.className).toBe("my-corner");
        }),
      );
    });
  });

  describe("type prop", () => {
    it("should accept type=hover", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({ type: "hover" }, collect());

          expect(el.getAttribute("data-scrollarea-root")).toBe("");
        }),
      );
    });

    it("should accept type=always", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({ type: "always" }, collect());

          expect(el.getAttribute("data-scrollarea-root")).toBe("");
        }),
      );
    });

    it("should accept type=scroll", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({ type: "scroll" }, collect());

          expect(el.getAttribute("data-scrollarea-root")).toBe("");
        }),
      );
    });

    it("should accept type=auto", async () => {
      await runTest(
        Effect.gen(function* () {
          const el = yield* ScrollArea.Root({ type: "auto" }, collect());

          expect(el.getAttribute("data-scrollarea-root")).toBe("");
        }),
      );
    });
  });
});
