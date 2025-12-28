import { Effect, Fiber, Option, Scope, Stream } from "effect";
import type { Readable } from "../Readable";
import { make as makeReadable } from "../Readable";
import type {
  AsyncDerived,
  AsyncDerivedOptions,
  AsyncState,
  DerivedOptions,
  ReadableValues,
} from "./types";
import {
  awaitAsyncState,
  combineReadables,
  defaultEquals,
  exitToAsyncState,
  getCurrentValues,
  makeLoadingState,
  makeReloadingState,
} from "./helpers";

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
 * // userData.get returns AsyncState with isLoading, value, and error
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
    let currentState: AsyncState<A, E> = makeLoadingState();
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

    const runComputation = (
      values: ReadableValues<T>,
    ): Effect.Effect<AsyncState<A, E>> =>
      Effect.gen(function* () {
        yield* abortCurrentFiber;
        currentState = makeReloadingState(currentState);

        const fiber = yield* Effect.forkIn(compute(values), scope);
        currentFiber = fiber;

        const exit = yield* Fiber.await(fiber);
        currentFiber = null;
        currentState = exitToAsyncState(currentState, exit, equals);

        return currentState;
      });

    const initialValues = yield* getCurrentValues(deps);
    currentState = yield* runComputation(initialValues);

    const getChangesStream = () => {
      const baseStream = combineReadables(deps).pipe(
        Stream.drop(1),
        Stream.mapEffect(runComputation),
      );

      if (strategy === "debounce" && debounceMs > 0) {
        return Stream.debounce(baseStream, debounceMs);
      }

      return baseStream;
    };

    const readable = makeReadable(
      Effect.sync(() => currentState),
      getChangesStream,
    );

    return {
      ...readable,
      await: awaitAsyncState(() => currentState),
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
