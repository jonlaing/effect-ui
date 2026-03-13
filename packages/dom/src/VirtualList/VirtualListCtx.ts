/**
 * VirtualList context interface and tag.
 * Abstracts environment differences (Client/SSR/Hydration) for virtual lists.
 */

import { Context, Effect, Scope } from "effect";

import type { Readable, RendererContext } from "@effex/core";

/**
 * Internal state for a rendered virtual item.
 */
export interface VirtualListItem {
  readonly key: string;
  readonly wrapper: HTMLElement;
  readonly scope: Scope.CloseableScope;
  currentIndex: number;
}

/**
 * Context interface for virtual list operations.
 * Abstracts SSR/Hydration/Client differences behind a unified API.
 *
 * Methods that create/modify DOM require RendererContext.
 */
export interface IVirtualListCtx {
  /**
   * Whether virtualization is active.
   * - Client/Hydration: true (only render visible items)
   * - SSR: false (render all items for SEO/accessibility)
   */
  readonly shouldVirtualize: boolean;

  /**
   * Create the viewport and inner container structure.
   * SSR creates VNodes, Client/Hydration create or find DOM elements.
   */
  readonly createContainers: (config: {
    height: string;
    totalHeight: number;
  }) => Effect.Effect<
    { viewport: HTMLElement; inner: HTMLElement },
    never,
    RendererContext
  >;

  /**
   * Update the inner container's total height.
   */
  readonly updateTotalHeight: (
    inner: HTMLElement,
    height: number,
  ) => Effect.Effect<void, never, RendererContext>;

  /**
   * Create a wrapper element for an item at a specific position.
   */
  readonly createItemWrapper: (config: {
    index: number;
    itemHeight: number;
  }) => Effect.Effect<HTMLElement, never, RendererContext>;

  /**
   * Update an item wrapper's position.
   */
  readonly updateItemPosition: (
    wrapper: HTMLElement,
    index: number,
    itemHeight: number,
  ) => Effect.Effect<void, never, RendererContext>;

  /**
   * Append a rendered item to the inner container.
   */
  readonly appendItem: (
    inner: HTMLElement,
    wrapper: HTMLElement,
  ) => Effect.Effect<void, never, RendererContext>;

  /**
   * Remove an item from the inner container.
   */
  readonly removeItem: (
    inner: HTMLElement,
    wrapper: HTMLElement,
  ) => Effect.Effect<void, never, RendererContext>;

  /**
   * Set up scroll tracking on the viewport.
   * Returns the initial scroll position.
   * Noop on SSR (returns 0).
   */
  readonly setupScrollTracking: (
    viewport: HTMLElement,
    onScroll: (scrollTop: number) => void,
    scope: Scope.Scope,
  ) => Effect.Effect<number>;

  /**
   * Set up resize tracking on the viewport.
   * Returns the initial viewport height.
   * Noop on SSR (returns a default height).
   */
  readonly setupResizeTracking: (
    viewport: HTMLElement,
    onResize: (height: number) => void,
    scope: Scope.Scope,
  ) => Effect.Effect<number>;

  /**
   * Subscribe to a Readable and run handler on each change.
   * Noop on SSR.
   */
  readonly subscribe: <V, E, R>(
    readable: Readable.Readable<V>,
    handler: (value: V) => Effect.Effect<void, E, R>,
    scope: Scope.Scope,
  ) => Effect.Effect<void, E, R>;

  /**
   * Get scroll control methods for the viewport.
   * Returns methods that work on Client/Hydration, noop on SSR.
   */
  readonly getScrollControl: (viewport: HTMLElement) => {
    scrollTo: (top: number, behavior: ScrollBehavior) => Effect.Effect<void>;
    getScrollTop: () => number;
  };
}

/**
 * Context tag for virtual list operations.
 */
export class VirtualListCtx extends Context.Tag("@effex/dom/VirtualListCtx")<
  VirtualListCtx,
  IVirtualListCtx
>() {}
