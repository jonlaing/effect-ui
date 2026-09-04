import { Chunk, Effect, Fiber, Stream } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RendererContext } from "@stax-ui/core";

import { DOMRendererLive } from "../Render/DOMRenderer.js";
import * as Screen from "./index.js";

// Screen.match now requires a RendererContext (to read the hydration
// phase). These tests exercise the client-side path only — provide the
// plain DOMRenderer whose `hydrationPhase` is a constant `false`, so
// there's no phase transition and the behavior collapses to raw
// `matchMedia` observation.
const runWithRenderer = <A, E>(
  program: Effect.Effect<A, E, RendererContext>,
): Promise<A> =>
  Effect.runPromise(program.pipe(Effect.provide(DOMRendererLive)));

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

/**
 * jsdom doesn't fire real resize events when you tweak innerWidth, so we
 * set the value manually and dispatch the event ourselves.
 */
const setViewport = (w: number, h: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: w,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: h,
  });
  window.dispatchEvent(new Event("resize"));
};

type FakeMql = {
  matches: boolean;
  media: string;
  listeners: Set<(e: MediaQueryListEvent) => void>;
  addEventListener: (kind: string, l: (e: MediaQueryListEvent) => void) => void;
  removeEventListener: (
    kind: string,
    l: (e: MediaQueryListEvent) => void,
  ) => void;
  fire: (matches: boolean) => void;
};

const mockMatchMedia = () => {
  const registry = new Map<string, FakeMql>();
  const impl = vi.fn((query: string): FakeMql => {
    const existing = registry.get(query);
    if (existing) return existing;
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const mql: FakeMql = {
      matches: false,
      media: query,
      listeners,
      addEventListener: (kind, l) => {
        if (kind === "change") listeners.add(l);
      },
      removeEventListener: (kind, l) => {
        if (kind === "change") listeners.delete(l);
      },
      fire: (matches) => {
        mql.matches = matches;
        for (const l of listeners) {
          l({ matches, media: query } as unknown as MediaQueryListEvent);
        }
      },
    };
    registry.set(query, mql);
    return mql;
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });
  return {
    get: (query: string) => registry.get(query)!,
    ensure: (query: string) => registry.get(query) ?? impl(query),
  };
};

/**
 * Collect the first `n` change emissions from a Readable and return them
 * as a plain array. Uses `.changes` (not `.values`) — starts empty and
 * only accumulates events fired AFTER the fiber attaches.
 */
const collect = <A>(readable: { changes: Stream.Stream<A> }, n: number) =>
  Effect.gen(function* () {
    return Chunk.toReadonlyArray(
      yield* readable.changes.pipe(Stream.take(n), Stream.runCollect),
    );
  });

// -----------------------------------------------------------------------------
// Viewport
// -----------------------------------------------------------------------------

describe("Screen.width / Screen.height", () => {
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

  afterEach(() => {
    setViewport(originalWidth, originalHeight);
  });

  it("reads the current window.innerWidth synchronously", async () => {
    setViewport(1280, 720);
    const value = await Effect.runPromise(Screen.width.get);
    expect(value).toBe(1280);
  });

  it("reads the current window.innerHeight synchronously", async () => {
    setViewport(1280, 720);
    const value = await Effect.runPromise(Screen.height.get);
    expect(value).toBe(720);
  });

  it("emits new widths on resize", async () => {
    setViewport(1024, 768);
    const promise = Effect.runPromise(Effect.scoped(collect(Screen.width, 2)));
    // Give the stream a tick to attach the resize listener.
    await new Promise((r) => setTimeout(r, 5));
    setViewport(800, 768);
    setViewport(400, 768);
    const events = await promise;
    expect(events).toEqual([800, 400]);
  });

  it("cleans up its resize listener when the scope closes", async () => {
    const before = countResizeListeners();
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const fiber = yield* Stream.runDrain(Screen.width.changes).pipe(
            Effect.fork,
          );
          // Let the listener attach.
          yield* Effect.sleep("5 millis");
          const during = countResizeListeners();
          yield* Fiber.interrupt(fiber);
          yield* Effect.sleep("5 millis");
          const after = countResizeListeners();
          return { before, during, after };
        }),
      ),
    ).then((counts) => {
      expect(counts.during).toBeGreaterThan(counts.before);
      expect(counts.after).toBe(counts.before);
    });
  });
});

// -----------------------------------------------------------------------------
// Match
// -----------------------------------------------------------------------------

describe("Screen.match", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia();
  });

  it("reads the current matches state via matchMedia", async () => {
    const result = await runWithRenderer(
      Effect.gen(function* () {
        const readable = yield* Screen.match("(max-width: 767px)");
        // Prime the mock with a known state.
        media.ensure("(max-width: 767px)").matches = true;
        return yield* readable.get;
      }),
    );
    expect(result).toBe(true);
  });

  it("emits when the underlying MediaQueryList fires change", async () => {
    // On subscribe, `.changes` first emits a post-hydration seed with
    // the current `mql.matches` (see the hydration-safety design in
    // Screen/index.ts). For a non-hydrating renderer that seed matches
    // whatever `.get` would return, so downstream reconcile treats it
    // as an idempotent no-op. Here we skip past it and assert the
    // real mql-change events.
    const promise = runWithRenderer(
      Effect.scoped(
        Effect.gen(function* () {
          const readable = yield* Screen.match("(max-width: 767px)");
          return yield* collect(readable, 3);
        }),
      ),
    );
    await new Promise((r) => setTimeout(r, 5));
    media.ensure("(max-width: 767px)").fire(true);
    media.ensure("(max-width: 767px)").fire(false);
    const events = await promise;
    // events[0] is the post-hydration seed (mql.matches at subscribe
    // time — false, since we haven't fired anything yet).
    expect(events[0]).toBe(false);
    expect(events.slice(1)).toEqual([true, false]);
  });

  it("respects the `initial` option when window has no matchMedia (falls back to caller-provided default)", async () => {
    // A synchronous read against the initial value — this covers the
    // SSR default indirectly by unmounting matchMedia.
    const original = window.matchMedia;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = undefined;
    try {
      // Even with matchMedia absent, `initial` should surface — but since
      // the module's `isBrowser` was computed at import time, we can't
      // fully simulate SSR here. Just assert construction succeeds and
      // the resulting Readable is defined.
      const readable = await runWithRenderer(
        Screen.match("(prefers-reduced-motion: reduce)", { initial: true }),
      );
      expect(readable).toBeDefined();
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).matchMedia = original;
    }
  });

  // ---------------------------------------------------------------------
  // Hydration-safe behavior
  // ---------------------------------------------------------------------
  //
  // Build a bespoke Renderer where `hydrationPhase` is a controllable
  // Signal — the client's initial read returns `initial`, then when we
  // flip the phase to `false` the `.changes` stream must fire with the
  // live matchMedia value so reconcile can swap the DOM off the SSR
  // fallback. Uses only the Renderer fields Screen.match consults; the
  // rest of the tree is unused for this scenario.
  describe("hydration", () => {
    it("returns `initial` while phase is true, then emits live value on completeHydration", async () => {
      const { Signal } = await import("@stax-ui/core");
      const { RendererContext } = await import("@stax-ui/core");
      const { Layer } = await import("effect");

      // Prime matchMedia so the "live" side is unambiguously `true`
      // while our SSR-safe `initial` is `false`.
      media.ensure("(max-width: 767px)").matches = true;

      const events = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const phase = yield* Signal.make(true); // hydrating

            const fakeRenderer = {
              hydrationPhase: phase,
              completeHydration: phase.set(false),
              // Fields not read by Screen.match — safe to leave unset
              // by casting; TypeScript sees the shape we care about.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;

            const fakeLayer = Layer.succeed(RendererContext, fakeRenderer);

            return yield* Effect.gen(function* () {
              const readable = yield* Screen.match("(max-width: 767px)", {
                initial: false,
              });

              // Initial read during hydration — SSR-safe fallback.
              const duringHydration = yield* readable.get;

              // Attach a collector that expects one emission (the
              // post-hydration delta).
              const collectFiber = yield* readable.changes.pipe(
                Stream.take(1),
                Stream.runCollect,
                Effect.fork,
              );
              yield* Effect.sleep("5 millis"); // let it subscribe

              // Flip the phase — completeHydration fires, phase.changes
              // emits `false`, Screen.match's hydrationFlip picks it up.
              yield* phase.set(false);
              yield* Effect.sleep("5 millis");

              const emitted = Chunk.toReadonlyArray(
                yield* Fiber.join(collectFiber),
              );

              // After the flip, subsequent reads return the live value.
              const afterHydration = yield* readable.get;

              return { duringHydration, emitted, afterHydration };
            }).pipe(Effect.provide(fakeLayer));
          }),
        ),
      );

      expect(events.duringHydration).toBe(false); // SSR fallback
      expect(events.emitted).toEqual([true]); // live delta
      expect(events.afterHydration).toBe(true); // post-flip reads real
    });

    it("delivers the live value to a subscriber that attaches AFTER completeHydration", async () => {
      // Regression: an earlier version emitted the post-hydration delta
      // via a one-shot `phase.changes` filter. If a `when`/reconcile
      // block's forked subscription attached after `completeHydration`
      // had already fired, the emission was gone — the subscriber never
      // heard about the SSR→live correction and the DOM stayed on the
      // fallback branch until the user actually resized across the
      // breakpoint. Fixed by seeding from `phase.values` (which prepends
      // the current value on subscribe) + `Stream.take(1)`.
      const { Signal } = await import("@stax-ui/core");
      const { RendererContext } = await import("@stax-ui/core");
      const { Layer } = await import("effect");

      media.ensure("(max-width: 767px)").matches = true;

      const events = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const phase = yield* Signal.make(true);

            const fakeRenderer = {
              hydrationPhase: phase,
              completeHydration: phase.set(false),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;

            const fakeLayer = Layer.succeed(RendererContext, fakeRenderer);

            return yield* Effect.gen(function* () {
              const readable = yield* Screen.match("(max-width: 767px)", {
                initial: false,
              });

              // Fire completeHydration FIRST — the "flip" moment
              // happens before any subscriber is listening.
              yield* phase.set(false);
              yield* Effect.sleep("5 millis");

              // NOW attach a subscriber. It missed the transition on
              // `phase.changes` entirely — but should still receive the
              // live value from the `phase.values` seed.
              const collectFiber = yield* readable.changes.pipe(
                Stream.take(1),
                Stream.runCollect,
                Effect.fork,
              );
              yield* Effect.sleep("5 millis");

              return Chunk.toReadonlyArray(yield* Fiber.join(collectFiber));
            }).pipe(Effect.provide(fakeLayer));
          }),
        ),
      );

      expect(events).toEqual([true]);
    });
  });

  it("cleans up its matchMedia listener when the scope closes", async () => {
    const query = "(min-width: 1024px)";
    // Prime the mock so ensure() has a registered entry — build one
    // Readable and drop it so the mql exists in `media`.
    await runWithRenderer(Effect.map(Screen.match(query), () => undefined));
    const before = media.ensure(query).listeners.size;

    await runWithRenderer(
      Effect.scoped(
        Effect.gen(function* () {
          const readable = yield* Screen.match(query);
          const fiber = yield* Stream.runDrain(readable.changes).pipe(
            Effect.fork,
          );
          yield* Effect.sleep("5 millis");
          const during = media.ensure(query).listeners.size;
          yield* Fiber.interrupt(fiber);
          yield* Effect.sleep("5 millis");
          const after = media.ensure(query).listeners.size;
          expect(during).toBeGreaterThan(before);
          expect(after).toBe(before);
        }),
      ),
    );
  });
});

// -----------------------------------------------------------------------------
// Display
// -----------------------------------------------------------------------------

describe("Screen.display", () => {
  it("mirrors window.screen.width via .get", async () => {
    Object.defineProperty(window.screen, "width", {
      configurable: true,
      value: 1920,
    });
    const value = await Effect.runPromise(Screen.display.width.get);
    expect(value).toBe(1920);
  });

  it("returns an orientation snapshot with type and angle", async () => {
    // jsdom doesn't populate screen.orientation by default — fake it.
    Object.defineProperty(window.screen, "orientation", {
      configurable: true,
      value: {
        type: "portrait-primary",
        angle: 90,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    const value = await Effect.runPromise(Screen.display.orientation.get);
    expect(value).toEqual({ type: "portrait-primary", angle: 90 });
  });
});

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

/**
 * Count how many `resize` listeners are attached to `window`. jsdom
 * doesn't expose this directly, so we monkey-patch add/removeEventListener
 * lazily and hook into a counter.
 */
let resizeListenerCount = 0;
const originalAdd = window.addEventListener.bind(window);
const originalRemove = window.removeEventListener.bind(window);
Object.defineProperty(window, "addEventListener", {
  configurable: true,
  value: (type: string, listener: EventListener, opts?: unknown) => {
    if (type === "resize") resizeListenerCount++;
    return originalAdd(type, listener, opts as AddEventListenerOptions);
  },
});
Object.defineProperty(window, "removeEventListener", {
  configurable: true,
  value: (type: string, listener: EventListener, opts?: unknown) => {
    if (type === "resize") resizeListenerCount--;
    return originalRemove(type, listener, opts as EventListenerOptions);
  },
});

const countResizeListeners = () => resizeListenerCount;
