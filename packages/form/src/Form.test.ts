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
