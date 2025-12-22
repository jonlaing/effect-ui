import { Effect, Scope, SubscriptionRef } from "effect";

import type { Readable } from "./Readable.js";
import { Readable as ReadableNS } from "./Readable.js";

/**
 * A reactive Set with mutation methods that trigger updates.
 * Mutations happen in-place without cloning, then trigger reactive updates.
 *
 * @template T - The value type
 *
 * @example
 * ```ts
 * const tags = yield* Signal.Set.make<string>();
 *
 * // Mutations
 * yield* tags.add("important");
 * yield* tags.delete("draft");
 * yield* tags.toggle("featured");  // add if missing, remove if present
 *
 * // Reads
 * const hasTag = yield* tags.has("important");
 *
 * // Derived readables for UI binding
 * tags.size    // Readable<number>
 * tags.values  // Readable<readonly T[]>
 * ```
 */
export interface SignalSet<T> {
  /**
   * Add a value to the set.
   */
  readonly add: (value: T) => Effect.Effect<void>;

  /**
   * Check if a value exists.
   */
  readonly has: (value: T) => Effect.Effect<boolean>;

  /**
   * Delete a value. Returns true if the value existed.
   */
  readonly delete: (value: T) => Effect.Effect<boolean>;

  /**
   * Toggle a value: add if missing, remove if present.
   * Returns true if the value is now in the set.
   */
  readonly toggle: (value: T) => Effect.Effect<boolean>;

  /**
   * Remove all values.
   */
  readonly clear: () => Effect.Effect<void>;

  /**
   * Replace the entire set contents.
   */
  readonly replace: (set: ReadonlySet<T> | Iterable<T>) => Effect.Effect<void>;

  /**
   * Update the set using a function.
   */
  readonly update: (
    f: (set: ReadonlySet<T>) => ReadonlySet<T> | Iterable<T>,
  ) => Effect.Effect<void>;

  /**
   * Reactive size of the set.
   */
  readonly size: Readable<number>;

  /**
   * Reactive array of values.
   */
  readonly values: Readable<readonly T[]>;

  /**
   * The underlying readable for use with Readable.combine(), etc.
   */
  readonly readable: Readable<ReadonlySet<T>>;
}

/**
 * Create a new SignalSet with optional initial values.
 *
 * @param initial - Initial values as a Set or iterable
 */
export const make = <T>(
  initial?: ReadonlySet<T> | Iterable<T>,
): Effect.Effect<SignalSet<T>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const initialSet = initial ? new Set(initial) : new Set<T>();
    const ref = yield* SubscriptionRef.make(initialSet);

    const getChanges = () => ref.changes;

    // Helper to trigger update after mutation
    const notify = Effect.gen(function* () {
      const set = yield* SubscriptionRef.get(ref);
      yield* SubscriptionRef.set(ref, set);
    });

    // Build the base Readable
    const readable = ReadableNS.make(
      Effect.map(SubscriptionRef.get(ref), (set) => set as ReadonlySet<T>),
      () => getChanges(),
    );

    const signalSet: SignalSet<T> = {
      add: (value) =>
        Effect.gen(function* () {
          const set = yield* SubscriptionRef.get(ref);
          const hadValue = set.has(value);
          set.add(value);
          if (!hadValue) {
            yield* notify;
          }
        }),

      has: (value) =>
        Effect.gen(function* () {
          const set = yield* SubscriptionRef.get(ref);
          return set.has(value);
        }),

      delete: (value) =>
        Effect.gen(function* () {
          const set = yield* SubscriptionRef.get(ref);
          const existed = set.delete(value);
          if (existed) {
            yield* notify;
          }
          return existed;
        }),

      toggle: (value) =>
        Effect.gen(function* () {
          const set = yield* SubscriptionRef.get(ref);
          if (set.has(value)) {
            set.delete(value);
            yield* notify;
            return false;
          } else {
            set.add(value);
            yield* notify;
            return true;
          }
        }),

      clear: () =>
        Effect.gen(function* () {
          const set = yield* SubscriptionRef.get(ref);
          if (set.size > 0) {
            set.clear();
            yield* notify;
          }
        }),

      replace: (newSet) =>
        Effect.gen(function* () {
          yield* SubscriptionRef.set(ref, new Set(newSet));
        }),

      update: (f) =>
        Effect.gen(function* () {
          const current = yield* SubscriptionRef.get(ref);
          const next = f(current);
          yield* SubscriptionRef.set(ref, new Set(next));
        }),

      // Derived readables
      size: readable.map((set) => set.size),
      values: readable.map((set) => [...set]),

      readable,
    };

    return signalSet;
  });

/**
 * SignalSet namespace.
 */
export const SignalSet = {
  make,
};
