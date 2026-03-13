/**
 * Client-side VirtualListCtx implementation.
 * Full virtualization with scroll and resize tracking.
 */

import { Effect, Layer, Scope, Stream } from "effect";

import { RendererContext, type Readable } from "@effex/core";

import { calculateItemOffset } from "./helpers.js";
import { VirtualListCtx, type IVirtualListCtx } from "./VirtualListCtx.js";

/**
 * Create client virtual list context.
 * Provides full virtualization with scroll/resize tracking.
 */
const createClientVirtualListCtx = (): IVirtualListCtx => {
  const ctx: IVirtualListCtx = {
    shouldVirtualize: true,

    createContainers: ({ height, totalHeight }) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;

        // Create viewport (scrollable container)
        const viewport = (yield* renderer.createNode("div")) as HTMLElement;
        yield* renderer.setStyleProperty(viewport, "overflow", "auto");
        yield* renderer.setStyleProperty(viewport, "height", height);
        yield* renderer.setStyleProperty(viewport, "position", "relative");

        // Create inner container (full height for absolute positioning)
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

        // Return initial height
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
 * Client-side VirtualListCtx layer.
 * Provides full virtualization with scroll/resize tracking.
 */
export const ClientVirtualListCtx: Layer.Layer<
  VirtualListCtx,
  never,
  RendererContext
> = Layer.effect(
  VirtualListCtx,
  Effect.sync(() => createClientVirtualListCtx()),
);
