/**
 * SSR VirtualListCtx implementation.
 * Renders all items (no virtualization) for SEO/accessibility.
 * Event listeners and subscriptions are noops.
 */

import { Effect, Layer } from "effect";

import { RendererContext, type Readable } from "@effex/core";

import { calculateItemOffset } from "./helpers";
import { VirtualListCtx, type IVirtualListCtx } from "./VirtualListCtx";

/**
 * Default viewport height for SSR.
 * Used to calculate initial total height, but all items are rendered regardless.
 */
const SSR_DEFAULT_VIEWPORT_HEIGHT = 600;

/**
 * Create SSR virtual list context.
 * Renders all items without virtualization.
 */
const createSSRVirtualListCtx = (): IVirtualListCtx => {
  const ctx: IVirtualListCtx = {
    // SSR renders all items - no virtualization
    shouldVirtualize: false,

    createContainers: ({ height, totalHeight }) =>
      Effect.gen(function* () {
        const renderer = yield* RendererContext;

        // Create viewport (scrollable container)
        const viewport = (yield* renderer.createNode("div")) as HTMLElement;
        yield* renderer.setStyleProperty(viewport, "overflow", "auto");
        yield* renderer.setStyleProperty(viewport, "height", height);
        yield* renderer.setStyleProperty(viewport, "position", "relative");

        // Create inner container
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

    // Noop on SSR - no scroll tracking
    setupScrollTracking: (_viewport, _onScroll, _scope) => Effect.succeed(0),

    // Noop on SSR - return default height so all items render
    setupResizeTracking: (_viewport, _onResize, _scope) =>
      Effect.succeed(SSR_DEFAULT_VIEWPORT_HEIGHT),

    // Noop on SSR - no reactive subscriptions
    subscribe: <V, E, R>(
      _readable: Readable.Readable<V>,
      _handler: (value: V) => Effect.Effect<void, E, R>,
      _scope: unknown,
    ): Effect.Effect<void, E, R> => Effect.void as Effect.Effect<void, E, R>,

    // Noop scroll control for SSR
    getScrollControl: (_viewport) => ({
      scrollTo: (_top, _behavior) => Effect.void,
      getScrollTop: () => 0,
    }),
  };

  return ctx;
};

/**
 * SSR VirtualListCtx layer.
 * Renders all items without virtualization for SEO/accessibility.
 */
export const SSRVirtualListCtx: Layer.Layer<
  VirtualListCtx,
  never,
  RendererContext
> = Layer.effect(
  VirtualListCtx,
  Effect.sync(() => createSSRVirtualListCtx()),
);
