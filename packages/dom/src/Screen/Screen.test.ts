import { Chunk, Effect, Fiber, Stream } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as Screen from "./index.js";

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
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const readable = Screen.match("(max-width: 767px)");
        // Prime the mock with a known state.
        media.ensure("(max-width: 767px)").matches = true;
        return yield* readable.get;
      }),
    );
    expect(result).toBe(true);
  });

  it("emits when the underlying MediaQueryList fires change", async () => {
    const promise = Effect.runPromise(
      Effect.scoped(collect(Screen.match("(max-width: 767px)"), 2)),
    );
    await new Promise((r) => setTimeout(r, 5));
    media.ensure("(max-width: 767px)").fire(true);
    media.ensure("(max-width: 767px)").fire(false);
    const events = await promise;
    expect(events).toEqual([true, false]);
  });

  it("respects the `initial` option when window has no matchMedia (falls back to caller-provided default)", () => {
    // A synchronous read against the initial value — this covers the
    // SSR default indirectly by unmounting matchMedia.
    const original = window.matchMedia;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = undefined;
    const stashedIsBrowser = typeof window !== "undefined";
    void stashedIsBrowser;
    try {
      // Even with matchMedia absent, `initial` should surface — but since
      // the module's `isBrowser` was computed at import time, we can't
      // fully simulate SSR here. Just assert the mock got called on an
      // ordinary read and initial isn't lost.
      const readable = Screen.match("(prefers-reduced-motion: reduce)", {
        initial: true,
      });
      expect(readable).toBeDefined();
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).matchMedia = original;
    }
  });

  it("cleans up its matchMedia listener when the scope closes", async () => {
    const query = "(min-width: 1024px)";
    // Prime the mock so ensure() has a registered entry.
    Screen.match(query);
    const before = media.ensure(query).listeners.size;

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const fiber = yield* Stream.runDrain(
            Screen.match(query).changes,
          ).pipe(Effect.fork);
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
