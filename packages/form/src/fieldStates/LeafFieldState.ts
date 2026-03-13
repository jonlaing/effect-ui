import { Effect, Either, ParseResult, Schema, Scope } from "effect";

import { Readable, Signal } from "@effex/core";

import type { FieldConfig, LeafField } from "../Field.js";
import type { LeafFieldState } from "../FieldState.js";

export const createLeafFieldState = <A, I>(
  field: LeafField<A, I>,
  defaultValue: unknown,
  config: FieldConfig,
): Effect.Effect<LeafFieldState<A>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const value = yield* Signal.make(defaultValue as A);
    const touched = yield* Signal.make(false);
    const focused = yield* Signal.make(false);
    const initialValue = defaultValue as A;

    // Dirty = value differs from initial
    const dirty = Readable.map(value, (v) => v !== initialValue);

    // Validation errors - computed based on validateOn config
    const errors: Readable.Readable<readonly ParseResult.ParseIssue[]> =
      Readable.map(Readable.zipAll([value, touched] as const), ([v, t]) => {
        // Don't validate until touched (for blur mode)
        if (config.validateOn === "blur" && !t) {
          return [];
        }

        // For submit mode, don't auto-validate
        if (config.validateOn === "submit") {
          return [];
        }

        // Validate using schema
        const result = Schema.decodeUnknownEither(field.schema)(v);
        if (Either.isLeft(result)) {
          return result.left.issue ? [result.left.issue] : [];
        }
        return [];
      });

    const leafState: LeafFieldState<A> = {
      value,
      errors,
      touched,
      dirty,
      set: (v: A) => value.set(v),
      update: (f: (v: A) => A) => value.update(f),
      blur: () =>
        Effect.gen(function* () {
          yield* touched.set(true);
          yield* focused.set(false);
        }),
      focus: () => focused.set(true),
      reset: () =>
        Effect.gen(function* () {
          yield* value.set(initialValue);
          yield* touched.set(false);
          yield* focused.set(false);
        }),
    };

    return leafState;
  });
