import { Array as Arr, Effect, Schema, SchemaAST as AST, Either } from "effect";
import type { ParseResult } from "effect";
import { makeField, makeFieldArray } from "./Field";
import type { Field, FieldArray, ValidationTiming } from "./types";

/**
 * Convert a Path to an array of property keys.
 */
const pathToArray = (path: ParseResult.Path): PropertyKey[] =>
  Array.isArray(path) ? (path as PropertyKey[]) : [path as PropertyKey];

/**
 * Extract error messages from a ParseIssue for a specific field.
 */
const extractMessagesFromIssue = (
  issue: ParseResult.ParseIssue,
  targetField: string,
  currentPath: string[] = [],
): string[] => {
  const messages: string[] = [];

  switch (issue._tag) {
    case "Pointer": {
      const pathKeys = pathToArray(issue.path).map(String);
      const newPath = [...currentPath, ...pathKeys];
      messages.push(
        ...extractMessagesFromIssue(issue.issue, targetField, newPath),
      );
      break;
    }
    case "Composite": {
      const issues = Arr.isArray(issue.issues)
        ? (issue.issues as ParseResult.ParseIssue[])
        : [issue.issues as ParseResult.ParseIssue];
      for (const nestedIssue of issues) {
        messages.push(
          ...extractMessagesFromIssue(nestedIssue, targetField, currentPath),
        );
      }
      break;
    }
    case "Refinement":
    case "Transformation": {
      messages.push(
        ...extractMessagesFromIssue(issue.issue, targetField, currentPath),
      );
      break;
    }
    case "Type": {
      // Only add if this is for our target field
      if (
        currentPath[0] === targetField ||
        (currentPath.length === 0 && targetField === "_root")
      ) {
        const message = issue.message ?? `Invalid value`;
        messages.push(message);
      }
      break;
    }
    case "Missing": {
      if (
        currentPath[0] === targetField ||
        (currentPath.length === 0 && targetField === "_root")
      ) {
        const message = issue.message ?? `Field is required`;
        messages.push(message);
      }
      break;
    }
    case "Unexpected": {
      if (currentPath[0] === targetField) {
        const message = issue.message ?? `Unexpected field`;
        messages.push(message);
      }
      break;
    }
    case "Forbidden": {
      if (
        currentPath[0] === targetField ||
        (currentPath.length === 0 && targetField === "_root")
      ) {
        const message = issue.message ?? `Operation forbidden`;
        messages.push(message);
      }
      break;
    }
  }

  return messages;
};

/**
 * Extract error messages from a ParseError for a specific field.
 */
export const extractFieldErrors = (
  error: ParseResult.ParseError,
  fieldName: string,
): readonly string[] => extractMessagesFromIssue(error.issue, fieldName);

/**
 * Validate a single field value against a schema.
 */
export const validateField = <A>(
  schema: Schema.Schema<A>,
  value: unknown,
  fieldName: string,
): Effect.Effect<readonly string[]> =>
  Schema.decodeUnknown(schema)(value).pipe(
    Effect.either,
    Effect.map(
      Either.mapBoth({
        onLeft: (e) => extractFieldErrors(e, fieldName),
        onRight: () => [],
      }),
    ),
    Effect.map(Either.merge),
  );

/**
 * Extract all errors grouped by field from a ParseIssue.
 */
const extractAllErrors = (
  issue: ParseResult.ParseIssue,
  currentPath: string[] = [],
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  const addError = (fieldName: string, message: string) => {
    if (!errors[fieldName]) {
      errors[fieldName] = [];
    }
    errors[fieldName].push(message);
  };

  switch (issue._tag) {
    case "Pointer": {
      const pathKeys = pathToArray(issue.path).map(String);
      const newPath = [...currentPath, ...pathKeys];
      const nestedErrors = extractAllErrors(issue.issue, newPath);
      for (const [field, msgs] of Object.entries(nestedErrors)) {
        for (const msg of msgs) {
          addError(field, msg);
        }
      }
      break;
    }
    case "Composite": {
      const issues = Arr.isArray(issue.issues)
        ? (issue.issues as ParseResult.ParseIssue[])
        : [issue.issues as ParseResult.ParseIssue];
      for (const nestedIssue of issues) {
        const nestedErrors = extractAllErrors(nestedIssue, currentPath);
        for (const [field, msgs] of Object.entries(nestedErrors)) {
          for (const msg of msgs) {
            addError(field, msg);
          }
        }
      }
      break;
    }
    case "Refinement":
    case "Transformation": {
      const nestedErrors = extractAllErrors(issue.issue, currentPath);
      for (const [field, msgs] of Object.entries(nestedErrors)) {
        for (const msg of msgs) {
          addError(field, msg);
        }
      }
      break;
    }
    case "Type": {
      const fieldName = currentPath[0] || "_root";
      addError(fieldName, issue.message ?? `Invalid value`);
      break;
    }
    case "Missing": {
      const fieldName = currentPath[0] || "_root";
      addError(fieldName, issue.message ?? `Field is required`);
      break;
    }
    case "Unexpected": {
      const fieldName = currentPath[0] || "_root";
      addError(fieldName, issue.message ?? `Unexpected field`);
      break;
    }
    case "Forbidden": {
      const fieldName = currentPath[0] || "_root";
      addError(fieldName, issue.message ?? `Operation forbidden`);
      break;
    }
  }

  return errors;
};

/**
 * Validate entire form data against a schema.
 * Returns a map of field names to error arrays.
 */
export const validateForm = <S extends Schema.Schema.AnyNoContext>(
  schema: S,
  data: unknown,
): Effect.Effect<Record<string, readonly string[]>> =>
  Schema.decodeUnknown(schema)(data).pipe(
    Effect.either,
    Effect.map(
      Either.mapBoth({
        onLeft: (e) => extractAllErrors(e.issue),
        onRight: () => ({}),
      }),
    ),
    Effect.map(Either.merge),
  );

/**
 * Check if an object is empty (has no own properties).
 */
export const isEmptyObject = (obj: object): boolean =>
  Object.keys(obj).length === 0;

/**
 * Check if all error arrays in a record are empty.
 */
export const hasNoErrors = (
  errors: Record<string, readonly string[]>,
): boolean => Object.values(errors).every((arr) => arr.length === 0);

export const buildFieldEntries = <S extends Schema.Schema.AnyNoContext>(
  initalValues: Record<string, unknown>,
  schema: S,
  validation: ValidationTiming,
) =>
  Effect.all(
    AST.getPropertySignatures(schema.ast).map((prop) => {
      const fieldName = String(prop.name);
      const initial = initalValues[fieldName];

      // Check if the field is an array type (unwrap refinements to find TupleType)
      const isArrayField = AST.isTupleType(AST.typeAST(prop.type));

      return (
        isArrayField && Array.isArray(initial)
          ? makeFieldArray({
              initial,
              validation,
              itemSchemaValidate: () => Effect.succeed([]),
            })
          : makeField({
              initial,
              validation,
              schemaValidate: (value: unknown) =>
                validateForm(schema, { [fieldName]: value }).pipe(
                  Effect.map((errs) => errs[fieldName] ?? []),
                ),
            })
      ).pipe(
        Effect.map(
          (f: Field<unknown> | FieldArray<unknown>) =>
            [fieldName, f] as [string, Field<unknown> | FieldArray<unknown>],
        ),
      );
    }),
  );
