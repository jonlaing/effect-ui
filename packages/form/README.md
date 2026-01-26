# @effex/form

Type-safe form handling for Effex applications with Effect Schema validation.

## Installation

```bash
pnpm add @effex/form effect
```

## Basic Usage

```ts
import { Effect, Schema } from "effect";
import { $, collect, Element, when } from "@effex/dom";
import { Form } from "@effex/form";

// Define a schema for validation
const LoginSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required" }),
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, {
      message: () => "Password must be at least 8 characters",
    }),
  ),
});

const LoginForm = () =>
  Effect.gen(function* () {
    const form = yield* Form.make({
      schema: LoginSchema,
      initial: { email: "", password: "" },
    });

    const handleSubmit = () =>
      form.submit((values) =>
        Effect.gen(function* () {
          // values is typed as { email: string, password: string }
          console.log("Submitting:", values);
          yield* form.reset();
        }),
      );

    return yield* $.div(
      { class: "login-form" },
      collect(
        $.div(
          {},
          collect(
            $.label({}, $.of("Email")),
            $.input({
              type: "email",
              value: form.fields.email.value,
              onInput: (e) =>
                form.fields.email.value.set((e.target as HTMLInputElement).value),
              onBlur: () => form.fields.email.touch(),
            }),
            when(form.fields.email.errors.map((errs) => errs.length > 0), {
              onTrue: () =>
                $.span(
                  { class: "error" },
                  $.of(form.fields.email.errors.map((e) => e[0] ?? "")),
                ),
              onFalse: () => $.span(),
            }),
          ),
        ),
        $.div(
          {},
          collect(
            $.label({}, $.of("Password")),
            $.input({
              type: "password",
              value: form.fields.password.value,
              onInput: (e) =>
                form.fields.password.value.set(
                  (e.target as HTMLInputElement).value,
                ),
              onBlur: () => form.fields.password.touch(),
            }),
            when(form.fields.password.errors.map((errs) => errs.length > 0), {
              onTrue: () =>
                $.span(
                  { class: "error" },
                  $.of(form.fields.password.errors.map((e) => e[0] ?? "")),
                ),
              onFalse: () => $.span(),
            }),
          ),
        ),
        $.button(
          {
            onClick: () => handleSubmit(),
            disabled: form.isSubmitting,
          },
          $.of(form.isSubmitting.map((s) => (s ? "Submitting..." : "Log In"))),
        ),
      ),
    );
  });
```

## Field State

Each field has reactive state:

```ts
const form = yield* Form.make({
  schema: MySchema,
  initial: { name: "", email: "" },
});

// Field value (readable + writable)
form.fields.name.value        // Readable<string>
form.fields.name.value.set()  // Set value
form.fields.name.value.get    // Effect to read value

// Field metadata
form.fields.name.errors   // Readable<string[]>
form.fields.name.touched  // Readable<boolean>
form.fields.name.dirty    // Readable<boolean>

// Mark as touched (triggers validation on blur)
form.fields.name.touch()
```

## Form State

Aggregate form state:

```ts
form.isValid       // Readable<boolean>
form.isSubmitting  // Readable<boolean>
form.isTouched     // Readable<boolean> - any field touched
form.isDirty       // Readable<boolean> - any field dirty
form.errors        // Readable<Record<string, string[]>>
```

## Validation Timing

Control when validation runs:

```ts
const form = yield* Form.make({
  schema: MySchema,
  initial: { email: "" },
  validation: "hybrid", // default
});
```

Options:
- `"hybrid"` - Validate on blur, then on change after first blur
- `"blur"` - Validate only on blur
- `"change"` - Validate on every change
- `"submit"` - Validate only on submit

## Form Actions

```ts
// Submit the form
form.submit((values) =>
  Effect.gen(function* () {
    yield* saveToServer(values);
  }),
);

// Reset to initial values
yield* form.reset();

// Set errors manually
yield* form.setErrors({ email: ["Already taken"] });

// Validate without submitting
yield* form.validate();

// Get current values
const values = yield* form.getValues();
```

## Complex Schemas

Use Effect Schema's full power for complex validation:

```ts
const RegistrationSchema = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, { message: () => "Username too short" }),
    Schema.maxLength(20, { message: () => "Username too long" }),
    Schema.pattern(/^[a-z0-9_]+$/, {
      message: () => "Only lowercase letters, numbers, and underscores",
    }),
  ),
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Required" }),
    // Add custom email validation
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, { message: () => "At least 8 characters" }),
  ),
  confirmPassword: Schema.String,
  age: Schema.optional(
    Schema.Number.pipe(
      Schema.int({ message: () => "Must be a whole number" }),
      Schema.greaterThanOrEqualTo(18, { message: () => "Must be 18+" }),
    ),
  ),
});
```

## API Reference

### Form

- `Form.make(options)` - Create a form instance
  - `schema` - Effect Schema for validation
  - `initial` - Initial values
  - `validation` - Validation timing: `"hybrid"` | `"blur"` | `"change"` | `"submit"`

### Form Instance

- `form.fields.<name>` - Field accessor
- `form.submit(handler)` - Submit with handler
- `form.reset()` - Reset to initial values
- `form.validate()` - Run validation
- `form.getValues()` - Get current values
- `form.setErrors(errors)` - Set errors manually
- `form.isValid` - Readable<boolean>
- `form.isSubmitting` - Readable<boolean>
- `form.isTouched` - Readable<boolean>
- `form.isDirty` - Readable<boolean>
- `form.errors` - Readable<Record<string, string[]>>

### Field

- `field.value` - Readable + writable signal
- `field.errors` - Readable<string[]>
- `field.touched` - Readable<boolean>
- `field.dirty` - Readable<boolean>
- `field.touch()` - Mark as touched
