import { Effect, Schema, Scope } from "effect";
import { describe, expect, it } from "vitest";

import { Field } from "./Field";
import { Form, FormTypeId, isForm, make as makeForm } from "./Form";

// Helper to run form effects in tests
const runFormTest = <A>(
  effect: Effect.Effect<A, never, Scope.Scope>,
): Promise<A> => Effect.runPromise(Effect.scoped(effect));

describe("Form.make", () => {
  it("should create a form definition", () => {
    const form = makeForm({
      name: Field.make(Schema.String),
      email: Field.make(Schema.String),
    });

    expect(form[FormTypeId]).toBe(FormTypeId);
    expect(form._fields).toBeDefined();
    expect(form.fields).toBeDefined();
    expect(form.form).toBeDefined();
    expect(form.provide).toBeDefined();
  });

  it("should create field accessors for each field", () => {
    const form = makeForm({
      name: Field.make(Schema.String),
      age: Field.make(Schema.Number),
    });

    expect(form.fields.name).toBeDefined();
    expect(form.fields.age).toBeDefined();
  });

  it("should accept form-level config", () => {
    const form = makeForm(
      {
        name: Field.make(Schema.String),
      },
      {
        validateOn: "change",
        debounce: 300,
      },
    );

    expect(form[FormTypeId]).toBe(FormTypeId);
  });
});

describe("Form.provide", () => {
  it("should provide field state to children", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "John" } },
        Effect.gen(function* () {
          const nameField = yield* TestForm.fields.name;
          const value = yield* nameField.value.get;
          return value;
        }),
      ),
    );

    expect(result).toBe("John");
  });

  it("should provide form state to children", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          return yield* formState.isValid.get;
        }),
      ),
    );

    // Empty string is valid for Schema.String (no additional constraints)
    expect(result).toBe(true);
  });
});

describe("Field state", () => {
  it("should track field value", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "initial" } },
        Effect.gen(function* () {
          const nameField = yield* TestForm.fields.name;

          // Check initial value
          const initial = yield* nameField.value.get;

          // Update value
          yield* nameField.set("updated");
          const updated = yield* nameField.value.get;

          return { initial, updated };
        }),
      ),
    );

    expect(result.initial).toBe("initial");
    expect(result.updated).toBe("updated");
  });

  it("should track touched state", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "" } },
        Effect.gen(function* () {
          const nameField = yield* TestForm.fields.name;

          const beforeBlur = yield* nameField.touched.get;
          yield* nameField.blur();
          const afterBlur = yield* nameField.touched.get;

          return { beforeBlur, afterBlur };
        }),
      ),
    );

    expect(result.beforeBlur).toBe(false);
    expect(result.afterBlur).toBe(true);
  });

  it("should track dirty state", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "initial" } },
        Effect.gen(function* () {
          const nameField = yield* TestForm.fields.name;

          const beforeChange = yield* nameField.dirty.get;
          yield* nameField.set("changed");
          const afterChange = yield* nameField.dirty.get;

          return { beforeChange, afterChange };
        }),
      ),
    );

    expect(result.beforeChange).toBe(false);
    expect(result.afterChange).toBe(true);
  });

  it("should reset field to initial value", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "initial" } },
        Effect.gen(function* () {
          const nameField = yield* TestForm.fields.name;

          yield* nameField.set("changed");
          yield* nameField.blur();

          const beforeReset = {
            value: yield* nameField.value.get,
            touched: yield* nameField.touched.get,
          };

          yield* nameField.reset();

          const afterReset = {
            value: yield* nameField.value.get,
            touched: yield* nameField.touched.get,
          };

          return { beforeReset, afterReset };
        }),
      ),
    );

    expect(result.beforeReset.value).toBe("changed");
    expect(result.beforeReset.touched).toBe(true);
    expect(result.afterReset.value).toBe("initial");
    expect(result.afterReset.touched).toBe(false);
  });

  it("should update field value with function", async () => {
    const TestForm = makeForm({
      count: Field.make(Schema.Number),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { count: 5 } },
        Effect.gen(function* () {
          const countField = yield* TestForm.fields.count;

          yield* countField.update((n) => n + 1);
          const value = yield* countField.value.get;

          return value;
        }),
      ),
    );

    expect(result).toBe(6);
  });
});

describe("Field validation", () => {
  it("should validate on blur when validateOn is blur", async () => {
    const TestForm = makeForm(
      {
        email: Field.make(Schema.String.pipe(Schema.minLength(5)), {
          validateOn: "blur",
        }),
      },
      { validateOn: "blur" },
    );

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { email: "ab" } },
        Effect.gen(function* () {
          const emailField = yield* TestForm.fields.email;

          // Before blur, no errors should show
          const errorsBeforeBlur = yield* emailField.errors.get;

          yield* emailField.blur();

          // After blur, errors should appear
          const errorsAfterBlur = yield* emailField.errors.get;

          return {
            beforeBlur: errorsBeforeBlur.length,
            afterBlur: errorsAfterBlur.length,
          };
        }),
      ),
    );

    expect(result.beforeBlur).toBe(0);
    expect(result.afterBlur).toBeGreaterThan(0);
  });

  it("should validate on change when validateOn is change", async () => {
    const TestForm = makeForm({
      email: Field.make(Schema.String.pipe(Schema.minLength(5)), {
        validateOn: "change",
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { email: "ab" } },
        Effect.gen(function* () {
          const emailField = yield* TestForm.fields.email;

          // With validateOn: change, errors show immediately
          const errors = yield* emailField.errors.get;

          return errors.length;
        }),
      ),
    );

    expect(result).toBeGreaterThan(0);
  });

  it("should not auto-validate when validateOn is submit", async () => {
    const TestForm = makeForm({
      email: Field.make(Schema.String.pipe(Schema.minLength(5)), {
        validateOn: "submit",
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { email: "ab" } },
        Effect.gen(function* () {
          const emailField = yield* TestForm.fields.email;

          yield* emailField.blur();
          const errors = yield* emailField.errors.get;

          return errors.length;
        }),
      ),
    );

    expect(result).toBe(0);
  });
});

describe("Form state", () => {
  it("should track isValid across all fields", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String.pipe(Schema.minLength(1)), {
        validateOn: "change",
      }),
      email: Field.make(Schema.String.pipe(Schema.minLength(1)), {
        validateOn: "change",
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "", email: "" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;

          const invalidBoth = yield* formState.isValid.get;

          const nameField = yield* TestForm.fields.name;
          yield* nameField.set("John");

          const invalidOne = yield* formState.isValid.get;

          const emailField = yield* TestForm.fields.email;
          yield* emailField.set("john@example.com");

          const validAll = yield* formState.isValid.get;

          return { invalidBoth, invalidOne, validAll };
        }),
      ),
    );

    expect(result.invalidBoth).toBe(false);
    expect(result.invalidOne).toBe(false);
    expect(result.validAll).toBe(true);
  });

  it("should track isTouched across all fields", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
      email: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "", email: "" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;

          const initial = yield* formState.isTouched.get;

          const nameField = yield* TestForm.fields.name;
          yield* nameField.blur();

          const afterOneTouch = yield* formState.isTouched.get;

          return { initial, afterOneTouch };
        }),
      ),
    );

    expect(result.initial).toBe(false);
    expect(result.afterOneTouch).toBe(true);
  });

  it("should track isDirty across all fields", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
      email: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "initial", email: "initial" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;

          const initial = yield* formState.isDirty.get;

          const nameField = yield* TestForm.fields.name;
          yield* nameField.set("changed");

          const afterOneChange = yield* formState.isDirty.get;

          return { initial, afterOneChange };
        }),
      ),
    );

    expect(result.initial).toBe(false);
    expect(result.afterOneChange).toBe(true);
  });

  it("should get encoded values", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
      age: Field.make(Schema.Number),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "John", age: 30 } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          return yield* formState.getEncoded();
        }),
      ),
    );

    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should get decoded values when valid", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
      age: Field.make(Schema.Number),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "John", age: 30 } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          // Use Effect.orDie since we know these values are valid
          return yield* Effect.orDie(formState.getDecoded());
        }),
      ),
    );

    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should fail getDecoded when invalid", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String.pipe(Schema.minLength(5))),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "ab" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          const decoded = yield* Effect.either(formState.getDecoded());
          return decoded._tag;
        }),
      ),
    );

    expect(result).toBe("Left");
  });

  it("should validate all fields", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String.pipe(Schema.minLength(1)), {
        validateOn: "blur",
      }),
      email: Field.make(Schema.String.pipe(Schema.minLength(1)), {
        validateOn: "blur",
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "", email: "" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          const nameField = yield* TestForm.fields.name;
          const emailField = yield* TestForm.fields.email;

          // Before validate, fields are not touched
          const touchedBefore = {
            name: yield* nameField.touched.get,
            email: yield* emailField.touched.get,
          };

          const isValid = yield* formState.validate();

          // After validate, all fields should be touched
          const touchedAfter = {
            name: yield* nameField.touched.get,
            email: yield* emailField.touched.get,
          };

          return { touchedBefore, touchedAfter, isValid };
        }),
      ),
    );

    expect(result.touchedBefore.name).toBe(false);
    expect(result.touchedBefore.email).toBe(false);
    expect(result.touchedAfter.name).toBe(true);
    expect(result.touchedAfter.email).toBe(true);
    expect(result.isValid).toBe(false);
  });

  it("should reset all fields", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
      email: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "initial", email: "initial" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          const nameField = yield* TestForm.fields.name;
          const emailField = yield* TestForm.fields.email;

          // Change values
          yield* nameField.set("changed");
          yield* emailField.set("changed");
          yield* nameField.blur();
          yield* emailField.blur();

          const beforeReset = {
            name: yield* nameField.value.get,
            email: yield* emailField.value.get,
            isDirty: yield* formState.isDirty.get,
          };

          yield* formState.reset();

          const afterReset = {
            name: yield* nameField.value.get,
            email: yield* emailField.value.get,
            isDirty: yield* formState.isDirty.get,
          };

          return { beforeReset, afterReset };
        }),
      ),
    );

    expect(result.beforeReset.name).toBe("changed");
    expect(result.beforeReset.email).toBe("changed");
    expect(result.beforeReset.isDirty).toBe(true);
    expect(result.afterReset.name).toBe("initial");
    expect(result.afterReset.email).toBe("initial");
    expect(result.afterReset.isDirty).toBe(false);
  });
});

describe("Form submission", () => {
  it("should track isSubmitting state", async () => {
    const TestForm = makeForm({
      name: Field.make(Schema.String),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { name: "John" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;

          const initial = yield* formState.isSubmitting.get;

          return { initial };
        }),
      ),
    );

    expect(result.initial).toBe(false);
  });

  it("should call onSubmit handler with valid form", async () => {
    let submitCalled = false;
    let submittedValues: unknown = null;

    const TestForm = makeForm(
      {
        name: Field.make(Schema.String),
      },
      {
        onSubmit: (ctx) =>
          Effect.sync(() => {
            submitCalled = true;
            submittedValues = ctx.decoded;
          }),
      },
    );

    await runFormTest(
      TestForm.provide(
        { defaults: { name: "John" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          yield* formState.submit();
        }),
      ),
    );

    expect(submitCalled).toBe(true);
    expect(submittedValues).toEqual({ name: "John" });
  });

  it("should not call onSubmit when form is invalid", async () => {
    let submitCalled = false;

    const TestForm = makeForm(
      {
        name: Field.make(Schema.String.pipe(Schema.minLength(5)), {
          validateOn: "submit",
        }),
      },
      {
        onSubmit: () =>
          Effect.sync(() => {
            submitCalled = true;
          }),
      },
    );

    await runFormTest(
      TestForm.provide(
        { defaults: { name: "ab" } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          yield* formState.submit();
        }),
      ),
    );

    expect(submitCalled).toBe(false);
  });

  it("should call both form-level and instance-level onSubmit", async () => {
    const calls: string[] = [];

    const TestForm = makeForm(
      {
        name: Field.make(Schema.String),
      },
      {
        onSubmit: () =>
          Effect.sync(() => {
            calls.push("form-level");
          }),
      },
    );

    await runFormTest(
      TestForm.provide(
        {
          defaults: { name: "John" },
          onSubmit: () =>
            Effect.sync(() => {
              calls.push("instance-level");
            }),
        },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          yield* formState.submit();
        }),
      ),
    );

    expect(calls).toEqual(["form-level", "instance-level"]);
  });
});

describe("Type guards", () => {
  it("isForm should return true for forms", () => {
    const form = makeForm({
      name: Field.make(Schema.String),
    });

    expect(isForm(form)).toBe(true);
  });

  it("isForm should return false for non-forms", () => {
    expect(isForm(null)).toBe(false);
    expect(isForm(undefined)).toBe(false);
    expect(isForm({})).toBe(false);
    expect(isForm({ [FormTypeId]: "wrong" })).toBe(false);
  });
});

describe("Form namespace export", () => {
  it("should expose all functions", () => {
    expect(Form.make).toBe(makeForm);
    expect(Form.isForm).toBe(isForm);
    expect(Form.FormTypeId).toBe(FormTypeId);
  });
});

describe("StructField support", () => {
  it("should create a form with struct fields", () => {
    const form = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
        zip: Field.make(Schema.String),
      }),
    });

    expect(form[FormTypeId]).toBe(FormTypeId);
    expect(form.fields.address).toBeDefined();
  });

  it("should access nested field states through struct field", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          // Access nested field states
          const streetValue = yield* addressField.fields.street.value.get;
          const cityValue = yield* addressField.fields.city.value.get;

          return { streetValue, cityValue };
        }),
      ),
    );

    expect(result.streetValue).toBe("123 Main St");
    expect(result.cityValue).toBe("Springfield");
  });

  it("should update nested field values", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          // Update a nested field
          yield* addressField.fields.street.set("456 Oak Ave");

          const streetValue = yield* addressField.fields.street.value.get;
          return streetValue;
        }),
      ),
    );

    expect(result).toBe("456 Oak Ave");
  });

  it("should derive struct value from nested fields", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          // Update nested field
          yield* addressField.fields.city.set("Shelbyville");

          // Struct value should reflect the change
          const structValue = yield* addressField.value.get;
          return structValue;
        }),
      ),
    );

    expect(result.street).toBe("123 Main St");
    expect(result.city).toBe("Shelbyville");
  });

  it("should set struct value and propagate to nested fields", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          // Set the whole struct value
          yield* addressField.set({
            street: "789 Pine Rd",
            city: "Capital City",
          });

          // Nested fields should be updated
          const streetValue = yield* addressField.fields.street.value.get;
          const cityValue = yield* addressField.fields.city.value.get;

          return { streetValue, cityValue };
        }),
      ),
    );

    expect(result.streetValue).toBe("789 Pine Rd");
    expect(result.cityValue).toBe("Capital City");
  });

  it("should aggregate touched from nested fields", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          const touchedBefore = yield* addressField.touched.get;

          // Touch one nested field
          yield* addressField.fields.street.blur();

          const touchedAfter = yield* addressField.touched.get;

          return { touchedBefore, touchedAfter };
        }),
      ),
    );

    expect(result.touchedBefore).toBe(false);
    expect(result.touchedAfter).toBe(true);
  });

  it("should aggregate dirty from nested fields", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          const dirtyBefore = yield* addressField.dirty.get;

          // Change one nested field
          yield* addressField.fields.city.set("Changed City");

          const dirtyAfter = yield* addressField.dirty.get;

          return { dirtyBefore, dirtyAfter };
        }),
      ),
    );

    expect(result.dirtyBefore).toBe(false);
    expect(result.dirtyAfter).toBe(true);
  });

  it("should aggregate errors from nested fields", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String.pipe(Schema.minLength(5)), {
          validateOn: "change",
        }),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "AB", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          // Get aggregated errors (should include street validation error)
          const errors = yield* addressField.errors.get;

          return errors.length;
        }),
      ),
    );

    expect(result).toBeGreaterThan(0);
  });

  it("should reset all nested fields", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String),
        city: Field.make(Schema.String),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "123 Main St", city: "Springfield" },
          },
        },
        Effect.gen(function* () {
          const addressField = yield* TestForm.fields.address;

          // Change and touch fields
          yield* addressField.fields.street.set("Changed Street");
          yield* addressField.fields.city.set("Changed City");
          yield* addressField.fields.street.blur();
          yield* addressField.fields.city.blur();

          const beforeReset = {
            street: yield* addressField.fields.street.value.get,
            city: yield* addressField.fields.city.value.get,
            touched: yield* addressField.touched.get,
          };

          // Reset
          yield* addressField.reset();

          const afterReset = {
            street: yield* addressField.fields.street.value.get,
            city: yield* addressField.fields.city.value.get,
            touched: yield* addressField.touched.get,
          };

          return { beforeReset, afterReset };
        }),
      ),
    );

    expect(result.beforeReset.street).toBe("Changed Street");
    expect(result.beforeReset.city).toBe("Changed City");
    expect(result.beforeReset.touched).toBe(true);
    expect(result.afterReset.street).toBe("123 Main St");
    expect(result.afterReset.city).toBe("Springfield");
    expect(result.afterReset.touched).toBe(false);
  });

  it("should validate nested struct fields on form.validate()", async () => {
    const TestForm = makeForm({
      address: Field.make({
        street: Field.make(Schema.String.pipe(Schema.minLength(1)), {
          validateOn: "blur",
        }),
        city: Field.make(Schema.String.pipe(Schema.minLength(1)), {
          validateOn: "blur",
        }),
      }),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            address: { street: "", city: "" },
          },
        },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          const addressField = yield* TestForm.fields.address;

          // Before validate, nested fields are not touched
          const touchedBefore = {
            street: yield* addressField.fields.street.touched.get,
            city: yield* addressField.fields.city.touched.get,
          };

          const isValid = yield* formState.validate();

          // After validate, all nested fields should be touched
          const touchedAfter = {
            street: yield* addressField.fields.street.touched.get,
            city: yield* addressField.fields.city.touched.get,
          };

          return { touchedBefore, touchedAfter, isValid };
        }),
      ),
    );

    expect(result.touchedBefore.street).toBe(false);
    expect(result.touchedBefore.city).toBe(false);
    expect(result.touchedAfter.street).toBe(true);
    expect(result.touchedAfter.city).toBe(true);
    expect(result.isValid).toBe(false);
  });
});

describe("ArrayField support", () => {
  it("should create a form with array fields", () => {
    const form = makeForm({
      emails: Field.Array(Field.make(Schema.String)),
    });

    expect(form[FormTypeId]).toBe(FormTypeId);
    expect(form.fields.emails).toBeDefined();
  });

  it("should initialize with default values", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          const values = yield* tagsField.value.get;
          const length = yield* tagsField.length.get;

          return { values, length };
        }),
      ),
    );

    expect(result.values).toEqual(["one", "two", "three"]);
    expect(result.length).toBe(3);
  });

  it("should access individual item states", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["first", "second"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          const items = yield* tagsField.items.get;
          const firstValue = yield* items[0].value.get;
          const secondValue = yield* items[1].value.get;

          return { firstValue, secondValue, itemCount: items.length };
        }),
      ),
    );

    expect(result.firstValue).toBe("first");
    expect(result.secondValue).toBe("second");
    expect(result.itemCount).toBe(2);
  });

  it("should push items to the array", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.push("two", "three");

          const values = yield* tagsField.value.get;
          const items = yield* tagsField.items.get;

          return { values, itemCount: items.length };
        }),
      ),
    );

    expect(result.values).toEqual(["one", "two", "three"]);
    expect(result.itemCount).toBe(3);
  });

  it("should pop items from the array", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.pop();

          const values = yield* tagsField.value.get;
          return values;
        }),
      ),
    );

    expect(result).toEqual(["one", "two"]);
  });

  it("should unshift items to the beginning", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.unshift("one");

          const values = yield* tagsField.value.get;
          return values;
        }),
      ),
    );

    expect(result).toEqual(["one", "two", "three"]);
  });

  it("should shift items from the beginning", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.shift();

          const values = yield* tagsField.value.get;
          return values;
        }),
      ),
    );

    expect(result).toEqual(["two", "three"]);
  });

  it("should insert at specific index", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.insertAt(1, "two");

          const values = yield* tagsField.value.get;
          return values;
        }),
      ),
    );

    expect(result).toEqual(["one", "two", "three"]);
  });

  it("should remove at specific index", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.removeAt(1);

          const values = yield* tagsField.value.get;
          return values;
        }),
      ),
    );

    expect(result).toEqual(["one", "three"]);
  });

  it("should move items between indices", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.move(0, 2);

          const values = yield* tagsField.value.get;
          return values;
        }),
      ),
    );

    expect(result).toEqual(["two", "three", "one"]);
  });

  it("should clear all items", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two", "three"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.clear();

          const values = yield* tagsField.value.get;
          const length = yield* tagsField.length.get;

          return { values, length };
        }),
      ),
    );

    expect(result.values).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("should set entire array value", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["old"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          yield* tagsField.set(["new", "values"]);

          const values = yield* tagsField.value.get;
          const items = yield* tagsField.items.get;

          return { values, itemCount: items.length };
        }),
      ),
    );

    expect(result.values).toEqual(["new", "values"]);
    expect(result.itemCount).toBe(2);
  });

  it("should track dirty state", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          const dirtyBefore = yield* tagsField.dirty.get;

          yield* tagsField.push("three");

          const dirtyAfterPush = yield* tagsField.dirty.get;

          return { dirtyBefore, dirtyAfterPush };
        }),
      ),
    );

    expect(result.dirtyBefore).toBe(false);
    expect(result.dirtyAfterPush).toBe(true);
  });

  it("should aggregate touched from items", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          const touchedBefore = yield* tagsField.touched.get;

          // Touch one item
          const items = yield* tagsField.items.get;
          yield* items[0].blur();

          const touchedAfter = yield* tagsField.touched.get;

          return { touchedBefore, touchedAfter };
        }),
      ),
    );

    expect(result.touchedBefore).toBe(false);
    expect(result.touchedAfter).toBe(true);
  });

  it("should aggregate errors from items", async () => {
    const TestForm = makeForm({
      tags: Field.Array(
        Field.make(Schema.String.pipe(Schema.minLength(3)), {
          validateOn: "change",
        }),
      ),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["ab", "valid"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          // Check individual item errors first
          const items = yield* tagsField.items.get;
          const firstItemErrors = yield* items[0].errors.get;

          // Then check aggregated errors
          const aggregatedErrors = yield* tagsField.errors.get;

          return {
            firstItemErrors: firstItemErrors.length,
            aggregatedErrors: aggregatedErrors.length,
          };
        }),
      ),
    );

    // First item "ab" should have errors (minLength 3)
    expect(result.firstItemErrors).toBeGreaterThan(0);
    expect(result.aggregatedErrors).toBeGreaterThan(0);
  });

  it("should reset to initial values", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          // Modify
          yield* tagsField.push("three");
          yield* tagsField.removeAt(0);

          const beforeReset = yield* tagsField.value.get;

          yield* tagsField.reset();

          const afterReset = yield* tagsField.value.get;

          return { beforeReset, afterReset };
        }),
      ),
    );

    expect(result.beforeReset).toEqual(["two", "three"]);
    expect(result.afterReset).toEqual(["one", "two"]);
  });

  it("should update item state and reflect in value", async () => {
    const TestForm = makeForm({
      tags: Field.Array(Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["one", "two"] } },
        Effect.gen(function* () {
          const tagsField = yield* TestForm.fields.tags;

          // Update via item state
          const items = yield* tagsField.items.get;
          yield* items[0].set("updated");

          const firstItemValue = yield* items[0].value.get;

          return firstItemValue;
        }),
      ),
    );

    expect(result).toBe("updated");
  });

  it("should handle array of struct fields", async () => {
    const TestForm = makeForm({
      users: Field.Array(
        Field.make({
          name: Field.make(Schema.String),
          email: Field.make(Schema.String),
        }),
      ),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            users: [
              { name: "Alice", email: "alice@example.com" },
              { name: "Bob", email: "bob@example.com" },
            ],
          },
        },
        Effect.gen(function* () {
          const usersField = yield* TestForm.fields.users;

          const items = yield* usersField.items.get;

          // Access nested struct field state
          const aliceName = yield* items[0].fields.name.value.get;
          const bobEmail = yield* items[1].fields.email.value.get;

          // Add a new user
          yield* usersField.push({
            name: "Charlie",
            email: "charlie@example.com",
          });

          const newItems = yield* usersField.items.get;
          const charlieName = yield* newItems[2].fields.name.value.get;

          return {
            aliceName,
            bobEmail,
            charlieName,
            userCount: newItems.length,
          };
        }),
      ),
    );

    expect(result.aliceName).toBe("Alice");
    expect(result.bobEmail).toBe("bob@example.com");
    expect(result.charlieName).toBe("Charlie");
    expect(result.userCount).toBe(3);
  });

  it("should validate array items on form.validate()", async () => {
    const TestForm = makeForm({
      tags: Field.Array(
        Field.make(Schema.String.pipe(Schema.minLength(1)), {
          validateOn: "blur",
        }),
      ),
    });

    const result = await runFormTest(
      TestForm.provide(
        { defaults: { tags: ["", "valid"] } },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          const tagsField = yield* TestForm.fields.tags;

          // Before validate, items are not touched
          const items = yield* tagsField.items.get;
          const touchedBefore = yield* items[0].touched.get;

          const isValid = yield* formState.validate();

          // After validate, all items should be touched
          const touchedAfter = yield* items[0].touched.get;

          return { touchedBefore, touchedAfter, isValid };
        }),
      ),
    );

    expect(result.touchedBefore).toBe(false);
    expect(result.touchedAfter).toBe(true);
    expect(result.isValid).toBe(false);
  });
});

describe("MapField support", () => {
  it("should create a form with map fields", () => {
    const form = makeForm({
      metadata: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    expect(form[FormTypeId]).toBe(FormTypeId);
    expect(form.fields.metadata).toBeDefined();
  });

  it("should initialize with default values", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["theme", "dark"],
              ["language", "en"],
            ]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          const value = yield* settingsField.value.get;
          const size = yield* settingsField.size.get;

          return { theme: value.get("theme"), size };
        }),
      ),
    );

    expect(result.theme).toBe("dark");
    expect(result.size).toBe(2);
  });

  it("should access individual entry states", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["theme", "dark"],
              ["language", "en"],
            ]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          const themeEntry = yield* settingsField.getEntry("theme");
          const themeValue = yield* themeEntry!.value.get;

          const entries = yield* settingsField.entries.get;
          const entryCount = entries.size;

          return { themeValue, entryCount };
        }),
      ),
    );

    expect(result.themeValue).toBe("dark");
    expect(result.entryCount).toBe(2);
  });

  it("should set entry values", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([["theme", "dark"]]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          // Add new entry
          yield* settingsField.setEntry("language", "en");

          // Update existing entry
          yield* settingsField.setEntry("theme", "light");

          const value = yield* settingsField.value.get;
          return {
            theme: value.get("theme"),
            language: value.get("language"),
            size: value.size,
          };
        }),
      ),
    );

    expect(result.theme).toBe("light");
    expect(result.language).toBe("en");
    expect(result.size).toBe(2);
  });

  it("should delete entries", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["theme", "dark"],
              ["language", "en"],
            ]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          const deleted = yield* settingsField.delete("theme");

          const value = yield* settingsField.value.get;
          const entries = yield* settingsField.entries.get;

          return {
            deleted,
            hasTheme: value.has("theme"),
            hasLanguage: value.has("language"),
            entryCount: entries.size,
          };
        }),
      ),
    );

    expect(result.deleted).toBe(true);
    expect(result.hasTheme).toBe(false);
    expect(result.hasLanguage).toBe(true);
    expect(result.entryCount).toBe(1);
  });

  it("should clear all entries", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["theme", "dark"],
              ["language", "en"],
            ]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          yield* settingsField.clear();

          const size = yield* settingsField.size.get;
          const entries = yield* settingsField.entries.get;

          return { size, entryCount: entries.size };
        }),
      ),
    );

    expect(result.size).toBe(0);
    expect(result.entryCount).toBe(0);
  });

  it("should set entire map value", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([["old", "value"]]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          yield* settingsField.set(
            new Map([
              ["new", "value"],
              ["another", "entry"],
            ]),
          );

          const value = yield* settingsField.value.get;
          const entries = yield* settingsField.entries.get;

          return {
            hasOld: value.has("old"),
            hasNew: value.has("new"),
            size: value.size,
            entryCount: entries.size,
          };
        }),
      ),
    );

    expect(result.hasOld).toBe(false);
    expect(result.hasNew).toBe(true);
    expect(result.size).toBe(2);
    expect(result.entryCount).toBe(2);
  });

  it("should track dirty state", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([["theme", "dark"]]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          const dirtyBefore = yield* settingsField.dirty.get;

          yield* settingsField.setEntry("language", "en");

          const dirtyAfterAdd = yield* settingsField.dirty.get;

          return { dirtyBefore, dirtyAfterAdd };
        }),
      ),
    );

    expect(result.dirtyBefore).toBe(false);
    expect(result.dirtyAfterAdd).toBe(true);
  });

  it("should aggregate touched from entries", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["theme", "dark"],
              ["language", "en"],
            ]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          const touchedBefore = yield* settingsField.touched.get;

          // Touch one entry
          const themeEntry = yield* settingsField.getEntry("theme");
          yield* themeEntry!.blur();

          const touchedAfter = yield* settingsField.touched.get;

          return { touchedBefore, touchedAfter };
        }),
      ),
    );

    expect(result.touchedBefore).toBe(false);
    expect(result.touchedAfter).toBe(true);
  });

  it("should aggregate errors from entries", async () => {
    const TestForm = makeForm({
      settings: Field.Map(
        Schema.String,
        Field.make(Schema.String.pipe(Schema.minLength(3)), {
          validateOn: "change",
        }),
      ),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["valid", "abc"],
              ["invalid", "ab"],
            ]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          // Check individual entry errors
          const invalidEntry = yield* settingsField.getEntry("invalid");
          const entryErrors = yield* invalidEntry!.errors.get;

          // Check aggregated errors
          const aggregatedErrors = yield* settingsField.errors.get;

          return {
            entryErrors: entryErrors.length,
            aggregatedErrors: aggregatedErrors.length,
          };
        }),
      ),
    );

    expect(result.entryErrors).toBeGreaterThan(0);
    expect(result.aggregatedErrors).toBeGreaterThan(0);
  });

  it("should reset to initial values", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([["theme", "dark"]]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          // Modify
          yield* settingsField.setEntry("language", "en");
          yield* settingsField.delete("theme");

          const beforeReset = yield* settingsField.value.get;

          yield* settingsField.reset();

          const afterReset = yield* settingsField.value.get;

          return {
            beforeResetSize: beforeReset.size,
            beforeResetHasTheme: beforeReset.has("theme"),
            afterResetSize: afterReset.size,
            afterResetHasTheme: afterReset.has("theme"),
          };
        }),
      ),
    );

    expect(result.beforeResetSize).toBe(1);
    expect(result.beforeResetHasTheme).toBe(false);
    expect(result.afterResetSize).toBe(1);
    expect(result.afterResetHasTheme).toBe(true);
  });

  it("should update entry state and reflect in value", async () => {
    const TestForm = makeForm({
      settings: Field.Map(Schema.String, Field.make(Schema.String)),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([["theme", "dark"]]),
          },
        },
        Effect.gen(function* () {
          const settingsField = yield* TestForm.fields.settings;

          // Update via entry state
          const themeEntry = yield* settingsField.getEntry("theme");
          yield* themeEntry!.set("light");

          const entryValue = yield* themeEntry!.value.get;

          return entryValue;
        }),
      ),
    );

    expect(result).toBe("light");
  });

  it("should handle map of struct fields", async () => {
    const TestForm = makeForm({
      users: Field.Map(
        Schema.String,
        Field.make({
          name: Field.make(Schema.String),
          age: Field.make(Schema.Number),
        }),
      ),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            users: new Map([
              ["alice", { name: "Alice", age: 30 }],
              ["bob", { name: "Bob", age: 25 }],
            ]),
          },
        },
        Effect.gen(function* () {
          const usersField = yield* TestForm.fields.users;

          // Access nested struct field state
          const aliceEntry = yield* usersField.getEntry("alice");
          const aliceName = yield* aliceEntry!.fields.name.value.get;
          const aliceAge = yield* aliceEntry!.fields.age.value.get;

          // Add a new user
          yield* usersField.setEntry("charlie", { name: "Charlie", age: 35 });

          const entries = yield* usersField.entries.get;
          const charlieEntry = entries.get("charlie");
          const charlieName = yield* charlieEntry!.fields.name.value.get;

          return { aliceName, aliceAge, charlieName, userCount: entries.size };
        }),
      ),
    );

    expect(result.aliceName).toBe("Alice");
    expect(result.aliceAge).toBe(30);
    expect(result.charlieName).toBe("Charlie");
    expect(result.userCount).toBe(3);
  });

  it("should validate map entries on form.validate()", async () => {
    const TestForm = makeForm({
      settings: Field.Map(
        Schema.String,
        Field.make(Schema.String.pipe(Schema.minLength(1)), {
          validateOn: "blur",
        }),
      ),
    });

    const result = await runFormTest(
      TestForm.provide(
        {
          defaults: {
            settings: new Map([
              ["valid", "abc"],
              ["invalid", ""],
            ]),
          },
        },
        Effect.gen(function* () {
          const formState = yield* TestForm.form;
          const settingsField = yield* TestForm.fields.settings;

          // Before validate, entries are not touched
          const invalidEntry = yield* settingsField.getEntry("invalid");
          const touchedBefore = yield* invalidEntry!.touched.get;

          const isValid = yield* formState.validate();

          // After validate, all entries should be touched
          const touchedAfter = yield* invalidEntry!.touched.get;

          return { touchedBefore, touchedAfter, isValid };
        }),
      ),
    );

    expect(result.touchedBefore).toBe(false);
    expect(result.touchedAfter).toBe(true);
    expect(result.isValid).toBe(false);
  });
});
