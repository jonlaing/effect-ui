import { describe, it, expect } from "vitest";
import { Effect, Schema } from "effect";
import { Reaction } from "@effex/dom";
import { Form } from "./Form";

describe("Form", () => {
  describe("Form.make", () => {
    it("should create a form with initial values", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
                password: Schema.String,
              }),
              initial: { email: "test@example.com", password: "secret123" },
            });

            const values = yield* form.getValues();
            return values;
          }),
        ),
      );

      expect(result).toEqual({
        email: "test@example.com",
        password: "secret123",
      });
    });

    it("should provide field access with correct initial values", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                name: Schema.String,
                age: Schema.Number,
              }),
              initial: { name: "Alice", age: 30 },
            });

            const name = yield* form.fields.name.value.get;
            const age = yield* form.fields.age.value.get;
            return { name, age };
          }),
        ),
      );

      expect(result).toEqual({ name: "Alice", age: 30 });
    });

    it("should track touched state per field", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
                password: Schema.String,
              }),
              initial: { email: "", password: "" },
            });

            const beforeTouch = yield* form.fields.email.touched.get;
            yield* form.fields.email.touch();
            const afterTouch = yield* form.fields.email.touched.get;
            const passwordTouched = yield* form.fields.password.touched.get;

            return { beforeTouch, afterTouch, passwordTouched };
          }),
        ),
      );

      expect(result.beforeTouch).toBe(false);
      expect(result.afterTouch).toBe(true);
      expect(result.passwordTouched).toBe(false);
    });

    it("should track dirty state when field value changes", async () => {
      const lastDirty = { value: false };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                name: Schema.String,
              }),
              initial: { name: "Initial" },
            });

            // Create a reaction to consume the dirty stream
            yield* Reaction.make([form.fields.name.dirty], ([d]) =>
              Effect.sync(() => {
                lastDirty.value = d;
              }),
            );

            // Wait for initial reaction to run
            yield* Effect.sleep(10);
            expect(lastDirty.value).toBe(false);

            // Change value
            yield* form.fields.name.value.set("Changed");
            yield* Effect.sleep(10);
          }),
        ),
      );

      expect(lastDirty.value).toBe(true);
    });

    it("should update field values", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
              }),
              initial: { email: "" },
            });

            yield* form.fields.email.value.set("new@example.com");
            const newValue = yield* form.fields.email.value.get;

            return newValue;
          }),
        ),
      );

      expect(result).toBe("new@example.com");
    });

    it("should reset form to initial values", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
                password: Schema.String,
              }),
              initial: { email: "initial@example.com", password: "initial" },
            });

            // Modify values
            yield* form.fields.email.value.set("changed@example.com");
            yield* form.fields.password.value.set("changed");
            yield* form.fields.email.touch();

            // Reset
            yield* form.reset();

            const values = yield* form.getValues();
            const emailTouched = yield* form.fields.email.touched.get;

            return { values, emailTouched };
          }),
        ),
      );

      expect(result.values).toEqual({
        email: "initial@example.com",
        password: "initial",
      });
      expect(result.emailTouched).toBe(false);
    });

    it("should track form-level isTouched", async () => {
      const lastTouched = { value: false };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                a: Schema.String,
                b: Schema.String,
              }),
              initial: { a: "", b: "" },
            });

            // Create a reaction to consume the isTouched stream
            yield* Reaction.make([form.isTouched], ([t]) =>
              Effect.sync(() => {
                lastTouched.value = t;
              }),
            );

            yield* Effect.sleep(10);
            expect(lastTouched.value).toBe(false);

            yield* form.fields.a.touch();
            yield* Effect.sleep(10);
          }),
        ),
      );

      expect(lastTouched.value).toBe(true);
    });

    it("should track form-level isDirty", async () => {
      const lastDirty = { value: false };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                a: Schema.String,
                b: Schema.String,
              }),
              initial: { a: "", b: "" },
            });

            // Create a reaction to consume the isDirty stream
            yield* Reaction.make([form.isDirty], ([d]) =>
              Effect.sync(() => {
                lastDirty.value = d;
              }),
            );

            yield* Effect.sleep(10);
            expect(lastDirty.value).toBe(false);

            yield* form.fields.a.value.set("changed");
            yield* Effect.sleep(10);
          }),
        ),
      );

      expect(lastDirty.value).toBe(true);
    });

    it("should set external errors via setErrors", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
              }),
              initial: { email: "" },
            });

            // Create a reaction to consume the errors stream
            yield* Reaction.make([form.fields.email.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            yield* Effect.sleep(10);

            yield* form.setErrors({
              email: ["Email already exists"],
            });

            yield* Effect.sleep(10);
          }),
        ),
      );

      expect(lastErrors.value).toContain("Email already exists");
    });
  });

  describe("Form validation", () => {
    it("should validate with submit timing only on submit", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String.pipe(Schema.nonEmptyString()),
              }),
              initial: { email: "" },
              validation: "submit",
            });

            // Touch the field - should not trigger validation
            yield* form.fields.email.touch();
            const errorsBeforeSubmit = yield* form.fields.email.errors.get;

            // Explicitly validate
            const validationResult = yield* form.validate();

            return { errorsBeforeSubmit, validationResult };
          }),
        ),
      );

      // With submit timing, errors should be empty until explicit validation
      expect(result.errorsBeforeSubmit).toHaveLength(0);
      // The validation result should have errors for the empty field
      expect(Object.keys(result.validationResult).length).toBeGreaterThan(0);
    });

    it("should validate entire form", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String.pipe(Schema.nonEmptyString()),
                password: Schema.String.pipe(Schema.minLength(8)),
              }),
              initial: { email: "", password: "short" },
            });

            const errors = yield* form.validate();
            return errors;
          }),
        ),
      );

      // Both fields should have errors
      expect(Object.keys(result)).toContain("email");
    });

    it("should track isValid state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                name: Schema.String,
              }),
              initial: { name: "Valid" },
            });

            // Form should start valid with valid initial data
            const isValid = yield* form.isValid.get;
            return isValid;
          }),
        ),
      );

      expect(result).toBe(true);
    });
  });

  describe("Form submission", () => {
    it("should call submit handler with form values", async () => {
      let submittedValues: { email: string; password: string } | null = null;

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
                password: Schema.String,
              }),
              initial: { email: "test@example.com", password: "password123" },
            });

            yield* form.submit((values) =>
              Effect.sync(() => {
                submittedValues = values;
              }),
            );
          }),
        ),
      );

      expect(submittedValues).toEqual({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should track isSubmitting state during submission", async () => {
      const states: boolean[] = [];

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                name: Schema.String,
              }),
              initial: { name: "Test" },
            });

            const before = yield* form.isSubmitting.get;
            states.push(before);

            yield* form.submit(() =>
              Effect.gen(function* () {
                const during = yield* form.isSubmitting.get;
                states.push(during);
              }),
            );

            const after = yield* form.isSubmitting.get;
            states.push(after);
          }),
        ),
      );

      expect(states).toEqual([false, true, false]);
    });

    it("should not call submit handler when validation fails", async () => {
      let handlerCalled = false;

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String.pipe(Schema.nonEmptyString()),
              }),
              initial: { email: "" },
            });

            yield* form.submit(() =>
              Effect.sync(() => {
                handlerCalled = true;
              }),
            );
          }),
        ),
      );

      expect(handlerCalled).toBe(false);
    });

    it("should touch all fields on submit attempt", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                a: Schema.String.pipe(Schema.nonEmptyString()),
                b: Schema.String.pipe(Schema.nonEmptyString()),
              }),
              initial: { a: "", b: "" },
            });

            yield* form.submit(() => Effect.void);

            const aTouched = yield* form.fields.a.touched.get;
            const bTouched = yield* form.fields.b.touched.get;

            return { aTouched, bTouched };
          }),
        ),
      );

      expect(result.aTouched).toBe(true);
      expect(result.bTouched).toBe(true);
    });
  });

  describe("Field-level operations", () => {
    it("should set field-level errors", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
              }),
              initial: { email: "" },
            });

            // Create a reaction to consume the errors stream
            yield* Reaction.make([form.fields.email.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            yield* Effect.sleep(10);

            yield* form.fields.email.setErrors(["Custom error"]);
            yield* Effect.sleep(10);
          }),
        ),
      );

      expect(lastErrors.value).toContain("Custom error");
    });

    it("should reset individual field", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
              }),
              initial: { email: "initial@example.com" },
            });

            yield* form.fields.email.value.set("changed@example.com");
            yield* form.fields.email.touch();
            yield* form.fields.email.setErrors(["Some error"]);

            yield* form.fields.email.reset();

            const value = yield* form.fields.email.value.get;
            const touched = yield* form.fields.email.touched.get;

            return { value, touched };
          }),
        ),
      );

      expect(result.value).toBe("initial@example.com");
      expect(result.touched).toBe(false);
    });

    it("should validate individual field", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String.pipe(Schema.nonEmptyString()),
              }),
              initial: { email: "" },
            });

            const errors = yield* form.fields.email.validate();
            return errors;
          }),
        ),
      );

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Form errors aggregation", () => {
    it("should aggregate errors from all fields", async () => {
      const lastErrors = { value: {} as Record<string, readonly string[]> };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                a: Schema.String,
                b: Schema.String,
              }),
              initial: { a: "", b: "" },
            });

            // Create a reaction to consume the errors stream
            yield* Reaction.make([form.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            yield* Effect.sleep(10);

            yield* form.fields.a.setErrors(["Error A"]);
            yield* form.fields.b.setErrors(["Error B"]);

            yield* Effect.sleep(10);
          }),
        ),
      );

      expect(lastErrors.value.a).toContain("Error A");
      expect(lastErrors.value.b).toContain("Error B");
    });
  });
});
