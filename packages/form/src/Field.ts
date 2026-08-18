import type { Schema } from "effect";

// -----------------------------------------------------------------------------
// TypeId
// -----------------------------------------------------------------------------

export const FieldTypeId: unique symbol = Symbol.for("stax/form/Field");
export type FieldTypeId = typeof FieldTypeId;

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

/**
 * Validation timing strategy for form fields.
 * - "blur" - validate when field loses focus
 * - "change" - validate on every keystroke (respects debounce)
 * - "submit" - only validate when submitting
 */
export type ValidateOn = "blur" | "change" | "submit";

/**
 * Configuration options for a Field.
 */
export interface FieldConfig {
  /** When to run validation */
  readonly validateOn?: ValidateOn;
  /** Debounce time in ms for 'change' validation */
  readonly debounce?: number;
}

// -----------------------------------------------------------------------------
// Field Types
// -----------------------------------------------------------------------------

/**
 * A leaf field wrapping a Schema.
 */
export interface LeafField<A, I = A> {
  readonly [FieldTypeId]: FieldTypeId;
  readonly _tag: "Leaf";
  readonly schema: Schema.Schema<A, I>;
  readonly config: FieldConfig;
}

/**
 * A struct field containing nested fields.
 */
export interface StructField<F extends Record<string, Field<any, any>>> {
  readonly [FieldTypeId]: FieldTypeId;
  readonly _tag: "Struct";
  readonly fields: F;
  readonly config: FieldConfig;
}

/**
 * An array field containing repeated fields.
 */
export interface ArrayField<F extends Field<any, any>> {
  readonly [FieldTypeId]: FieldTypeId;
  readonly _tag: "Array";
  readonly element: F;
  readonly config: FieldConfig;
}

/**
 * A map field for dynamic key-value pairs.
 */
export interface MapField<K, F extends Field<any, any>> {
  readonly [FieldTypeId]: FieldTypeId;
  readonly _tag: "Map";
  readonly key: Schema.Schema<K>;
  readonly element: F;
  readonly config: FieldConfig;
}

/**
 * Union of all field types.
 */
export type Field<A, I = A> =
  | LeafField<A, I>
  | StructField<Record<string, Field<any, any>>>
  | ArrayField<Field<any, any>>
  | MapField<any, Field<any, any>>;

// -----------------------------------------------------------------------------
// Type Extraction
// -----------------------------------------------------------------------------

/**
 * Extract the output type from a Field.
 */
export type TypeOf<F> =
  F extends LeafField<infer A, any>
    ? A
    : F extends StructField<infer Fields>
      ? { [K in keyof Fields]: TypeOf<Fields[K]> }
      : F extends ArrayField<infer Element>
        ? Array<TypeOf<Element>>
        : F extends MapField<infer K, infer Element>
          ? Map<K, TypeOf<Element>>
          : never;

/**
 * Extract the input (encoded) type from a Field.
 */
export type EncodedOf<F> =
  F extends LeafField<any, infer I>
    ? I
    : F extends StructField<infer Fields>
      ? { [K in keyof Fields]: EncodedOf<Fields[K]> }
      : F extends ArrayField<infer Element>
        ? Array<EncodedOf<Element>>
        : F extends MapField<infer K, infer Element>
          ? Map<K, EncodedOf<Element>>
          : never;

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Check if a value is a Field.
 */
export const isField = (value: unknown): value is Field<any, any> =>
  typeof value === "object" &&
  value !== null &&
  FieldTypeId in value &&
  (value as Record<symbol, unknown>)[FieldTypeId] === FieldTypeId;

/**
 * Check if a field is a leaf field.
 */
export const isLeafField = <A, I>(
  field: Field<A, I>,
): field is LeafField<A, I> => (field as { _tag: string })._tag === "Leaf";

/**
 * Check if a field is a struct field.
 */
export const isStructField = <A, I>(
  field: Field<A, I>,
): field is StructField<Record<string, Field<any, any>>> =>
  (field as { _tag: string })._tag === "Struct";

/**
 * Check if a field is an array field.
 */
export const isArrayField = <A, I>(
  field: Field<A, I>,
): field is ArrayField<Field<any, any>> =>
  (field as { _tag: string })._tag === "Array";

/**
 * Check if a field is a map field.
 */
export const isMapField = <A, I>(
  field: Field<A, I>,
): field is MapField<unknown, Field<any, any>> =>
  (field as { _tag: string })._tag === "Map";

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Create a leaf field from a Schema.
 *
 * @example
 * ```ts
 * const email = Field.make(Schema.String.pipe(Schema.email()), {
 *   validateOn: 'blur',
 * });
 * ```
 */
export function make<A, I>(
  schema: Schema.Schema<A, I>,
  config?: FieldConfig,
): LeafField<A, I>;

/**
 * Create a struct field from a record of Fields.
 *
 * @example
 * ```ts
 * const address = Field.make({
 *   street: Field.make(Schema.String),
 *   city: Field.make(Schema.String),
 * });
 * ```
 */
export function make<F extends Record<string, Field<any, any>>>(
  fields: F,
  config?: FieldConfig,
): StructField<F>;

export function make(
  schemaOrFields:
    Schema.Schema<unknown, unknown> | Record<string, Field<any, any>>,
  config: FieldConfig = {},
): Field<any, any> {
  // Check if it's a record of fields (struct)
  if (isFieldRecord(schemaOrFields)) {
    return {
      [FieldTypeId]: FieldTypeId,
      _tag: "Struct",
      fields: schemaOrFields,
      config,
    };
  }

  // Otherwise it's a Schema (leaf)
  return {
    [FieldTypeId]: FieldTypeId,
    _tag: "Leaf",
    schema: schemaOrFields as Schema.Schema<unknown, unknown>,
    config,
  };
}

/**
 * Create an array field.
 *
 * @example
 * ```ts
 * const emails = Field.Array(
 *   Field.make(Schema.String.pipe(Schema.email()))
 * );
 * ```
 */
export function Array<F extends Field<any, any>>(
  element: F,
  config: FieldConfig = {},
): ArrayField<F> {
  return {
    [FieldTypeId]: FieldTypeId,
    _tag: "Array",
    element,
    config,
  };
}

/**
 * Create a map field for dynamic key-value pairs.
 *
 * @example
 * ```ts
 * const metadata = Field.Map(
 *   Schema.String,
 *   Field.make(Schema.String)
 * );
 * ```
 */
export function Map<K, F extends Field<any, any>>(
  key: Schema.Schema<K>,
  element: F,
  config: FieldConfig = {},
): MapField<K, F> {
  return {
    [FieldTypeId]: FieldTypeId,
    _tag: "Map",
    key,
    element,
    config,
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Check if a value is a record of Fields (vs a Schema).
 */
function isFieldRecord(
  value: unknown,
): value is Record<string, Field<any, any>> {
  if (typeof value !== "object" || value === null) return false;

  // If it has FieldTypeId, it's a Field itself, not a record of fields
  if (FieldTypeId in value) return false;

  // Check if all values are Fields
  const entries = Object.entries(value);
  if (entries.length === 0) return false;

  return entries.every(([_, v]) => isField(v));
}

// -----------------------------------------------------------------------------
// Namespace Export
// -----------------------------------------------------------------------------

export const Field = {
  FieldTypeId,
  make,
  Array,
  Map,
  isField,
  isLeafField,
  isStructField,
  isArrayField,
  isMapField,
};
