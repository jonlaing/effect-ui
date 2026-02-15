# Form Package Redesign

## Motivation

The current API follows the React Hook Form / Tanstack Form pattern:
1. Define a Schema
2. Create a form instance inside a component
3. Verbose API to interact with the form object
4. Form state lives within the component

The new approach flips this: **define the form in terms of its Schema, with the form definition living outside components**. This is similar to how we handle Routers - a static definition that knows its structure, with components plugging into it.

## Core Concept

```typescript
// Form definition lives OUTSIDE components - it's a static structure
// Form.make takes a record of Fields, not a Schema directly
const LoginForm = Form.make({
  email: Field.make(Schema.String.pipe(Schema.email()), {
    validateOn: 'blur',
  }),
  password: Field.make(Schema.String.pipe(Schema.minLength(8)), {
    validateOn: 'change',
    debounce: 300,
  }),
});

// Field components access state via context (yield*)
const EmailField = () => Effect.gen(function*() {
  const email = yield* LoginForm.fields.email;

  return yield* $.input({
    value: email.value,
    onInput: (e) => email.set(e.target.value),
    onBlur: email.blur,
    "aria-invalid": Readable.map(email.errors, e => e.length > 0),
  });
});

// Mount point - provide creates live state and provides context
const LoginPage = () => Effect.gen(function*() {
  return yield* LoginForm.provide({
    defaults: { email: "", password: "" },
    onSubmit: (values) => authService.login(values),
  },
    collect(EmailField(), PasswordField(), SubmitButton())
  );
});
```

## Key Design Decisions

### 1. Field Wraps Schema

`Field` is the bridge between Schema (data validation) and UI behavior:

```typescript
interface FieldConfig {
  validateOn?: 'blur' | 'change' | 'submit';  // When to run validation
  debounce?: number;                           // Debounce for 'change' mode (ms)
  // Future: transform, format, parse, etc.
}

// Field.make wraps a Schema with UI configuration
const email = Field.make(
  Schema.String.pipe(Schema.email()),
  { validateOn: 'blur' }
);
```

Form.make takes a record of Fields and optional form-level defaults:

```typescript
const LoginForm = Form.make({
  email: Field.make(Schema.String.pipe(Schema.email())),           // inherits form default
  password: Field.make(Schema.String, { validateOn: 'change' }),   // overrides default
}, {
  validateOn: 'blur',   // default for all fields
  debounce: 300,        // default debounce
});

// Form internally builds Schema.Struct from the Field schemas
// and merges per-field config with form defaults
```

### 2. Form Definition Outside Components

The form is defined by its fields and becomes a static structure:
- Field names are known at compile time (type-safe)
- Validation rules come from the schema
- The form definition is reusable across components
- Different UIs can consume the same form definition

### 2. Context-Based Field Access

Fields are accessed via Effect context using `yield*`:

```typescript
const email = yield* LoginForm.field("email");
// or possibly: yield* LoginForm.fields.email
```

This returns a `FieldState<T>`:

```typescript
interface FieldState<T> {
  value: Readable<T>;
  set: (value: T) => Effect<void>;
  errors: Readable<readonly ParseError[]>;
  touched: Readable<boolean>;
  dirty: Readable<boolean>;
  blur: () => Effect<void>;
  focus: () => Effect<void>;
  reset: () => Effect<void>;
}
```

### 3. Initialize Creates Live Context

`Form.initialize()` is the boundary where real state gets created:

```typescript
LoginForm.initialize(
  {
    defaults: { email: "", password: "" },
    onSubmit: (values) => Effect.gen(...),
  },
  children
)
```

This function:
1. Creates Signals for each field value
2. Sets up derived state for errors (running schema validation)
3. Creates form-level state (isSubmitting, isValid, etc.)
4. Provides all of this via Effect context to children

### 4. Form-Level State Access

For submit buttons, form-wide validation status, etc.:

```typescript
const SubmitButton = () => Effect.gen(function*() {
  const form = yield* LoginForm.form;

  return yield* $.button({
    type: "submit",
    disabled: form.isSubmitting,
  }, "Login");
});
```

## Field to Signal Mapping

The form maps Field types to appropriate reactive primitives:

| Field Type | Reactive Primitive | Rationale |
|------------|-------------------|-----------|
| `Field.make(Schema)` | `Signal<T>` | Leaf values |
| `Field.make({ ...fields })` | `Signal.Struct<T>` | Fixed keys with per-key access |
| `Field.Array(Field)` | `Signal.Array<T>` | Get `push`, `remove`, `move`, `swap` for free |
| `Field.Map(Field)` | `Signal.Map<K, V>` | Dynamic key-value pairs |

### Signal.Struct (Implemented in @effex/core)

For nested objects with known keys, `Signal.Struct` allows granular updates without reconstructing the whole object:

```typescript
type SignalStruct<T extends Record<string, unknown>> = Readable<T> & {
  // Each key becomes a Signal for that field
  [K in keyof T]: Signal<T[K]>;
} & {
  // Batch update multiple keys
  update: (partial: Partial<T>) => Effect<void>;
  // Replace entire value
  replace: (value: T) => Effect<void>;
};
```

Usage:

```typescript
const billing: SignalStruct<{ street: string, city: string }>;

// Granular updates - no spread needed!
yield* billing.street.set("123 Main St");
yield* billing.city.set("Austin");

// Batch update
yield* billing.update({ street: "456 Oak Ave", city: "Dallas" });

// Read whole value
const value = yield* billing.get; // { street: "456 Oak Ave", city: "Dallas" }
```

### Nested Field Access

`Field.make` accepts either a Schema (leaf) or a record of Fields (nested). This allows per-field configuration at any depth:

```typescript
const OrderForm = Form.make({
  customer: Field.make(Schema.String),
  billing: Field.make({
    address: Field.make({
      street: Field.make(Schema.String, { validateOn: 'blur' }),
      city: Field.make(Schema.String, { validateOn: 'change' }),
    }),
  }),
});

// Each level is a SignalStruct until you hit a leaf
form.billing                    // SignalStruct<{ address: { street, city }}>
form.billing.address            // SignalStruct<{ street: string, city: string }>
form.billing.address.street     // Signal<string>

yield* form.billing.address.street.set("New Street");
```

Field.make signature:

```typescript
// Leaf field - wraps a Schema
function make<S extends Schema.Schema>(
  schema: S,
  config?: FieldConfig
): Field<Schema.Schema.Type<S>>;

// Nested field - wraps a record of Fields
function make<F extends Record<string, Field<any>>>(
  fields: F,
  config?: FieldConfig  // Config applies to this level (e.g., group validation)
): Field<{ [K in keyof F]: Field.Type<F[K]> }>;
```

## Array Fields Example

Dynamic lists get full Signal.Array power. Use `Field.Array` for array fields:

```typescript
const ContactForm = Form.make({
  name: Field.make(Schema.String),
  emails: Field.Array(
    Field.make(Schema.String.pipe(Schema.email()), { validateOn: 'blur' })
  ),
});

const EmailList = () => Effect.gen(function*() {
  const emails = yield* ContactForm.fields.emails;

  // Full Signal.Array API
  yield* emails.push("new@email.com");
  yield* emails.remove(2);
  yield* emails.move(0, 3);

  return yield* each(emails, {
    // render each email input...
  });
});
```

For arrays of structs, each element is a `Signal.Struct`:

```typescript
const OrderForm = Form.make({
  items: Field.Array(
    Field.make({
      product: Field.make(Schema.String),
      quantity: Field.make(Schema.Number.pipe(Schema.positive())),
    })
  ),
});

const ItemRow = (index: number) => Effect.gen(function*() {
  const items = yield* OrderForm.fields.items;
  const item = items.at(index); // Signal.Struct<{ product, quantity }>

  yield* item.quantity.set(5);
});
```

## Separation of Concerns

The form definition (data layer) is separate from field rendering (UI layer):

- **Form**: Schema, validation, state shape
- **Field Components**: How to render inputs, labels, error messages

This means one `LoginForm` definition can be rendered completely differently in different contexts (modal vs full page, different styling, different field arrangements).

## Configuration & Callbacks

### Layered Callbacks

Callbacks can be registered at both the form definition level and the instance level. Both run (form-level first, then instance-level):

```typescript
// Form-level: global behavior (analytics, logging) + defaults
const LoginForm = Form.make({
  email: Field.make(Schema.String.pipe(Schema.email())),
  password: Field.make(Schema.String.pipe(Schema.minLength(8))),
}, {
  validateOn: 'blur',
  onSubmit: (ctx) => telemetry.track("login_attempt", ctx.encoded)
});

// Instance-level: specific action
yield* LoginForm.provide({
  defaults: { email: "", password: "" },
  onSubmit: (ctx) => authService.login(ctx.decoded)
}, children);
```

### Callback Signatures

```typescript
interface SubmitContext<Encoded, Decoded> {
  encoded: Encoded;           // Raw form values (schema input type)
  decoded: Decoded;           // Validated/transformed (schema output type)
  form: {
    isValid: boolean;
    errors: readonly ParseError[];
    touched: ReadonlySet<string>;
    dirty: ReadonlySet<string>;
  };
}

type OnSubmit<E, D, Err, R> = (ctx: SubmitContext<E, D>) => Effect<void, Err, R>
```

### Requirements Flow Through Types

The Form type is generic over its callback requirements. Requirements from both form-level and instance-level callbacks flow up through the type system:

```typescript
interface Form<Fields, R = never> {
  provide: <R2>(
    config: ProvideConfig<Fields, R2>,
    children: Element
  ) => Effect<Element, never, R | R2 | Scope>
}

// Form-level callback requires Telemetry
const LoginForm = Form.make({
  email: Field.make(Schema.String.pipe(Schema.email())),
  password: Field.make(Schema.String),
}, {
  onSubmit: (ctx) => telemetry.track("login")
});
// LoginForm: Form<typeof fields, Telemetry>

// Instance callback requires AuthService
yield* LoginForm.provide({
  defaults: { email: "", password: "" },
  onSubmit: (ctx) => authService.login(ctx.decoded)
}, children);
// This Effect requires: Telemetry | AuthService | Scope

// Caller must have both services in scope (or provide via Layer)
```

This is idiomatic Effect - requirements compose naturally and the type system tracks them.

## Future Considerations

### Lenses

If we need more power for dynamic path access or complex transformations, we could add lens support:

```typescript
// Dynamic path access
const street = form.at("billing.address.street"); // Signal<string>

// Or full lens composition
const streetLens = Form.lens(billing, address, street);
```

For now, Signal.Struct's property traversal covers the common cases.

### Field Components on Form Object

Some libraries attach field components directly to the form (`<LoginForm.email />`). We decided against this because:
1. It conflates data and UI concerns
2. Limits flexibility in how fields are rendered
3. The `yield* LoginForm.field("email")` pattern is already typed and ergonomic

## Resolved Design Decisions

### Cross-Field Validation

Use `Schema.filter` refinements on the struct itself. These are inherently form-level concerns, so errors surface at the form level (not individual fields):

```typescript
const SignupForm = Form.make(
  Schema.Struct({
    email: Schema.String.pipe(Schema.email()),
    password: Schema.String.pipe(Schema.minLength(8)),
    confirmPassword: Schema.String,
  }).pipe(
    Schema.filter(
      (data) => data.password === data.confirmPassword,
      { message: "Passwords must match" }
    )
  )
);

// Errors surface at form level
const FormErrors = () => Effect.gen(function*() {
  const form = yield* SignupForm.form;

  return yield* when(Readable.map(form.errors, e => e.length > 0), {
    true: () => $.div({ class: "form-errors" }, /* render errors */)
  });
});
```

### Async Validation

Use `Schema.filterEffect` for async validation (e.g., checking if email is taken). Same pattern as cross-field - errors surface at form level:

```typescript
const SignupForm = Form.make(
  Schema.Struct({
    email: Schema.String.pipe(Schema.email()),
    username: Schema.String,
  }).pipe(
    Schema.filterEffect((data) =>
      Effect.gen(function*() {
        const available = yield* checkUsernameAvailable(data.username);
        return available;
      }),
      { message: "Username already taken" }
    )
  )
);
```

### Form Arrays (Nested Sub-Forms)

For arrays of structs, the Form's schema-to-signal mapping creates nested `Signal.Struct` elements automatically:

```typescript
const OrderForm = Form.make(
  Schema.Struct({
    customer: Schema.String,
    items: Schema.Array(
      Schema.Struct({
        product: Schema.String,
        quantity: Schema.Number.pipe(Schema.positive()),
        price: Schema.Number.pipe(Schema.positive()),
      })
    ),
  })
);

const ItemRow = (index: number) => Effect.gen(function*() {
  const items = yield* OrderForm.fields.items;
  const item = items.at(index); // Signal.Struct<{ product, quantity, price }>

  // Granular field access within array element
  yield* item.quantity.set(5);
  yield* item.product.set("Widget");

  // Or read individual fields
  const qty = yield* item.quantity.get;
});
```

This "smart" behavior lives in the Form's schema mapping, not in `Signal.Array` itself. The Form recursively builds the reactive structure:

- `Schema.Struct` → `Signal.Struct`
- `Schema.Array(Schema.Struct(...))` → `Signal.Array` with `Signal.Struct` elements
- `Schema.Array(Schema.String)` → `Signal.Array` with `Signal<string>` elements

The primitive types stay simple and composable; Form orchestrates them based on schema shape.
