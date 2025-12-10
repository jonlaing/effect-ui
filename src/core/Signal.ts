import { Context, Effect, Layer, Scope, SubscriptionRef } from "effect";

import type { Readable } from "./Readable.js";
import { make as makeReadable } from "./Readable.js";
import { defaultEquals } from "./Derived/helpers.js";

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

    const readable = makeReadable(SubscriptionRef.get(ref), getChanges);

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
 * Context service for creating and managing Signals within a scope.
 */
export class SignalRegistry extends Context.Tag("effect-ui/SignalRegistry")<
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

/**
 * Signal module namespace containing factory functions.
 */
export const Signal = {
  make,
  SignalRegistry,
};
