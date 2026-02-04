import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  Field,
  Array as FieldArray,
  Map as FieldMap,
  FieldTypeId,
  isArrayField,
  isField,
  isLeafField,
  isMapField,
  isStructField,
  make,
} from "./Field";

describe("Field.make", () => {
  it("should create a leaf field from a Schema", () => {
    const field = make(Schema.String);

    expect(field[FieldTypeId]).toBe(FieldTypeId);
    expect(field._tag).toBe("Leaf");
    expect(isLeafField(field)).toBe(true);
  });

  it("should create a leaf field with config", () => {
    const field = make(Schema.String, { validateOn: "change", debounce: 300 });

    expect(field._tag).toBe("Leaf");
    expect(field.config.validateOn).toBe("change");
    expect(field.config.debounce).toBe(300);
  });

  it("should create a struct field from a record of fields", () => {
    const field = make({
      name: make(Schema.String),
      age: make(Schema.Number),
    });

    expect(field[FieldTypeId]).toBe(FieldTypeId);
    expect(field._tag).toBe("Struct");
    expect(isStructField(field)).toBe(true);
  });

  it("should create a struct field with config", () => {
    const field = make(
      {
        name: make(Schema.String),
        age: make(Schema.Number),
      },
      { validateOn: "blur" },
    );

    expect(field._tag).toBe("Struct");
    expect(field.config.validateOn).toBe("blur");
  });

  it("should create nested struct fields", () => {
    const field = make({
      user: make({
        name: make(Schema.String),
        email: make(Schema.String),
      }),
      settings: make({
        theme: make(Schema.String),
      }),
    });

    expect(field._tag).toBe("Struct");
    expect(isStructField(field)).toBe(true);
  });
});

describe("Field.Array", () => {
  it("should create an array field", () => {
    const field = FieldArray(make(Schema.String));

    expect(field[FieldTypeId]).toBe(FieldTypeId);
    expect(field._tag).toBe("Array");
    expect(isArrayField(field)).toBe(true);
  });

  it("should create an array field with config", () => {
    const field = FieldArray(make(Schema.String), { validateOn: "submit" });

    expect(field._tag).toBe("Array");
    expect(field.config.validateOn).toBe("submit");
  });

  it("should create an array of struct fields", () => {
    const field = FieldArray(
      make({
        name: make(Schema.String),
        email: make(Schema.String),
      }),
    );

    expect(field._tag).toBe("Array");
    expect(field.element._tag).toBe("Struct");
  });
});

describe("Field.Map", () => {
  it("should create a map field", () => {
    const field = FieldMap(Schema.String, make(Schema.Number));

    expect(field[FieldTypeId]).toBe(FieldTypeId);
    expect(field._tag).toBe("Map");
    expect(isMapField(field)).toBe(true);
  });

  it("should create a map field with config", () => {
    const field = FieldMap(Schema.String, make(Schema.Number), {
      validateOn: "change",
    });

    expect(field._tag).toBe("Map");
    expect(field.config.validateOn).toBe("change");
  });
});

describe("Type guards", () => {
  it("isField should return true for fields", () => {
    expect(isField(make(Schema.String))).toBe(true);
    expect(isField(make({ name: make(Schema.String) }))).toBe(true);
    expect(isField(FieldArray(make(Schema.String)))).toBe(true);
    expect(isField(FieldMap(Schema.String, make(Schema.Number)))).toBe(true);
  });

  it("isField should return false for non-fields", () => {
    expect(isField(null)).toBe(false);
    expect(isField(undefined)).toBe(false);
    expect(isField({})).toBe(false);
    expect(isField({ _tag: "Leaf" })).toBe(false);
    expect(isField(Schema.String)).toBe(false);
  });

  it("isLeafField should correctly identify leaf fields", () => {
    const leaf = make(Schema.String);
    const struct = make({ name: make(Schema.String) });

    expect(isLeafField(leaf)).toBe(true);
    expect(isLeafField(struct)).toBe(false);
  });

  it("isStructField should correctly identify struct fields", () => {
    const leaf = make(Schema.String);
    const struct = make({ name: make(Schema.String) });

    expect(isStructField(leaf)).toBe(false);
    expect(isStructField(struct)).toBe(true);
  });

  it("isArrayField should correctly identify array fields", () => {
    const leaf = make(Schema.String);
    const array = FieldArray(make(Schema.String));

    expect(isArrayField(leaf)).toBe(false);
    expect(isArrayField(array)).toBe(true);
  });

  it("isMapField should correctly identify map fields", () => {
    const leaf = make(Schema.String);
    const map = FieldMap(Schema.String, make(Schema.Number));

    expect(isMapField(leaf)).toBe(false);
    expect(isMapField(map)).toBe(true);
  });
});

describe("Field namespace export", () => {
  it("should expose all constructors and guards", () => {
    expect(Field.make).toBe(make);
    expect(Field.Array).toBe(FieldArray);
    expect(Field.Map).toBe(FieldMap);
    expect(Field.isField).toBe(isField);
    expect(Field.isLeafField).toBe(isLeafField);
    expect(Field.isStructField).toBe(isStructField);
    expect(Field.isArrayField).toBe(isArrayField);
    expect(Field.isMapField).toBe(isMapField);
    expect(Field.FieldTypeId).toBe(FieldTypeId);
  });
});
