import { Effect, Stream } from "effect";

import type { Readable } from "../Readable";
import type { ReadableValues } from "./types";

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
