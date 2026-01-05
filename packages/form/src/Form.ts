import { Effect, Schema, Scope } from "effect";
import { Signal, Derived, Readable } from "@effex/dom";
import type {
  Field,
  FieldArray,
  Form as FormType,
  FormFields,
  FormOptions,
  SubmitHandler,
  ValidationTiming,
} from "./types";
import { buildFieldEntries, hasNoErrors, validateForm } from "./helpers";

/**
 * Create a new Form with reactive state management.
 * @param options - Form configuration including schema and initial values
 *
 * @example
 * ```ts
 * const form = yield* Form.make({
 *   schema: Schema.Struct({
 *     email: Schema.String.pipe(Schema.nonEmptyString()),
 *     password: Schema.String.pipe(Schema.minLength(8)),
 *   }),
 *   initial: { email: "", password: "" },
 * })
 *
 * // Access fields
 * form.fields.email.value      // Signal<string>
 * form.fields.email.errors     // Readable<string[]>
 * form.fields.email.touched    // Readable<boolean>
 *
 * // Submit the form
 * yield* form.submit((values) =>
 *   Effect.gen(function* () {
 *     yield* api.register(values)
 *   })
 * )
 * ```
 */
export const make = <
  S extends Schema.Schema.AnyNoContext,
  E = never,
  R = never,
>(
  options: FormOptions<S, E, R>,
): Effect.Effect<FormType<S, E, R>, never, Scope.Scope> => {
  type T = Schema.Schema.Type<S>;
  const validation: ValidationTiming = options.validation ?? "hybrid";

  return Effect.gen(function* () {
    const isSubmitting = yield* Signal.make(false);

    const fieldEntries = yield* buildFieldEntries(
      options.initial,
      options.schema,
      validation,
    );

    const fields = Object.fromEntries(fieldEntries) as FormFields<T>;

    // Collect all field readables for derived state
    const fieldNames = Object.keys(fields);
    const allFields = Object.values(fields) as Array<
      Field<unknown> | FieldArray<unknown>
    >;

    // Get error readables from all fields
    const errorReadables: Readable.Readable<readonly string[]>[] =
      allFields.map((f) => (f as Field<unknown>).errors);

    // Derive form-level errors (aggregate from all fields)
    const errors: Readable.Readable<Record<string, readonly string[]>> =
      yield* Derived.sync(errorReadables, (allErrors) =>
        fieldNames.reduce(
          (acc, key, idx) => ({
            ...acc,
            [key]: allErrors[idx],
          }),
          {} as Record<string, readonly string[]>,
        ),
      );

    // Derive isValid from errors
    const isValid: Readable.Readable<boolean> = yield* Derived.sync(
      [errors],
      ([errs]) => hasNoErrors(errs),
    );

    // Get touched readables from all fields
    const touchedReadables: Readable.Readable<boolean>[] = allFields.map(
      (f) => (f as Field<unknown>).touched,
    );

    // Derive isTouched from all fields
    const isTouched: Readable.Readable<boolean> = yield* Derived.sync(
      touchedReadables,
      (touchedStates) => touchedStates.some((t) => t),
    );

    // Get dirty readables from all fields
    const dirtyReadables: Readable.Readable<boolean>[] = allFields.map(
      (f) => (f as Field<unknown>).dirty,
    );

    // Derive isDirty from all fields
    const isDirty: Readable.Readable<boolean> = yield* Derived.sync(
      dirtyReadables,
      (dirtyStates) => dirtyStates.some((d) => d),
    );

    // Get current values from all fields
    const getValues = (): Effect.Effect<T> =>
      Effect.gen(function* () {
        const result: Record<string, unknown> = {};
        for (const [name, field] of Object.entries(fields)) {
          const f = field as Field<unknown>;
          result[name] = yield* f.value.get;
        }
        return result as T;
      });

    // Validate all fields and return errors
    const validateAll = (): Effect.Effect<
      Record<keyof T, readonly string[]>,
      E,
      R
    > =>
      Effect.gen(function* () {
        const values = yield* getValues();
        const schemaErrors = yield* validateForm(options.schema, values);

        // Also run async validators
        const asyncErrors: Record<string, readonly string[]> = {};
        if (options.validators) {
          for (const [fieldNameKey, validator] of Object.entries(
            options.validators,
          )) {
            if (validator) {
              const fieldValue = (values as Record<string, unknown>)[
                fieldNameKey
              ];
              const validatorFn = validator as (
                v: unknown,
              ) => Effect.Effect<readonly string[], E, R>;
              asyncErrors[fieldNameKey] = yield* validatorFn(fieldValue);
            }
          }
        }

        // Merge errors - start with schema errors, then append async errors
        const merged = { ...schemaErrors };
        for (const [name, errs] of Object.entries(asyncErrors)) {
          merged[name] = [...(merged[name] ?? []), ...errs];
        }

        return merged as Record<keyof T, readonly string[]>;
      });

    // Submit handler
    const submit = <SE, SR>(
      handler: SubmitHandler<T, SE, SR>,
    ): Effect.Effect<void, E | SE, R | SR> =>
      Effect.gen(function* () {
        yield* isSubmitting.set(true);

        // Touch all fields to show validation
        for (const field of Object.values(fields)) {
          const f = field as Field<unknown>;
          yield* f.touch();
        }

        // Validate all
        const allErrors = yield* validateAll();

        if (!hasNoErrors(allErrors as Record<string, readonly string[]>)) {
          // Set errors on fields
          for (const [name, errs] of Object.entries(allErrors)) {
            const field = (fields as Record<string, Field<unknown>>)[name];
            yield* field?.setErrors(errs as readonly string[]);
          }
          return;
        }

        // Get validated values and call handler
        const values = yield* getValues();
        yield* handler(values);
      }).pipe(Effect.ensuring(isSubmitting.set(false)));

    // Reset all fields
    const reset = (): Effect.Effect<void> =>
      Effect.all(
        Object.values(fields).map((field) => (field as Field<unknown>).reset()),
      );

    // Set external errors
    const setErrors = (
      externalErrors: Partial<Record<keyof T, readonly string[]>>,
    ): Effect.Effect<void> =>
      Effect.all(
        Object.entries(externalErrors).map(([name, errs]) => {
          const field = (fields as Record<string, Field<unknown>>)[name];
          if (field && errs) {
            return field.setErrors(errs as readonly string[]);
          }
          return Effect.void;
        }),
      );

    const form: FormType<S, E, R> = {
      fields,
      isValid,
      isSubmitting,
      isTouched,
      isDirty,
      errors,
      submit,
      reset,
      setErrors,
      validate: validateAll,
      getValues,
    };

    return form;
  });
};

/**
 * Form module namespace for creating forms with Effect Schema validation.
 */
export const Form = {
  make,
};
