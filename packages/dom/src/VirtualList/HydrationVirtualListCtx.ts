/**
 * Hydration VirtualListCtx implementation.
 * Finds existing SSR-rendered items, attaches event handlers,
 * then switches to virtualization mode.
 */

import { Effect, Layer, Scope, Stream } from "effect";

import { RendererContext, type Readable } from "@effex/core";

import { calculateItemOffset } from "./helpers.js";
import { VirtualListCtx, type IVirtualListCtx } from "./VirtualListCtx.js";

/**
 * Create hydration virtual list context.
 * Attaches to existing DOM and enables virtualization.
 */
const createHydrationVirtualListCtx = (): IVirtualListCtx => {
  const ctx: IVirtualListCtx = {
    // Hydration uses virtualization (items will be added/removed as user scrolls)
    shouldVirtualize: true,

    createContainers: ({ height, totalHeight }) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;

        // For hydration, we create new containers since the SSR output
        // rendered all items and we need to switch to virtualized layout.
        // In a more sophisticated implementation, we could find and reuse
        // the existing viewport/inner containers.
        const viewport = (yield* renderer.createNode("div")) as HTMLElement;
        yield* renderer.setStyleProperty(viewport, "overflow", "auto");
        yield* renderer.setStyleProperty(viewport, "height", height);
        yield* renderer.setStyleProperty(viewport, "position", "relative");

        const inner = (yield* renderer.createNode("div")) as HTMLElement;
        yield* renderer.setStyleProperty(inner, "position", "relative");
        yield* renderer.setStyleProperty(inner, "width", "100%");
        yield* renderer.setStyleProperty(inner, "height", `${totalHeight}px`);
        yield* renderer.appendChild(viewport, inner);

        return { viewport, inner };
      }),

    updateTotalHeight: (inner, height) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;
        yield* renderer.setStyleProperty(inner, "height", `${height}px`);
      }),

    createItemWrapper: ({ index, itemHeight }) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;
        const wrapper = (yield* renderer.createNode("div")) as HTMLElement;
        yield* renderer.setStyleProperty(wrapper, "position", "absolute");
        yield* renderer.setStyleProperty(
          wrapper,
          "top",
          `${calculateItemOffset(index, itemHeight)}px`,
        );
        yield* renderer.setStyleProperty(wrapper, "left", "0");
        yield* renderer.setStyleProperty(wrapper, "right", "0");
        yield* renderer.setStyleProperty(wrapper, "height", `${itemHeight}px`);
        return wrapper;
      }),

    updateItemPosition: (wrapper, index, itemHeight) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;
        yield* renderer.setStyleProperty(
          wrapper,
          "top",
          `${calculateItemOffset(index, itemHeight)}px`,
        );
      }),

    appendItem: (inner, wrapper) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;
        yield* renderer.appendChild(inner, wrapper);
      }),

    removeItem: (inner, wrapper) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;
        yield* renderer.removeChild(inner, wrapper);
      }),

    setupScrollTracking: (viewport, onScroll, scope) =>
      Effect.gen(function* () {
        let rafId: number | null = null;

        const handleScroll = () => {
          if (rafId === null) {
            rafId = requestAnimationFrame(() => {
              onScroll(viewport.scrollTop);
              rafId = null;
            });
          }
        };

        viewport.addEventListener("scroll", handleScroll, { passive: true });

        yield* Scope.addFinalizer(
          scope,
          Effect.sync(() => {
            viewport.removeEventListener("scroll", handleScroll);
            if (rafId !== null) {
              cancelAnimationFrame(rafId);
            }
          }),
        );

        return viewport.scrollTop;
      }),

    setupResizeTracking: (viewport, onResize, scope) =>
      Effect.gen(function* () {
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            onResize(entry.contentRect.height);
          }
        });

        resizeObserver.observe(viewport);

        yield* Scope.addFinalizer(
          scope,
          Effect.sync(() => {
            resizeObserver.disconnect();
          }),
        );

        const initialHeight =
          viewport.clientHeight || viewport.offsetHeight || 0;
        return initialHeight;
      }),

    subscribe: <V, E, R>(
      readable: Readable.Readable<V>,
      handler: (value: V) => Effect.Effect<void, E, R>,
      scope: Scope.Scope,
    ): Effect.Effect<void, E, R> =>
      readable.changes.pipe(
        Stream.runForEach(handler),
        Effect.forkIn(scope),
        Effect.asVoid,
      ) as Effect.Effect<void, E, R>,

    getScrollControl: (viewport) => ({
      scrollTo: (top, behavior) =>
        Effect.sync(() => {
          viewport.scrollTo({ top, behavior });
        }),
      getScrollTop: () => viewport.scrollTop,
    }),
  };

  return ctx;
};

/**
 * Hydration VirtualListCtx layer.
 * Attaches to existing DOM and enables virtualization.
 */
export const HydrationVirtualListCtx: Layer.Layer<
  VirtualListCtx,
  never,
  RendererContext
> = Layer.effect(
  VirtualListCtx,
  Effect.sync(() => createHydrationVirtualListCtx()),
);
