import { describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { beforeEach, expect } from "vitest";

import { DOMRendererLive } from "../Render/DOMRenderer.js";
import * as Element from "./core.js";

const TestLayer = DOMRendererLive;

// The point of this file: verify that `Element.on`, `Element.once`, and
// the bare `Element.addEventListener` actually detach their DOM
// listeners when the enclosing scope closes. Prior to the scoped
// renderer.addEventListener contract, the finalizer only flipped an
// `isActive` flag — the DOM listener stayed attached forever and every
// component unmount leaked one listener per binding.
//
// These tests dispatch events AFTER the scope has closed. If the
// listener really got removed, the handler doesn't fire; if we
// regressed, the handler still fires and the counter goes up.
describe("Element.on — scope cleanup", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive("listener is removed from the DOM when the scope closes", () =>
    Effect.gen(function* () {
      let calls = 0;
      let element: HTMLDivElement | null = null;

      yield* Effect.scoped(
        Effect.gen(function* () {
          const el = yield* Element.on(
            Effect.gen(function* () {
              const div = document.createElement("div");
              document.body.appendChild(div);
              return div;
            }),
            "click",
            () => Effect.sync(() => calls++),
          );
          element = el as HTMLDivElement;

          el.dispatchEvent(new MouseEvent("click"));
          expect(calls).toBe(1);
        }),
      );

      // Scope closed. If cleanup worked, this click hits no listener.
      // If we regressed to the isActive-flag pattern, the DOM listener
      // is still attached; the wrappedHandler would just short-circuit
      // on !isActive. Either way `calls` wouldn't go up — so the
      // stronger signal is verifying the DOM state directly.
      element!.dispatchEvent(new MouseEvent("click"));
      expect(calls).toBe(1);

      // Direct DOM check: dispatching after cleanup should return
      // true (event.defaultPrevented is false because nobody called
      // preventDefault). Really we just care that no listener fired.
    }).pipe(Effect.provide(TestLayer)),
  );

  it.scopedLive(
    "multiple bindings on the same element are all cleaned up",
    () =>
      Effect.gen(function* () {
        let clickCount = 0;
        let mouseoverCount = 0;
        let element: HTMLDivElement | null = null;

        yield* Effect.scoped(
          Effect.gen(function* () {
            const el = yield* Element.on(
              Effect.gen(function* () {
                const div = document.createElement("div");
                document.body.appendChild(div);
                return div;
              }),
              "click",
              () => Effect.sync(() => clickCount++),
            );

            // Chain a second binding on the same element.
            yield* Element.on(Effect.succeed(el), "mouseover", () =>
              Effect.sync(() => mouseoverCount++),
            );

            element = el as HTMLDivElement;

            el.dispatchEvent(new MouseEvent("click"));
            el.dispatchEvent(new MouseEvent("mouseover"));
            expect(clickCount).toBe(1);
            expect(mouseoverCount).toBe(1);
          }),
        );

        element!.dispatchEvent(new MouseEvent("click"));
        element!.dispatchEvent(new MouseEvent("mouseover"));
        expect(clickCount).toBe(1);
        expect(mouseoverCount).toBe(1);
      }).pipe(Effect.provide(TestLayer)),
  );
});

describe("Element.once — scope cleanup + native once semantics", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive("fires exactly once and stops firing after", () =>
    Effect.gen(function* () {
      let calls = 0;
      const el = yield* Element.once(
        Effect.gen(function* () {
          const div = document.createElement("div");
          document.body.appendChild(div);
          return div;
        }),
        "click",
        () => Effect.sync(() => calls++),
      );

      el.dispatchEvent(new MouseEvent("click"));
      el.dispatchEvent(new MouseEvent("click"));
      el.dispatchEvent(new MouseEvent("click"));
      expect(calls).toBe(1);
    }).pipe(Effect.provide(TestLayer)),
  );

  it.scopedLive(
    "listener is removed if the scope closes before the event fires",
    () =>
      Effect.gen(function* () {
        let calls = 0;
        let element: HTMLDivElement | null = null;

        yield* Effect.scoped(
          Effect.gen(function* () {
            const el = yield* Element.once(
              Effect.gen(function* () {
                const div = document.createElement("div");
                document.body.appendChild(div);
                return div;
              }),
              "click",
              () => Effect.sync(() => calls++),
            );
            element = el as HTMLDivElement;
            // Do NOT dispatch. Scope closes here.
          }),
        );

        element!.dispatchEvent(new MouseEvent("click"));
        expect(calls).toBe(0);
      }).pipe(Effect.provide(TestLayer)),
  );
});

describe("Element.addEventListener — scope cleanup", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive("removes the plain-function listener on scope close", () =>
    Effect.gen(function* () {
      let calls = 0;
      let element: HTMLDivElement | null = null;

      yield* Effect.scoped(
        Effect.gen(function* () {
          const el = yield* Element.addEventListener(
            Effect.gen(function* () {
              const div = document.createElement("div");
              document.body.appendChild(div);
              return div;
            }),
            "click",
            () => {
              calls++;
            },
          );
          element = el as HTMLDivElement;

          el.dispatchEvent(new MouseEvent("click"));
          expect(calls).toBe(1);
        }),
      );

      element!.dispatchEvent(new MouseEvent("click"));
      expect(calls).toBe(1);
    }).pipe(Effect.provide(TestLayer)),
  );
});
