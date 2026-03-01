import { Context, Effect, Scope, type ParseResult } from "effect";

import { MergePropsCtx } from "@effex/core";

import {
  type ArrayField,
  type EncodedOf,
  type Field,
  type LeafField,
  type MapField,
  type StructField,
  type TypeOf,
  type ValidateOn,
} from "./Field";
import type {
  ArrayFieldState,
  FormState,
  LeafFieldState,
  MapFieldState,
  StructFieldState,
} from "./FieldState";
import { createFieldState, type SupportedFieldState } from "./fieldStates";
import { createFormState } from "./FormState";

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
  /** Instance-level submit handler (runs on client with JS) */
  readonly onSubmit?: OnSubmit<Encoded, Decoded, E, R>;
  /**
   * Native form action attribute (e.g., "?_action=submit").
   * When provided, form renders with action and method="POST" attributes,
   * enabling progressive enhancement (works without JS).
   */
  readonly action?: string;
}

// -----------------------------------------------------------------------------
// Form Type
// -----------------------------------------------------------------------------

/**
 * Maps Field types to their corresponding FieldState types.
 */
type FieldStateOf<F> =
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
 * Maps a record of Fields to a record of Effects that yield FieldStates.
 * The FormCtx is the identifier type of the context tag.
 */
type FieldAccessors<Fields extends Record<string, Field<any, any>>, FormCtx> = {
  readonly [K in keyof Fields]: Effect.Effect<
    FieldStateOf<Fields[K]>,
    never,
    FormCtx
  >;
};

/**
 * Internal form context containing live state.
 */
interface FormContextValue<Fields extends Record<string, Field<any, any>>> {
  readonly fieldStates: {
    [K in keyof Fields]: FieldStateOf<Fields[K]>;
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
  Fields extends Record<string, Field<any, any>>,
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
  Fields extends Record<string, Field<any, any>>,
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
    Effect.Effect<SupportedFieldState<unknown>, never, FormCtxId>
  >;

  for (const key of Object.keys(fields)) {
    fieldAccessors[key] = Effect.map(
      FormContext,
      (ctx) =>
        ctx.fieldStates[key as keyof Fields] as SupportedFieldState<unknown>,
    ) as unknown as Effect.Effect<
      SupportedFieldState<unknown>,
      never,
      FormCtxId
    >;
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
          [K in keyof Fields]: FieldStateOf<Fields[K]>;
        },
        formState: formState as FormState<Encoded, Decoded>,
      };

      // Create onSubmit handler for MergePropsCtx
      const onSubmit = (e: Event) => {
        e.preventDefault();
        return formState.submit();
      };

      // Build props to merge into form element
      const mergeProps: Record<string, unknown> = { onSubmit };

      // When action is provided, add native form attributes for progressive enhancement
      if (provideConfig.action) {
        mergeProps.action = provideConfig.action;
        mergeProps.method = "POST";
      }

      // Provide form context and inject props via MergePropsCtx
      // The first element (typically $.form) will receive these props
      return yield* children.pipe(
        Effect.provideService(FormContext, contextValue),
        Effect.provideService(MergePropsCtx, mergeProps),
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
  fields: Record<string, Field<any, any>>,
  defaults: Record<string, unknown>,
  formConfig: { validateOn?: ValidateOn; debounce?: number },
): Effect.Effect<
  Record<string, SupportedFieldState<unknown>>,
  never,
  Scope.Scope
> =>
  Effect.gen(function* () {
    const states: Record<string, SupportedFieldState<unknown>> = {};

    for (const [key, field] of Object.entries(fields)) {
      const defaultValue = defaults[key];
      const mergedConfig = {
        validateOn: field.config.validateOn ?? formConfig.validateOn ?? "blur",
        debounce: field.config.debounce ?? formConfig.debounce,
      };

      states[key] = yield* createFieldState(field, defaultValue, mergedConfig);
    }

    return states;
  });

// -----------------------------------------------------------------------------
// Type Guard
// -----------------------------------------------------------------------------

/**
 * Check if a value is a Form.
 */
export const isForm = (
  value: unknown,
): value is Form<Record<string, Field<any, any>>> =>
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
