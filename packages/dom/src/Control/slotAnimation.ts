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

import { runEnterAnimation, runExitAnimation } from "../Animation/index.js";
import { AnimationConfigCtx } from "./AnimationConfigCtx.js";

type DOMElement = HTMLElement | SVGElement;

const readAnimateOption = <T>(): Effect.Effect<T | undefined> =>
  Effect.gen(function* () {
    const configOpt = yield* Effect.serviceOption(AnimationConfigCtx);
    const config = Option.getOrUndefined(configOpt);
    return (config?.list ?? config?.single) as T | undefined;
  });

/**
 * Fork an enter animation into the slot's scope. Returns immediately; the
 * animation plays in the background and gets interrupted if the slot scope
 * closes before it finishes. No-op if the element is not an HTMLElement
 * (SVG doesn't support the CSS-class animation path).
 */
export const forkSlotEnter = (
  element: DOMElement,
  slotScope: Scope.CloseableScope,
): Effect.Effect<void> => {
  if (!(element instanceof HTMLElement)) return Effect.void;
  return Effect.gen(function* () {
    const animate =
      yield* readAnimateOption<Parameters<typeof runEnterAnimation>[1]>();
    if (animate) {
      yield* runEnterAnimation(Effect.succeed(element), animate);
    }
  }).pipe(Effect.forkIn(slotScope), Effect.asVoid);
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
        const animate =
          yield* readAnimateOption<Parameters<typeof runExitAnimation>[1]>();
        if (animate) {
          yield* runExitAnimation(Effect.succeed(entry.element), animate);
        }
      }
      removeFromDom();
    }).pipe(Effect.forkIn(parentScope));
  }) as unknown as Effect.Effect<void>;
