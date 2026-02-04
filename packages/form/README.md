# @effex/form

Type-safe form handling for Effex applications with Effect Schema validation.

## Installation

```bash
pnpm add @effex/form effect
```

## Overview

Forms in `@effex/form` are defined separately from their runtime state. This separation allows you to:

- Define forms at module level (like routers)
- Reuse form definitions across components
- Get full type inference for field access
- Use context-based field access via `yield*`

## Basic Usage

```ts
import { Effect, Schema } from "effect";
import { $, collect, when } from "@effex/dom";
import { Field, Form } from "@effex/form";

// 1. Define the form at module level
const LoginForm = Form.make(
  {
    email: Field.make(
      Schema.String.pipe(Schema.nonEmptyString({ message: () => "Email is required" })),
      { validateOn: "blur" },
    ),
    password: Field.make(
      Schema.String.pipe(Schema.minLength(8, { message: () => "At least 8 characters" })),
      { validateOn: "blur" },
    ),
  },
  {
    onSubmit: (ctx) =>
      Effect.sync(() => {
        console.log("Form submitted:", ctx.decoded);
      }),
  },
);

// 2. Create field components - each yields only the state it needs
const EmailField = () =>
  Effect.gen(function* () {
    const field = yield* LoginForm.fields.email;

    return yield* $.div(
      {},
      collect(
        $.label({}, $.of("Email")),
        $.input({
          type: "email",
          value: field.value,
          onInput: (e) => field.set((e.target as HTMLInputElement).value),
          onBlur: () => field.blur(),
        }),
        when(field.errors.map((errs) => errs.length > 0), {
          onTrue: () => $.span({ class: "error" }, $.of("Invalid email")),
          onFalse: () => Effect.succeed([]),
        }),
      ),
    );
  });

const PasswordField = () =>
  Effect.gen(function* () {
    const field = yield* LoginForm.fields.password;

    return yield* $.div(
      {},
      collect(
        $.label({}, $.of("Password")),
        $.input({
          type: "password",
          value: field.value,
          onInput: (e) => field.set((e.target as HTMLInputElement).value),
          onBlur: () => field.blur(),
        }),
        when(field.errors.map((errs) => errs.length > 0), {
          onTrue: () => $.span({ class: "error" }, $.of("Too short")),
          onFalse: () => Effect.succeed([]),
        }),
      ),
    );
  });

const SubmitButton = () =>
  Effect.gen(function* () {
    const form = yield* LoginForm.form;

    return yield* $.button(
      { type: "submit", disabled: form.isSubmitting },
      $.of(form.isSubmitting.map((s) => (s ? "Submitting..." : "Log In"))),
    );
  });

// 3. Compose the form - $.form automatically receives onSubmit from Form.provide
const LoginPage = () =>
  LoginForm.provide(
    { defaults: { email: "", password: "" } },
    $.form(
      { class: "login-form" },  // your props merge with the injected onSubmit
      collect(
        EmailField(),
        PasswordField(),
        SubmitButton(),
      ),
    ),
  );
```

> **Note:** `Form.provide` automatically injects an `onSubmit` handler (with `preventDefault`)
> into the first element via context. Just make sure `$.form` is your first element.

## Field Definition

Fields wrap Effect Schemas with UI configuration:

```ts
import { Field } from "@effex/form";
import { Schema } from "effect";

// Basic field
const nameField = Field.make(Schema.String);

// Field with validation config
const emailField = Field.make(
  Schema.String.pipe(Schema.nonEmptyString()),
  { validateOn: "blur", debounce: 300 },
);

// Nested struct field
const addressField = Field.make({
  street: Field.make(Schema.String),
  city: Field.make(Schema.String),
  zip: Field.make(Schema.String),
});

// Array field
const tagsField = Field.Array(Field.make(Schema.String));

// Map field (dynamic key-value pairs)
const metadataField = Field.Map(Schema.String, Field.make(Schema.String));
```

## Validation Timing

Control when validation runs per-field or form-wide:

```ts
// Per-field config
Field.make(Schema.String, { validateOn: "change" });

// Form-wide defaults
Form.make(
  { name: Field.make(Schema.String) },
  { validateOn: "blur", debounce: 200 },
);
```

Options:
- `"blur"` - Validate when field loses focus (default)
- `"change"` - Validate on every change
- `"submit"` - Only validate on form submission

## Field State

Each field component yields only the state it needs. This keeps components focused and makes the data flow clear:

```ts
// A reusable text input component
const NameField = () =>
  Effect.gen(function* () {
    // This component only accesses the name field
    const field = yield* MyForm.fields.name;

    return yield* $.input({
      value: field.value,
      onInput: (e) => field.set((e.target as HTMLInputElement).value),
      onBlur: () => field.blur(),
    });
  });
```

### Field State Properties

```ts
const field = yield* MyForm.fields.name;

// Reactive values
field.value    // Signal<T> - current value
field.errors   // Readable<ParseIssue[]> - validation errors
field.touched  // Readable<boolean> - has been blurred
field.dirty    // Readable<boolean> - changed from initial

// Actions (all return Effect<void>)
yield* field.set("new value");
yield* field.update((v) => v.toUpperCase());
yield* field.blur();   // Mark as touched
yield* field.focus();  // Mark as focused
yield* field.reset();  // Reset to initial value
```

## Form State

Components that need form-level state (like submit buttons or status indicators) yield `form` separately:

```ts
const SubmitButton = () =>
  Effect.gen(function* () {
    const form = yield* MyForm.form;

    // Just use type="submit" - onSubmit is handled by Form.provide
    return yield* $.button(
      { type: "submit", disabled: form.isSubmitting },
      $.of(form.isSubmitting.map((s) => (s ? "Saving..." : "Save"))),
    );
  });

const FormStatus = () =>
  Effect.gen(function* () {
    const form = yield* MyForm.form;

    return yield* when(form.isDirty, {
      onTrue: () => $.span({}, $.of("You have unsaved changes")),
      onFalse: () => Effect.succeed([]),
    });
  });
```

### Form State Properties

```ts
const form = yield* MyForm.form;

// Reactive values
form.isValid       // Readable<boolean> - all fields valid
form.isSubmitting  // Readable<boolean> - submit in progress
form.isTouched     // Readable<boolean> - any field touched
form.isDirty       // Readable<boolean> - any field changed
form.errors        // Readable<ParseIssue[]> - form-level errors

// Actions
yield* form.validate();   // Validate all fields, returns boolean
yield* form.reset();      // Reset all fields
yield* form.submit();     // Validate and call onSubmit handlers

// Get values
const encoded = yield* form.getEncoded();  // Raw form values
const decoded = yield* form.getDecoded();  // Validated values (may fail)
```

## Submit Handlers

Define submit handlers at form level and/or instance level:

```ts
// Form-level handler (runs first)
const MyForm = Form.make(
  { name: Field.make(Schema.String) },
  {
    onSubmit: (ctx) =>
      Effect.sync(() => {
        analytics.track("form_submit", ctx.decoded);
      }),
  },
);

// Instance-level handler (runs second)
MyForm.provide(
  {
    defaults: { name: "" },
    onSubmit: (ctx) =>
      Effect.gen(function* () {
        yield* saveToServer(ctx.decoded);
      }),
  },
  children,
);
```

The submit context includes:

```ts
interface SubmitContext<Encoded, Decoded> {
  encoded: Encoded;           // Raw form values
  decoded: Decoded;           // Validated/transformed values
  form: {
    isValid: boolean;
    errors: ParseIssue[];
    touched: Set<string>;
    dirty: Set<string>;
  };
}
```

## Complex Validation

Use Effect Schema's full power:

```ts
const RegistrationForm = Form.make({
  username: Field.make(
    Schema.String.pipe(
      Schema.minLength(3, { message: () => "Too short" }),
      Schema.maxLength(20, { message: () => "Too long" }),
      Schema.pattern(/^[a-z0-9_]+$/, {
        message: () => "Only lowercase letters, numbers, and underscores",
      }),
    ),
  ),
  email: Field.make(
    Schema.String.pipe(Schema.nonEmptyString({ message: () => "Required" })),
  ),
  age: Field.make(
    Schema.Number.pipe(
      Schema.int({ message: () => "Must be a whole number" }),
      Schema.greaterThanOrEqualTo(18, { message: () => "Must be 18+" }),
    ),
  ),
});
```

## API Reference

### Field

```ts
// Create a leaf field from a Schema
Field.make(schema: Schema, config?: FieldConfig): LeafField

// Create a struct field from nested fields
Field.make(fields: Record<string, Field>, config?: FieldConfig): StructField

// Create an array field
Field.Array(element: Field, config?: FieldConfig): ArrayField

// Create a map field
Field.Map(keySchema: Schema, element: Field, config?: FieldConfig): MapField
```

### FieldConfig

```ts
interface FieldConfig {
  validateOn?: "blur" | "change" | "submit";
  debounce?: number;  // ms, for "change" validation
}
```

### Form

```ts
// Create a form definition
Form.make(fields: Record<string, LeafField>, config?: FormConfig): Form

// Create live state and provide context
form.provide(config: ProvideConfig, children: Effect<A>): Effect<A, never, Scope>

// Access field state (inside Form.provide)
form.fields.<name>: Effect<LeafFieldState>

// Access form state (inside Form.provide)
form.form: Effect<FormState>
```

### FormConfig

```ts
interface FormConfig {
  validateOn?: "blur" | "change" | "submit";
  debounce?: number;
  onSubmit?: (ctx: SubmitContext) => Effect<void>;
}
```

### ProvideConfig

```ts
interface ProvideConfig {
  defaults: Encoded;  // Initial values for all fields
  onSubmit?: (ctx: SubmitContext) => Effect<void>;
}
```

## Acknowledgments

The schema-first, context-based architecture of this package was inspired by [effect-form](https://github.com/lucas-barake/effect-form).
