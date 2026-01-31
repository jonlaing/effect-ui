/**
 * Virtualized list rendering for large lists.
 *
 * @module VirtualList
 */

export { virtualEach } from "./virtualEach";
export { VirtualListRef, makeVirtualListRef } from "./VirtualListRef";

// Context implementations for different environments
export { VirtualListCtx, type IVirtualListCtx } from "./VirtualListCtx";
export { ClientVirtualListCtx } from "./ClientVirtualListCtx";
export { SSRVirtualListCtx } from "./SSRVirtualListCtx";
export { HydrationVirtualListCtx } from "./HydrationVirtualListCtx";

export type {
  VirtualEachOptions,
  VirtualListRef as VirtualListRefType,
  VirtualListControl,
  VisibleRange,
} from "./types";
export {
  calculateVisibleRange,
  calculateItemOffset,
  calculateTotalHeight,
  calculateScrollToPosition,
} from "./helpers";
