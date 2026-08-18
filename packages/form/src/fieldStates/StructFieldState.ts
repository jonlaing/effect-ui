import { Effect, Scope } from "effect";

import { Readable, Signal } from "@stax-ui/core";

import type { Field, FieldConfig, StructField, TypeOf } from "../Field.js";
import type { StructFieldState } from "../FieldState.js";
import {
  aggregateErrors,
  aggregateTouched,
  type SupportedFieldState,
} from "./aggregation.js";
import type { CreateFieldState, FieldStateOf } from "./createFieldState.js";

export const createStructFieldState = <
  F extends Record<string, Field<any, any>>,
>(
  field: StructField<F>,
  defaultValue: Record<string, unknown>,
  formConfig: FieldConfig,
  createFieldState: CreateFieldState,
): Effect.Effect<
  StructFieldState<
    { [K in keyof F]: TypeOf<F[K]> },
    { [K in keyof F]: FieldStateOf<F[K]> }
  >,
  never,
  Scope.Scope
> =>
  Effect.gen(function* () {
    type StructValue = { [K in keyof F]: TypeOf<F[K]> };

    // Recursively create field states for nested fields
    const nestedStates: Record<string, SupportedFieldState<unknown>> = {};
    for (const [key, nestedField] of Object.entries(field.fields)) {
      const nestedDefault = defaultValue[key];
      nestedStates[key] = yield* createFieldState(
        nestedField,
        nestedDefault,
        formConfig,
      );
    }

    const fieldNames = Object.keys(nestedStates);

    // Derive the struct value from nested field values
    const nestedValueReadables = fieldNames.map((k) => nestedStates[k].value);
    const value: Signal.Signal<StructValue> =
      nestedValueReadables.length > 0
        ? (Readable.map(Readable.zipAll(nestedValueReadables), (values) => {
            const result: Record<string, unknown> = {};
            fieldNames.forEach((k, i) => {
              result[k] = values[i];
            });
            return result as StructValue;
          }) as unknown as Signal.Signal<StructValue>)
        : (Readable.of(
            defaultValue as StructValue,
          ) as unknown as Signal.Signal<StructValue>);

    // Add set and update methods to the derived readable
    const setStruct = (v: StructValue): Effect.Effect<void> =>
      Effect.all(
        fieldNames.map((k) => nestedStates[k].set(v[k as keyof StructValue])),
      ).pipe(Effect.asVoid);

    const updateStruct = (
      f: (v: StructValue) => StructValue,
    ): Effect.Effect<void> =>
      Effect.gen(function* () {
        const current = yield* value.get;
        yield* setStruct(f(current));
      });

    // Aggregate touched from all nested fields
    const touched = aggregateTouched(Object.values(nestedStates));

    // Aggregate dirty from all nested fields
    const nestedDirtyReadables = Object.values(nestedStates).map(
      (state) => state.dirty,
    );
    const dirty: Readable.Readable<boolean> =
      nestedDirtyReadables.length > 0
        ? Readable.map(Readable.zipAll(nestedDirtyReadables), (dirtyStates) =>
            dirtyStates.some((d) => d),
          )
        : Readable.of(false);

    // Aggregate errors from all nested fields
    const errors = aggregateErrors(Object.values(nestedStates));

    const structState: StructFieldState<
      StructValue,
      { [K in keyof F]: FieldStateOf<F[K]> }
    > = {
      value,
      errors,
      touched,
      dirty,
      fields: nestedStates as { [K in keyof F]: FieldStateOf<F[K]> },
      set: setStruct,
      update: updateStruct,
      reset: () =>
        Effect.all(Object.values(nestedStates).map((s) => s.reset())).pipe(
          Effect.asVoid,
        ),
    };

    return structState;
  });
