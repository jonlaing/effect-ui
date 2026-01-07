import { Effect, Either, Option, Scope, Stream } from "effect";
import type { Readable } from "../Readable";
import { make as makeReadable, combine as combineReadable } from "../Readable";
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
    const isLoadingSignal = yield* makeSignal(true);
    const valueSignal = yield* makeSignal<Option.Option<A>>(Option.none());
    const errorSignal = yield* makeSignal<Option.Option<E>>(Option.none());

    const scope = yield* Effect.scope;

    const runComputation = (values: ReadableValues<T>): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* isLoadingSignal.set(true);
        yield* errorSignal.set(Option.none());

        const result = yield* compute(values).pipe(Effect.either);

        if (Either.isRight(result)) {
          const newValue = result.right;
          const currentValue = yield* valueSignal.get;
          const shouldUpdate =
            Option.isNone(currentValue) ||
            !equals(currentValue.value, newValue);
          if (shouldUpdate) {
            yield* valueSignal.set(Option.some(newValue));
          }
        } else {
          yield* errorSignal.set(Option.some(result.left));
        }

        yield* isLoadingSignal.set(false);
      });

    // Run initial computation
    const initialValues = yield* getCurrentValues(deps);
    yield* runComputation(initialValues);

    // Set up subscription to dependency changes
    let changesStream = combineReadables(deps).pipe(Stream.drop(1));

    // Apply debounce before processing if configured
    if (strategy === "debounce" && debounceMs > 0) {
      changesStream = Stream.debounce(changesStream, debounceMs);
    }

    // For abort strategy, use flatMap with switch to cancel in-flight computations
    // For other strategies, use sequential mapEffect
    const processedStream =
      strategy === "abort"
        ? changesStream.pipe(
            Stream.flatMap(
              (values) => Stream.fromEffect(runComputation(values)),
              { switch: true },
            ),
          )
        : changesStream.pipe(Stream.mapEffect(runComputation));

    // Fork the stream processing to run in background
    yield* Stream.runDrain(processedStream).pipe(Effect.forkIn(scope));

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
 * Combine multiple boolean Readables with AND logic.
 * Returns true only if ALL inputs are true.
 *
 * @param deps - Array of boolean Readables to combine
 * @returns A Readable that is true when all inputs are true
 *
 * @example
 * ```ts
 * const canSubmit = Derived.every([isValid, isOnline, hasChanges]);
 * // canSubmit is true only when all three are true
 * ```
 */
export const every = (deps: Readable<boolean>[]): Readable<boolean> =>
  combineReadable(deps).map((values) => values.every(Boolean));

/**
 * Combine multiple boolean Readables with OR logic.
 * Returns true if ANY input is true.
 *
 * @param deps - Array of boolean Readables to combine
 * @returns A Readable that is true when at least one input is true
 *
 * @example
 * ```ts
 * const hasError = Derived.some([nameError, emailError, passwordError]);
 * // hasError is true if any field has an error
 *
 * // Also useful for combining disabled states:
 * const isDisabled = Derived.some([ctx.disabled, props.disabled]);
 * ```
 */
export const some = (deps: Readable<boolean>[]): Readable<boolean> =>
  combineReadable(deps).map((values) => values.some(Boolean));

/**
 * Derived module namespace for creating computed reactive values.
 */
export const Derived = {
  sync,
  async,
  every,
  some,
};
