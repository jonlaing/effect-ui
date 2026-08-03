/**
 * Shared animation-fork helpers used by every ControlCtx implementation
 * (Client, HydrationClient-like, Hydration-root).
 *
 * The reconcile loop invokes addSlot/removeSlot sequentially. If enter/exit
 * animations were awaited inline, every slot's animation would block the
 * next slot's turn — so we fork them:
 *
 * - Enter animations fork into the slot's own scope; closing the slot's
 *   scope (e.g. via removeSlot) interrupts an in-flight enter.
 * - Exit animations fork into the *parent* scope so removeSlot returns
 *   right away and the exit continues even if a fresh slot re-uses the
 *   same key immediately.
 *
 * AnimationConfigCtx is read lazily inside the forked fiber so nested
 * control flow sees the config its parent provided (rather than whatever
 * was in scope at Layer construction).
 */

import { Clock, Effect, Exit, Option, Scope } from "effect";

import {
  _awaitGate,
  _complete,
  _register,
  type AnimationGroup,
} from "../Animation/groups.js";
import {
  runEnterAnimation,
  runExitAnimation,
  type ListAnimationOptions,
  type StaggerFunction,
} from "../Animation/index.js";
import { AnimationConfigCtx } from "./AnimationConfigCtx.js";

type DOMElement = HTMLElement | SVGElement;

type AnimateWithGroup<T> = T & { group?: AnimationGroup };

const staggerDelayMs = (
  stagger: ListAnimationOptions["stagger"] | undefined,
  index: number,
  total: number,
): number => {
  if (stagger === undefined) return 0;
  if (typeof stagger === "number") return index * stagger;
  return (stagger as StaggerFunction)(index, total);
};

interface ResolvedAnimation<T> {
  readonly animate: AnimateWithGroup<T>;
  readonly intro: boolean;
}

const readAnimation = <T>(): Effect.Effect<ResolvedAnimation<T> | undefined> =>
  Effect.gen(function* () {
    const configOpt = yield* Effect.serviceOption(AnimationConfigCtx);
    const config = Option.getOrUndefined(configOpt);
    if (!config) return undefined;
    const animate = (config.list ?? config.single) as
      | AnimateWithGroup<T>
      | undefined;
    if (!animate) return undefined;
    return { animate, intro: config.intro === true };
  });

/**
 * Apply the configured `enterFrom` classes to an element *before* it is
 * inserted into the DOM. Without this, on client-mode mounts (fresh
 * addSlot outside the hydration path) the browser paints the element in
 * its final state before `forkSlotEnter`'s forked fiber gets a chance to
 * apply `enterFrom` — producing a one-frame flash of the resolved state
 * followed by the animation playing "backwards" from the end.
 *
 * SSR already emits `enterFrom` classes in the HTML for `intro: true`
 * controls, so hydration paths don't need this. This is the client-only
 * equivalent: same guarantee, applied synchronously in JS instead of in
 * the SSG output.
 *
 * Only touches `enterFrom` — the transition setup and target state stay
 * with `runEnterAnimation`, which will re-add `enterFrom` (no-op),
 * reflow, and swap to enter/enterTo as before.
 */
export const applyPreInsertEnterFrom = (
  element: DOMElement,
): Effect.Effect<void> => {
  if (!(element instanceof HTMLElement)) return Effect.void;
  return Effect.gen(function* () {
    const resolved = yield* readAnimation<{ enterFrom?: string }>();
    if (!resolved) return;
    const { enterFrom } = resolved.animate;
    if (!enterFrom) return;
    const classes = enterFrom.split(/\s+/).filter(Boolean);
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
  });
};

/**
 * Fork an enter animation into the slot's scope. Returns immediately; the
 * animation plays in the background and gets interrupted if the slot scope
 * closes before it finishes. No-op if the element is not an HTMLElement
 * (SVG doesn't support the CSS-class animation path).
 *
 * When `opts.hydrating` is true, the animation only runs if the parent
 * control opted into intro re-animation (`animate.intro` on the config).
 * The default hydration behaviour is to attach handlers to pre-existing
 * DOM without re-animating; the intro flag flips that for decorative
 * sequences.
 *
 * If the animation is attached to an {@link AnimationGroup}, the group is
 * registered synchronously (before the fiber forks) so its pending count
 * reflects every sibling animation before any completion decrements it.
 * The forked fiber then awaits the group's gate before playing.
 */
export const forkSlotEnter = (
  element: DOMElement,
  slotScope: Scope.CloseableScope,
  opts?: {
    readonly hydrating?: boolean;
    /** Position of this slot within its reconcile batch (0-based). */
    readonly index?: number;
    /** Total number of slots in this reconcile batch. */
    readonly total?: number;
    /**
     * `Date.now()` timestamp captured when reconcile started iterating.
     * Used to compute stagger delays relative to a shared reference so
     * items fire at `startAt + delayMs` regardless of how long reconcile
     * takes to reach each slot — otherwise reconcile overhead would
     * compound and each staggered item would drift further behind.
     */
    readonly staggerStartAt?: number;
  },
): Effect.Effect<void> => {
  if (!(element instanceof HTMLElement)) return Effect.void;
  return Effect.gen(function* () {
    const resolved = yield* readAnimation<ListAnimationOptions>();
    if (!resolved) return;
    if (opts?.hydrating && !resolved.intro) return;

    const { animate } = resolved;
    const grp = animate.group;
    if (grp) {
      _register(grp);
    }

    const targetDelay =
      opts?.index !== undefined && opts?.total !== undefined
        ? staggerDelayMs(animate.stagger, opts.index, opts.total)
        : 0;
    const now = yield* Clock.currentTimeMillis;
    const actualDelay =
      targetDelay > 0 && opts?.staggerStartAt !== undefined
        ? Math.max(0, opts.staggerStartAt + targetDelay - now)
        : targetDelay;

    yield* Effect.gen(function* () {
      if (grp) {
        yield* _awaitGate(grp);
      }
      // Wait for the element to be attached to the document before the
      // enter lifecycle starts. On client-mode re-mount (e.g. a router
      // nav-back), the fiber is forked from inside addSlot while the
      // ancestor chain is still being assembled bottom-up in memory.
      // The forked fiber can win the race against the outer flow, and
      // `onBeforeEnter` would then fire against a detached node —
      // `getComputedStyle` returns empty strings on disconnected nodes
      // and browsers won't compute or transition styles against them,
      // so the enter transition never fires and the animation stalls.
      //
      // Effect.yieldNow is not enough — Effect's scheduler can
      // reschedule the fiber right back if no other work is queued.
      // Real browser microtasks (via queueMicrotask) DO defer past
      // the current synchronous+microtask window, so the outer flow's
      // DOM insertion completes before this fiber resumes.
      if (!element.isConnected) {
        yield* waitForConnection(element);
      }
      // Force a style/layout computation on the (now-connected)
      // element. Some engines defer style computation for freshly-
      // inserted nodes until it's needed; without this, forceReflow
      // inside runEnterAnimation may end up recording the enterFrom-
      // applied state as the initial snapshot for a node that hasn't
      // been styled yet, leaving the browser without a valid "before"
      // to interpolate the transition from.
      if (element instanceof HTMLElement) {
        void element.offsetHeight;
      }
      const run = runEnterAnimation(Effect.succeed(element), animate).pipe(
        Effect.ensuring(grp ? _complete(grp) : Effect.void),
      );
      yield* actualDelay > 0
        ? run.pipe(Effect.delay(`${actualDelay} millis`))
        : run;
    }).pipe(Effect.forkIn(slotScope));
  }).pipe(Effect.asVoid);
};

/**
 * Yield a real browser microtask. Different from `Effect.yieldNow` — that
 * only reschedules the fiber inside Effect's queue and can re-run
 * immediately when nothing else is queued. `queueMicrotask` guarantees
 * the browser will finish the current task's remaining synchronous work
 * and flush other pending microtasks before resuming.
 */
const yieldMicrotask: Effect.Effect<void> = Effect.async<void>((resume) => {
  queueMicrotask(() => resume(Effect.void));
});

/**
 * Wait for an element to become connected to the document. On client-mode
 * re-mount, the enter fiber is forked from inside `addSlot` before the
 * outer synchronous render flow has finished appending the wrapper's
 * ancestor chain — but that flow runs entirely within the current task's
 * synchronous+microtask window, so yielding real microtasks in a bounded
 * loop lets it complete and the element becomes connected.
 *
 * The bound is generous (32 microtasks): each takes ~microseconds in
 * modern engines, so a full spin is well under a millisecond even in the
 * worst case, but it comfortably covers any realistic outer-flow depth.
 * Callers that never insert their animated element (e.g. tests that yield
 * `animated(...)` inline without appending) hit the bound and proceed
 * anyway — best-effort rather than hanging.
 */
const waitForConnection = (element: HTMLElement): Effect.Effect<void> =>
  Effect.gen(function* () {
    for (let i = 0; i < 32 && !element.isConnected; i++) {
      yield* yieldMicrotask;
    }
  });

/**
 * Fork the full slot-removal sequence into the parent scope:
 * 1. Close the slot's scope (interrupts any in-flight enter animation).
 * 2. Play the exit animation (if configured).
 * 3. Call `removeFromDom` to detach the element.
 *
 * `entry.scope` is nullable because hydration seeds slots from existing
 * DOM before their scopes are populated by addSlot; a slot removed in
 * that intermediate state has nothing to close.
 *
 * The Scope.Scope required by `Effect.scope` is stripped from the returned
 * signature; callers (removeSlot) always run inside a scope from reconcile.
 */
export const forkSlotRemoval = (
  entry: {
    readonly element: DOMElement;
    readonly scope: Scope.CloseableScope | null;
  },
  removeFromDom: () => void,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const parentScope = yield* Effect.scope;
    yield* Effect.gen(function* () {
      if (entry.scope) {
        yield* Scope.close(entry.scope, Exit.void);
      }
      if (entry.element instanceof HTMLElement) {
        const resolved =
          yield* readAnimation<Parameters<typeof runExitAnimation>[1]>();
        if (resolved) {
          yield* runExitAnimation(
            Effect.succeed(entry.element),
            resolved.animate,
          );
        }
      }
      removeFromDom();
    }).pipe(Effect.forkIn(parentScope));
  }) as unknown as Effect.Effect<void>;
