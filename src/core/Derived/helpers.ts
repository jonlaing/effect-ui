import { Cause, Chunk, Effect, Exit, Option, Stream } from "effect";
import type { Readable } from "../Readable";
import type { AsyncState, ReadableValues } from "./types";

/**
 * Default equality function using strict equality.
 */
export const defaultEquals = <A>(a: A, b: A): boolean => a === b;

/**
 * Combines multiple Readables into a single stream of value tuples.
 * Emits whenever any dependency changes, fetching current values from ALL
 * dependencies to ensure consistency.
 */
export const combineReadables = <T extends readonly Readable<unknown>[]>(
  readables: T,
): Stream.Stream<ReadableValues<T>> => {
  if (readables.length === 0) {
    return Stream.make([] as unknown as ReadableValues<T>);
  }

  if (readables.length === 1) {
    return Stream.map(
      readables[0].values,
      (a) => [a] as unknown as ReadableValues<T>,
    );
  }

  // Emit initial values once, then re-fetch all values whenever any changes
  const initialStream = Stream.fromEffect(getCurrentValues(readables));
  const changesStream = readables
    .map((r) => r.changes)
    .reduce(
      (acc, stream) => Stream.merge(acc, stream),
      Stream.never as Stream.Stream<unknown>,
    )
    .pipe(Stream.mapEffect(() => getCurrentValues(readables)));

  return Stream.concat(initialStream, changesStream);
};

/**
 * Gets the current values from all Readables as a tuple.
 */
export const getCurrentValues = <T extends readonly Readable<unknown>[]>(
  readables: T,
): Effect.Effect<ReadableValues<T>> =>
  Effect.all(readables.map((r) => r.get)) as Effect.Effect<ReadableValues<T>>;

/**
 * Creates an initial loading AsyncState.
 */
export const makeLoadingState = <A, E>(): AsyncState<A, E> => ({
  isLoading: true,
  value: Option.none(),
  error: Option.none(),
});

/**
 * Creates an AsyncState that preserves the previous value while loading.
 */
export const makeReloadingState = <A, E>(
  previous: AsyncState<A, E>,
): AsyncState<A, E> => ({
  isLoading: true,
  value: previous.value,
  error: Option.none(),
});

/**
 * Creates a successful AsyncState with the given value.
 */
export const makeSuccessState = <A, E>(value: A): AsyncState<A, E> => ({
  isLoading: false,
  value: Option.some(value),
  error: Option.none(),
});

/**
 * Creates a successful AsyncState, preserving the previous value if unchanged.
 */
export const makeSuccessStateWithEquality = <A, E>(
  previous: AsyncState<A, E>,
  newValue: A,
  equals: (a: A, b: A) => boolean,
): AsyncState<A, E> => {
  const shouldUpdate =
    Option.isNone(previous.value) ||
    !equals(Option.getOrThrow(previous.value), newValue);

  if (!shouldUpdate) {
    return { ...previous, isLoading: false };
  }

  return makeSuccessState(newValue);
};

/**
 * Extracts the first error from an Exit's Cause, if any.
 */
export const extractFirstError = <E>(
  cause: Cause.Cause<E>,
): Option.Option<E> => {
  const failures = Cause.failures(cause);
  const firstFailure = Chunk.head(failures);

  if (Option.isNone(firstFailure)) {
    return Option.none();
  }

  return Option.some(firstFailure.value);
};

/**
 * Creates an error AsyncState, preserving the previous value.
 */
export const makeErrorState = <A, E>(
  previous: AsyncState<A, E>,
  error: Option.Option<E>,
): AsyncState<A, E> => ({
  isLoading: false,
  value: previous.value,
  error,
});

/**
 * Converts an Exit to an AsyncState.
 */
export const exitToAsyncState = <A, E>(
  previous: AsyncState<A, E>,
  exit: Exit.Exit<A, E>,
  equals: (a: A, b: A) => boolean,
): AsyncState<A, E> => {
  if (Exit.isSuccess(exit)) {
    return makeSuccessStateWithEquality(previous, exit.value, equals);
  }

  return makeErrorState(previous, extractFirstError(exit.cause));
};

/**
 * Creates an Effect that resolves to the value or fails with the error from an AsyncState.
 */
export const awaitAsyncState = <A, E>(
  getState: () => AsyncState<A, E>,
): Effect.Effect<A, E> =>
  Effect.suspend(() => {
    const state = getState();

    if (Option.isSome(state.error)) {
      return Effect.fail(Option.getOrThrow(state.error));
    }

    if (Option.isSome(state.value)) {
      return Effect.succeed(Option.getOrThrow(state.value));
    }

    return Effect.fail(new Error("No value available") as unknown as E);
  });
