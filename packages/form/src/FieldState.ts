import type { Effect, ParseResult } from "effect";

import type { Readable, Signal } from "@stax-ui/core";

// -----------------------------------------------------------------------------
// FieldState Types
// -----------------------------------------------------------------------------

/**
 * Runtime state for a leaf field.
 */
export interface LeafFieldState<T> {
  /** The field's current value */
  readonly value: Signal.Signal<T>;
  /** Validation errors for this field */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Whether the field has been touched (blurred) */
  readonly touched: Readable.Readable<boolean>;
  /** Whether the field value has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Set the field value */
  readonly set: (value: T) => Effect.Effect<void>;
  /** Update the field value with a function */
  readonly update: (f: (value: T) => T) => Effect.Effect<void>;
  /** Mark the field as touched (triggers blur validation) */
  readonly blur: () => Effect.Effect<void>;
  /** Mark the field as focused */
  readonly focus: () => Effect.Effect<void>;
  /** Reset the field to its initial value */
  readonly reset: () => Effect.Effect<void>;
}

/**
 * Runtime state for a struct field.
 * Provides access to nested field states.
 */
export interface StructFieldState<
  T extends Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FieldStates extends Record<string, unknown> = Record<string, any>,
> {
  /** The struct's current value as a signal */
  readonly value: Signal.Signal<T>;
  /** Validation errors for the struct as a whole */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Whether any nested field has been touched */
  readonly touched: Readable.Readable<boolean>;
  /** Whether any nested field value has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Access nested field states */
  readonly fields: FieldStates;
  /** Set the struct value */
  readonly set: (value: T) => Effect.Effect<void>;
  /** Update the struct value with a function */
  readonly update: (f: (value: T) => T) => Effect.Effect<void>;
  /** Reset all nested fields to initial values */
  readonly reset: () => Effect.Effect<void>;
}

/**
 * Runtime state for an array field.
 * Provides array manipulation and access to individual item states.
 */
export interface ArrayFieldState<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ItemState = any,
> {
  /** The array's current values as a signal */
  readonly value: Signal.Signal<readonly T[]>;
  /** Reactive length of the array */
  readonly length: Readable.Readable<number>;
  /** Validation errors for the array as a whole (aggregated from items) */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Whether any array item has been touched */
  readonly touched: Readable.Readable<boolean>;
  /** Whether any array item has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Access individual item field states */
  readonly items: Readable.Readable<readonly ItemState[]>;
  /** Set the entire array value */
  readonly set: (value: readonly T[]) => Effect.Effect<void>;
  /** Update the array value with a function */
  readonly update: (
    f: (value: readonly T[]) => readonly T[],
  ) => Effect.Effect<void>;
  /** Add one or more elements to the end */
  readonly push: (...items: T[]) => Effect.Effect<void>;
  /** Remove and return the last element */
  readonly pop: () => Effect.Effect<void>;
  /** Add one or more elements to the beginning */
  readonly unshift: (...items: T[]) => Effect.Effect<void>;
  /** Remove and return the first element */
  readonly shift: () => Effect.Effect<void>;
  /** Insert an element at a specific index */
  readonly insertAt: (index: number, item: T) => Effect.Effect<void>;
  /** Remove the element at a specific index */
  readonly removeAt: (index: number) => Effect.Effect<void>;
  /** Move an element from one index to another */
  readonly move: (fromIndex: number, toIndex: number) => Effect.Effect<void>;
  /** Remove all elements from the array */
  readonly clear: () => Effect.Effect<void>;
  /** Reset the array to initial values */
  readonly reset: () => Effect.Effect<void>;
}

/**
 * Runtime state for a map field.
 * Provides map manipulation and access to individual entry states.
 */
export interface MapFieldState<
  K,
  V,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EntryState = any,
> {
  /** The map's current values as a readable */
  readonly value: Readable.Readable<ReadonlyMap<K, V>>;
  /** Reactive size of the map */
  readonly size: Readable.Readable<number>;
  /** Validation errors for the map as a whole (aggregated from entries) */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Whether any map entry has been touched */
  readonly touched: Readable.Readable<boolean>;
  /** Whether any map entry has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Access individual entry field states by key */
  readonly entries: Readable.Readable<ReadonlyMap<K, EntryState>>;
  /** Get field state for a specific key */
  readonly getEntry: (key: K) => Effect.Effect<EntryState | undefined>;
  /** Set the entire map value */
  readonly set: (
    value: ReadonlyMap<K, V> | Iterable<readonly [K, V]>,
  ) => Effect.Effect<void>;
  /** Update the map value with a function */
  readonly update: (
    f: (
      value: ReadonlyMap<K, V>,
    ) => ReadonlyMap<K, V> | Iterable<readonly [K, V]>,
  ) => Effect.Effect<void>;
  /** Set a single entry value (creates entry state if new) */
  readonly setEntry: (key: K, value: V) => Effect.Effect<void>;
  /** Delete an entry by key */
  readonly delete: (key: K) => Effect.Effect<boolean>;
  /** Remove all entries */
  readonly clear: () => Effect.Effect<void>;
  /** Reset the map to initial values */
  readonly reset: () => Effect.Effect<void>;
}

/**
 * Union of all field state types.
 */
export type FieldState<T> =
  | LeafFieldState<T>
  | StructFieldState<T & Record<string, unknown>>
  | ArrayFieldState<T>
  | MapFieldState<unknown, T>;

// -----------------------------------------------------------------------------
// FormState
// -----------------------------------------------------------------------------

/**
 * Form-level state accessible via Form.form accessor.
 */
export interface FormState<Encoded, Decoded> {
  /** Whether all fields are valid */
  readonly isValid: Readable.Readable<boolean>;
  /** Whether the form is currently submitting */
  readonly isSubmitting: Readable.Readable<boolean>;
  /** Whether any field has been touched */
  readonly isTouched: Readable.Readable<boolean>;
  /** Whether any field has changed from initial */
  readonly isDirty: Readable.Readable<boolean>;
  /** Form-level validation errors (from struct refinements) */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Get current encoded (raw) values */
  readonly getEncoded: () => Effect.Effect<Encoded>;
  /** Get current decoded (validated) values, fails if invalid */
  readonly getDecoded: () => Effect.Effect<Decoded, ParseResult.ParseError>;
  /** Validate all fields and return whether valid */
  readonly validate: () => Effect.Effect<boolean>;
  /** Reset all fields to initial values */
  readonly reset: () => Effect.Effect<void>;
  /** Submit the form (calls onSubmit callbacks if valid) */
  readonly submit: () => Effect.Effect<void>;
}
