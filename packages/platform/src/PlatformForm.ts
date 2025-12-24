import { Effect, Schema, Scope } from "effect";
import {
  Form as FormCore,
  type FormType,
  type FormOptions,
  type FieldType,
  type SubmitHandler,
} from "@effex/form";
import { RouterContext, type ActionResult } from "@effex/router";

/**
 * Extended form options for platform-integrated forms.
 */
export interface PlatformFormOptions<
  S extends Schema.Schema.AnyNoContext,
  E = never,
  R = never,
> extends FormOptions<S, E, R> {
  /**
   * If true, form.submit() will POST to the current route's action.
   * If false or omitted, behaves like regular @effex/form.
   * @default false
   */
  readonly action?: boolean;
}

/**
 * Extended form interface with router action support.
 */
export interface PlatformForm<
  S extends Schema.Schema.AnyNoContext,
  E = never,
  R = never,
> extends Omit<FormType<S, E, R>, "submit"> {
  /**
   * Submit the form.
   * When action mode is enabled, the handler is optional - form will POST to route action.
   * When action mode is disabled, requires a handler like regular @effex/form.
   */
  readonly submit: <SE = never, SR = never>(
    handler?: SubmitHandler<Schema.Schema.Type<S>, SE, SR>,
  ) => Effect.Effect<void, E | SE | unknown, R | SR>;
  /**
   * Submit form data to the current route's action.
   * Returns the action result or null if no action handler exists.
   */
  readonly submitToAction: () => Effect.Effect<ActionResult | null, unknown>;
}

/**
 * Convert form values to FormData for submission.
 */
const toFormData = (values: Record<string, unknown>): FormData => {
  const formData = new FormData();

  const appendValue = (key: string, value: unknown): void => {
    if (value === null || value === undefined) {
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          Object.entries(item as Record<string, unknown>).forEach(
            ([nestedKey, nestedValue]) => {
              appendValue(`${key}[${index}][${nestedKey}]`, nestedValue);
            },
          );
        } else {
          appendValue(`${key}[${index}]`, item);
        }
      });
    } else if (typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(
        ([nestedKey, nestedValue]) => {
          appendValue(`${key}[${nestedKey}]`, nestedValue);
        },
      );
    } else {
      formData.append(key, String(value));
    }
  };

  for (const [key, value] of Object.entries(values)) {
    appendValue(key, value);
  }

  return formData;
};

/**
 * Create a platform-integrated form with optional router action support.
 *
 * When `action: true` is set, the form's `submit()` method will POST
 * to the current route's action handler, and server-side validation
 * errors will be automatically synced back to the form fields.
 *
 * @example
 * ```ts
 * // Basic form (same as @effex/form)
 * const form = yield* Form.make({
 *   schema: ContactSchema,
 *   initial: { name: "", email: "" },
 * })
 *
 * // Form that submits to route action
 * const form = yield* Form.make({
 *   schema: ContactSchema,
 *   initial: { name: "", email: "" },
 *   action: true,
 * })
 *
 * // Submit will POST to route action and sync errors
 * yield* form.submit()
 * ```
 */
export const make = <
  S extends Schema.Schema.AnyNoContext,
  E = never,
  R = never,
>(
  options: PlatformFormOptions<S, E, R>,
): Effect.Effect<PlatformForm<S, E, R>, never, Scope.Scope | RouterContext> => {
  type T = Schema.Schema.Type<S>;

  return Effect.gen(function* () {
    // Create the core form
    const coreForm = yield* FormCore.make(options);

    // Get router context for action submission
    const router = yield* RouterContext;

    // Submit to route action
    const submitToAction = (): Effect.Effect<ActionResult | null, unknown> =>
      Effect.gen(function* () {
        // Get current values
        const values = yield* coreForm.getValues();

        // Convert to FormData
        const formData = toFormData(values as Record<string, unknown>);

        // Submit to router action
        const result = yield* router.submitAction(formData);

        // If action returned errors, sync them to form
        if (result && typeof result.data === "object" && result.data !== null) {
          const data = result.data as Record<string, unknown>;
          if (data.errors && typeof data.errors === "object") {
            yield* coreForm.setErrors(
              data.errors as Partial<Record<keyof T, readonly string[]>>,
            );
          }
        }

        return result;
      });

    // If action mode, wrap submit to use action
    const submit = options.action
      ? <SE, SR>(
          handler?: (values: T) => Effect.Effect<void, SE, SR>,
        ): Effect.Effect<void, E | SE | unknown, R | SR> =>
          Effect.gen(function* () {
            // Touch all fields
            for (const field of Object.values(coreForm.fields)) {
              const f = field as FieldType<unknown>;
              yield* f.touch();
            }

            // Validate locally first
            const allErrors = yield* coreForm.validate();
            const hasErrors = Object.values(allErrors).some(
              (errs) => (errs as readonly string[]).length > 0,
            );

            if (hasErrors) {
              // Set errors on fields and don't submit
              for (const [name, errs] of Object.entries(allErrors)) {
                const field = (
                  coreForm.fields as Record<string, FieldType<unknown>>
                )[name];
                yield* field?.setErrors(errs as readonly string[]);
              }
              return;
            }

            // Submit to action
            const result = yield* submitToAction();

            // Call custom handler if provided and action succeeded
            if (
              handler &&
              result &&
              typeof result.data === "object" &&
              result.data !== null
            ) {
              const data = result.data as Record<string, unknown>;
              if (!data.errors) {
                const values = yield* coreForm.getValues();
                yield* handler(values);
              }
            }
          })
      : coreForm.submit;

    const platformForm: PlatformForm<S, E, R> = {
      ...coreForm,
      submit: submit as PlatformForm<S, E, R>["submit"],
      submitToAction,
    };

    return platformForm;
  });
};

/**
 * Platform-integrated Form module.
 * Extends @effex/form with router action support.
 */
export const Form = {
  make,
};
