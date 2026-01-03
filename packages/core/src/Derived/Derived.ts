import {
  Cause,
  Chunk,
  Effect,
  Exit,
  Fiber,
  Option,
  Scope,
  Stream,
} from "effect";
import type { Readable } from "../Readable";
import { make as makeReadable } from "../Readable";
import { make as makeSignal } from "../Signal";
import type {
  AsyncDerived,
  AsyncDerivedOptions,
  DerivedOptions,
  ReadableValues,
} from "./types";
import { combineReadables, defaultEquals, getCurrentValues } from "./helpers";

/**
 * Create a synchronous derived value that recomputes when dependencies change.
 * @param deps - Array of Readable dependencies
 * @param compute - Function to compute the derived value from dependency values
 * @param options - Optional configuration
 *
 * @example
 * ```ts
 * const count = yield* Signal.make(5)
 * const doubled = yield* Derived.sync([count], ([n]) => n * 2)
 * // doubled.get returns 10
 * ```
 */
export const sync = <T extends readonly Readable<unknown>[], B>(
  deps: T,
  compute: (values: ReadableValues<T>) => B,
  options?: DerivedOptions<B>,
): Effect.Effect<Readable<B>, never, Scope.Scope> => {
  const equals = options?.equals ?? defaultEquals;

  return Effect.gen(function* () {
    const initialValues = yield* getCurrentValues(deps);
    let currentValue = compute(initialValues);

    // Get always re-computes from current dependency values
    // This ensures correct values during SSR where streams aren't subscribed
    const get = getCurrentValues(deps).pipe(Effect.map(compute));

    // Create a fresh stream for each subscriber
    const getChangesStream = () =>
      combineReadables(deps).pipe(
        Stream.drop(1),
        Stream.map(compute),
        Stream.filterMap((next) => {
          if (equals(currentValue, next)) {
            return Option.none();
          }
          currentValue = next;
          return Option.some(next);
        }),
      );

    return makeReadable(get, getChangesStream);
  });
};

/**
 * Create an asynchronous derived value that recomputes when dependencies change.
 * @param deps - Array of Readable dependencies
 * @param compute - Effect-returning function to compute the derived value
 * @param options - Optional configuration including concurrency strategy
 *
 * @example
 * ```ts
 * const userId = yield* Signal.make(1)
 * const userData = yield* Derived.async([userId], ([id]) =>
 *   Effect.gen(function* () {
 *     const response = yield* fetchUser(id)
 *     return response.data
 *   })
 * )
 * // userData.isLoading, userData.value, userData.error are all Readables
 * ```
 */
export const async = <T extends readonly Readable<unknown>[], A, E = never>(
  deps: T,
  compute: (values: ReadableValues<T>) => Effect.Effect<A, E>,
  options?: AsyncDerivedOptions<A>,
): Effect.Effect<AsyncDerived<A, E>, never, Scope.Scope> => {
  const strategy = options?.strategy ?? "abort";
  const debounceMs = options?.debounceMs ?? 0;
  const equals = options?.equals ?? defaultEquals;

  return Effect.gen(function* () {
    // Create separate signals for each piece of state
    const isLoadingSignal = yield* makeSignal(true);
    const valueSignal = yield* makeSignal<Option.Option<A>>(Option.none());
    const errorSignal = yield* makeSignal<Option.Option<E>>(Option.none());

    let currentFiber: Fiber.RuntimeFiber<A, E> | null = null;
    const scope = yield* Effect.scope;

    const abortCurrentFiber = Effect.suspend(() => {
      if (strategy !== "abort" || currentFiber === null) {
        return Effect.void;
      }
      const fiber = currentFiber;
      currentFiber = null;
      return Fiber.interrupt(fiber);
    });

    const runComputation = (values: ReadableValues<T>): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* abortCurrentFiber;
        yield* isLoadingSignal.set(true);
        yield* errorSignal.set(Option.none());

        const fiber = yield* Effect.forkIn(compute(values), scope);
        currentFiber = fiber;

        const exit = yield* Fiber.await(fiber);
        currentFiber = null;

        if (Exit.isSuccess(exit)) {
          const newValue = exit.value;
          // Check equality before updating
          const currentValue = yield* valueSignal.get;
          const shouldUpdate =
            Option.isNone(currentValue) ||
            !equals(currentValue.value, newValue);
          if (shouldUpdate) {
            yield* valueSignal.set(Option.some(newValue));
          }
        } else {
          // Extract first error from cause
          const failures = Cause.failures(exit.cause);
          const firstFailure = Chunk.head(failures);
          yield* errorSignal.set(firstFailure);
        }

        yield* isLoadingSignal.set(false);
      });

    // Run initial computation
    const initialValues = yield* getCurrentValues(deps);
    yield* runComputation(initialValues);

    // Set up subscription to dependency changes
    const changesStream = combineReadables(deps).pipe(
      Stream.drop(1),
      Stream.mapEffect(runComputation),
    );

    const finalStream =
      strategy === "debounce" && debounceMs > 0
        ? Stream.debounce(changesStream, debounceMs)
        : changesStream;

    // Fork the stream processing to run in background
    yield* Stream.runDrain(finalStream).pipe(Effect.forkIn(scope));

    // Create the await effect
    const awaitEffect: Effect.Effect<A, E> = Effect.gen(function* () {
      const error = yield* errorSignal.get;
      if (Option.isSome(error)) {
        return yield* Effect.fail(error.value);
      }
      const value = yield* valueSignal.get;
      if (Option.isSome(value)) {
        return value.value;
      }
      return yield* Effect.fail(
        new Error("No value available") as unknown as E,
      );
    });

    return {
      isLoading: isLoadingSignal,
      value: valueSignal,
      error: errorSignal,
      await: awaitEffect,
    };
  });
};

/**
 * Derived module namespace for creating computed reactive values.
 */
export const Derived = {
  sync,
  async,
};
