import type { VisibleRange } from "./types.js";

/**
 * Calculate the visible range of items based on scroll position.
 * For fixed-height items only.
 */
export const calculateVisibleRange = (
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number,
): VisibleRange => {
  if (totalItems === 0) {
    return { start: 0, end: -1 };
  }

  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(viewportHeight / itemHeight);
  const endIndex = startIndex + visibleCount;

  return {
    start: Math.max(0, startIndex - overscan),
    end: Math.min(totalItems - 1, endIndex + overscan),
  };
};

/**
 * Calculate the top offset for an item at the given index.
 * For fixed-height items only.
 */
export const calculateItemOffset = (
  index: number,
  itemHeight: number,
): number => index * itemHeight;

/**
 * Calculate the total height of all items.
 * For fixed-height items only.
 */
export const calculateTotalHeight = (
  totalItems: number,
  itemHeight: number,
): number => totalItems * itemHeight;

/**
 * Calculate the scroll position needed to bring an item into view.
 */
export const calculateScrollToPosition = (
  index: number,
  itemHeight: number,
  viewportHeight: number,
  currentScrollTop: number,
): number => {
  const itemTop = index * itemHeight;
  const itemBottom = itemTop + itemHeight;
  const viewportBottom = currentScrollTop + viewportHeight;

  // Item is above viewport - scroll to show item at top
  if (itemTop < currentScrollTop) {
    return itemTop;
  }

  // Item is below viewport - scroll to show item at bottom
  if (itemBottom > viewportBottom) {
    return itemBottom - viewportHeight;
  }

  // Item is already visible - no scroll needed
  return currentScrollTop;
};

/**
 * Parse height value to CSS string.
 */
export const parseHeight = (height: number | string | undefined): string => {
  if (height === undefined) {
    return "100%";
  }
  if (typeof height === "number") {
    return `${height}px`;
  }
  return height;
};

/**
 * Check if two visible ranges are equal.
 */
export const rangesEqual = (a: VisibleRange, b: VisibleRange): boolean =>
  a.start === b.start && a.end === b.end;
