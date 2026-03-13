import { Effect, Either, Option, Pipeable, Predicate, Scope } from "effect";

import { Readable } from "./Readable.js";
import { make as makeSignal } from "./Signal.js";

// -----------------------------------------------------------------------------
// TypeId
// -----------------------------------------------------------------------------

export const MutationTypeId: unique symbol = Symbol.for("effex/Mutation");
export type MutationTypeId = typeof MutationTypeId;

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Check if a value is a Mutation.
 */
export const isMutation = (
  value: unknown,
): value is Mutation<unknown, unknown, unknown> =>
  Predicate.hasProperty(value, MutationTypeId);

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

/**
 * A reactive mutation that tracks loading, data, and error states.
 * Unlike AsyncReadable, mutations are triggered explicitly via `run(input)`.
 *
 * @template I - The input type
 * @template O - The output/data type
 * @template E - The error type
 *
 * @example
 * ```ts
 * const createUser = yield* Mutation.make((userData: CreateUserInput) =>
 *   Effect.gen(function* () {
 *     const response = yield* api.createUser(userData)
 *     return response.user
 *   })
 * )
 *
 * // Reactive state properties
 * createUser.isLoading  // Readable<boolean>
 * createUser.data       // Readable<Option<User>>
 * createUser.error      // Readable<Option<E>>
 *
 * // Execute the mutation
 * const user = yield* createUser.run({ name: "Alice", email: "alice@example.com" })
 *
 * // Reset to initial state
 * yield* createUser.reset()
 * ```
 */
export interface Mutation<I, O, E = never> extends Pipeable.Pipeable {
  readonly [MutationTypeId]: MutationTypeId;

  /**
   * Whether the mutation is currently running.
   */
  readonly isLoading: Readable.Readable<boolean>;

  /**
   * The most recent successful result, if any.
   */
  readonly data: Readable.Readable<Option.Option<O>>;

  /**
   * The most recent error, if any.
   */
  readonly error: Readable.Readable<Option.Option<E>>;

  /**
   * Execute the mutation with the given input.
   * Returns the result on success, or fails with the error.
   */
  readonly run: (input: I) => Effect.Effect<O, E>;

  /**
   * Reset to initial state: isLoading=false, data=None, error=None.
   */
  readonly reset: () => Effect.Effect<void>;
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Create a Mutation from an Effect-returning execute function.
 *
 * @param execute - Function that takes input and returns an Effect
 *
 * @example
 * ```ts
 * const createUser = yield* Mutation.make((userData: CreateUserInput) =>
 *   Effect.gen(function* () {
 *     const response = yield* api.createUser(userData)
 *     return response.user
 *   })
 * )
 *
 * const user = yield* createUser.run({ name: "Alice" })
 * ```
 */
export const make = <I, O, E = never, R = never>(
  execute: (input: I) => Effect.Effect<O, E, R>,
): Effect.Effect<Mutation<I, O, E>, never, Scope.Scope | R> =>
  Effect.gen(function* () {
    const isLoadingSignal = yield* makeSignal(false);
    const dataSignal = yield* makeSignal<Option.Option<O>>(Option.none());
    const errorSignal = yield* makeSignal<Option.Option<E>>(Option.none());

    const runMutation = (input: I): Effect.Effect<O, E, R> =>
      Effect.gen(function* () {
        yield* isLoadingSignal.set(true);
        yield* errorSignal.set(Option.none());

        const result = yield* execute(input).pipe(Effect.either);

        if (Either.isRight(result)) {
          yield* dataSignal.set(Option.some(result.right));
          yield* isLoadingSignal.set(false);
          return result.right;
        } else {
          yield* errorSignal.set(Option.some(result.left));
          yield* isLoadingSignal.set(false);
          return yield* Effect.fail(result.left);
        }
      });

    const resetEffect = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* isLoadingSignal.set(false);
        yield* dataSignal.set(Option.none());
        yield* errorSignal.set(Option.none());
      });

    const mutation: Mutation<I, O, E> = {
      [MutationTypeId]: MutationTypeId,

      pipe() {
        return Pipeable.pipeArguments(this, arguments);
      },

      isLoading: isLoadingSignal,
      data: dataSignal,
      error: errorSignal,
      run: (input) => runMutation(input) as Effect.Effect<O, E>,
      reset: resetEffect,
    };

    return mutation;
  });

/**
 * Create a Mutation from a Promise-returning function.
 *
 * @param execute - Function that takes input and returns a Promise
 *
 * @example
 * ```ts
 * const createUser = yield* Mutation.promise((userData: CreateUserInput) =>
 *   fetch('/api/users', {
 *     method: 'POST',
 *     body: JSON.stringify(userData)
 *   }).then(r => r.json())
 * )
 * ```
 */
export const promise = <I, O>(
  execute: (input: I) => Promise<O>,
): Effect.Effect<Mutation<I, O, never>, never, Scope.Scope> =>
  make((input: I) => Effect.promise(() => execute(input)));

/**
 * Create a Mutation from a Promise-returning function with error handling.
 *
 * @param execute - Function that takes input and returns a Promise
 * @param onError - Function to transform caught errors
 *
 * @example
 * ```ts
 * const createUser = yield* Mutation.tryPromise(
 *   (userData: CreateUserInput) =>
 *     fetch('/api/users', {
 *       method: 'POST',
 *       body: JSON.stringify(userData)
 *     }).then(r => r.json()),
 *   (error) => new ApiError(error)
 * )
 * ```
 */
export const tryPromise = <I, O, E>(
  execute: (input: I) => Promise<O>,
  onError: (error: unknown) => E,
): Effect.Effect<Mutation<I, O, E>, never, Scope.Scope> =>
  make((input: I) =>
    Effect.tryPromise({ try: () => execute(input), catch: onError }),
  );

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

/**
 * Map the successful data of a Mutation.
 *
 * @param f - Function to transform the data
 *
 * @example
 * ```ts
 * const createUser = yield* Mutation.make(createUserApi)
 * const createUserName = createUser.pipe(Mutation.map(user => user.name))
 * ```
 */
export const map: {
  <O, O2>(
    f: (o: O) => O2,
  ): <I, E>(self: Mutation<I, O, E>) => Mutation<I, O2, E>;
  <I, O, E, O2>(self: Mutation<I, O, E>, f: (o: O) => O2): Mutation<I, O2, E>;
} = <I, O, O2, E>(
  ...args: [f: (o: O) => O2] | [self: Mutation<I, O, E>, f: (o: O) => O2]
): any => {
  if (args.length === 1) {
    const [f] = args;
    return (self: Mutation<I, O, E>) => mapImpl(self, f);
  }
  const [self, f] = args;
  return mapImpl(self, f);
};

const mapImpl = <I, O, E, O2>(
  self: Mutation<I, O, E>,
  f: (o: O) => O2,
): Mutation<I, O2, E> => {
  const mappedData = self.data.pipe(Readable.map((opt) => Option.map(opt, f)));

  return {
    [MutationTypeId]: MutationTypeId,

    pipe() {
      return Pipeable.pipeArguments(this, arguments);
    },

    isLoading: self.isLoading,
    data: mappedData,
    error: self.error,
    run: (input) => Effect.map(self.run(input), f),
    reset: self.reset,
  };
};

/**
 * Chain mutations together, running the second after the first succeeds.
 *
 * @param f - Function that takes the first result and returns a new Mutation
 *
 * @example
 * ```ts
 * const createUser = yield* Mutation.make(createUserApi)
 * const createAndVerify = createUser.pipe(
 *   Mutation.flatMap(user => verifyEmailMutation)
 * )
 * ```
 */
export const flatMap: {
  <O, I2, O2, E2>(
    f: (o: O) => Mutation<I2, O2, E2>,
  ): <I, E>(self: Mutation<I, O, E>) => Mutation<I, O2, E | E2>;
  <I, O, E, I2, O2, E2>(
    self: Mutation<I, O, E>,
    f: (o: O) => Mutation<I2, O2, E2>,
  ): Mutation<I, O2, E | E2>;
} = <I, O, E, I2, O2, E2>(
  ...args:
    | [f: (o: O) => Mutation<I2, O2, E2>]
    | [self: Mutation<I, O, E>, f: (o: O) => Mutation<I2, O2, E2>]
): any => {
  if (args.length === 1) {
    const [f] = args;
    return (self: Mutation<I, O, E>) => flatMapImpl(self, f);
  }
  const [self, f] = args;
  return flatMapImpl(self, f);
};

const flatMapImpl = <I, O, E, I2, O2, E2>(
  self: Mutation<I, O, E>,
  f: (o: O) => Mutation<I2, O2, E2>,
): Mutation<I, O2, E | E2> => {
  // For flatMap, we need to create a new mutation that:
  // 1. Runs the first mutation
  // 2. Uses the result to get the second mutation
  // 3. Runs the second mutation (but it needs input I2, which we don't have)
  //
  // The signature in the plan seems off - if we flatMap to Mutation<I2, O2, E2>,
  // we'd need to provide I2 somewhere. Looking at the signature more carefully:
  // run: (input: I) => Effect<O2, E | E2>
  //
  // This means we run the first with input I, get O, then need to run second with I2.
  // But we don't have I2. The plan might expect the second mutation to be a "unit" mutation
  // or we need to rethink this.
  //
  // For now, let's implement it where the second mutation takes Unit (void) input:
  // Actually looking at the signature again, it returns Mutation<I, O2, E | E2>
  // So input stays as I. The f function creates a mutation but we need to run it.
  // If the created mutation needs no input (or unit), this works.

  return {
    [MutationTypeId]: MutationTypeId,

    pipe() {
      return Pipeable.pipeArguments(this, arguments);
    },

    isLoading: self.isLoading,
    data: self.data.pipe(Readable.map(() => Option.none<O2>())),
    error: self.error as Readable.Readable<Option.Option<E | E2>>,
    run: (input: I) =>
      Effect.gen(function* () {
        const result = yield* self.run(input);
        const nextMutation = f(result);
        // Note: This assumes the next mutation takes void/unit input
        // A more complete implementation would need to handle this differently
        return yield* nextMutation.run(undefined as I2);
      }),
    reset: self.reset,
  };
};

// -----------------------------------------------------------------------------
// Namespace
// -----------------------------------------------------------------------------

/**
 * Mutation namespace.
 */
export const Mutation = {
  MutationTypeId,
  isMutation,
  make,
  promise,
  tryPromise,
  map,
  flatMap,
};
