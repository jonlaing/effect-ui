import { Effect, Pipeable, Predicate, Scope, SubscriptionRef } from "effect";

import { Readable, TypeId as ReadableTypeId } from "./Readable.js";
import { Signal, SignalTypeId } from "./Signal.js";

// -----------------------------------------------------------------------------
// TypeId
// -----------------------------------------------------------------------------

export const SignalStructTypeId: unique symbol =
  Symbol.for("effex/SignalStruct");
export type SignalStructTypeId = typeof SignalStructTypeId;

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Check if a value is a SignalStruct.
 */
export const isSignalStruct = (
  value: unknown,
): value is SignalStruct<Record<string, unknown>> =>
  Predicate.hasProperty(value, SignalStructTypeId);

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

/**
 * Base interface for SignalStruct operations.
 */
export interface SignalStructBase<
  T extends Record<string, unknown>,
> extends Readable.Readable<T> {
  readonly [SignalStructTypeId]: SignalStructTypeId;

  /**
   * Update multiple fields at once.
   * Only the specified fields are updated; others remain unchanged.
   */
  readonly update: (partial: Partial<T>) => Effect.Effect<void>;

  /**
   * Replace the entire struct value.
   */
  readonly replace: (value: T) => Effect.Effect<void>;

  /**
   * Get the list of field keys.
   */
  readonly keys: readonly (keyof T)[];
}

/**
 * Maps each key of T to a Signal for that field's value.
 */
export type SignalStructFields<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: Signal.Signal<T[K]>;
};

/**
 * A reactive struct with fixed keys, where each key is accessible as a Signal.
 * This allows granular updates to individual fields without reconstructing the whole object.
 *
 * @template T - The struct type (must be a Record)
 *
 * @example
 * ```ts
 * const address = yield* Signal.Struct.make({
 *   street: "123 Main St",
 *   city: "Austin",
 *   zip: "78701",
 * });
 *
 * // Access individual fields as Signals
 * yield* address.street.set("456 Oak Ave");
 * yield* address.city.set("Dallas");
 *
 * // Read whole struct
 * const value = yield* address.get; // { street: "456 Oak Ave", city: "Dallas", zip: "78701" }
 *
 * // Batch update multiple fields
 * yield* address.update({ street: "789 Pine Rd", city: "Houston" });
 *
 * // Replace entire struct
 * yield* address.replace({ street: "100 New St", city: "San Antonio", zip: "78201" });
 * ```
 */
export type SignalStruct<T extends Record<string, unknown>> =
  SignalStructBase<T> & SignalStructFields<T>;

/**
 * Create a new SignalStruct with an initial value.
 *
 * @param initial - The initial struct value
 */
export const make = <T extends Record<string, unknown>>(
  initial: T,
): Effect.Effect<SignalStruct<T>, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Use a mutable object internally
    const ref = yield* SubscriptionRef.make<T>({ ...initial });

    const getChanges = () => ref.changes;

    // Helper to trigger update after mutation
    const notify = Effect.gen(function* () {
      const obj = yield* SubscriptionRef.get(ref);
      yield* SubscriptionRef.set(ref, obj);
    });

    // Build the base Readable for the whole struct
    const readable = Readable.make(SubscriptionRef.get(ref), () =>
      getChanges(),
    );

    // Get the keys from the initial value
    const keys = Object.keys(initial) as (keyof T)[];

    // Create a Signal for each field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldSignals: Record<string, Signal.Signal<any>> = {};

    for (const key of keys) {
      // Create a derived readable for this field
      const fieldReadable = Readable.make(
        Effect.map(SubscriptionRef.get(ref), (obj) => obj[key]),
        () => Readable.map(readable, (obj) => obj[key as keyof T]).changes,
      );

      // Create a signal-like object for this field
      const fieldSignal: Signal.Signal<T[keyof T]> = {
        [ReadableTypeId]: ReadableTypeId,
        [SignalTypeId]: SignalTypeId,

        pipe() {
          return Pipeable.pipeArguments(this, arguments);
        },

        get: fieldReadable.get,
        changes: fieldReadable.changes,
        values: fieldReadable.values,

        set: (value: T[keyof T]) =>
          Effect.gen(function* () {
            const obj = yield* SubscriptionRef.get(ref);
            if (obj[key] !== value) {
              (obj as Record<string, unknown>)[key as string] = value;
              yield* notify;
            }
          }),

        update: (f: (a: T[keyof T]) => T[keyof T]) =>
          Effect.gen(function* () {
            const obj = yield* SubscriptionRef.get(ref);
            const current = obj[key] as T[keyof T];
            const next = f(current);
            if (current !== next) {
              (obj as Record<string, unknown>)[key as string] = next;
              yield* notify;
            }
          }),
      };

      fieldSignals[key as string] = fieldSignal;
    }

    // Build the SignalStruct object
    const signalStruct = {
      // TypeIds
      [ReadableTypeId]: ReadableTypeId,
      [SignalStructTypeId]: SignalStructTypeId,

      // Pipeable
      pipe() {
        return Pipeable.pipeArguments(this, arguments);
      },

      // Readable interface (for the whole struct)
      get: readable.get,
      changes: readable.changes,
      values: readable.values,

      // Field signals
      ...fieldSignals,

      // Struct-specific operations
      update: (partial: Partial<T>) =>
        Effect.gen(function* () {
          const obj = yield* SubscriptionRef.get(ref);
          let changed = false;
          for (const [key, value] of Object.entries(partial)) {
            if (obj[key as keyof T] !== value) {
              (obj as Record<string, unknown>)[key] = value;
              changed = true;
            }
          }
          if (changed) {
            yield* notify;
          }
        }),

      replace: (value: T) =>
        Effect.gen(function* () {
          yield* SubscriptionRef.set(ref, { ...value });
        }),

      keys,
    } as SignalStruct<T>;

    return signalStruct;
  });

/**
 * SignalStruct namespace.
 */
export const SignalStruct = {
  SignalStructTypeId,
  isSignalStruct,
  make,
};
