import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { Reaction } from "@effex/dom";
import { Field, makeField, makeFieldArray } from "./Field";

describe("Field", () => {
  describe("makeField", () => {
    it("should create a field with initial value", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "hello",
              validation: "submit",
              schemaValidate: () => Effect.succeed([]),
            });
            return yield* field.value.get;
          }),
        ),
      );

      expect(result).toBe("hello");
    });

    it("should track touched state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "",
              validation: "submit",
              schemaValidate: () => Effect.succeed([]),
            });

            const before = yield* field.touched.get;
            yield* field.touch();
            const after = yield* field.touched.get;

            return { before, after };
          }),
        ),
      );

      expect(result.before).toBe(false);
      expect(result.after).toBe(true);
    });

    it("should track dirty state when value changes", async () => {
      const lastDirty = { value: false };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "initial",
              validation: "submit",
              schemaValidate: () => Effect.succeed([]),
            });

            yield* Reaction.make([field.dirty], ([d]) =>
              Effect.sync(() => {
                lastDirty.value = d;
              }),
            );

            expect(lastDirty.value).toBe(false);

            yield* field.value.set("changed");
            yield* Effect.sleep(10);

            expect(lastDirty.value).toBe(true);

            // Setting back to initial should make it not dirty
            yield* field.value.set("initial");
            yield* Effect.sleep(10);

            expect(lastDirty.value).toBe(false);
          }),
        ),
      );
    });

    it("should reset field to initial state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "initial",
              validation: "submit",
              schemaValidate: () => Effect.succeed([]),
            });

            yield* field.value.set("changed");
            yield* field.touch();
            yield* field.setErrors(["some error"]);

            yield* field.reset();

            const value = yield* field.value.get;
            const touched = yield* field.touched.get;
            const errors = yield* field.errors.get;

            return { value, touched, errors };
          }),
        ),
      );

      expect(result.value).toBe("initial");
      expect(result.touched).toBe(false);
      expect(result.errors).toEqual([]);
    });

    it("should set manual errors", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "",
              validation: "submit",
              schemaValidate: () => Effect.succeed([]),
            });

            yield* Reaction.make([field.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            yield* field.setErrors(["Error 1", "Error 2"]);
            yield* Effect.sleep(50);
          }),
        ),
      );

      expect(lastErrors.value).toEqual(["Error 1", "Error 2"]);
    });

    it("should validate on explicit validate() call", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "",
              validation: "submit",
              schemaValidate: (value) =>
                Effect.succeed(value === "" ? ["Value is required"] : []),
            });

            const errors = yield* field.validate();
            return errors;
          }),
        ),
      );

      expect(result).toEqual(["Value is required"]);
    });

    it("should use custom equality function", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: { id: 1, name: "initial" },
              validation: "submit",
              schemaValidate: () => Effect.succeed([]),
              equals: (a, b) => a.id === b.id,
            });

            // Change name but keep same ID - should not be dirty
            yield* field.value.set({ id: 1, name: "changed" });
            yield* Effect.sleep(10);
            const dirty = yield* field.dirty.get;

            return dirty;
          }),
        ),
      );

      expect(result).toBe(false);
    });
  });

  describe("validation timing", () => {
    it("should validate on blur when validation is 'blur'", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "",
              validation: "blur",
              schemaValidate: (value) =>
                Effect.succeed(value === "" ? ["Required"] : []),
            });

            yield* Reaction.make([field.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            // Initially no errors (hasn't blurred yet)
            yield* Effect.sleep(50);
            expect(lastErrors.value).toEqual([]);

            // Touch (blur) the field
            yield* field.touch();
            yield* Effect.sleep(50);

            expect(lastErrors.value).toEqual(["Required"]);
          }),
        ),
      );
    });

    it("should validate on change when validation is 'change'", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "valid",
              validation: "change",
              schemaValidate: (value) =>
                Effect.succeed(value === "" ? ["Required"] : []),
            });

            yield* Reaction.make([field.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            // Initially valid
            yield* Effect.sleep(50);
            expect(lastErrors.value).toEqual([]);

            // Change to invalid value
            yield* field.value.set("");
            yield* Effect.sleep(50);

            expect(lastErrors.value).toEqual(["Required"]);
          }),
        ),
      );
    });

    it("should not auto-validate when validation is 'submit'", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "",
              validation: "submit",
              schemaValidate: (value) =>
                Effect.succeed(value === "" ? ["Required"] : []),
            });

            yield* Reaction.make([field.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            yield* field.touch();
            yield* field.value.set("something");
            yield* field.value.set("");
            yield* Effect.sleep(50);

            // Should never auto-validate
            expect(lastErrors.value).toEqual([]);
          }),
        ),
      );
    });

    it("should validate hybrid: blur first, then change", async () => {
      const lastErrors = { value: [] as readonly string[] };

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const field = yield* makeField({
              initial: "",
              validation: "hybrid",
              schemaValidate: (value) =>
                Effect.succeed(value === "" ? ["Required"] : []),
            });

            yield* Reaction.make([field.errors], ([e]) =>
              Effect.sync(() => {
                lastErrors.value = e;
              }),
            );

            // No validation before touched
            yield* Effect.sleep(50);
            expect(lastErrors.value).toEqual([]);

            // Touch triggers validation
            yield* field.touch();
            yield* Effect.sleep(50);
            expect(lastErrors.value).toEqual(["Required"]);

            // Subsequent changes trigger validation
            yield* field.value.set("valid");
            yield* Effect.sleep(50);
            expect(lastErrors.value).toEqual([]);

            yield* field.value.set("");
            yield* Effect.sleep(50);
            expect(lastErrors.value).toEqual(["Required"]);
          }),
        ),
      );
    });
  });

  describe("makeFieldArray", () => {
    it("should create field array with initial items", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a", "b", "c"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should append items", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.append("b");
            yield* fieldArray.append("c");

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should prepend items", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["b"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.prepend("a");

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["a", "b"]);
    });

    it("should insert at index", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a", "c"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.insert(1, "b");

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should remove at index", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a", "b", "c"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.remove(1);

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["a", "c"]);
    });

    it("should move items", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a", "b", "c"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.move(0, 2);

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["b", "c", "a"]);
    });

    it("should swap items", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a", "b", "c"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.swap(0, 2);

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["c", "b", "a"]);
    });

    it("should replace all items", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: ["a", "b"],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            yield* fieldArray.replace(["x", "y", "z"]);

            const items = yield* fieldArray.items.get;
            const values = yield* Effect.all(items.map((f) => f.value.get));
            return values;
          }),
        ),
      );

      expect(result).toEqual(["x", "y", "z"]);
    });

    it("should handle empty initial array", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const fieldArray = yield* makeFieldArray({
              initial: [] as string[],
              validation: "submit",
              itemSchemaValidate: () => Effect.succeed([]),
            });

            const items = yield* fieldArray.items.get;
            expect(items.length).toBe(0);

            yield* fieldArray.append("first");
            const afterAppend = yield* fieldArray.items.get;
            return afterAppend.length;
          }),
        ),
      );

      expect(result).toBe(1);
    });
  });

  describe("Field namespace", () => {
    it("should expose make function", () => {
      expect(Field.make).toBe(makeField);
    });

    it("should expose makeArray function", () => {
      expect(Field.makeArray).toBe(makeFieldArray);
    });
  });
});
