import { Effect, Scope } from "effect";

import {
  isArrayField,
  isLeafField,
  isMapField,
  isStructField,
  type ArrayField,
  type Field,
  type FieldConfig,
  type LeafField,
  type MapField,
  type StructField,
  type TypeOf,
} from "../Field";
import type {
  ArrayFieldState,
  LeafFieldState,
  MapFieldState,
  StructFieldState,
} from "../FieldState";
import type { SupportedFieldState } from "./aggregation";

// Re-export SupportedFieldState for convenience
export type { SupportedFieldState } from "./aggregation";

/**
 * Maps Field types to their corresponding FieldState types.
 */
export type FieldStateOf<F> =
  F extends LeafField<infer A, any>
    ? LeafFieldState<A>
    : F extends StructField<infer Fields>
      ? StructFieldState<
          { [K in keyof Fields]: TypeOf<Fields[K]> },
          { [K in keyof Fields]: FieldStateOf<Fields[K]> }
        >
      : F extends ArrayField<infer Element>
        ? ArrayFieldState<TypeOf<Element>, FieldStateOf<Element>>
        : F extends MapField<infer K, infer Element>
          ? MapFieldState<K, TypeOf<Element>, FieldStateOf<Element>>
          : never;

/**
 * Type signature for createFieldState function.
 */
export type CreateFieldState = (
  field: Field<any, any>,
  defaultValue: unknown,
  formConfig: FieldConfig,
) => Effect.Effect<SupportedFieldState<unknown>, never, Scope.Scope>;

/**
 * Registry of field state creators.
 * This is populated by the index module to avoid circular dependencies.
 */
export const fieldStateCreators = {
  leaf: null as
    | ((
        field: LeafField<any, any>,
        defaultValue: unknown,
        config: FieldConfig,
      ) => Effect.Effect<LeafFieldState<any>, never, Scope.Scope>)
    | null,
  struct: null as
    | ((
        field: StructField<any>,
        defaultValue: Record<string, unknown>,
        config: FieldConfig,
        dispatcher: CreateFieldState,
      ) => Effect.Effect<StructFieldState<any>, never, Scope.Scope>)
    | null,
  array: null as
    | ((
        field: ArrayField<any>,
        defaultValue: unknown[],
        config: FieldConfig,
      ) => Effect.Effect<ArrayFieldState<any>, never, Scope.Scope>)
    | null,
  map: null as
    | ((
        field: MapField<any, any>,
        defaultValue: Map<any, unknown>,
        config: FieldConfig,
      ) => Effect.Effect<MapFieldState<any, any>, never, Scope.Scope>)
    | null,
};

/**
 * Create a field state for any field type.
 * Dispatches to the appropriate creator based on field type.
 *
 * The config is merged: field.config takes priority over formConfig.
 */
export const createFieldState: CreateFieldState = (
  field: Field<any, any>,
  defaultValue: unknown,
  formConfig: FieldConfig,
): Effect.Effect<SupportedFieldState<unknown>, never, Scope.Scope> => {
  // Merge field's config with form config (field config takes priority)
  const mergedConfig: FieldConfig = {
    validateOn: field.config.validateOn ?? formConfig.validateOn ?? "blur",
    debounce: field.config.debounce ?? formConfig.debounce,
  };

  if (isLeafField(field)) {
    return fieldStateCreators.leaf!(field, defaultValue, mergedConfig);
  } else if (isStructField(field)) {
    return fieldStateCreators.struct!(
      field,
      (defaultValue as Record<string, unknown>) ?? {},
      mergedConfig,
      createFieldState,
    );
  } else if (isArrayField(field)) {
    return fieldStateCreators.array!(
      field,
      (defaultValue as unknown[]) ?? [],
      mergedConfig,
    );
  } else if (isMapField(field)) {
    return fieldStateCreators.map!(
      field,
      (defaultValue as Map<unknown, unknown>) ?? new Map(),
      mergedConfig,
    );
  }
  // Fallback - shouldn't happen
  return Effect.succeed(null as unknown as SupportedFieldState<unknown>);
};

/**
 * Create a child field state with a captured scope.
 * Used by Array and Map field states to create child elements dynamically.
 *
 * @param capturedScope - The scope captured at parent creation time
 * @param elementField - The field definition for the child element
 * @param elementConfig - The merged config (element config + form config)
 */
export const createChildFieldState = <ItemState>(
  capturedScope: Scope.Scope,
  elementField: Field<any, any>,
  elementConfig: FieldConfig,
) => {
  return (itemValue: unknown): Effect.Effect<ItemState> => {
    const createEffect = (): Effect.Effect<ItemState, never, Scope.Scope> => {
      if (isLeafField(elementField)) {
        return fieldStateCreators.leaf!(
          elementField,
          itemValue,
          elementConfig,
        ) as unknown as Effect.Effect<ItemState, never, Scope.Scope>;
      } else if (isStructField(elementField)) {
        return fieldStateCreators.struct!(
          elementField as StructField<Record<string, Field<any, any>>>,
          (itemValue as Record<string, unknown>) ?? {},
          elementConfig,
          createFieldState,
        ) as unknown as Effect.Effect<ItemState, never, Scope.Scope>;
      } else if (isArrayField(elementField)) {
        return fieldStateCreators.array!(
          elementField as ArrayField<Field<any, any>>,
          (itemValue as unknown[]) ?? [],
          elementConfig,
        ) as unknown as Effect.Effect<ItemState, never, Scope.Scope>;
      } else if (isMapField(elementField)) {
        return fieldStateCreators.map!(
          elementField as MapField<unknown, Field<any, any>>,
          (itemValue as Map<unknown, unknown>) ?? new Map(),
          elementConfig,
        ) as unknown as Effect.Effect<ItemState, never, Scope.Scope>;
      }
      // Fallback - shouldn't happen
      return Effect.succeed(null as unknown as ItemState);
    };

    // Provide the captured scope to the effect
    return Effect.provideService(createEffect(), Scope.Scope, capturedScope);
  };
};
