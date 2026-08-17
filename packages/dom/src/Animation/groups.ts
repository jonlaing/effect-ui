/**
 * Animation groups: declarative sequencing across multiple animated blocks.
 *
 * A group is a shared handle that any animated control (`each`, `when`,
 * `match`, ...) can attach to via `animate.group`. When groups are wired
 * with `sequence()`, later groups' animations wait for the prior group's
 * animations to complete before starting.
 *
 * @example Chained word-by-word intro:
 * ```ts
 * const App = () =>
 *   Effect.gen(function* () {
 *     const [greeting, name, tagline] = yield* Animation.sequence(3);
 *     return $.div({}, collect(
 *       each(greetingLetters, {
 *         key: (l) => l.id,
 *         render: (l) => $.span({}, $.of(l.char)),
 *         animate: { enter: "letter-in", stagger: stagger(40), group: greeting },
 *       }),
 *       each(nameLetters, {
 *         key: (l) => l.id,
 *         render: (l) => $.span({}, $.of(l.char)),
 *         animate: { enter: "letter-in", stagger: stagger(40), group: name },
 *       }),
 *       each(taglineLetters, {
 *         key: (l) => l.id,
 *         render: (l) => $.span({}, $.of(l.char)),
 *         animate: { enter: "letter-in", stagger: stagger(40), group: tagline },
 *       }),
 *     ));
 *   });
 * ```
 *
 * A group's `done` signal fires the first time its pending count returns
 * to zero after having been non-zero. Late registrations that arrive after
 * the group is already done run immediately without gating and don't
 * re-open the signal — intended for one-shot intros where new items added
 * after the sequence completes should behave like ordinary animations.
 */

import { Deferred, Effect } from "effect";

/**
 * Opaque handle representing a group of animations that can be gated and
 * awaited together. Construct via `group()`, `sequence()`, or `parallel()`.
 */
export interface AnimationGroup {
  readonly _tag: "AnimationGroup";
  readonly _gate: Deferred.Deferred<void>;
  readonly _done: Deferred.Deferred<void>;
  readonly _state: {
    pending: number;
    started: boolean;
    doneResolved: boolean;
    gateResolved: boolean;
  };
}

/**
 * Create a fresh group whose gate is closed. Use `sequence()` or `parallel()`
 * for the common case of building wired chains; call `group()` directly only
 * if you need custom gating logic.
 */
export const group = (): Effect.Effect<AnimationGroup> =>
  Effect.gen(function* () {
    const gate = yield* Deferred.make<void>();
    const done = yield* Deferred.make<void>();
    return {
      _tag: "AnimationGroup" as const,
      _gate: gate,
      _done: done,
      _state: {
        pending: 0,
        started: false,
        doneResolved: false,
        gateResolved: false,
      },
    };
  });

/**
 * Options accepted by `sequence` and `parallel` for nesting the returned
 * groups under a parent.
 */
export interface GroupOptions {
  /**
   * Nest the resulting groups under a parent group. When set:
   * - The first (or only) child group's gate is chained to `parent._gate`
   *   instead of opening immediately.
   * - The whole child chain is registered against `parent` as one virtual
   *   animation, so parent's `_done` waits for it in addition to any
   *   directly-attached animations.
   *
   * Enables nested sequences without users touching internal wiring:
   *
   * ```ts
   * const [greeting, nameChunk, tagline] = yield* Animation.sequence(3);
   * const [firstName, lastName] = yield* Animation.sequence(2, {
   *   group: nameChunk,
   * });
   * // Timeline: greeting → firstName → lastName → tagline
   * ```
   */
  readonly group?: AnimationGroup;
}

/**
 * Create `count` groups where each opens after the prior's animations
 * complete. Group 0's gate is open immediately; groups 1..N-1 gate on the
 * prior group's `_done`.
 *
 * When `options.group` is set, group 0 gates on the parent's `_gate` and the
 * chain's completion drives the parent's `_done` through a virtual
 * registration — the parent effectively "contains" the sequence.
 */
export const sequence = (
  count: number,
  options?: GroupOptions,
): Effect.Effect<AnimationGroup[]> =>
  Effect.gen(function* () {
    if (count <= 0) return [];

    const groups: AnimationGroup[] = [];
    for (let i = 0; i < count; i++) {
      groups.push(yield* group());
    }

    const parent = options?.group;
    if (parent) {
      // The whole child chain counts as one virtual animation on the parent —
      // register up front so parent's pending count reflects it before any
      // sibling completions can drive it to zero.
      _register(parent);
      // Open child 0's gate when parent's gate opens. Daemon so the wiring
      // outlives the render scope.
      yield* Effect.forkDaemon(
        Deferred.await(parent._gate).pipe(
          Effect.andThen(() => openGate(groups[0])),
        ),
      );
      // When the last child's chain completes, mark parent's virtual
      // registration done so its `_done` can fire.
      yield* Effect.forkDaemon(
        Deferred.await(groups[count - 1]._done).pipe(
          Effect.andThen(() => _complete(parent)),
        ),
      );
    } else {
      // Top-level: first group opens immediately.
      yield* openGate(groups[0]);
    }

    // Chain: groups 1..N-1 gate on the prior group's `_done`. Independent of
    // whether we're nested — the intra-chain sequencing is the same either way.
    for (let i = 1; i < count; i++) {
      const prev = groups[i - 1];
      const curr = groups[i];
      // Daemon so the wiring outlives the render scope — deferreds get GC'd
      // when the groups are unreachable.
      yield* Effect.forkDaemon(
        Deferred.await(prev._done).pipe(Effect.andThen(() => openGate(curr))),
      );
    }
    return groups;
  });

/**
 * Create `count` groups whose gates are all open immediately. Useful nested
 * inside `sequence` for concurrent segments.
 *
 * When `options.group` is set, all child gates open when the parent's gate
 * opens, and the child chain's completion drives the parent's `_done`
 * through a virtual registration.
 */
export const parallel = (
  count: number,
  options?: GroupOptions,
): Effect.Effect<AnimationGroup[]> =>
  Effect.gen(function* () {
    if (count <= 0) return [];

    const groups: AnimationGroup[] = [];
    for (let i = 0; i < count; i++) {
      groups.push(yield* group());
    }

    const parent = options?.group;
    if (parent) {
      // Register the child chain as one virtual animation on the parent.
      _register(parent);
      // All child gates open in unison when parent's gate does.
      yield* Effect.forkDaemon(
        Deferred.await(parent._gate).pipe(
          Effect.andThen(() =>
            Effect.forEach(groups, openGate, { discard: true }),
          ),
        ),
      );
      // Parent's virtual registration completes when EVERY child's `_done`
      // has fired. Await all in parallel then decrement parent's pending.
      yield* Effect.forkDaemon(
        Effect.forEach(groups, (g) => Deferred.await(g._done), {
          concurrency: "unbounded",
          discard: true,
        }).pipe(Effect.andThen(() => _complete(parent))),
      );
    } else {
      // Top-level: open every child's gate immediately.
      for (const g of groups) {
        yield* openGate(g);
      }
    }

    return groups;
  });

const openGate = (g: AnimationGroup): Effect.Effect<void> =>
  Effect.gen(function* () {
    if (g._state.gateResolved) return;
    g._state.gateResolved = true;
    yield* Deferred.succeed(g._gate, void 0);
  });

/**
 * Register an animation with the group synchronously — must be called from
 * the calling fiber before its animation fiber is forked, so the counter
 * reflects all sibling animations before any completion decrements it.
 * Internal — invoked by the ControlCtx slot machinery.
 */
export const _register = (g: AnimationGroup): void => {
  g._state.pending += 1;
  g._state.started = true;
};

/**
 * Signal that a registered animation has finished. When the pending count
 * hits zero (having previously been non-zero), the group's `_done` fires.
 * Idempotent past the first zero-crossing. Internal.
 */
export const _complete = (g: AnimationGroup): Effect.Effect<void> =>
  Effect.gen(function* () {
    g._state.pending -= 1;
    if (g._state.pending === 0 && g._state.started && !g._state.doneResolved) {
      g._state.doneResolved = true;
      yield* Deferred.succeed(g._done, void 0);
    }
  });

/**
 * Wait until the group's gate is open. Once open, returns immediately on
 * subsequent calls. Internal.
 */
export const _awaitGate = (g: AnimationGroup): Effect.Effect<void> =>
  Deferred.await(g._gate);
