/**
 * Per-outlet coordination context.
 *
 * Provided by `Outlet` into each rendered route's scope (and into
 * every `Router.scrollBehavior` custom-fn invocation), so route
 * components and scroll behaviors can react to the outlet's transition
 * lifecycle without the outlet having to plumb it through every
 * component's props.
 *
 * ## Uses
 *
 * ### Split `exit` / `enter` groups
 *
 * `exit` and `enter` are independent per-nav `AnimationGroup`s wired
 * into the outlet's own slot animations. `_done` on each fires
 * exactly once per navigation — when the outlet's exit (or enter)
 * finishes.
 *
 * ```ts
 * // Scroll fires after the outlet's EXIT animation completes.
 * Router.scrollBehavior((from, to) =>
 *   Effect.gen(function* () {
 *     const outlet = yield* OutletCtx;
 *     yield* Animation.awaitDone(outlet.exit);
 *     window.scrollTo({ top: 0, left: 0, behavior: "instant" });
 *   }),
 * );
 *
 * // Page's intro sequence fires after the outlet's ENTER animation
 * // completes — so the first item of the intro doesn't overlap the
 * // outlet's own enter.
 * const HomePage = () => Effect.gen(function* () {
 *   const outlet = yield* OutletCtx;
 *   yield* Animation.awaitDone(outlet.enter);
 *   const groups = yield* Animation.sequence(3);
 *   // ...
 * });
 * ```
 *
 * ### Nearest scroll container
 *
 * `scrollContainer` walks up from the outlet's own container element
 * to the nearest actually-scrollable ancestor (or falls back to
 * `null` for window-scrolled apps). A custom `scrollBehavior` fn
 * reads this instead of re-implementing the walk.
 *
 * Exposed as a function so it's resolved at call time — the outlet's
 * container isn't populated during the initial reconcile that runs at
 * mount, but by the time any nav-driven callback fires (which is when
 * `scrollBehavior` runs) the container is present.
 *
 * @module
 */

import { Context, type Effect } from "effect";

import type { AnimationGroup } from "@stax-ui/dom";

/**
 * Service exposed on `OutletCtx`.
 */
export interface OutletCtxService {
  /**
   * `AnimationGroup` for the outlet's own exit animation on this nav.
   * `_done` fires once the exit completes — `Animation.awaitDone(exit)`
   * is the canonical "wait for the old page to finish leaving."
   *
   * Fresh per nav.
   */
  readonly exit: AnimationGroup;

  /**
   * `AnimationGroup` for the outlet's own enter animation on this nav.
   * `_done` fires once the enter completes —
   * `Animation.awaitDone(enter)` is the canonical "wait for the new
   * page to finish appearing" before running downstream intros.
   *
   * Fresh per nav. Runs in parallel with `exit` by default — sequence
   * them yourself if you want a serial exit → enter timeline.
   */
  readonly enter: AnimationGroup;

  /**
   * Nearest scrollable ancestor of the outlet's own container
   * element, or `null` if none was found on the walk up (the app is
   * window-scrolled, so `window.scrollTo` is the right fallback).
   *
   * Effect-typed rather than a plain ref, to match the shape of
   * `AnimationHook`'s `Effect.Effect<HTMLElement>` — the outlet's
   * container isn't populated during the initial reconcile pass, so
   * wrapping the walk in an Effect gets it resolved at consumption
   * time (which is always post-mount for a scroll-behavior callback).
   *
   * ```ts
   * Router.scrollBehavior((from, to) =>
   *   Effect.gen(function* () {
   *     const outlet = yield* OutletCtx;
   *     const target = yield* outlet.scrollContainer;
   *     (target ?? window).scrollTo({ top: 0, left: 0, behavior: "instant" });
   *   }),
   * );
   * ```
   */
  readonly scrollContainer: Effect.Effect<HTMLElement | SVGElement | null>;
}

/**
 * Context tag for `OutletCtx`.
 */
export class OutletCtx extends Context.Tag("stax/router/OutletCtx")<
  OutletCtx,
  OutletCtxService
>() {}
