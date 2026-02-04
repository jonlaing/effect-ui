import type { Effect, ParseResult } from "effect";

import type {
  Readable,
  Signal,
  SignalArray,
  SignalMap,
  SignalStruct,
} from "@effex/core";

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
export type StructFieldState<T extends Record<string, unknown>> =
  SignalStruct<T> & {
    /** Validation errors for the struct as a whole */
    readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
    /** Whether any nested field has been touched */
    readonly touched: Readable.Readable<boolean>;
    /** Whether any nested field value has changed from initial */
    readonly dirty: Readable.Readable<boolean>;
    /** Reset all nested fields to initial values */
    readonly reset: () => Effect.Effect<void>;
  };

/**
 * Runtime state for an array field.
 * Extends SignalArray with form-specific functionality.
 */
export type ArrayFieldState<T> = SignalArray<T> & {
  /** Validation errors for the array as a whole */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Whether any array item has been touched */
  readonly touched: Readable.Readable<boolean>;
  /** Whether any array item has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Reset the array to initial values */
  readonly reset: () => Effect.Effect<void>;
};

/**
 * Runtime state for a map field.
 * Extends SignalMap with form-specific functionality.
 */
export type MapFieldState<K, V> = SignalMap<K, V> & {
  /** Validation errors for the map as a whole */
  readonly errors: Readable.Readable<readonly ParseResult.ParseIssue[]>;
  /** Whether any map entry has been touched */
  readonly touched: Readable.Readable<boolean>;
  /** Whether any map entry has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Reset the map to initial values */
  readonly reset: () => Effect.Effect<void>;
};

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
