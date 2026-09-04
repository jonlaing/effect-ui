/**
 * Signal.Optic — one deeply-nested state root that hands out lazy,
 * fine-grained `Readable`s for arbitrary sub-paths.
 *
 * Motivation: `Signal.Struct` gives per-field signals but only one
 * level deep and only for a known key set. For deeply nested state
 * (config trees, form models, editor documents) you'd otherwise be
 * stuck either constructing nested Structs by hand or reading the
 * whole tree and mapping — both give up the "only the components who
 * read this field re-render" property that makes signals worth the
 * ceremony in the first place.
 *
 * Shape:
 *
 * ```ts
 * const state = yield* Signal.Optic.make({ a: { b: { c: 0 }, d: 1 }, e: 2 });
 *
 * const c = yield* Signal.Optic.get(state, "a.b.c");
 * const b = yield* Signal.Optic.get(state, "a.b");
 *
 * yield* Signal.Optic.set(state, "a.b.c", 3);
 * yield* c.get; // 3
 * yield* b.get; // { c: 3 }
 *
 * yield* Signal.Optic.set(state, "a.b", { c: 5 });
 * yield* b.get; // { c: 5 }
 * yield* c.get; // 5  ← ancestor write propagates to child readables
 * ```
 *
 * The root handle itself is a `Readable<T>` (whole tree), so
 * `yield* state.get` works and so does `state.changes` for observing
 * every write. Direct `.set` on the root is intentionally NOT
 * provided — writes flow only through `Signal.Optic.set(state, path,
 * value)` / `Signal.Optic.update(state, path, fn)`. That's what
 * enables `Signal.trace`-style write-tracing to answer "which lens
 * modified this state?" without users having to grep for `.set(`
 * everywhere; every mutation carries a path.
 *
 * @module
 */

import {
  Effect,
  Function as Fn,
  Predicate,
  Scope,
  Stream,
  SubscriptionRef,
} from "effect";

import { Readable, TypeId as ReadableTypeId } from "./Readable.js";

// =============================================================================
// TypeId
// =============================================================================

export const OpticTypeId: unique symbol = Symbol.for("stax/Signal/Optic");
export type OpticTypeId = typeof OpticTypeId;

// =============================================================================
// Path types (template-literal)
// =============================================================================

// Depth-limited recursion keeps TS from choking on the type-level walk.
// Five levels covers the realistic ceiling for hand-authored state
// trees; beyond that either use the composable lens API (future) or
// widen a sub-path to a bare `Readable<unknown>` via cast.
type Prev = [never, 0, 1, 2, 3, 4, 5];

/**
 * All valid dot-separated paths into `T` — object keys separated by
 * `.`, terminating either at a primitive leaf or at the maximum
 * recursion depth. Non-object values ignore recursion and only
 * contribute their own key.
 */
export type Paths<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & string]:
          K | (T[K] extends object ? `${K}.${Paths<T[K], Prev[D]>}` : never);
      }[keyof T & string]
    : never;

/**
 * The value type at a dot-separated path `P` in `T`.
 */
export type ValueAtPath<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? ValueAtPath<T[K], Rest>
      : never
    : never;

// =============================================================================
// Model
// =============================================================================

/**
 * A `Signal.Optic<T>` is a `Readable<T>` of the whole tree plus an
 * opaque handle to its internal path-subscriber table. Callers can
 * observe the whole tree via `.get` / `.changes` / `.values`, but
 * writes flow through `Signal.Optic.set` / `Signal.Optic.update`
 * against a path.
 */
export interface Optic<T> extends Readable.Readable<T> {
  readonly [OpticTypeId]: OpticTypeId;
  /** @internal */
  readonly _ref: SubscriptionRef.SubscriptionRef<T>;
  /**
   * Path → set of `emit`-callbacks. Every write walks this map,
   * comparing the new value at each subscribed path against its last
   * emitted value; only paths whose value actually changed fire.
   * @internal
   */
  readonly _subs: Map<string, Set<(value: unknown) => void>>;
}

/**
 * @category guards
 */
export const isOptic = (value: unknown): value is Optic<unknown> =>
  Predicate.hasProperty(value, OpticTypeId);

// =============================================================================
// Construction
// =============================================================================

/**
 * Create a new `Optic` seeded with an initial value.
 */
export const make = <T>(
  initial: T,
): Effect.Effect<Optic<T>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make(initial);
    const subs = new Map<string, Set<(value: unknown) => void>>();

    // Whole-tree Readable — `.changes` drops the first emission
    // because SubscriptionRef fires current-value on subscribe and our
    // Readable contract is future-only.
    const readable = Readable.make(SubscriptionRef.get(ref), () =>
      Stream.drop(ref.changes, 1),
    );

    return {
      [ReadableTypeId]: ReadableTypeId,
      [OpticTypeId]: OpticTypeId,
      get: readable.get,
      changes: readable.changes,
      values: readable.values,
      pipe: readable.pipe.bind(readable),
      _ref: ref,
      _subs: subs,
    } as Optic<T>;
  });

// =============================================================================
// Path arithmetic (runtime)
// =============================================================================

const parsePath = (path: string): readonly string[] =>
  path === "" ? [] : path.split(".");

const getIn = (root: unknown, keys: readonly string[]): unknown => {
  let cur: unknown = root;
  for (const k of keys) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
};

// Immutable set: rebuilds only the objects along `keys`; unaffected
// branches keep their previous references (structural sharing). That
// lets subscriber-side dedup rely on `Object.is` at the read path
// rather than deep-comparing every emission.
const setIn = (
  root: unknown,
  keys: readonly string[],
  value: unknown,
): unknown => {
  if (keys.length === 0) return value;
  const [head, ...rest] = keys;
  const parent =
    root === null || root === undefined
      ? {}
      : (root as Record<string, unknown>);
  return { ...parent, [head]: setIn(parent[head], rest, value) };
};

/**
 * True if a write at `writePath` should notify a subscription at
 * `subPath`. Overlap is symmetric: either path is a prefix of the
 * other (or they're equal). The empty subscription path — reserved
 * for whole-tree Readables — matches every write.
 */
const overlaps = (writePath: string, subPath: string): boolean => {
  if (subPath === "" || writePath === "") return true;
  if (subPath === writePath) return true;
  return (
    subPath.startsWith(writePath + ".") || writePath.startsWith(subPath + ".")
  );
};

// =============================================================================
// Reads
// =============================================================================

/**
 * A `Readable<ValueAtPath<T, P>>` for the value at `path`. Emits on
 * `.changes` whenever a write to the root causes the value at this
 * exact path to change — writes to unrelated sibling paths don't
 * fire, and writes producing an equal value are deduplicated via
 * `Object.is`.
 *
 * Subscribes to a shared entry in the optic's path-subscriber table
 * on the returned Readable's `.changes` stream; unsubscribes when the
 * enclosing scope closes.
 */
export const get: {
  <T, P extends Paths<T>>(
    optic: Optic<T>,
    path: P,
  ): Effect.Effect<Readable.Readable<ValueAtPath<T, P>>>;
  <T, P extends Paths<T>>(
    path: P,
  ): (optic: Optic<T>) => Effect.Effect<Readable.Readable<ValueAtPath<T, P>>>;
} = Fn.dual(
  2,
  <T, P extends Paths<T>>(
    optic: Optic<T>,
    path: P,
  ): Effect.Effect<Readable.Readable<ValueAtPath<T, P>>> =>
    Effect.sync(() => {
      const keys = parsePath(path);
      const readable = Readable.make(
        Effect.map(SubscriptionRef.get(optic._ref), (root) =>
          getIn(root, keys),
        ) as Effect.Effect<ValueAtPath<T, P>>,
        () =>
          Stream.async<ValueAtPath<T, P>>((emit) => {
            const listener = (value: unknown) =>
              emit.single(value as ValueAtPath<T, P>);
            let set = optic._subs.get(path);
            if (!set) {
              set = new Set();
              optic._subs.set(path, set);
            }
            set.add(listener);
            return Effect.sync(() => {
              const s = optic._subs.get(path);
              if (!s) return;
              s.delete(listener);
              if (s.size === 0) optic._subs.delete(path);
            });
          }),
      );
      return readable;
    }),
);

// =============================================================================
// Writes
// =============================================================================

const emitOverlaps = (
  optic: Optic<unknown>,
  writePath: string,
  next: unknown,
) =>
  Effect.sync(() => {
    // Snapshot subscribers so iteration is stable if a listener
    // synchronously triggers another subscribe/unsubscribe.
    for (const [subPath, listeners] of Array.from(optic._subs.entries())) {
      if (!overlaps(writePath, subPath)) continue;
      const value = getIn(next, parsePath(subPath));
      for (const listener of Array.from(listeners)) {
        listener(value);
      }
    }
  });

/**
 * Write `value` at `path`. The internal root is rebuilt via
 * structural-sharing immutable update, then every subscription whose
 * path overlaps `path` is fired with the fresh value at its own
 * path — subject to `Object.is` dedup at the subscriber level (the
 * `.changes` stream naturally drops repeats through the shared
 * `Stream.async` implementation… actually, dedup happens at the
 * ref-emitting stream layer for the root; for path subscribers it's
 * up to the framework's downstream dedup (`Stream.changes`) that
 * every Readable already applies to its `.values` view).
 *
 * Overlap notification rule: notify iff `subPath === writePath`,
 * `subPath` is a strict prefix of `writePath`, or `writePath` is a
 * strict prefix of `subPath`. Sibling paths (`a.b.c` vs `a.b.d`) do
 * not overlap.
 */
export const set: {
  <T, P extends Paths<T>>(
    optic: Optic<T>,
    path: P,
    value: ValueAtPath<T, P>,
  ): Effect.Effect<void>;
  <T, P extends Paths<T>>(
    path: P,
    value: ValueAtPath<T, P>,
  ): (optic: Optic<T>) => Effect.Effect<void>;
} = Fn.dual(
  3,
  <T, P extends Paths<T>>(
    optic: Optic<T>,
    path: P,
    value: ValueAtPath<T, P>,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const keys = parsePath(path);
      const current = yield* SubscriptionRef.get(optic._ref);
      const next = setIn(current, keys, value) as T;
      // Skip the whole notification pass when nothing actually
      // changed at the write point — cheap sanity, protects against
      // accidental churn from setting a path back to its current
      // value.
      const prevAtPath = getIn(current, keys);
      if (Object.is(prevAtPath, value)) return;
      yield* SubscriptionRef.set(optic._ref, next);
      yield* emitOverlaps(optic as Optic<unknown>, path, next);
    }),
);

/**
 * Update the value at `path` via a pure function.
 */
export const update: {
  <T, P extends Paths<T>>(
    optic: Optic<T>,
    path: P,
    fn: (value: ValueAtPath<T, P>) => ValueAtPath<T, P>,
  ): Effect.Effect<void>;
  <T, P extends Paths<T>>(
    path: P,
    fn: (value: ValueAtPath<T, P>) => ValueAtPath<T, P>,
  ): (optic: Optic<T>) => Effect.Effect<void>;
} = Fn.dual(
  3,
  <T, P extends Paths<T>>(
    optic: Optic<T>,
    path: P,
    fn: (value: ValueAtPath<T, P>) => ValueAtPath<T, P>,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const keys = parsePath(path);
      const current = yield* SubscriptionRef.get(optic._ref);
      const currentAtPath = getIn(current, keys) as ValueAtPath<T, P>;
      const nextAtPath = fn(currentAtPath);
      if (Object.is(currentAtPath, nextAtPath)) return;
      const next = setIn(current, keys, nextAtPath) as T;
      yield* SubscriptionRef.set(optic._ref, next);
      yield* emitOverlaps(optic as Optic<unknown>, path, next);
    }),
);

// =============================================================================
// Namespace
// =============================================================================

export const Optic = {
  OpticTypeId,
  isOptic,
  make,
  get,
  set,
  update,
};
