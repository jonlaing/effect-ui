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

import { Effect, Exit, Option, Scope } from "effect";

import {
  _awaitGate,
  _complete,
  _register,
  type AnimationGroup,
} from "../Animation/groups.js";
import { runEnterAnimation, runExitAnimation } from "../Animation/index.js";
import { AnimationConfigCtx } from "./AnimationConfigCtx.js";

type DOMElement = HTMLElement | SVGElement;

type AnimateWithGroup<T> = T & { group?: AnimationGroup };

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
  opts?: { readonly hydrating?: boolean },
): Effect.Effect<void> => {
  if (!(element instanceof HTMLElement)) return Effect.void;
  return Effect.gen(function* () {
    const resolved =
      yield* readAnimation<Parameters<typeof runEnterAnimation>[1]>();
    if (!resolved) return;
    if (opts?.hydrating && !resolved.intro) return;

    const { animate } = resolved;
    const grp = animate.group;
    if (grp) {
      _register(grp);
    }

    yield* Effect.gen(function* () {
      if (grp) {
        yield* _awaitGate(grp);
      }
      yield* runEnterAnimation(Effect.succeed(element), animate).pipe(
        Effect.ensuring(grp ? _complete(grp) : Effect.void),
      );
    }).pipe(Effect.forkIn(slotScope));
  }).pipe(Effect.asVoid);
};

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
