/**
 * Per-outlet coordination context.
 *
 * Provided by `Outlet` into each rendered route's scope, so route
 * components — and any downstream custom `Router.scrollBehavior` fn —
 * can read the current outlet's transition state without the outlet
 * having to plumb it through every component's props.
 *
 * The classic uses:
 *
 * - **Intro animations that don't race with the outlet transition.** A
 *   route component with its own `Animation.sequence(...)` intro can
 *   nest that sequence under the outlet's transition group so its
 *   first animation doesn't fire at the same wall-clock moment as the
 *   outlet's enter — which used to look like "the beginning of the
 *   intro was dropped."
 *
 *   ```ts
 *   const HomePage = () => Effect.gen(function* () {
 *     const outlet = yield* OutletCtx;
 *     const groups = yield* Animation.sequence(3, { group: outlet.transition });
 *     // ...
 *   });
 *   ```
 *
 * - **Scroll timing.** A custom scroll behavior can await the outlet's
 *   transition before scrolling so users don't see a flash of the old
 *   page scrolled to the top mid-exit-animation.
 *
 *   ```ts
 *   Router.scrollBehavior((from, to) =>
 *     Effect.gen(function* () {
 *       const outlet = yield* OutletCtx;
 *       yield* Animation.awaitDone(outlet.transition);
 *       window.scrollTo({ top: 0, left: 0, behavior: "instant" });
 *     }),
 *   );
 *   ```
 *
 * The transition group is **fresh per nav** — each route render sees a
 * group that fires `_done` exactly once, for its own transition cycle,
 * so downstream sequencing behaves predictably across multiple
 * navigations.
 *
 * @module
 */

import { Context } from "effect";

import type { AnimationGroup } from "@stax-ui/dom";

/**
 * Service exposed on `OutletCtx`.
 */
export interface OutletCtxService {
  /**
   * The current transition's animation group. The outlet's own
   * enter/exit animation is registered with this group, so
   * `Animation.awaitDone(transition)` resolves when the outlet's
   * transition for this nav has completed.
   *
   * Fresh per nav — a page component that reads this on mount gets a
   * group scoped to *its own* mount cycle.
   */
  readonly transition: AnimationGroup;
}

/**
 * Context tag for `OutletCtx`.
 */
export class OutletCtx extends Context.Tag("stax/router/OutletCtx")<
  OutletCtx,
  OutletCtxService
>() {}
