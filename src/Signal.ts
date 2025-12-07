import {
  Context,
  Effect,
  Layer,
  Scope,
  SubscriptionRef,
} from "effect";
import type { Readable } from "./Readable.js";
import { make as makeReadable } from "./Readable.js";

export interface Signal<A> extends Readable<A> {
  readonly set: (a: A) => Effect.Effect<void>;
  readonly update: (f: (a: A) => A) => Effect.Effect<void>;
}

export interface SignalOptions<A> {
  readonly equals?: (a: A, b: A) => boolean;
}

const defaultEquals = <A>(a: A, b: A): boolean => a === b;

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

export const Signal = {
  make,
  SignalRegistry,
};
