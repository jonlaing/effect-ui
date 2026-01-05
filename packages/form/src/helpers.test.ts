import { describe, it, expect } from "vitest";
import { Effect, Schema } from "effect";
import {
  extractFieldErrors,
  validateField,
  validateForm,
  isEmptyObject,
  hasNoErrors,
  buildFieldEntries,
} from "./helpers";

describe("extractFieldErrors", () => {
  it("should extract errors for a specific field", async () => {
    const schema = Schema.Struct({
      email: Schema.String.pipe(Schema.nonEmptyString()),
      password: Schema.String,
    });

    const result = await Effect.runPromise(
      Schema.decodeUnknown(schema)({ email: "", password: "test" }).pipe(
        Effect.flip,
        Effect.map((error) => extractFieldErrors(error, "email")),
      ),
    );

    // Should have at least one error for email field
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return empty array for valid field", async () => {
    const schema = Schema.Struct({
      email: Schema.String.pipe(Schema.nonEmptyString()),
      password: Schema.String,
    });

    const result = await Effect.runPromise(
      Schema.decodeUnknown(schema)({ email: "", password: "test" }).pipe(
        Effect.flip,
        Effect.map((error) => extractFieldErrors(error, "password")),
      ),
    );

    expect(result).toEqual([]);
  });
});

describe("validateField", () => {
  it("should return errors for invalid field", async () => {
    const schema = Schema.Struct({
      name: Schema.String.pipe(Schema.minLength(3)),
    });

    const result = await Effect.runPromise(
      validateField(schema, { name: "ab" }, "name"),
    );

    // Should have at least one error
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return empty array for valid field", async () => {
    const schema = Schema.Struct({
      name: Schema.String.pipe(Schema.minLength(3)),
    });

    const result = await Effect.runPromise(
      validateField(schema, { name: "alice" }, "name"),
    );

    expect(result).toEqual([]);
  });
});

describe("validateForm", () => {
  const TestSchema = Schema.Struct({
    email: Schema.String.pipe(Schema.nonEmptyString()),
    password: Schema.String.pipe(Schema.minLength(8)),
    age: Schema.Number.pipe(Schema.greaterThan(0)),
  });

  it("should return empty object for valid form", async () => {
    const result = await Effect.runPromise(
      validateForm(TestSchema, {
        email: "test@example.com",
        password: "password123",
        age: 25,
      }),
    );

    expect(result).toEqual({});
  });

  it("should return errors grouped by field", async () => {
    const result = await Effect.runPromise(
      validateForm(TestSchema, {
        email: "",
        password: "short",
        age: -5,
      }),
    );

    // Should have errors - exact grouping depends on Schema implementation
    // At minimum, we should have some errors returned
    const totalErrors = Object.values(result).reduce(
      (sum, errs) => sum + (errs?.length ?? 0),
      0,
    );
    expect(totalErrors).toBeGreaterThan(0);

    // Email should have an error for being empty
    expect(result.email?.length).toBeGreaterThan(0);
  });

  it("should handle partially valid form", async () => {
    const result = await Effect.runPromise(
      validateForm(TestSchema, {
        email: "valid@email.com",
        password: "short",
        age: 30,
      }),
    );

    expect(result.email).toBeUndefined();
    expect(result.password?.length).toBeGreaterThan(0);
    expect(result.age).toBeUndefined();
  });

  it("should handle missing fields", async () => {
    const result = await Effect.runPromise(validateForm(TestSchema, {}));

    expect(Object.keys(result).length).toBeGreaterThan(0);
  });
});

describe("isEmptyObject", () => {
  it("should return true for empty object", () => {
    expect(isEmptyObject({})).toBe(true);
  });

  it("should return false for object with properties", () => {
    expect(isEmptyObject({ key: "value" })).toBe(false);
  });

  it("should return false for object with nested empty objects", () => {
    expect(isEmptyObject({ nested: {} })).toBe(false);
  });
});

describe("hasNoErrors", () => {
  it("should return true for empty error record", () => {
    expect(hasNoErrors({})).toBe(true);
  });

  it("should return true for record with empty arrays", () => {
    expect(
      hasNoErrors({
        email: [],
        password: [],
      }),
    ).toBe(true);
  });

  it("should return false for record with errors", () => {
    expect(
      hasNoErrors({
        email: ["Required"],
        password: [],
      }),
    ).toBe(false);
  });

  it("should return false for record with multiple errors", () => {
    expect(
      hasNoErrors({
        email: ["Required", "Invalid format"],
        password: ["Too short"],
      }),
    ).toBe(false);
  });
});

describe("buildFieldEntries", () => {
  it("should create field entries from schema", async () => {
    const schema = Schema.Struct({
      name: Schema.String,
      email: Schema.String,
    });

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const entries = yield* buildFieldEntries(
            { name: "Alice", email: "alice@example.com" },
            schema,
            "hybrid",
          );
          return entries.map(([key]) => key);
        }),
      ),
    );

    expect(result).toContain("name");
    expect(result).toContain("email");
  });

  it("should set initial values on fields", async () => {
    const schema = Schema.Struct({
      name: Schema.String,
    });

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const entries = yield* buildFieldEntries(
            { name: "Bob" },
            schema,
            "hybrid",
          );
          const [, field] = entries[0];
          // Field has a value property which is a Signal
          if ("value" in field && "get" in field.value) {
            return yield* field.value.get;
          }
          return null;
        }),
      ),
    );

    expect(result).toBe("Bob");
  });

  it("should create field arrays for array schema properties", async () => {
    const schema = Schema.Struct({
      tags: Schema.Array(Schema.String),
    });

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const entries = yield* buildFieldEntries(
            { tags: ["a", "b", "c"] },
            schema,
            "hybrid",
          );
          const [key, field] = entries[0];
          // Field arrays have items property
          const isFieldArray = "items" in field;
          return { key, isFieldArray };
        }),
      ),
    );

    expect(result.key).toBe("tags");
    expect(result.isFieldArray).toBe(true);
  });

  it("should handle empty initial values", async () => {
    const schema = Schema.Struct({
      name: Schema.String,
      age: Schema.Number,
    });

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const entries = yield* buildFieldEntries(
            { name: undefined, age: undefined },
            schema,
            "hybrid",
          );
          return entries.length;
        }),
      ),
    );

    expect(result).toBe(2);
  });

  it("should pass validation timing to fields", async () => {
    const schema = Schema.Struct({
      name: Schema.String.pipe(
        Schema.nonEmptyString({ message: () => "Required" }),
      ),
    });

    // Test that validation is set to "submit" - errors shouldn't appear until validate()
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const entries = yield* buildFieldEntries(
            { name: "" },
            schema,
            "submit",
          );
          const [, field] = entries[0];

          if ("errors" in field) {
            // With "submit" timing, errors should be empty until explicit validation
            yield* Effect.sleep(50);
            return yield* field.errors.get;
          }
          return null;
        }),
      ),
    );

    expect(result).toEqual([]);
  });
});
