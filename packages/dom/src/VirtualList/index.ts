/**
 * Virtualized list rendering for large lists.
 *
 * @module VirtualList
 */

export { virtualEach } from "./virtualEach.js";
export { VirtualListRef, makeVirtualListRef } from "./VirtualListRef.js";

// Context implementations for different environments
export { VirtualListCtx, type IVirtualListCtx } from "./VirtualListCtx.js";
export { ClientVirtualListCtx } from "./ClientVirtualListCtx.js";
export { SSRVirtualListCtx } from "./SSRVirtualListCtx.js";
export { HydrationVirtualListCtx } from "./HydrationVirtualListCtx.js";

export type {
  VirtualEachOptions,
  VirtualListRef as VirtualListRefType,
  VirtualListControl,
  VisibleRange,
} from "./types.js";
export {
  calculateVisibleRange,
  calculateItemOffset,
  calculateTotalHeight,
  calculateScrollToPosition,
} from "./helpers.js";
