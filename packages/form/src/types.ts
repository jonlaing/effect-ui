import type { Effect, Schema } from "effect";
import type { Readable, Signal } from "@effex/dom";

/**
 * Validation timing strategy for form fields.
 * - "hybrid" (default) - validate on blur first, then on change after first blur
 * - "blur" - validate when field loses focus
 * - "change" - validate on every keystroke
 * - "submit" - only validate when submitting
 */
export type ValidationTiming = "hybrid" | "blur" | "change" | "submit";

/**
 * A single form field with reactive state.
 * @template A - The type of the field value
 */
export interface Field<A> {
  /** The field's current value (writable) */
  readonly value: Signal.Signal<A>;
  /** Validation errors for this field */
  readonly errors: Readable.Readable<readonly string[]>;
  /** Whether the field has been touched (blurred) */
  readonly touched: Readable.Readable<boolean>;
  /** Whether the field value has changed from initial */
  readonly dirty: Readable.Readable<boolean>;
  /** Mark the field as touched */
  readonly touch: () => Effect.Effect<void>;
  /** Reset the field to its initial value */
  readonly reset: () => Effect.Effect<void>;
  /** Manually set errors for this field */
  readonly setErrors: (errors: readonly string[]) => Effect.Effect<void>;
  /** Trigger validation for this field */
  readonly validate: () => Effect.Effect<readonly string[]>;
}

/**
 * Array field operations for dynamic field lists.
 * @template A - The type of each array item
 */
export interface FieldArray<A> {
  /** The array of field items */
  readonly items: Readable.Readable<readonly Field<A>[]>;
  /** Add a new item to the end */
  readonly append: (value: A) => Effect.Effect<void>;
  /** Add a new item at the beginning */
  readonly prepend: (value: A) => Effect.Effect<void>;
  /** Insert an item at a specific index */
  readonly insert: (index: number, value: A) => Effect.Effect<void>;
  /** Remove an item at a specific index */
  readonly remove: (index: number) => Effect.Effect<void>;
  /** Move an item from one index to another */
  readonly move: (fromIndex: number, toIndex: number) => Effect.Effect<void>;
  /** Swap two items */
  readonly swap: (indexA: number, indexB: number) => Effect.Effect<void>;
  /** Replace all items */
  readonly replace: (values: readonly A[]) => Effect.Effect<void>;
}

/**
 * Custom async validator function.
 * Returns an array of error messages (empty array means valid).
 */
export type AsyncValidator<A, E = never, R = never> = (
  value: A,
) => Effect.Effect<readonly string[], E, R>;

/**
 * Validators configuration for a form.
 * Maps field names to async validator functions.
 */
export type Validators<T, E = never, R = never> = {
  readonly [K in keyof T]?: AsyncValidator<T[K], E, R>;
};

/**
 * Options for creating a Form.
 * @template S - The schema type
 * @template E - The error type from validators
 * @template R - The requirements from validators
 */
export interface FormOptions<
  S extends Schema.Schema.AnyNoContext,
  E = never,
  R = never,
> {
  /** Effect Schema for validation */
  readonly schema: S;
  /** Initial values for the form */
  readonly initial: Schema.Schema.Type<S>;
  /** When to validate fields */
  readonly validation?: ValidationTiming;
  /** Custom async validators for individual fields */
  readonly validators?: Validators<Schema.Schema.Type<S>, E, R>;
}

/**
 * Extracts field types from a schema type.
 * Maps each property to a Field of that type.
 */
export type FormFields<T> = {
  readonly [K in keyof T]: T[K] extends readonly (infer Item)[]
    ? FieldArray<Item>
    : Field<T[K]>;
};

/**
 * Submit handler function type.
 * @template T - The validated form data type
 * @template E - The error type
 * @template R - The requirements
 */
export type SubmitHandler<T, E = never, R = never> = (
  values: T,
) => Effect.Effect<void, E, R>;

/**
 * The main Form interface.
 * @template S - The schema type
 * @template E - The error type from validators
 * @template R - The requirements from validators
 */
export interface Form<
  S extends Schema.Schema.AnyNoContext,
  E = never,
  R = never,
> {
  /** Individual field accessors */
  readonly fields: FormFields<Schema.Schema.Type<S>>;
  /** Whether the entire form is valid */
  readonly isValid: Readable.Readable<boolean>;
  /** Whether the form is currently submitting */
  readonly isSubmitting: Readable.Readable<boolean>;
  /** Whether any field has been touched */
  readonly isTouched: Readable.Readable<boolean>;
  /** Whether any field has changed from initial */
  readonly isDirty: Readable.Readable<boolean>;
  /** All form errors by field name */
  readonly errors: Readable.Readable<Record<string, readonly string[]>>;
  /** Submit the form with a handler */
  readonly submit: <SE, SR>(
    handler: SubmitHandler<Schema.Schema.Type<S>, SE, SR>,
  ) => Effect.Effect<void, E | SE, R | SR>;
  /** Reset all fields to initial values */
  readonly reset: () => Effect.Effect<void>;
  /** Set errors from server/external validation */
  readonly setErrors: (
    errors: Partial<Record<keyof Schema.Schema.Type<S>, readonly string[]>>,
  ) => Effect.Effect<void>;
  /** Validate all fields and return all errors */
  readonly validate: () => Effect.Effect<
    Record<keyof Schema.Schema.Type<S>, readonly string[]>,
    E,
    R
  >;
  /** Get current form values */
  readonly getValues: () => Effect.Effect<Schema.Schema.Type<S>>;
}
