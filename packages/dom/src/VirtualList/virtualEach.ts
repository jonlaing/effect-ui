import { Effect, Exit, Scope } from "effect";

import { Readable, RendererContext, Signal } from "@effex/core";

import * as Element from "../Element/index.js";
import {
  calculateScrollToPosition,
  calculateTotalHeight,
  calculateVisibleRange,
  parseHeight,
  rangesEqual,
} from "./helpers.js";
import type {
  VirtualEachOptions,
  VirtualListControl,
  VisibleRange,
} from "./types.js";
import { VirtualListCtx } from "./VirtualListCtx.js";

/**
 * Internal state for a rendered item.
 */
interface VirtualItemEntry<A> {
  readonly wrapper: HTMLElement;
  readonly scope: Scope.CloseableScope;
  readonly item: Signal.Signal<A>;
  readonly index: Signal.Signal<number>;
  currentIndex: number;
}

/**
 * Render a virtualized list of items, only rendering items visible in the viewport.
 * Ideal for large lists (1000+ items) where rendering all items would be too slow.
 *
 * Uses VirtualListCtx to abstract environment differences:
 * - Client: Full virtualization with scroll/resize tracking
 * - SSR: Renders all items for SEO/accessibility
 * - Hydration: Attaches to existing DOM, then virtualizes
 *
 * @param items - Reactive array of items
 * @param options - Configuration including key function, render function, and height
 *
 * @example
 * ```ts
 * // Basic usage with fixed height items
 * virtualEach(todos, {
 *   key: (todo) => todo.id,
 *   itemHeight: 48,
 *   height: 400,
 *   render: (todo) => $.li(todo.map(t => t.text)),
 * })
 * ```
 *
 * @example
 * ```ts
 * // With ref for scroll control
 * const listRef = yield* VirtualListRef.make()
 *
 * yield* virtualEach(items, {
 *   key: (item) => item.id,
 *   itemHeight: 60,
 *   ref: listRef,
 *   render: (item, index) => ListItem({ item, index }),
 * })
 *
 * // Scroll to item 100
 * yield* listRef.ready.pipe(
 *   Effect.flatMap((control) => control.scrollTo(100))
 * )
 * ```
 */
export const virtualEach = <A, E = never, R = never>(
  items: Readable.Readable<readonly A[]>,
  options: VirtualEachOptions<A, E, R>,
): Element.Element<HTMLDivElement, E, R | RendererContext | VirtualListCtx> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const ctx = yield* VirtualListCtx;
    const renderer = yield* RendererContext;

    // Validate options
    if (
      options.itemHeight === undefined &&
      options.estimatedHeight === undefined
    ) {
      yield* Effect.dieMessage(
        "virtualEach requires either itemHeight or estimatedHeight option",
      );
    }

    const itemHeight = options.itemHeight ?? options.estimatedHeight!;
    const overscan = options.overscan ?? 3;
    const keyFn = options.key;

    // Get initial items for total height calculation
    const initialItems = yield* items.get;
    const initialTotalHeight = calculateTotalHeight(
      initialItems.length,
      itemHeight,
    );

    // Create container structure
    const { viewport, inner } = yield* ctx.createContainers({
      height: parseHeight(options.height),
      totalHeight: initialTotalHeight,
    });

    // State - using Signal from core
    const scrollTop = yield* Signal.make(0);
    const viewportHeight = yield* Signal.make(0);
    const itemsArray = yield* Signal.make<readonly A[]>(initialItems);

    // Derive total items count
    const totalItems: Readable.Readable<number> = Readable.map(
      itemsArray,
      (arr) => arr.length,
    );

    // Derive visible range
    const visibleRange: Readable.Readable<VisibleRange> = Readable.zipAll([
      scrollTop,
      viewportHeight,
      totalItems,
    ]).pipe(
      Readable.map(([scrollTopVal, viewportHeightVal, totalItemsVal]) => {
        // If not virtualizing (SSR), return range covering all items
        if (!ctx.shouldVirtualize) {
          return {
            start: 0,
            end: totalItemsVal > 0 ? totalItemsVal - 1 : -1,
          };
        }
        return calculateVisibleRange(
          scrollTopVal,
          viewportHeightVal,
          itemHeight,
          totalItemsVal,
          overscan,
        );
      }),
    );

    // Track rendered items
    const itemMap = new Map<string, VirtualItemEntry<A>>();

    // Update visible items based on current range
    const updateVisibleItems = (
      currentItems: readonly A[],
      range: VisibleRange,
    ): Effect.Effect<void, E, RendererContext | R> =>
      Effect.gen(function* () {
        const currentKeys = new Set(itemMap.keys());
        const newKeys = new Set<string>();

        // Determine which items should be visible
        for (
          let i = range.start;
          i <= range.end && i < currentItems.length;
          i++
        ) {
          const itemData = currentItems[i];
          const key = keyFn(itemData);
          newKeys.add(key);

          const existing = itemMap.get(key);

          if (existing) {
            // Update existing item using Signal.set
            yield* existing.item.set(itemData);
            yield* existing.index.set(i);

            // Update position if index changed
            if (existing.currentIndex !== i) {
              yield* ctx.updateItemPosition(existing.wrapper, i, itemHeight);
              existing.currentIndex = i;
            }
          } else {
            // Create new item with its own scope
            const itemScope = yield* Scope.make();

            // Create Signals for item and index
            const itemSignal = yield* Signal.make(itemData).pipe(
              Effect.provideService(Scope.Scope, itemScope),
            );
            const indexSignal = yield* Signal.make(i).pipe(
              Effect.provideService(Scope.Scope, itemScope),
            );

            // Create wrapper for positioning
            const wrapper = yield* ctx.createItemWrapper({
              index: i,
              itemHeight,
            });

            // Render item content
            const content = yield* options
              .render(itemSignal, indexSignal)
              .pipe(Effect.provideService(Scope.Scope, itemScope));

            yield* renderer.appendChild(wrapper, content);
            yield* ctx.appendItem(inner, wrapper);

            itemMap.set(key, {
              wrapper,
              scope: itemScope,
              item: itemSignal,
              index: indexSignal,
              currentIndex: i,
            });
          }
        }

        // Remove items that are no longer visible
        for (const key of currentKeys) {
          if (!newKeys.has(key)) {
            const entry = itemMap.get(key)!;
            yield* ctx.removeItem(inner, entry.wrapper);
            yield* Scope.close(entry.scope, Exit.void);
            itemMap.delete(key);
          }
        }

        // Update inner container height
        const totalHeight = calculateTotalHeight(
          currentItems.length,
          itemHeight,
        );
        yield* ctx.updateTotalHeight(inner, totalHeight);
      });

    // Set up scroll tracking
    const initialScrollTop = yield* ctx.setupScrollTracking(
      viewport,
      (newScrollTop) => {
        Effect.runSync(scrollTop.set(newScrollTop));
      },
      scope,
    );
    yield* scrollTop.set(initialScrollTop);

    // Set up resize tracking
    const initialHeight = yield* ctx.setupResizeTracking(
      viewport,
      (newHeight) => {
        Effect.runSync(viewportHeight.set(newHeight));
      },
      scope,
    );
    yield* viewportHeight.set(initialHeight);

    // Get scroll control
    const scrollControl = ctx.getScrollControl(viewport);

    // Create control interface
    const control: VirtualListControl = {
      scrollTo: (index: number, behavior: ScrollBehavior = "auto") =>
        Effect.gen(function* () {
          const currentTop = yield* scrollTop.get;
          const height = yield* viewportHeight.get;
          const newTop = calculateScrollToPosition(
            index,
            itemHeight,
            height,
            currentTop,
          );
          yield* scrollControl.scrollTo(newTop, behavior);
        }),

      scrollToTop: (behavior: ScrollBehavior = "auto") =>
        scrollControl.scrollTo(0, behavior),

      scrollToBottom: (behavior: ScrollBehavior = "auto") =>
        Effect.gen(function* () {
          const total = yield* totalItems.get;
          const totalHeight = calculateTotalHeight(total, itemHeight);
          yield* scrollControl.scrollTo(totalHeight, behavior);
        }) as Effect.Effect<void>,

      visibleRange,
      totalItems,
    };

    // Set ref if provided
    if (options.ref) {
      options.ref._set(control);
    }

    // Subscribe to visible range changes
    let lastRange: VisibleRange = { start: 0, end: -1 };

    yield* ctx.subscribe(
      visibleRange,
      (range: VisibleRange) =>
        Effect.gen(function* () {
          if (!rangesEqual(range, lastRange)) {
            lastRange = range;
            const currentItems = yield* itemsArray.get;
            yield* updateVisibleItems(currentItems, range);

            // Call user callback if provided
            if (options.onVisibleRangeChange) {
              const result = options.onVisibleRangeChange(range);
              if (Effect.isEffect(result)) {
                yield* result;
              }
            }
          }
        }),
      scope,
    );

    // Subscribe to items changes
    yield* ctx.subscribe(
      items,
      (newItems) =>
        Effect.gen(function* () {
          yield* itemsArray.set(newItems);
          // Range subscription will trigger updateVisibleItems
        }),
      scope,
    );

    // Initial render
    const initialRange = yield* visibleRange.get;
    yield* updateVisibleItems(initialItems, initialRange);
    lastRange = initialRange;

    // Cleanup all item scopes when unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        for (const [, entry] of itemMap) {
          yield* Scope.close(entry.scope, Exit.void);
        }
      }),
    );

    return viewport;
  }) as Element.Element<
    HTMLDivElement,
    E,
    R | RendererContext | VirtualListCtx
  >;
