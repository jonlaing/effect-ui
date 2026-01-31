import type { Deferred, Effect, Scope } from "effect";

import type { Readable, Signal } from "@effex/core";

import type { ListAnimationOptions } from "../Animation";
import type * as Element from "../Element";

/**
 * Visible range of items in the virtual list.
 */
export interface VisibleRange {
  readonly start: number;
  readonly end: number;
}

/**
 * Control interface for a virtual list, accessible via ref.
 */
export interface VirtualListControl {
  /** Scroll to bring a specific item index into view */
  readonly scrollTo: (
    index: number,
    behavior?: ScrollBehavior,
  ) => Effect.Effect<void>;
  /** Scroll to the top of the list */
  readonly scrollToTop: (behavior?: ScrollBehavior) => Effect.Effect<void>;
  /** Scroll to the bottom of the list */
  readonly scrollToBottom: (behavior?: ScrollBehavior) => Effect.Effect<void>;
  /** Currently visible range of items */
  readonly visibleRange: Readable.Readable<VisibleRange>;
  /** Total number of items */
  readonly totalItems: Readable.Readable<number>;
}

/**
 * A reference to virtual list controls that may not be available yet.
 */
export interface VirtualListRef {
  /** The current control interface, or null if not yet mounted */
  readonly current: VirtualListControl | null;
  /** Effect that resolves when the control interface is available */
  readonly ready: Effect.Effect<VirtualListControl>;
  /** Internal setter - do not use directly */
  readonly _set: (control: VirtualListControl) => void;
  /** Internal deferred for awaiting */
  readonly _deferred: Deferred.Deferred<VirtualListControl>;
}

/**
 * Options for virtualEach.
 */
export interface VirtualEachOptions<A, E = never, R = never> {
  /**
   * Function to extract a unique key from each item.
   * Used for efficient updates and item identity.
   */
  readonly key: (item: A) => string;

  /**
   * Render function for each item.
   * Receives a Signal for the item data and its index.
   */
  readonly render: (
    item: Signal.Signal<A>,
    index: Signal.Signal<number>,
  ) => Element.Element<HTMLElement | SVGElement, E, R>;

  /**
   * Fixed height for all items in pixels.
   * Use this for best performance when all items have the same height.
   * Either itemHeight or estimatedHeight must be provided.
   */
  readonly itemHeight?: number;

  /**
   * Estimated height for variable-height items.
   * The list will measure actual heights and adjust positioning.
   * Either itemHeight or estimatedHeight must be provided.
   */
  readonly estimatedHeight?: number;

  /**
   * Height of the scrollable viewport.
   * Can be a number (pixels) or CSS string like "100%" or "400px".
   * Default: "100%" (fills parent container)
   */
  readonly height?: number | string;

  /**
   * Number of items to render above/below the visible area.
   * Higher values reduce flicker during fast scrolling but use more memory.
   * Default: 3
   */
  readonly overscan?: number;

  /**
   * Optional ref to access scroll control methods.
   * Create with VirtualListRef.make()
   */
  readonly ref?: VirtualListRef;

  /**
   * Animation options for items entering/exiting the viewport.
   */
  readonly animate?: ListAnimationOptions;

  /**
   * Callback when the visible range changes.
   */
  readonly onVisibleRangeChange?: (
    range: VisibleRange,
  ) => Effect.Effect<void> | void;
}

/**
 * Internal state for a rendered item.
 * Uses Signals instead of bespoke MutableReadable.
 */
export interface VirtualItemEntry<A> {
  readonly element: HTMLElement;
  readonly scope: Scope.CloseableScope;
  readonly item: Signal.Signal<A>;
  readonly index: Signal.Signal<number>;
  currentIndex: number;
}
