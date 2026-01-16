import { Context, Effect, Layer, Scope, SubscriptionRef } from "effect";

import { defaultEquals } from "./Derived/helpers.js";
import { Readable as ReadableNS, type Readable } from "./Readable.js";
import {
  SignalArray,
  type SignalArray as SignalArrayType,
} from "./SignalArray.js";
import { SignalMap, type SignalMap as SignalMapType } from "./SignalMap.js";
import { SignalSet, type SignalSet as SignalSetType } from "./SignalSet.js";

/**
 * A mutable reactive value that extends Readable with write capabilities.
 * @template A - The type of the value
 */
export interface Signal<A> extends Readable<A> {
  /** Set the signal to a new value */
  readonly set: (a: A) => Effect.Effect<void>;
  /** Update the signal value using a function */
  readonly update: (f: (a: A) => A) => Effect.Effect<void>;
}

/**
 * @category models
 */
export declare namespace Signal {
  /**
   * A mutable reactive value that extends Readable with write capabilities.
   * @template A - The type of the value
   */
  export interface Signal<A> extends Readable<A> {
    /** Set the signal to a new value */
    readonly set: (a: A) => Effect.Effect<void>;
    /** Update the signal value using a function */
    readonly update: (f: (a: A) => A) => Effect.Effect<void>;
  }

  /**
   * Options for creating a Signal.
   * @template A - The type of the value
   */
  export interface Options<A> {
    /** Custom equality function to determine if the value has changed */
    readonly equals?: (a: A, b: A) => boolean;
  }
}

/**
 * Options for creating a Signal.
 * @template A - The type of the value
 */
export interface SignalOptions<A> {
  /** Custom equality function to determine if the value has changed */
  readonly equals?: (a: A, b: A) => boolean;
}

/**
 * Create a new Signal with an initial value.
 * @param initial - The initial value
 * @param options - Optional configuration
 */
export const make = <A>(
  initial: A,
  options?: SignalOptions<A>,
): Effect.Effect<Signal<A>, never, Scope.Scope> => {
  const equals = options?.equals ?? defaultEquals;

  return Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make(initial);

    // Use ref.changes to get a stream that receives all future updates
    const getChanges = () => ref.changes;

    const readable = ReadableNS.make(SubscriptionRef.get(ref), getChanges);

    const signal: Signal<A> = {
      ...readable,
      set: (a) =>
        Effect.gen(function* () {
          const current = yield* SubscriptionRef.get(ref);
          if (!equals(current, a)) {
            yield* SubscriptionRef.set(ref, a);
          }
        }),
      update: (f) =>
        Effect.gen(function* () {
          const current = yield* SubscriptionRef.get(ref);
          const next = f(current);
          if (!equals(current, next)) {
            yield* SubscriptionRef.set(ref, next);
          }
        }),
    };

    return signal;
  });
};

/**
 * Use an existing Signal if provided, otherwise create a new one with the default value.
 * This enables the controlled/uncontrolled component pattern.
 *
 * @param existing - An optional Signal to use if provided
 * @param defaultValue - The default value to use when creating a new Signal
 * @param options - Optional configuration for the new Signal
 *
 * @example
 * ```ts
 * // In a component that supports both controlled and uncontrolled modes:
 * const value = yield* Signal.fromNullable(props.value, props.defaultValue ?? "");
 *
 * // If props.value is a Signal, it will be used directly
 * // If props.value is undefined, a new Signal is created with defaultValue
 * ```
 */
export const fromNullable = <A>(
  existing: Signal<A> | undefined,
  defaultValue: A,
  options?: SignalOptions<A>,
): Effect.Effect<Signal<A>, never, Scope.Scope> =>
  existing !== undefined
    ? Effect.succeed(existing)
    : make(defaultValue, options);

/**
 * Create a Signal from a reactive value (Signal, Readable, or plain value).
 *
 * - If input is already a Signal, returns it as-is
 * - If input is a Readable, creates a new Signal initialized with the Readable's current value
 * - If input is a plain value, creates a new Signal with that value
 *
 * This is useful for controlled/uncontrolled component patterns where a prop
 * can be either a Signal (controlled), a Readable, or a plain value (uncontrolled).
 *
 * @param value - A Signal, Readable, or plain value
 * @param defaultValue - Default value to use if the input value is undefined
 * @param options - Optional configuration for the new Signal
 *
 * @example
 * ```ts
 * // In a component that accepts flexible input:
 * interface CheckboxProps {
 *   checked?: Signal<boolean> | Readable<boolean> | boolean;
 *   defaultChecked?: boolean;
 * }
 *
 * const Checkbox = (props: CheckboxProps) =>
 *   Effect.gen(function* () {
 *     // Works with Signal (controlled), Readable, or boolean (uncontrolled)
 *     const checked = yield* Signal.fromReactive(
 *       props.checked,
 *       props.defaultChecked ?? false
 *     );
 *   });
 * ```
 */
export const fromReactive = <A>(
  value: Signal<A> | Readable<A> | A | undefined,
  defaultValue: A,
  options?: SignalOptions<A>,
): Effect.Effect<Signal<A>, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Handle undefined - use default value
    if (value === undefined) {
      return yield* make(defaultValue, options);
    }

    // Check if it's a Signal (has both get and set)
    if (
      typeof value === "object" &&
      value !== null &&
      "get" in value &&
      "set" in value
    ) {
      return value as Signal<A>;
    }

    // Check if it's a Readable (has get but not set)
    if (
      typeof value === "object" &&
      value !== null &&
      "get" in value &&
      !("set" in value)
    ) {
      const readable = value as Readable<A>;
      const currentValue = yield* readable.get;
      return yield* make(currentValue ?? defaultValue, options);
    }

    // Otherwise, it's a plain value
    return yield* make(value as A, options);
  });

/**
 * Context service for creating and managing Signals within a scope.
 */
export class SignalRegistry extends Context.Tag("effex/SignalRegistry")<
  SignalRegistry,
  {
    readonly make: <A>(
      initial: A,
      options?: SignalOptions<A>,
    ) => Effect.Effect<Signal<A>, never, Scope.Scope>;
    readonly scoped: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>;
  }
>() {
  static Live = Layer.succeed(SignalRegistry, {
    make: (initial, options) => make(initial, options),
    scoped: (effect) => Effect.scoped(effect),
  });
}

export const Signal = {
  make,
  fromNullable,
  fromReactive,
  SignalRegistry,
  /**
   * Create a reactive array with in-place mutation methods.
   * @see SignalArray
   */
  Array: SignalArray,
  /**
   * Create a reactive Map with in-place mutation methods.
   * @see SignalMap
   */
  Map: SignalMap,
  /**
   * Create a reactive Set with in-place mutation methods.
   * @see SignalSet
   */
  Set: SignalSet,
};

// Re-export types for convenience
export type { SignalArrayType as SignalArray };
export type { SignalMapType as SignalMap };
export type { SignalSetType as SignalSet };
