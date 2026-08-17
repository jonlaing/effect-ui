import { Effect } from "effect";

/**
 * How the browser window should be scrolled after client-side navigation.
 *
 * - `"top"` — scroll to the top of the page. Matches the default behavior of
 *   most SPA frameworks and mirrors what a full page load would do.
 * - `"preserve"` — leave the scroll position untouched. Useful for e.g. a
 *   sidebar layout where sibling nav shouldn't disturb the main viewport.
 * - Custom function — receives the `from`/`to` paths and returns an effect
 *   the runtime awaits before the transition completes. Use for
 *   `sessionStorage`-backed restoration, hash-anchor scrolling, or scrolling
 *   a specific overflow container instead of the window.
 *
 * ScrollBehavior only fires for `pushPath` / `replacePath`. Popstate
 * navigations (browser back/forward) are left to the browser's
 * `history.scrollRestoration = "auto"`, which restores per-history-entry
 * positions correctly — better than a URL-keyed approximation could.
 */
export type ScrollBehavior =
  | "top"
  | "preserve"
  | ((from: string, to: string) => Effect.Effect<void>);

/**
 * Run a scroll behavior. Handles the three variants uniformly so callers
 * (Outlet, tests) don't have to switch on the shape.
 */
export const runScrollBehavior = (
  behavior: ScrollBehavior,
  from: string,
  to: string,
): Effect.Effect<void> => {
  if (behavior === "preserve") return Effect.void;
  if (behavior === "top") {
    return Effect.sync(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    });
  }
  return behavior(from, to);
};
