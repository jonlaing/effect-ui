import { Effect } from "effect";

/**
 * Type tags for serialized values that JSON doesn't support natively
 */
const TYPE_TAG = "__effex_type__";
const VALUE_TAG = "__effex_value__";

type SerializedSpecial =
  | { [TYPE_TAG]: "undefined" }
  | { [TYPE_TAG]: "Date"; [VALUE_TAG]: string }
  | { [TYPE_TAG]: "BigInt"; [VALUE_TAG]: string }
  | { [TYPE_TAG]: "Map"; [VALUE_TAG]: [unknown, unknown][] }
  | { [TYPE_TAG]: "Set"; [VALUE_TAG]: unknown[] }
  | { [TYPE_TAG]: "RegExp"; [VALUE_TAG]: { source: string; flags: string } }
  | { [TYPE_TAG]: "URL"; [VALUE_TAG]: string }
  | { [TYPE_TAG]: "NaN" }
  | { [TYPE_TAG]: "Infinity" }
  | { [TYPE_TAG]: "-Infinity" };

/**
 * Serialize a value to a JSON-safe representation
 * Handles: Date, BigInt, Map, Set, RegExp, URL, undefined, NaN, Infinity
 */
export const serialize = <T>(value: T): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => JSON.stringify(value, replacer),
    catch: (error) =>
      new Error(
        `Failed to serialize value: ${error instanceof Error ? error.message : String(error)}`,
      ),
  });

/**
 * Deserialize a JSON string back to its original value
 * Restores: Date, BigInt, Map, Set, RegExp, URL, undefined, NaN, Infinity
 */
export const deserialize = <T>(json: string): Effect.Effect<T, Error> =>
  Effect.try({
    try: () => JSON.parse(json, reviver) as T,
    catch: (error) =>
      new Error(
        `Failed to deserialize value: ${error instanceof Error ? error.message : String(error)}`,
      ),
  });

/**
 * Synchronous serialize (for use in non-Effect contexts)
 */
export const serializeSync = <T>(value: T): string => {
  return JSON.stringify(value, replacer);
};

/**
 * Synchronous deserialize (for use in non-Effect contexts)
 */
export const deserializeSync = <T>(json: string): T => {
  return JSON.parse(json, reviver) as T;
};

/**
 * JSON.stringify replacer that handles special types.
 * Note: Uses `this` to access original values before toJSON() transforms them.
 */
function replacer(this: unknown, key: string, value: unknown): unknown {
  // Get the original value from parent object (before toJSON transforms)
  const originalValue =
    key === "" ? value : (this as Record<string, unknown>)[key];

  // Handle undefined (JSON.stringify normally omits undefined)
  if (originalValue === undefined) {
    return { [TYPE_TAG]: "undefined" } satisfies SerializedSpecial;
  }

  // Handle NaN
  if (typeof originalValue === "number" && Number.isNaN(originalValue)) {
    return { [TYPE_TAG]: "NaN" } satisfies SerializedSpecial;
  }

  // Handle Infinity
  if (originalValue === Infinity) {
    return { [TYPE_TAG]: "Infinity" } satisfies SerializedSpecial;
  }
  if (originalValue === -Infinity) {
    return { [TYPE_TAG]: "-Infinity" } satisfies SerializedSpecial;
  }

  // Handle BigInt
  if (typeof originalValue === "bigint") {
    return {
      [TYPE_TAG]: "BigInt",
      [VALUE_TAG]: originalValue.toString(),
    } satisfies SerializedSpecial;
  }

  // Handle Date (check original before toJSON converts to string)
  if (originalValue instanceof Date) {
    return {
      [TYPE_TAG]: "Date",
      [VALUE_TAG]: originalValue.toISOString(),
    } satisfies SerializedSpecial;
  }

  // Handle Map
  if (originalValue instanceof Map) {
    return {
      [TYPE_TAG]: "Map",
      [VALUE_TAG]: Array.from(originalValue.entries()),
    } satisfies SerializedSpecial;
  }

  // Handle Set
  if (originalValue instanceof Set) {
    return {
      [TYPE_TAG]: "Set",
      [VALUE_TAG]: Array.from(originalValue),
    } satisfies SerializedSpecial;
  }

  // Handle RegExp
  if (originalValue instanceof RegExp) {
    return {
      [TYPE_TAG]: "RegExp",
      [VALUE_TAG]: { source: originalValue.source, flags: originalValue.flags },
    } satisfies SerializedSpecial;
  }

  // Handle URL (check original before toString converts to string)
  if (originalValue instanceof URL) {
    return {
      [TYPE_TAG]: "URL",
      [VALUE_TAG]: originalValue.href,
    } satisfies SerializedSpecial;
  }

  return value;
}

/**
 * JSON.parse reviver that restores special types
 */
function reviver(_key: string, value: unknown): unknown {
  if (value !== null && typeof value === "object" && TYPE_TAG in value) {
    const typed = value as SerializedSpecial;

    switch (typed[TYPE_TAG]) {
      case "undefined":
        return undefined;

      case "NaN":
        return NaN;

      case "Infinity":
        return Infinity;

      case "-Infinity":
        return -Infinity;

      case "BigInt":
        return BigInt(typed[VALUE_TAG]);

      case "Date":
        return new Date(typed[VALUE_TAG]);

      case "Map":
        return new Map(typed[VALUE_TAG] as [unknown, unknown][]);

      case "Set":
        return new Set(typed[VALUE_TAG] as unknown[]);

      case "RegExp": {
        const { source, flags } = typed[VALUE_TAG];
        return new RegExp(source, flags);
      }

      case "URL":
        return new URL(typed[VALUE_TAG]);
    }
  }

  return value;
}

/**
 * Serialize loader data for embedding in HTML
 * Returns an HTML-safe script content string
 */
export const serializeForHtml = <T>(data: T): Effect.Effect<string, Error> =>
  Effect.map(serialize(data), (json) =>
    // Escape </script> and <!-- to prevent XSS
    json
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026"),
  );

/**
 * Synchronous version for HTML serialization
 */
export const serializeForHtmlSync = <T>(data: T): string => {
  const json = serializeSync(data);
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
};
