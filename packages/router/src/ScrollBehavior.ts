import { Effect } from "effect";

/**
 * How the outlet's scroll container should be reset after client-side
 * navigation.
 *
 * - `"top"` — scroll the outlet's nearest scrollable ancestor back to
 *   the top. For a window-scrolled document that's `document.scrollingElement`
 *   (matches what a full page load would do). For an app-shell layout where
 *   scrolling lives inside a nested `overflow-y: auto` container (a common
 *   `100vh + overflow-y: auto` main region), it's that inner container —
 *   `window.scrollTo` would have been a no-op on such apps.
 * - `"preserve"` — leave scroll position untouched. Useful for e.g. a
 *   sidebar layout where sibling nav shouldn't disturb the main viewport.
 * - Custom function — receives the `from`/`to` paths and returns an effect
 *   the runtime awaits before the transition completes. Use for
 *   `sessionStorage`-backed restoration, hash-anchor scrolling, or when
 *   the auto-detected "top" target picks the wrong container.
 *
 * ScrollBehavior only fires for `pushPath` / `replacePath`. Popstate
 * navigations (browser back/forward) are left to the browser's
 * `history.scrollRestoration = "auto"`, which restores per-history-entry
 * positions correctly — better than a URL-keyed approximation could.
 */
export type ScrollBehavior =
  "top" | "preserve" | ((from: string, to: string) => Effect.Effect<void>);

/**
 * Walk up from `el`, returning the first ancestor whose vertical
 * overflow can actually scroll (`overflow-y: auto|scroll` AND
 * `scrollHeight > clientHeight`). Returns `null` when nothing
 * scrollable is found on the way up — the caller then falls back to
 * `window.scrollTo`, which handles the common "document is the
 * scroller" case.
 *
 * Checking `scrollHeight > clientHeight` skips wrappers that *declare*
 * scrolling but happen to contain no overflow at the moment; if we
 * didn't, an outer `overflow: auto` shell with a currently-short child
 * would shadow the real page scroller further up the tree.
 *
 * Exported so `OutletCtx.scrollContainer` can reuse it — same walk,
 * one implementation.
 */
export const findScrollRoot = (el: Element): Element | null => {
  let cur: Element | null = el;
  while (cur && cur !== document.scrollingElement) {
    const style = getComputedStyle(cur);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      cur.scrollHeight > cur.clientHeight
    ) {
      return cur;
    }
    cur = cur.parentElement;
  }
  return null;
};

/**
 * Run a scroll behavior. Handles the three variants uniformly so
 * callers (Outlet, tests) don't have to switch on the shape.
 *
 * `outletNode` is the Outlet's own container element — the starting
 * point for `"top"`'s scroll-root walk. When a scrollable ancestor is
 * found, that element is scrolled; otherwise the call falls back to
 * `window.scrollTo` for the document-scrolls-the-viewport case.
 */
export const runScrollBehavior = (
  behavior: ScrollBehavior,
  from: string,
  to: string,
  outletNode: Element | null | undefined,
): Effect.Effect<void> => {
  if (behavior === "preserve") return Effect.void;
  if (behavior === "top") {
    return Effect.sync(() => {
      if (typeof window === "undefined") return;
      const target = outletNode ? findScrollRoot(outletNode) : null;
      if (target) {
        target.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    });
  }
  return behavior(from, to);
};
