import { Effect, Scope, SubscriptionRef } from "effect";

import type { Signal } from "./Signal.js";
import type { Readable } from "./Readable.js";
import { Readable as ReadableNS } from "./Readable.js";

/**
 * A reactive array that extends Signal with array-specific mutation methods.
 * Mutations happen in-place without cloning, then trigger reactive updates.
 *
 * @template T - The type of array elements
 *
 * @example
 * ```ts
 * const todos = yield* Signal.Array.make<Todo>([]);
 *
 * // In-place mutations
 * yield* todos.push({ id: 1, text: "Learn Effex", done: false });
 * yield* todos.removeAt(0);
 *
 * // Transform entire array (inherited from Signal)
 * yield* todos.update(arr => arr.filter(t => !t.done));
 *
 * // Use with Control.each
 * Control.each(todos, t => t.id, renderTodo)
 * ```
 */
export interface SignalArray<T> extends Signal<readonly T[]> {
  /**
   * Add one or more elements to the end of the array.
   */
  readonly push: (...items: T[]) => Effect.Effect<void>;

  /**
   * Remove and return the last element.
   */
  readonly pop: () => Effect.Effect<T | undefined>;

  /**
   * Add one or more elements to the beginning of the array.
   */
  readonly unshift: (...items: T[]) => Effect.Effect<void>;

  /**
   * Remove and return the first element.
   */
  readonly shift: () => Effect.Effect<T | undefined>;

  /**
   * Insert, remove, or replace elements at a specific index.
   * Mirrors Array.prototype.splice.
   */
  readonly splice: (
    start: number,
    deleteCount?: number,
    ...items: T[]
  ) => Effect.Effect<readonly T[]>;

  /**
   * Insert an element at a specific index.
   */
  readonly insertAt: (index: number, item: T) => Effect.Effect<void>;

  /**
   * Remove the element at a specific index.
   */
  readonly removeAt: (index: number) => Effect.Effect<T | undefined>;

  /**
   * Remove the first occurrence of an element (by reference equality).
   * Returns true if the element was found and removed.
   */
  readonly remove: (item: T) => Effect.Effect<boolean>;

  /**
   * Move an element from one index to another.
   * Useful for drag-and-drop reordering.
   */
  readonly move: (fromIndex: number, toIndex: number) => Effect.Effect<void>;

  /**
   * Sort the array in-place.
   */
  readonly sort: (compareFn?: (a: T, b: T) => number) => Effect.Effect<void>;

  /**
   * Reverse the array in-place.
   */
  readonly reverse: () => Effect.Effect<void>;

  /**
   * Remove all elements from the array.
   */
  readonly clear: () => Effect.Effect<void>;

  /**
   * Reactive length of the array.
   */
  readonly length: Readable<number>;
}

/**
 * Create a new SignalArray with an optional initial value.
 *
 * @param initial - The initial array (defaults to empty)
 */
export const make = <T>(
  initial: readonly T[] = [],
): Effect.Effect<SignalArray<T>, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Use a mutable array internally
    const ref = yield* SubscriptionRef.make<T[]>([...initial]);

    const getChanges = () => ref.changes;

    // Helper to trigger update after mutation
    const notify = Effect.gen(function* () {
      const arr = yield* SubscriptionRef.get(ref);
      yield* SubscriptionRef.set(ref, arr);
    });

    // Build the base Readable
    const readable = ReadableNS.make(
      Effect.map(SubscriptionRef.get(ref), (arr) => arr as readonly T[]),
      () => getChanges(),
    );

    const signalArray: SignalArray<T> = {
      // Readable interface
      get: readable.get,
      changes: readable.changes,
      values: readable.values,
      map: readable.map,

      // Signal interface
      set: (arr) =>
        Effect.gen(function* () {
          yield* SubscriptionRef.set(ref, [...arr]);
        }),

      update: (f) =>
        Effect.gen(function* () {
          const current = yield* SubscriptionRef.get(ref);
          const next = f(current);
          yield* SubscriptionRef.set(ref, [...next]);
        }),

      // Array-specific mutations
      push: (...items) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          arr.push(...items);
          yield* notify;
        }),

      pop: () =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          const item = arr.pop();
          yield* notify;
          return item;
        }),

      unshift: (...items) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          arr.unshift(...items);
          yield* notify;
        }),

      shift: () =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          const item = arr.shift();
          yield* notify;
          return item;
        }),

      splice: (start, deleteCount = 0, ...items) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          const removed = arr.splice(start, deleteCount, ...items);
          yield* notify;
          return removed;
        }),

      insertAt: (index, item) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          arr.splice(index, 0, item);
          yield* notify;
        }),

      removeAt: (index) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          if (index < 0 || index >= arr.length) {
            return undefined;
          }
          const [removed] = arr.splice(index, 1);
          yield* notify;
          return removed;
        }),

      remove: (item) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          const index = arr.indexOf(item);
          if (index === -1) {
            return false;
          }
          arr.splice(index, 1);
          yield* notify;
          return true;
        }),

      move: (fromIndex, toIndex) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          if (
            fromIndex < 0 ||
            fromIndex >= arr.length ||
            toIndex < 0 ||
            toIndex >= arr.length
          ) {
            return;
          }
          const [item] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, item);
          yield* notify;
        }),

      sort: (compareFn) =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          arr.sort(compareFn);
          yield* notify;
        }),

      reverse: () =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          arr.reverse();
          yield* notify;
        }),

      clear: () =>
        Effect.gen(function* () {
          const arr = yield* SubscriptionRef.get(ref);
          arr.length = 0;
          yield* notify;
        }),

      // Derived readable
      length: readable.map((arr) => arr.length),
    };

    return signalArray;
  });

/**
 * SignalArray namespace.
 */
export const SignalArray = {
  make,
};
