import { Context, Effect, MutableRef } from "effect";
import { Signal } from "@core/Signal";
import { Derived } from "@core/Derived";
import * as Readable from "@core/Readable";
import { Ref } from "@core/Ref";
import { $ } from "@dom/Element/Element";
import { provide } from "@dom/Control";
import { component } from "@dom/Component";
import type { Element, Child } from "@dom/Element";

// ============================================================================
// Types
// ============================================================================

export type ScrollAreaType = "auto" | "always" | "scroll" | "hover";
export type ScrollbarOrientation = "vertical" | "horizontal";

// ============================================================================
// Context Interfaces
// ============================================================================

export interface ScrollAreaContext {
  /** Current scroll position */
  readonly scrollPosition: Readable.Readable<{ x: number; y: number }>;
  /** Viewport dimensions */
  readonly viewportSize: Readable.Readable<{ width: number; height: number }>;
  /** Content dimensions */
  readonly contentSize: Readable.Readable<{ width: number; height: number }>;
  /** Reference to the scrollable element */
  readonly scrollableRef: Ref<HTMLElement>;
  /** Scroll to a position */
  readonly scrollTo: (position: {
    x?: number;
    y?: number;
  }) => Effect.Effect<void>;
  /** Scroll by a delta */
  readonly scrollBy: (delta: { x?: number; y?: number }) => Effect.Effect<void>;
  /** Update scroll position (internal) */
  readonly updateScrollPosition: (pos: { x: number; y: number }) => void;
  /** Update content size (internal) */
  readonly updateContentSize: (size: { width: number; height: number }) => void;
  /** Update viewport size (internal) */
  readonly updateViewportSize: (size: {
    width: number;
    height: number;
  }) => void;
  /** Scrollbar visibility type */
  readonly type: ScrollAreaType;
  /** Delay before hiding scrollbar (ms) */
  readonly scrollHideDelay: number;
  /** Whether currently scrolling */
  readonly isScrolling: Readable.Readable<boolean>;
  /** Whether mouse is hovering */
  readonly isHovering: Readable.Readable<boolean>;
  /** Set scrolling state */
  readonly setIsScrolling: (value: boolean) => void;
  /** Set hovering state */
  readonly setIsHovering: (value: boolean) => void;
}

export interface ScrollbarContext {
  /** Scrollbar orientation */
  readonly orientation: ScrollbarOrientation;
  /** Thumb size as percentage (0-100) */
  readonly thumbSize: Readable.Readable<number>;
  /** Thumb position as percentage (0-100) */
  readonly thumbPosition: Readable.Readable<number>;
  /** Whether this scrollbar should be visible (content overflows) */
  readonly hasOverflow: Readable.Readable<boolean>;
  /** Whether scrollbar is currently visible based on type */
  readonly isVisible: Readable.Readable<boolean>;
  /** Reference to the scrollbar track */
  readonly trackRef: Ref<HTMLDivElement>;
}

// ============================================================================
// Context Tags
// ============================================================================

export class ScrollAreaCtx extends Context.Tag("ScrollAreaContext")<
  ScrollAreaCtx,
  ScrollAreaContext
>() {}

export class ScrollbarCtx extends Context.Tag("ScrollbarContext")<
  ScrollbarCtx,
  ScrollbarContext
>() {}

// ============================================================================
// Props Interfaces
// ============================================================================

export interface ScrollAreaRootProps {
  /** Scrollbar visibility behavior */
  readonly type?: ScrollAreaType;
  /** Delay before hiding scrollbars (ms) */
  readonly scrollHideDelay?: number;
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

export interface ScrollAreaViewportProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

export interface ScrollAreaScrollbarProps {
  /** Scrollbar orientation */
  readonly orientation: ScrollbarOrientation;
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

export interface ScrollAreaThumbProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

export interface ScrollAreaCornerProps {
  /** Additional class names */
  readonly class?: string | Readable.Readable<string>;
}

// ============================================================================
// Root Component
// ============================================================================

const Root = (
  props: ScrollAreaRootProps,
  children:
    | Child<never, ScrollAreaCtx>
    | readonly Child<never, ScrollAreaCtx>[],
): Element =>
  Effect.gen(function* () {
    const type = props.type ?? "hover";
    const scrollHideDelay = props.scrollHideDelay ?? 600;

    // State signals
    const scrollPosition = yield* Signal.make({ x: 0, y: 0 });
    const viewportSize = yield* Signal.make({ width: 0, height: 0 });
    const contentSize = yield* Signal.make({ width: 0, height: 0 });
    const isScrolling = yield* Signal.make(false);
    const isHovering = yield* Signal.make(false);

    // Ref for scrollable element
    const scrollableRef = yield* Ref.make<HTMLElement>();

    // Hide timeout ref
    const hideTimeout = MutableRef.make<ReturnType<typeof setTimeout> | null>(
      null,
    );

    const clearHideTimeout = () => {
      const timeout = MutableRef.get(hideTimeout);
      if (timeout) {
        clearTimeout(timeout);
        MutableRef.set(hideTimeout, null);
      }
    };

    const setIsScrolling = (value: boolean) => {
      Effect.runSync(isScrolling.set(value));
      if (value) {
        clearHideTimeout();
      } else if (type === "scroll" || type === "hover") {
        // Schedule hide
        clearHideTimeout();
        const timeout = setTimeout(() => {
          Effect.runSync(isScrolling.set(false));
        }, scrollHideDelay);
        MutableRef.set(hideTimeout, timeout);
      }
    };

    const setIsHovering = (value: boolean) => {
      Effect.runSync(isHovering.set(value));
    };

    // Methods
    const scrollTo = (position: { x?: number; y?: number }) =>
      Effect.sync(() => {
        const el = scrollableRef.current;
        if (el) {
          el.scrollTo({
            left: position.x,
            top: position.y,
            behavior: "auto",
          });
        }
      });

    const scrollBy = (delta: { x?: number; y?: number }) =>
      Effect.sync(() => {
        const el = scrollableRef.current;
        if (el) {
          el.scrollBy({
            left: delta.x,
            top: delta.y,
            behavior: "auto",
          });
        }
      });

    const updateScrollPosition = (pos: { x: number; y: number }) => {
      Effect.runSync(scrollPosition.set(pos));
    };

    const updateContentSize = (size: { width: number; height: number }) => {
      Effect.runSync(contentSize.set(size));
    };

    const updateViewportSize = (size: { width: number; height: number }) => {
      Effect.runSync(viewportSize.set(size));
    };

    // Cleanup
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        clearHideTimeout();
      }),
    );

    const ctx: ScrollAreaContext = {
      scrollPosition,
      viewportSize,
      contentSize,
      scrollableRef,
      scrollTo,
      scrollBy,
      updateScrollPosition,
      updateContentSize,
      updateViewportSize,
      type,
      scrollHideDelay,
      isScrolling,
      isHovering,
      setIsScrolling,
      setIsHovering,
    };

    const handleMouseEnter = () =>
      Effect.sync(() => {
        setIsHovering(true);
      });

    const handleMouseLeave = () =>
      Effect.sync(() => {
        setIsHovering(false);
      });

    return yield* $.div(
      {
        class: props.class,
        "data-scrollarea-root": "",
        style: {
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      },
      provide(ScrollAreaCtx, ctx, children),
    );
  });

// ============================================================================
// Viewport Component
// ============================================================================

const Viewport = component(
  "ScrollAreaViewport",
  (props: ScrollAreaViewportProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ScrollAreaCtx;
      const viewportRef = yield* Ref.make<HTMLDivElement>();

      // Set up scroll listener and observers after mount
      yield* Effect.sync(() => {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const viewport = viewportRef.current;
          if (!viewport) return;

          // Check if there's a scrollable child (like virtualEach output)
          const findScrollableChild = (el: HTMLElement): HTMLElement | null => {
            // Check direct children first
            for (const child of Array.from(el.children) as HTMLElement[]) {
              const style = getComputedStyle(child);
              if (
                style.overflow === "auto" ||
                style.overflow === "scroll" ||
                style.overflowY === "auto" ||
                style.overflowY === "scroll" ||
                style.overflowX === "auto" ||
                style.overflowX === "scroll"
              ) {
                return child;
              }
            }
            return null;
          };

          const scrollableChild = findScrollableChild(viewport);
          const scrollable = scrollableChild ?? viewport;

          // Set the scrollable ref
          ctx.scrollableRef.set(scrollable);

          // If using native scrolling on viewport, make it scrollable
          if (!scrollableChild) {
            viewport.style.overflow = "scroll";
            // Hide native scrollbars
            viewport.style.scrollbarWidth = "none";
            (viewport.style as unknown as Record<string, string>)[
              "msOverflowStyle"
            ] = "none";
          } else {
            // Hide scrollbars on the child
            scrollableChild.style.scrollbarWidth = "none";
            (scrollableChild.style as unknown as Record<string, string>)[
              "msOverflowStyle"
            ] = "none";
          }

          // Scroll handler
          let rafId: number | null = null;
          const handleScroll = () => {
            if (rafId === null) {
              rafId = requestAnimationFrame(() => {
                ctx.updateScrollPosition({
                  x: scrollable.scrollLeft,
                  y: scrollable.scrollTop,
                });
                ctx.setIsScrolling(true);
                rafId = null;

                // Schedule hide after scroll stops
                if (ctx.type === "scroll" || ctx.type === "hover") {
                  setTimeout(() => {
                    ctx.setIsScrolling(false);
                  }, 150);
                }
              });
            }
          };

          scrollable.addEventListener("scroll", handleScroll, {
            passive: true,
          });

          // ResizeObserver for viewport size
          const viewportObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              ctx.updateViewportSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
              });
            }
          });
          viewportObserver.observe(scrollable);

          // ResizeObserver for content size - observe the scrollable element itself
          // It will trigger when scrollWidth/scrollHeight change
          const contentObserver = new ResizeObserver(() => {
            ctx.updateContentSize({
              width: scrollable.scrollWidth,
              height: scrollable.scrollHeight,
            });
          });
          contentObserver.observe(scrollable);

          // Also use MutationObserver to detect when children are added/removed
          const mutationObserver = new MutationObserver(() => {
            ctx.updateContentSize({
              width: scrollable.scrollWidth,
              height: scrollable.scrollHeight,
            });
          });
          mutationObserver.observe(scrollable, {
            childList: true,
            subtree: true,
          });

          // Initial size update - use setTimeout to ensure content is rendered
          setTimeout(() => {
            ctx.updateViewportSize({
              width: scrollable.clientWidth,
              height: scrollable.clientHeight,
            });
            ctx.updateContentSize({
              width: scrollable.scrollWidth,
              height: scrollable.scrollHeight,
            });
          }, 0);
        });
      });

      return yield* $.div(
        {
          ref: viewportRef,
          class: props.class,
          "data-scrollarea-viewport": "",
          style: {
            width: "100%",
            height: "100%",
            overflow: "scroll",
            scrollbarWidth: "none",
          },
        },
        children ?? [],
      );
    }),
);

// ============================================================================
// Scrollbar Component
// ============================================================================

const Scrollbar = (
  props: ScrollAreaScrollbarProps,
  children: Child<never, ScrollAreaCtx | ScrollbarCtx>[],
): Element<never, ScrollAreaCtx> =>
  Effect.gen(function* () {
    const ctx = yield* ScrollAreaCtx;
    const trackRef = yield* Ref.make<HTMLDivElement>();
    const orientation = props.orientation;

    // Calculate thumb size (percentage of track)
    const thumbSize: Readable.Readable<number> = yield* Derived.sync(
      [ctx.viewportSize, ctx.contentSize],
      ([viewport, content]) => {
        if (orientation === "vertical") {
          if (content.height <= 0) return 100;
          const size = (viewport.height / content.height) * 100;
          return Math.max(10, Math.min(100, size)); // Min 10%, max 100%
        } else {
          if (content.width <= 0) return 100;
          const size = (viewport.width / content.width) * 100;
          return Math.max(10, Math.min(100, size));
        }
      },
    );

    // Calculate thumb position (percentage of track, 0 to 100-thumbSize)
    const thumbPosition: Readable.Readable<number> = yield* Derived.sync(
      [
        ctx.scrollPosition,
        ctx.viewportSize,
        ctx.contentSize,
        thumbSize,
      ] as const,
      ([scroll, viewport, content, size]) => {
        if (orientation === "vertical") {
          const maxScroll = content.height - viewport.height;
          if (maxScroll <= 0) return 0;
          const scrollPercent = scroll.y / maxScroll;
          // Thumb position ranges from 0% to (100 - thumbSize)%
          return scrollPercent * (100 - size);
        } else {
          const maxScroll = content.width - viewport.width;
          if (maxScroll <= 0) return 0;
          const scrollPercent = scroll.x / maxScroll;
          return scrollPercent * (100 - size);
        }
      },
    );

    // Check if content overflows
    const hasOverflow: Readable.Readable<boolean> = yield* Derived.sync(
      [ctx.viewportSize, ctx.contentSize],
      ([viewport, content]) => {
        if (orientation === "vertical") {
          return content.height > viewport.height;
        } else {
          return content.width > viewport.width;
        }
      },
    );

    // Visibility based on type
    const isVisible: Readable.Readable<boolean> = yield* Derived.sync(
      [hasOverflow, ctx.isScrolling, ctx.isHovering],
      ([overflow, scrolling, hovering]) => {
        if (!overflow) return false;
        switch (ctx.type) {
          case "always":
            return true;
          case "auto":
            return true;
          case "scroll":
            return scrolling;
          case "hover":
            return scrolling || hovering;
        }
      },
    );

    const scrollbarCtx: ScrollbarContext = {
      orientation,
      thumbSize,
      thumbPosition,
      hasOverflow,
      isVisible,
      trackRef,
    };

    // Handle click on track to jump scroll
    const handleTrackClick = (event: MouseEvent) =>
      Effect.gen(function* () {
        const track = trackRef.current;
        if (!track) return;
        if (event.target !== track) return; // Only handle clicks directly on track

        const rect = track.getBoundingClientRect();
        const scrollable = ctx.scrollableRef.current;
        if (!scrollable) return;

        if (orientation === "vertical") {
          const clickPercent = (event.clientY - rect.top) / rect.height;
          const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
          yield* ctx.scrollTo({ y: clickPercent * maxScroll });
        } else {
          const clickPercent = (event.clientX - rect.left) / rect.width;
          const maxScroll = scrollable.scrollWidth - scrollable.clientWidth;
          yield* ctx.scrollTo({ x: clickPercent * maxScroll });
        }
      });

    const dataState = isVisible.map((v) => (v ? "visible" : "hidden"));

    return yield* $.div(
      {
        ref: trackRef,
        class: props.class,
        "data-scrollarea-scrollbar": "",
        "data-orientation": orientation,
        "data-state": dataState,
        onClick: handleTrackClick,
      },
      provide(ScrollbarCtx, scrollbarCtx, children),
    );
  });

// ============================================================================
// Thumb Component
// ============================================================================

const Thumb = component("ScrollAreaThumb", (props: ScrollAreaThumbProps) =>
  Effect.gen(function* () {
    const ctx = yield* ScrollAreaCtx;
    const scrollbarCtx = yield* ScrollbarCtx;
    const thumbRef = yield* Ref.make<HTMLDivElement>();

    // Drag state
    const isDragging = MutableRef.make(false);
    const dragStart = MutableRef.make({ position: 0, scrollPosition: 0 });

    const handlePointerDown = (event: PointerEvent) =>
      Effect.sync(() => {
        event.preventDefault();
        event.stopPropagation();

        const thumb = thumbRef.current;
        if (!thumb) return;

        MutableRef.set(isDragging, true);
        thumb.setPointerCapture(event.pointerId);

        const scrollable = ctx.scrollableRef.current;
        if (!scrollable) return;

        if (scrollbarCtx.orientation === "vertical") {
          MutableRef.set(dragStart, {
            position: event.clientY,
            scrollPosition: scrollable.scrollTop,
          });
        } else {
          MutableRef.set(dragStart, {
            position: event.clientX,
            scrollPosition: scrollable.scrollLeft,
          });
        }
      });

    const handlePointerMove = (event: PointerEvent) =>
      Effect.sync(() => {
        if (!MutableRef.get(isDragging)) return;

        const scrollable = ctx.scrollableRef.current;
        const track = scrollbarCtx.trackRef.current;
        if (!scrollable || !track) return;

        const start = MutableRef.get(dragStart);
        const trackRect = track.getBoundingClientRect();

        if (scrollbarCtx.orientation === "vertical") {
          const delta = event.clientY - start.position;
          const trackHeight = trackRect.height;
          const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
          const scrollDelta = (delta / trackHeight) * maxScroll;
          scrollable.scrollTop = start.scrollPosition + scrollDelta;
        } else {
          const delta = event.clientX - start.position;
          const trackWidth = trackRect.width;
          const maxScroll = scrollable.scrollWidth - scrollable.clientWidth;
          const scrollDelta = (delta / trackWidth) * maxScroll;
          scrollable.scrollLeft = start.scrollPosition + scrollDelta;
        }
      });

    const handlePointerUp = (event: PointerEvent) =>
      Effect.sync(() => {
        if (!MutableRef.get(isDragging)) return;

        MutableRef.set(isDragging, false);
        const thumb = thumbRef.current;
        if (thumb) {
          thumb.releasePointerCapture(event.pointerId);
        }
      });

    const thumbStyle = yield* Derived.sync(
      [scrollbarCtx.thumbSize, scrollbarCtx.thumbPosition],
      ([size, position]): Record<string, string> => {
        if (scrollbarCtx.orientation === "vertical") {
          return {
            position: "absolute",
            left: "0",
            right: "0",
            height: `${size}%`,
            top: `${position}%`,
          };
        } else {
          return {
            position: "absolute",
            top: "0",
            bottom: "0",
            width: `${size}%`,
            left: `${position}%`,
          };
        }
      },
    );

    return yield* $.div({
      ref: thumbRef,
      class: props.class,
      "data-scrollarea-thumb": "",
      "data-orientation": scrollbarCtx.orientation,
      style: thumbStyle,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    });
  }),
);

// ============================================================================
// Corner Component
// ============================================================================

const Corner = component("ScrollAreaCorner", (props: ScrollAreaCornerProps) =>
  Effect.gen(function* () {
    return yield* $.div({
      class: props.class,
      "data-scrollarea-corner": "",
    });
  }),
);

// ============================================================================
// Export
// ============================================================================

/**
 * Headless ScrollArea primitive for building custom scrollable areas.
 *
 * Features:
 * - Custom scrollbar styling
 * - Native scroll behavior
 * - Multiple visibility modes (auto, always, scroll, hover)
 * - Works with virtualEach for virtualized lists
 * - Keyboard accessible
 *
 * @example
 * ```ts
 * ScrollArea.Root({ type: "hover" }, [
 *   ScrollArea.Viewport({}, [
 *     $.div({ style: { height: "2000px" } }, "Long content..."),
 *   ]),
 *   ScrollArea.Scrollbar({ orientation: "vertical" }, [
 *     ScrollArea.Thumb({}),
 *   ]),
 * ])
 * ```
 */
export const ScrollArea = {
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
} as const;
