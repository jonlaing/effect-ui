import { Context, Effect, ParseResult, Schema, Scope } from "effect";

import { MergePropsCtx, Readable, Signal } from "@effex/core";

import {
  isLeafField,
  type EncodedOf,
  type FieldConfig,
  type LeafField,
  type TypeOf,
  type ValidateOn,
} from "./Field";
import type { FormState, LeafFieldState } from "./FieldState";

// -----------------------------------------------------------------------------
// TypeId
// -----------------------------------------------------------------------------

export const FormTypeId: unique symbol = Symbol.for("effex/form/Form");
export type FormTypeId = typeof FormTypeId;

// -----------------------------------------------------------------------------
// Form Config
// -----------------------------------------------------------------------------

/**
 * Context for submit callbacks.
 */
export interface SubmitContext<Encoded, Decoded> {
  /** Raw form values (schema input type) */
  readonly encoded: Encoded;
  /** Validated/transformed values (schema output type) */
  readonly decoded: Decoded;
  /** Current form state */
  readonly form: {
    readonly isValid: boolean;
    readonly errors: readonly ParseResult.ParseIssue[];
    readonly touched: ReadonlySet<string>;
    readonly dirty: ReadonlySet<string>;
  };
}

/**
 * Submit handler type.
 */
export type OnSubmit<Encoded, Decoded, E = never, R = never> = (
  ctx: SubmitContext<Encoded, Decoded>,
) => Effect.Effect<void, E, R>;

/**
 * Configuration for Form.make.
 */
export interface FormConfig<Encoded, Decoded, E = never, R = never> {
  /** Default validation timing for all fields */
  readonly validateOn?: ValidateOn;
  /** Default debounce time in ms */
  readonly debounce?: number;
  /** Form-level submit handler */
  readonly onSubmit?: OnSubmit<Encoded, Decoded, E, R>;
}

/**
 * Configuration for Form.provide.
 */
export interface ProvideConfig<Encoded, Decoded, E = never, R = never> {
  /** Initial/default values for all fields */
  readonly defaults: Encoded;
  /** Instance-level submit handler */
  readonly onSubmit?: OnSubmit<Encoded, Decoded, E, R>;
}

// -----------------------------------------------------------------------------
// Form Type
// -----------------------------------------------------------------------------

/**
 * Maps Field types to their corresponding FieldState types.
 */
type FieldStateOf<F> =
  F extends LeafField<infer A, any> ? LeafFieldState<A> : never;

/**
 * Maps a record of Fields to a record of Effects that yield FieldStates.
 * The FormCtx is the identifier type of the context tag.
 */
type FieldAccessors<
  Fields extends Record<string, LeafField<any, any>>,
  FormCtx,
> = {
  readonly [K in keyof Fields]: Effect.Effect<
    FieldStateOf<Fields[K]>,
    never,
    FormCtx
  >;
};

/**
 * Internal form context containing live state.
 */
interface FormContextValue<Fields extends Record<string, LeafField<any, any>>> {
  readonly fieldStates: {
    [K in keyof Fields]: LeafFieldState<TypeOf<Fields[K]>>;
  };
  readonly formState: FormState<
    { [K in keyof Fields]: EncodedOf<Fields[K]> },
    { [K in keyof Fields]: TypeOf<Fields[K]> }
  >;
}

/**
 * A Form definition.
 *
 * @template Fields - The record of field definitions
 * @template R - Requirements from form-level callbacks
 * @template FormCtx - The form context identifier (internal)
 */
export interface Form<
  Fields extends Record<string, LeafField<any, any>>,
  R = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormCtx = any,
> {
  readonly [FormTypeId]: FormTypeId;

  /**
   * Access individual field states via context.
   */
  readonly fields: FieldAccessors<Fields, FormCtx>;

  /**
   * Access form-level state via context.
   */
  readonly form: Effect.Effect<
    FormState<
      { [K in keyof Fields]: EncodedOf<Fields[K]> },
      { [K in keyof Fields]: TypeOf<Fields[K]> }
    >,
    never,
    FormCtx
  >;

  /**
   * Create live form state and provide context to children.
   */
  readonly provide: <A, E2, R2>(
    config: ProvideConfig<
      { [K in keyof Fields]: EncodedOf<Fields[K]> },
      { [K in keyof Fields]: TypeOf<Fields[K]> },
      E2,
      R2
    >,
    children: Effect.Effect<A, never, FormCtx>,
  ) => Effect.Effect<A, never, R | R2 | Scope.Scope>;

  /**
   * The field definitions (for introspection).
   */
  readonly _fields: Fields;
}

// -----------------------------------------------------------------------------
// Constructor
// -----------------------------------------------------------------------------

/**
 * Create a new Form definition.
 *
 * @example
 * ```ts
 * const LoginForm = Form.make({
 *   email: Field.make(Schema.String.pipe(Schema.email()), { validateOn: 'blur' }),
 *   password: Field.make(Schema.String.pipe(Schema.minLength(8))),
 * }, {
 *   validateOn: 'blur',
 *   onSubmit: (ctx) => telemetry.track("login_attempt"),
 * });
 * ```
 */
export const make = <
  Fields extends Record<string, LeafField<any, any>>,
  E = never,
  R = never,
>(
  fields: Fields,
  config: FormConfig<
    { [K in keyof Fields]: EncodedOf<Fields[K]> },
    { [K in keyof Fields]: TypeOf<Fields[K]> },
    E,
    R
  > = {},
): Form<Fields, R> => {
  type Encoded = { [K in keyof Fields]: EncodedOf<Fields[K]> };
  type Decoded = { [K in keyof Fields]: TypeOf<Fields[K]> };

  // Create a unique context tag for this form
  const FormContext = Context.GenericTag<FormContextValue<Fields>>(
    `effex/form/FormContext/${Symbol().toString()}`,
  );

  // Infer the context identifier type
  type FormCtxId = Context.Tag.Identifier<typeof FormContext>;

  // Build field accessors
  const fieldAccessors = {} as Record<
    string,
    Effect.Effect<LeafFieldState<unknown>, never, FormCtxId>
  >;

  for (const key of Object.keys(fields)) {
    fieldAccessors[key] = Effect.map(
      FormContext,
      (ctx) => ctx.fieldStates[key as keyof Fields] as LeafFieldState<unknown>,
    ) as unknown as Effect.Effect<LeafFieldState<unknown>, never, FormCtxId>;
  }

  // Form accessor
  const formAccessor = Effect.map(
    FormContext,
    (ctx) => ctx.formState,
  ) as unknown as Effect.Effect<FormState<Encoded, Decoded>, never, FormCtxId>;

  // Provide function
  const provide = <A, E2, R2>(
    provideConfig: ProvideConfig<Encoded, Decoded, E2, R2>,
    children: Effect.Effect<A, never, FormCtxId>,
  ): Effect.Effect<A, never, R | R2 | Scope.Scope> =>
    Effect.gen(function* () {
      // Create live state for all fields
      const fieldStates = yield* createFieldStates(
        fields,
        provideConfig.defaults as Record<string, unknown>,
        { validateOn: config.validateOn, debounce: config.debounce },
      );

      // Create form-level state
      const formState = yield* createFormState(
        fields,
        fieldStates,
        config.onSubmit as
          | OnSubmit<
              Record<string, unknown>,
              Record<string, unknown>,
              unknown,
              R
            >
          | undefined,
        provideConfig.onSubmit as
          | OnSubmit<
              Record<string, unknown>,
              Record<string, unknown>,
              unknown,
              R2
            >
          | undefined,
      );

      // Create context value
      const contextValue: FormContextValue<Fields> = {
        fieldStates: fieldStates as {
          [K in keyof Fields]: LeafFieldState<TypeOf<Fields[K]>>;
        },
        formState: formState as FormState<Encoded, Decoded>,
      };

      // Create onSubmit handler for MergePropsCtx
      const onSubmit = (e: Event) => {
        e.preventDefault();
        return formState.submit();
      };

      // Provide form context and inject onSubmit via MergePropsCtx
      // The first element (typically $.form) will receive the onSubmit handler
      return yield* children.pipe(
        Effect.provideService(FormContext, contextValue),
        Effect.provideService(MergePropsCtx, { onSubmit }),
      );
    }) as Effect.Effect<A, never, R | R2 | Scope.Scope>;

  return {
    [FormTypeId]: FormTypeId,
    fields: fieldAccessors as unknown as FieldAccessors<Fields, FormCtxId>,
    form: formAccessor as unknown as Effect.Effect<
      FormState<Encoded, Decoded>,
      never,
      FormCtxId
    >,
    provide,
    _fields: fields,
  } as Form<Fields, R, FormCtxId>;
};

// -----------------------------------------------------------------------------
// Internal: Create Field States
// -----------------------------------------------------------------------------

const createFieldStates = (
  fields: Record<string, LeafField<any, any>>,
  defaults: Record<string, unknown>,
  formConfig: { validateOn?: ValidateOn; debounce?: number },
): Effect.Effect<Record<string, LeafFieldState<unknown>>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const states: Record<string, LeafFieldState<unknown>> = {};

    for (const [key, field] of Object.entries(fields)) {
      if (!isLeafField(field)) {
        continue; // Skip non-leaf fields for now
      }

      const defaultValue = defaults[key];
      const config: FieldConfig = {
        validateOn: field.config.validateOn ?? formConfig.validateOn ?? "blur",
        debounce: field.config.debounce ?? formConfig.debounce,
      };

      states[key] = yield* createLeafFieldState(field, defaultValue, config);
    }

    return states;
  });

const createLeafFieldState = <A, I>(
  field: LeafField<A, I>,
  defaultValue: unknown,
  config: FieldConfig,
): Effect.Effect<LeafFieldState<A>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const value = yield* Signal.make(defaultValue as A);
    const touched = yield* Signal.make(false);
    const focused = yield* Signal.make(false);
    const initialValue = defaultValue as A;

    // Dirty = value differs from initial
    const dirty = Readable.map(value, (v) => v !== initialValue);

    // Validation errors - computed based on validateOn config
    const errors: Readable.Readable<readonly ParseResult.ParseIssue[]> =
      Readable.map(Readable.zipAll([value, touched] as const), ([v, t]) => {
        // Don't validate until touched (for blur mode)
        if (config.validateOn === "blur" && !t) {
          return [];
        }

        // For submit mode, don't auto-validate
        if (config.validateOn === "submit") {
          return [];
        }

        // Validate using schema
        const result = Schema.decodeUnknownEither(field.schema)(v);
        if (result._tag === "Left") {
          return result.left.issue ? [result.left.issue] : [];
        }
        return [];
      });

    const leafState: LeafFieldState<A> = {
      value,
      errors,
      touched,
      dirty,
      set: (v: A) => value.set(v),
      update: (f: (v: A) => A) => value.update(f),
      blur: () =>
        Effect.gen(function* () {
          yield* touched.set(true);
          yield* focused.set(false);
        }),
      focus: () => focused.set(true),
      reset: () =>
        Effect.gen(function* () {
          yield* value.set(initialValue);
          yield* touched.set(false);
          yield* focused.set(false);
        }),
    };

    return leafState;
  });

// -----------------------------------------------------------------------------
// Internal: Create Form State
// -----------------------------------------------------------------------------

const createFormState = <R, R2>(
  fields: Record<string, LeafField<any, any>>,
  fieldStates: Record<string, LeafFieldState<unknown>>,
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
          yield* state.blur();
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

        try {
          // Validate first
          const valid = yield* validate();
          if (!valid) return;

          // Get values
          const encoded = yield* getEncoded();
          const decodedResult = yield* Effect.either(getDecoded());

          if (decodedResult._tag === "Left") {
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
        } finally {
          yield* isSubmitting.set(false);
        }
      });

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

// -----------------------------------------------------------------------------
// Type Guard
// -----------------------------------------------------------------------------

/**
 * Check if a value is a Form.
 */
export const isForm = (
  value: unknown,
): value is Form<Record<string, LeafField<any, any>>> =>
  typeof value === "object" &&
  value !== null &&
  FormTypeId in value &&
  (value as Record<symbol, unknown>)[FormTypeId] === FormTypeId;

// -----------------------------------------------------------------------------
// Namespace Export
// -----------------------------------------------------------------------------

export const Form = {
  FormTypeId,
  make,
  isForm,
};
