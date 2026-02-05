import type { ParseResult } from "effect";

import { Readable } from "@effex/core";

import type {
  ArrayFieldState,
  LeafFieldState,
  MapFieldState,
  StructFieldState,
} from "../FieldState";

/**
 * Supported field state types for aggregation.
 */
export type SupportedFieldState<T> =
  | LeafFieldState<T>
  | StructFieldState<T & Record<string, unknown>>
  | ArrayFieldState<T>
  | MapFieldState<unknown, T>;

/**
 * Aggregate touched state from an iterable of field states.
 * Returns true if any field is touched, false if empty.
 */
export const aggregateTouched = (
  states: Iterable<SupportedFieldState<unknown>>,
): Readable.Readable<boolean> => {
  const statesArray = Array.from(states);
  if (statesArray.length === 0) return Readable.of(false);

  const touchedReadables = statesArray.map((s) => s.touched);
  return Readable.map(Readable.zipAll(touchedReadables), (touchedStates) =>
    touchedStates.some((t) => t),
  );
};

/**
 * Aggregate errors from an iterable of field states.
 * Returns flattened array of all errors, empty array if no states.
 */
export const aggregateErrors = (
  states: Iterable<SupportedFieldState<unknown>>,
): Readable.Readable<readonly ParseResult.ParseIssue[]> => {
  const statesArray = Array.from(states);
  if (statesArray.length === 0) return Readable.of([]);

  const errorReadables = statesArray.map((s) => s.errors);
  return Readable.map(Readable.zipAll(errorReadables), (allErrors) =>
    allErrors.flat(),
  );
};

/**
 * Aggregate touched state from a reactive collection of field states.
 * Handles dynamic collections (arrays, maps) that may change.
 */
export const aggregateTouchedDynamic = (
  statesReadable: Readable.Readable<Iterable<SupportedFieldState<unknown>>>,
): Readable.Readable<boolean> =>
  Readable.flatMap(statesReadable, (states) => aggregateTouched(states));

/**
 * Aggregate errors from a reactive collection of field states.
 * Handles dynamic collections (arrays, maps) that may change.
 */
export const aggregateErrorsDynamic = (
  statesReadable: Readable.Readable<Iterable<SupportedFieldState<unknown>>>,
): Readable.Readable<readonly ParseResult.ParseIssue[]> =>
  Readable.flatMap(statesReadable, (states) => aggregateErrors(states));
