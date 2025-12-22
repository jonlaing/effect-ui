import { Effect, Scope, SubscriptionRef } from "effect";

import type { Readable } from "./Readable.js";
import { Readable as ReadableNS } from "./Readable.js";

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
 * // Reads
 * const user = yield* users.get("u1");
 * const exists = yield* users.has("u1");
 *
 * // Derived readables for UI binding
 * users.size      // Readable<number>
 * users.entries   // Readable<readonly [K, V][]>
 * ```
 */
export interface SignalMap<K, V> {
  /**
   * Set a value for a key.
   */
  readonly set: (key: K, value: V) => Effect.Effect<void>;

  /**
   * Get the value for a key.
   */
  readonly get: (key: K) => Effect.Effect<V | undefined>;

  /**
   * Check if a key exists.
   */
  readonly has: (key: K) => Effect.Effect<boolean>;

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
   * Reactive size of the map.
   */
  readonly size: Readable<number>;

  /**
   * Reactive array of entries.
   */
  readonly entries: Readable<readonly (readonly [K, V])[]>;

  /**
   * Reactive array of keys.
   */
  readonly keys: Readable<readonly K[]>;

  /**
   * Reactive array of values.
   */
  readonly values: Readable<readonly V[]>;

  /**
   * The underlying readable for use with Readable.combine(), etc.
   */
  readonly readable: Readable<ReadonlyMap<K, V>>;
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

    const getChanges = () => ref.changes;

    // Helper to trigger update after mutation
    const notify = Effect.gen(function* () {
      const map = yield* SubscriptionRef.get(ref);
      yield* SubscriptionRef.set(ref, map);
    });

    // Build the base Readable
    const readable = ReadableNS.make(
      Effect.map(SubscriptionRef.get(ref), (map) => map as ReadonlyMap<K, V>),
      () => getChanges(),
    );

    const signalMap: SignalMap<K, V> = {
      set: (key, value) =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          map.set(key, value);
          yield* notify;
        }),

      get: (key) =>
        Effect.gen(function* () {
          const map = yield* SubscriptionRef.get(ref);
          return map.get(key);
        }),

      has: (key) =>
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

      // Derived readables
      size: readable.map((map) => map.size),
      entries: readable.map((map) => [...map.entries()]),
      keys: readable.map((map) => [...map.keys()]),
      values: readable.map((map) => [...map.values()]),

      readable,
    };

    return signalMap;
  });

/**
 * SignalMap namespace.
 */
export const SignalMap = {
  make,
};
