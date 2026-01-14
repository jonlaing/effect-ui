import { Effect, Option, Scope } from "effect";

import { defaultEquals, Derived, Readable, Signal } from "@effex/dom";

import type { FieldArray, Field as FieldType, ValidationTiming } from "./types";

/**
 * Options for creating a Field.
 * @template A - The type of the field value
 */
export interface FieldOptions<A> {
  /** Initial value for the field */
  readonly initial: A;
  /** Validation timing strategy */
  readonly validation: ValidationTiming;
  /** Schema validation function */
  readonly schemaValidate: (value: A) => Effect.Effect<readonly string[]>;
  /** Custom equality function */
  readonly equals?: (a: A, b: A) => boolean;
}

/**
 * Create a form field with reactive state.
 * @param options - Field configuration
 */
export const makeField = <A>(
  options: FieldOptions<A>,
): Effect.Effect<FieldType<A>, never, Scope.Scope> => {
  const equals = options.equals ?? defaultEquals;

  return Effect.gen(function* () {
    // Core state signals
    const value = yield* Signal.make(options.initial, { equals });
    const touched = yield* Signal.make(false);
    const manualErrors = yield* Signal.make<readonly string[]>([]);
    const hasBlurred = yield* Signal.make(false);

    // Track if value has changed from initial
    const dirty = yield* Derived.sync(
      [value],
      ([v]) => !equals(v, options.initial),
    );

    // Run validation (synchronous only for simplicity)
    const runValidation = (currentValue: A): Effect.Effect<readonly string[]> =>
      options.schemaValidate(currentValue);

    // Derived errors based on validation timing - use sync instead of async
    // to avoid the complex AsyncState handling
    const validationErrors = yield* Derived.async(
      [value, touched, hasBlurred],
      ([v, isTouched, blurred]) => {
        // Determine if we should validate based on timing
        switch (options.validation) {
          case "submit":
            // Don't auto-validate - only on explicit validate() call
            return Effect.succeed<readonly string[]>([]);

          case "blur":
            // Only validate after field has been blurred
            if (!blurred) return Effect.succeed<readonly string[]>([]);
            return runValidation(v as A);

          case "change":
            // Validate on every change
            return runValidation(v as A);

          case "hybrid":
          default:
            // Validate on blur first, then on change after first blur
            if (!isTouched) return Effect.succeed<readonly string[]>([]);
            return runValidation(v as A);
        }
      },
      { strategy: "abort" },
    );

    // Combine validation errors with manual errors
    // validationErrors.value is Readable<Option<readonly string[]>>
    const errors: Readable.Readable<readonly string[]> = yield* Derived.sync(
      [validationErrors.value, manualErrors] as const,
      ([validationOpt, manual]) => {
        if (Option.isSome(validationOpt)) {
          return [...validationOpt.value, ...manual];
        }
        return [...manual];
      },
    );

    const field: FieldType<A> = {
      value,
      errors,
      touched,
      dirty,
      touch: () =>
        Effect.gen(function* () {
          yield* touched.set(true);
          yield* hasBlurred.set(true);
        }),
      reset: () =>
        Effect.gen(function* () {
          yield* value.set(options.initial);
          yield* touched.set(false);
          yield* hasBlurred.set(false);
          yield* manualErrors.set([]);
        }),
      setErrors: (errs) => manualErrors.set(errs),
      validate: () =>
        Effect.gen(function* () {
          const currentValue = yield* value.get;
          return yield* runValidation(currentValue);
        }),
    };

    return field;
  });
};

/**
 * Options for creating a FieldArray.
 * @template A - The type of each array item
 */
export interface FieldArrayOptions<A> {
  /** Initial array values */
  readonly initial: readonly A[];
  /** Validation timing strategy */
  readonly validation: ValidationTiming;
  /** Schema validation function for individual items */
  readonly itemSchemaValidate: (value: A) => Effect.Effect<readonly string[]>;
  /** Custom equality function */
  readonly equals?: (a: A, b: A) => boolean;
}

/**
 * Create a field array for dynamic lists.
 * @param options - Field array configuration
 */
export const makeFieldArray = <A>(
  options: FieldArrayOptions<A>,
): Effect.Effect<FieldArray<A>, never, Scope.Scope> => {
  return Effect.gen(function* () {
    // Helper to create a field for an item - note: requires Scope
    const createItemField = (
      initial: A,
    ): Effect.Effect<FieldType<A>, never, Scope.Scope> =>
      makeField({
        initial,
        validation: options.validation,
        schemaValidate: options.itemSchemaValidate,
        equals: options.equals,
      });

    // Create initial fields
    const initialFields = yield* Effect.all(
      options.initial.map((v) => createItemField(v)),
    );

    // Use SignalArray for built-in array manipulation methods
    const fields = yield* Signal.Array.make<FieldType<A>>(initialFields);

    const fieldArray: FieldArray<A> = {
      items: fields,
      append: (value) =>
        Effect.gen(function* () {
          const newField = yield* createItemField(value);
          yield* fields.push(newField);
        }).pipe(Effect.scoped),
      prepend: (value) =>
        Effect.gen(function* () {
          const newField = yield* createItemField(value);
          yield* fields.unshift(newField);
        }).pipe(Effect.scoped),
      insert: (index, value) =>
        Effect.gen(function* () {
          const newField = yield* createItemField(value);
          yield* fields.insertAt(index, newField);
        }).pipe(Effect.scoped),
      remove: (index) => fields.removeAt(index).pipe(Effect.asVoid),
      move: (fromIndex, toIndex) => fields.move(fromIndex, toIndex),
      swap: (indexA, indexB) => fields.swap(indexA, indexB),
      replace: (values) =>
        Effect.gen(function* () {
          const newFields = yield* Effect.all(
            values.map((v) => createItemField(v)),
          );
          yield* fields.set(newFields);
        }).pipe(Effect.scoped),
    };

    return fieldArray;
  });
};

/**
 * Field module namespace for creating form fields.
 */
export const Field = {
  make: makeField,
  makeArray: makeFieldArray,
};
