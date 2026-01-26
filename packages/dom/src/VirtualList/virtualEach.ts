import { Effect, Exit, Scope, Stream } from "effect";

import {
  Derived,
  mapReadable,
  RendererContext,
  Signal,
  type Readable,
} from "@effex/core";

import { createItemReadable } from "../Control/updaters";
import { Element } from "../Element";
import {
  calculateItemOffset,
  calculateScrollToPosition,
  calculateTotalHeight,
  calculateVisibleRange,
  parseHeight,
  rangesEqual,
} from "./helpers";
import type {
  VirtualEachOptions,
  VirtualItemEntry,
  VirtualListControl,
  VisibleRange,
} from "./types";

/**
 * Create an index readable for tracking item indices.
 */
const createIndexReadable = (initialIndex: number) => {
  let currentIndex = initialIndex;
  const subscribers = new Set<(value: number) => void>();

  let cachedChanges: Stream.Stream<number> | null = null;
  const getChanges = (): Stream.Stream<number> => {
    if (!cachedChanges) {
      cachedChanges = Stream.async<number>((emit) => {
        const handler = (value: number) => emit.single(value);
        subscribers.add(handler);
        return Effect.sync(() => {
          subscribers.delete(handler);
        });
      });
    }
    return cachedChanges;
  };

  return {
    get: Effect.sync(() => currentIndex),
    get changes(): Stream.Stream<number> {
      return getChanges();
    },
    get values(): Stream.Stream<number> {
      return Stream.concat(Stream.make(currentIndex), this.changes);
    },
    map: function <B>(f: (n: number) => B): Readable<B> {
      return mapReadable(this as Readable<number>, f);
    },
    _update: (index: number) => {
      if (currentIndex !== index) {
        currentIndex = index;
        for (const handler of subscribers) {
          handler(index);
        }
      }
    },
  };
};

/**
 * Render a virtualized list of items, only rendering items visible in the viewport.
 * Ideal for large lists (1000+ items) where rendering all items would be too slow.
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
  items: Readable<readonly A[]>,
  options: VirtualEachOptions<A, E, R>,
): Element.Element<HTMLDivElement, E, R> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;

    // Validate options
    if (
      options.itemHeight === undefined &&
      options.estimatedHeight === undefined
    ) {
      throw new Error(
        "virtualEach requires either itemHeight or estimatedHeight option",
      );
    }

    const itemHeight = options.itemHeight ?? options.estimatedHeight!;
    const overscan = options.overscan ?? 3;
    const keyFn = options.key;

    // Create container structure
    // Outer: scrollable viewport
    const viewport = document.createElement("div");
    viewport.style.overflow = "auto";
    viewport.style.height = parseHeight(options.height);
    viewport.style.position = "relative";

    // Inner: full-height container for absolute positioning
    const innerContainer = document.createElement("div");
    innerContainer.style.position = "relative";
    innerContainer.style.width = "100%";
    viewport.appendChild(innerContainer);

    // State
    const scrollTop = yield* Signal.make(0);
    const viewportHeight = yield* Signal.make(0);
    const itemsArray = yield* Signal.make<readonly A[]>([]);

    // Derive total items count
    const totalItems: Readable<number> = yield* Derived.sync(
      [itemsArray],
      (values) => values[0].length,
    );

    // Derive visible range
    const visibleRange: Readable<VisibleRange> = yield* Derived.sync(
      [scrollTop, viewportHeight, totalItems],
      (values): VisibleRange =>
        calculateVisibleRange(
          values[0],
          values[1],
          itemHeight,
          values[2],
          overscan,
        ),
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
          const item = currentItems[i];
          const key = keyFn(item);
          newKeys.add(key);

          const existing = itemMap.get(key);

          if (existing) {
            // Update existing item
            existing.readable._update(item);
            existing.indexReadable._update(i);

            // Update position if index changed
            if (existing.index !== i) {
              existing.element.style.top = `${calculateItemOffset(i, itemHeight)}px`;
              existing.index = i;
            }
          } else {
            // Create new item
            const itemScope = yield* Scope.make();
            const readable = createItemReadable(item);
            const indexReadable = createIndexReadable(i);

            // Create wrapper for absolute positioning
            const wrapper = document.createElement("div");
            wrapper.style.position = "absolute";
            wrapper.style.top = `${calculateItemOffset(i, itemHeight)}px`;
            wrapper.style.left = "0";
            wrapper.style.right = "0";
            wrapper.style.height = `${itemHeight}px`;

            // Render item content
            const content = yield* options
              .render(readable, indexReadable)
              .pipe(Effect.provideService(Scope.Scope, itemScope));

            wrapper.appendChild(content);
            innerContainer.appendChild(wrapper);

            itemMap.set(key, {
              element: wrapper,
              scope: itemScope,
              readable,
              indexReadable,
              index: i,
            });
          }
        }

        // Remove items that are no longer visible
        for (const key of currentKeys) {
          if (!newKeys.has(key)) {
            const entry = itemMap.get(key)!;
            innerContainer.removeChild(entry.element);
            yield* Scope.close(entry.scope, Exit.void);
            itemMap.delete(key);
          }
        }

        // Update inner container height
        const totalHeight = calculateTotalHeight(
          currentItems.length,
          itemHeight,
        );
        innerContainer.style.height = `${totalHeight}px`;
      });

    // Scroll handler with requestAnimationFrame throttling
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          Effect.runSync(scrollTop.set(viewport.scrollTop));
          rafId = null;
        });
      }
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup scroll listener
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        viewport.removeEventListener("scroll", handleScroll);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      }),
    );

    // ResizeObserver for viewport height
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        Effect.runSync(viewportHeight.set(entry.contentRect.height));
      }
    });
    resizeObserver.observe(viewport);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        resizeObserver.disconnect();
      }),
    );

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
          viewport.scrollTo({ top: newTop, behavior });
        }),

      scrollToTop: (behavior: ScrollBehavior = "auto") =>
        Effect.sync(() => {
          viewport.scrollTo({ top: 0, behavior });
        }),

      scrollToBottom: (behavior: ScrollBehavior = "auto") =>
        Effect.gen(function* () {
          const total = yield* totalItems.get;
          const totalHeight = calculateTotalHeight(total, itemHeight);
          viewport.scrollTo({ top: totalHeight, behavior });
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

    yield* visibleRange.changes.pipe(
      Stream.runForEach((range: VisibleRange) =>
        Effect.gen(function* () {
          if (!rangesEqual(range, lastRange)) {
            lastRange = range;
            const currentItems = yield* itemsArray.get;
            yield* updateVisibleItems(currentItems, range as VisibleRange);

            // Call user callback if provided
            if (options.onVisibleRangeChange) {
              const result = options.onVisibleRangeChange(range);
              if (Effect.isEffect(result)) {
                yield* result;
              }
            }
          }
        }),
      ),
      Effect.forkIn(scope),
    );

    // Subscribe to items changes
    yield* items.changes.pipe(
      Stream.runForEach((newItems) =>
        Effect.gen(function* () {
          yield* itemsArray.set(newItems);
          // Range subscription will trigger updateVisibleItems
        }),
      ),
      Effect.forkIn(scope),
    );

    // Initial render
    const initialItems = yield* items.get;
    yield* itemsArray.set(initialItems);

    // Wait a tick for viewport to have dimensions, then do initial render
    yield* Effect.sync(() => {
      // Force synchronous layout to get viewport height
      const height = viewport.clientHeight || viewport.offsetHeight;
      if (height > 0) {
        Effect.runSync(viewportHeight.set(height));
      }
    });

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
  }) as Element.Element<HTMLDivElement, E, R>;
