import { Effect } from "effect";

let counter = 0;

/**
 * Generate unique IDs for DOM elements.
 * Useful for ARIA relationships, label associations, and other cases
 * where elements need to reference each other by ID.
 *
 * @example
 * ```ts
 * // Basic usage
 * const id = yield* UniqueId.make()
 * // => "uid-1"
 *
 * // With prefix
 * const contentId = yield* UniqueId.make("collapsible-content")
 * // => "collapsible-content-1"
 *
 * // For ARIA relationships
 * Effect.gen(function* () {
 *   const labelId = yield* UniqueId.make("label")
 *   const inputId = yield* UniqueId.make("input")
 *
 *   return yield* $.div([
 *     $.label({ id: labelId, htmlFor: inputId }, "Name"),
 *     $.input({ id: inputId, "aria-labelledby": labelId }),
 *   ])
 * })
 * ```
 */
export const UniqueId = {
  /**
   * Generate a unique ID, optionally with a prefix.
   * @param prefix - Optional prefix for the ID (default: "uid")
   * @returns Effect that produces a unique string ID
   */
  make: (prefix = "uid"): Effect.Effect<string> =>
    Effect.sync(() => `${prefix}-${++counter}`),

  /**
   * Reset the counter (useful for testing).
   * @internal
   */
  _reset: (): Effect.Effect<void> =>
    Effect.sync(() => {
      counter = 0;
    }),
};
