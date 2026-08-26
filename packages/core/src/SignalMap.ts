import {
  Data,
  Effect,
  Option,
  Pipeable,
  Predicate,
  Scope,
  Stream,
  SubscriptionRef,
} from "effect";

import { Readable, TypeId as ReadableTypeId } from "./Readable.js";

// -----------------------------------------------------------------------------
// TypeId
// -----------------------------------------------------------------------------

export const SignalMapTypeId: unique symbol = Symbol.for("stax/SignalMap");
export type SignalMapTypeId = typeof SignalMapTypeId;

/**
 * Raised by `modifyAt` when the given key is not present in the map.
 * Carries the offending key so callers can log or recover.
 */
export class KeyNotFoundError<K = unknown> extends Data.TaggedError(
  "stax/SignalMap/KeyNotFoundError",
)<{
  readonly key: K;
}> {}

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Check if a value is a SignalMap.
 */
export const isSignalMap = (
  value: unknown,
): value is SignalMap<unknown, unknown> =>
  Predicate.hasProperty(value, SignalMapTypeId);

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

/**
 * A reactive Map with mutation methods that trigger updates.
 * Mutations happen in-place without cloning, then trigger reactive updates.
 *
 * @template K - The key type
 * @template V - The value type
 *
 * @example
 * ```ts
 * const users = yield* Signal.Map.make<string, User>();
 *
 * // Mutations
 * yield* users.set("u1", { name: "Alice" });
 * yield* users.delete("u1");
 *
 * // Reactive reads (for UI binding)
 * users.get("u1")              // Readable<Option<User>>
 * users.getOrElse("u1", guest) // Readable<User>
 *
 * // One-time reads
 * const user = yield* users.getEffect("u1");  // Effect<Option<User>>
 * const exists = yield* users.has("u1");
 *
 * // Derived readables
 * users.size      // Readable<number>
 * users.entries   // Readable<readonly [K, V][]>
 * ```
 */
export interface SignalMap<K, V> extends Readable.Readable<ReadonlyMap<K, V>> {
  readonly [SignalMapTypeId]: SignalMapTypeId;

  /**
   * Set a value for a key.
   */
  readonly set: (key: K, value: V) => Effect.Effect<void>;

  /**
   * Get a reactive value for a key, returning Option.none() if not found.
   * Use this for reactive UI bindings.
   */
  readonly at: (key: K) => Readable.Readable<Option.Option<V>>;

  /**
   * Get a reactive value for a key with a fallback if not found.
   * Use this for reactive UI bindings when you have a default value.
   */
  readonly atOrElse: (key: K, fallback: V) => Readable.Readable<V>;

  /**
   * Get the value for a key as an Effect, returning Option.none() if not found.
   * Use this for one-time reads in imperative code.
   */
  readonly atEffect: (key: K) => Effect.Effect<Option.Option<V>>;

  /**
   * Check if a key exists (reactive).
   * Use this for reactive UI bindings.
   */
  readonly has: (key: K) => Readable.Readable<boolean>;

  /**
   * Check if a key exists as an Effect.
   * Use this for one-time checks in imperative code.
   */
  readonly hasEffect: (key: K) => Effect.Effect<boolean>;

  /**
   * Delete a key. Returns true if the key existed.
   */
  readonly delete: (key: K) => Effect.Effect<boolean>;

  /**
   * Remove all entries.
   */
  readonly clear: () => Effect.Effect<void>;

  /**
   * Replace the entire map contents.
   */
  readonly replace: (
    map: ReadonlyMap<K, V> | Iterable<readonly [K, V]>,
  ) => Effect.Effect<void>;

  /**
   * Update the map using a function.
   */
  readonly update: (
    f: (
      map: ReadonlyMap<K, V>,
    ) => ReadonlyMap<K, V> | Iterable<readonly [K, V]>,
  ) => Effect.Effect<void>;

  /**
   * Update the value at a specific key by applying a function to it.
   * Fails with `KeyNotFoundError` if the key is not present in the map.
   *
   * Prefer `modifyAt` over `set` when the new value depends on the old
   * one — the function receives the current value and returns the next
   * one without a round-trip through `at`/`atEffect`.
   */
  readonly modifyAt: (
    key: K,
    f: (value: V) => V,
  ) => Effect.Effect<void, KeyNotFoundError<K>>;

  /**
   * Reactive size of the map.
   */
  readonly size: Readable.Readable<number>;

  /**
   * Reactive array of entries.
   */
  readonly entries: Readable.Readable<readonly (readonly [K, V])[]>;

  /**
   * Reactive array of keys.
   */
  readonly keys: Readable.Readable<readonly K[]>;

  /**
   * Reactive array of values.
   */
  readonly valuesArray: Readable.Readable<readonly V[]>;
}

/**
 * Create a new SignalMap with optional initial entries.
 *
 * @param initial - Initial entries as a Map or iterable of [key, value] pairs
 */
export const make = <K, V>(
  initial?: ReadonlyMap<K, V> | Iterable<readonly [K, V]>,
): Effect.Effect<SignalMap<K, V>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const initialMap = initial
      ? new Map(initial as Iterable<[K, V]>)
      : new Map<K, V>();
    const ref = yield* SubscriptionRef.make(initialMap);

    // Drop first emission from SubscriptionRef.changes (it emits current value on subscription)
    const getChanges = () => Stream.drop(ref.changes, 1);

    // Helper to trigger update after mutation
    const notify = Effect.gen(function* () {
      const map = yield* SubscriptionRef.get(ref);
      yield* SubscriptionRef.set(ref, map);
    });

    // Build the base Readable
    const readable = Readable.make(
      Effect.map(SubscriptionRef.get(ref), (map) => map as ReadonlyMap<K, V>),
      () => getChanges(),
    );

    const signalMap: SignalMap<K, V> = {
      // TypeIds
      [ReadableTypeId]: ReadableTypeId,
      [SignalMapTypeId]: SignalMapTypeId,

      // Pipeable
      pipe() {
        return Pipeable.pipeArguments(this, arguments);
      },

      // Readable interface
      get: readable.get,
      changes: readable.changes,
      values: readable.values,

      // SignalMap mutations
      set: (key, value) =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          map.set(key, value);
          yield* notify;
        }),

      at: (key) =>
        readable.pipe(Readable.map((map) => Option.fromNullable(map.get(key)))),

      atOrElse: (key, fallback) =>
        readable.pipe(Readable.map((map) => map.get(key) ?? fallback)),

      atEffect: (key) =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          return Option.fromNullable(map.get(key));
        }),

      has: (key) => readable.pipe(Readable.map((map) => map.has(key))),

      hasEffect: (key) =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          return map.has(key);
        }),

      delete: (key) =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          const existed = map.delete(key);
          if (existed) {
            yield* notify;
          }
          return existed;
        }),

      clear: () =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          if (map.size > 0) {
            map.clear();
            yield* notify;
          }
        }),

      replace: (newMap) =>
        Effect.gen(function* () {
          yield* SubscriptionRef.set(ref, new Map(newMap as Iterable<[K, V]>));
        }),

      update: (f) =>
        Effect.gen(function* () {
          const current = yield* SubscriptionRef.get(ref);
          const next = f(current);
          yield* SubscriptionRef.set(ref, new Map(next as Iterable<[K, V]>));
        }),

      modifyAt: (key, f) =>
        Effect.gen(function* () {
          const current = yield* SubscriptionRef.get(ref);
          if (!current.has(key)) {
            return yield* Effect.fail(new KeyNotFoundError<K>({ key }));
          }
          const next = new Map(current);
          next.set(key, f(current.get(key) as V));
          yield* SubscriptionRef.set(ref, next);
        }),

      // Derived readables
      size: readable.pipe(Readable.map((map) => map.size)),
      entries: readable.pipe(Readable.map((map) => [...map.entries()])),
      keys: readable.pipe(Readable.map((map) => [...map.keys()])),
      valuesArray: readable.pipe(Readable.map((map) => [...map.values()])),
    };

    return signalMap;
  });

/**
 * SignalMap namespace.
 */
export const SignalMap = {
  SignalMapTypeId,
  isSignalMap,
  make,
  KeyNotFoundError,
};
