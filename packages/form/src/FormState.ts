import { Effect, Either, ParseResult, Schema, Scope } from "effect";

import { Readable, Signal } from "@effex/core";

import { isLeafField, type Field } from "./Field";
import type {
  ArrayFieldState,
  FormState,
  MapFieldState,
  StructFieldState,
} from "./FieldState";
import type { SupportedFieldState } from "./fieldStates";
import type { OnSubmit, SubmitContext } from "./Form";

/**
 * Helper to trigger validation on a field state by touching it.
 * Recursively touches nested fields for struct, array, and map fields.
 */
export const touchFieldState = (
  state: SupportedFieldState<unknown>,
): Effect.Effect<void> => {
  // LeafFieldState has blur(), StructFieldState needs recursive touch
  if ("blur" in state && typeof state.blur === "function") {
    return state.blur();
  }
  // For struct fields, touch all nested fields
  if ("fields" in state) {
    const structState = state as StructFieldState<Record<string, unknown>>;
    return Effect.all(
      Object.values(structState.fields).map((nested) =>
        touchFieldState(nested as SupportedFieldState<unknown>),
      ),
    ).pipe(Effect.asVoid);
  }
  // For array fields, touch all item states
  if ("items" in state) {
    const arrayState = state as ArrayFieldState<unknown>;
    return Effect.gen(function* () {
      const itemStates = yield* arrayState.items.get;
      yield* Effect.all(
        itemStates.map((item) =>
          touchFieldState(item as SupportedFieldState<unknown>),
        ),
      );
    }).pipe(Effect.asVoid);
  }
  // For map fields, touch all entry states
  if ("entries" in state && "getEntry" in state) {
    const mapState = state as MapFieldState<unknown, unknown>;
    return Effect.gen(function* () {
      const entryStates = yield* mapState.entries.get;
      yield* Effect.all(
        Array.from(entryStates.values()).map((entry) =>
          touchFieldState(entry as SupportedFieldState<unknown>),
        ),
      );
    }).pipe(Effect.asVoid);
  }
  return Effect.void;
};

export const createFormState = <R, R2>(
  fields: Record<string, Field<any, any>>,
  fieldStates: Record<string, SupportedFieldState<unknown>>,
  formOnSubmit:
    | OnSubmit<Record<string, unknown>, Record<string, unknown>, unknown, R>
    | undefined,
  provideOnSubmit:
    | OnSubmit<Record<string, unknown>, Record<string, unknown>, unknown, R2>
    | undefined,
): Effect.Effect<
  FormState<Record<string, unknown>, Record<string, unknown>>,
  never,
  Scope.Scope
> =>
  Effect.gen(function* () {
    const isSubmitting = yield* Signal.make(false);

    // Collect error readables
    const fieldNames = Object.keys(fieldStates);
    const errorReadables = fieldNames.map((k) => fieldStates[k].errors);

    // Aggregate isValid from all fields
    const isValid: Readable.Readable<boolean> =
      errorReadables.length > 0
        ? Readable.map(Readable.zipAll(errorReadables), (allErrors) =>
            allErrors.every((errs) => errs.length === 0),
          )
        : Readable.of(true);

    // Collect touched readables
    const touchedReadables = fieldNames.map((k) => fieldStates[k].touched);

    // Aggregate isTouched from all fields
    const isTouched: Readable.Readable<boolean> =
      touchedReadables.length > 0
        ? Readable.map(Readable.zipAll(touchedReadables), (touchedStates) =>
            touchedStates.some((t) => t),
          )
        : Readable.of(false);

    // Collect dirty readables
    const dirtyReadables = fieldNames.map((k) => fieldStates[k].dirty);

    // Aggregate isDirty from all fields
    const isDirty: Readable.Readable<boolean> =
      dirtyReadables.length > 0
        ? Readable.map(Readable.zipAll(dirtyReadables), (dirtyStates) =>
            dirtyStates.some((d) => d),
          )
        : Readable.of(false);

    // Form-level errors (empty for now - would come from struct refinements)
    const errors: Readable.Readable<readonly ParseResult.ParseIssue[]> =
      Readable.of([]);

    // Get encoded values
    const getEncoded = (): Effect.Effect<Record<string, unknown>> =>
      Effect.gen(function* () {
        const result: Record<string, unknown> = {};
        for (const [key, state] of Object.entries(fieldStates)) {
          result[key] = yield* state.value.get;
        }
        return result;
      });

    // Get decoded values (validates and transforms)
    const getDecoded = (): Effect.Effect<
      Record<string, unknown>,
      ParseResult.ParseError
    > => {
      // Build schema outside the generator to avoid R inference issues
      const schemaFields: Record<
        string,
        Schema.Schema<unknown, unknown, never>
      > = {};
      for (const [key, field] of Object.entries(fields)) {
        if (isLeafField(field)) {
          schemaFields[key] = field.schema as Schema.Schema<
            unknown,
            unknown,
            never
          >;
        }
      }
      const structSchema = Schema.Struct(schemaFields);

      return getEncoded().pipe(
        Effect.flatMap((encoded) => Schema.decode(structSchema)(encoded)),
        Effect.map((decoded) => decoded as Record<string, unknown>),
      ) as Effect.Effect<
        Record<string, unknown>,
        ParseResult.ParseError,
        never
      >;
    };

    // Validate all fields
    const validate = (): Effect.Effect<boolean> =>
      Effect.gen(function* () {
        // Touch all fields to trigger validation
        for (const state of Object.values(fieldStates)) {
          yield* touchFieldState(state);
        }
        return yield* isValid.get;
      });

    // Reset all fields
    const reset = (): Effect.Effect<void> =>
      Effect.all(Object.values(fieldStates).map((s) => s.reset())).pipe(
        Effect.asVoid,
      );

    // Submit handler
    const submit = (): Effect.Effect<void, unknown, R | R2> =>
      Effect.gen(function* () {
        yield* isSubmitting.set(true);

        // Validate first
        const valid = yield* validate();
        if (!valid) return;

        // Get values
        const encoded = yield* getEncoded();
        const decodedResult = yield* Effect.either(getDecoded());

        if (Either.isLeft(decodedResult)) {
          // Validation failed
          return;
        }

        const decoded = decodedResult.right;

        // Build submit context
        const ctx: SubmitContext<
          Record<string, unknown>,
          Record<string, unknown>
        > = {
          encoded,
          decoded,
          form: {
            isValid: true,
            errors: [],
            touched: new Set(Object.keys(fieldStates)),
            dirty: new Set(),
          },
        };

        // Call form-level onSubmit first
        if (formOnSubmit) {
          yield* formOnSubmit(ctx) as Effect.Effect<void, unknown, R>;
        }

        // Call instance-level onSubmit
        if (provideOnSubmit) {
          yield* provideOnSubmit(ctx) as Effect.Effect<void, unknown, R2>;
        }
      }).pipe(Effect.ensuring(isSubmitting.set(false)));

    return {
      isValid,
      isSubmitting,
      isTouched,
      isDirty,
      errors,
      getEncoded,
      getDecoded,
      validate,
      reset,
      submit: submit as () => Effect.Effect<void>,
    };
  });
