import { Effect, Stream } from "effect";
import type { Readable } from "@core/Readable";
import { map as mapReadable } from "@core/Readable";

const isReadable = (value: unknown): value is Readable<unknown> =>
  value !== null &&
  typeof value === "object" &&
  "get" in value &&
  "changes" in value &&
  "values" in value;

/**
 * Tagged template literal for creating reactive strings.
 * Interpolated Readable values will automatically update the string when they change.
 *
 * @example
 * ```ts
 * const name = yield* Signal.make("World")
 * const count = yield* Signal.make(0)
 *
 * // Static parts stay static, reactive parts update
 * const message = t`Hello, ${name}! Count: ${count}`
 *
 * // Use in elements
 * div([message])  // Updates when name or count changes
 * ```
 */
export const t = (
  strings: TemplateStringsArray,
  ...values: readonly (Readable<unknown> | unknown)[]
): Readable<string> => {
  const readables: Readable<unknown>[] = [];

  values.forEach((value) => {
    if (isReadable(value)) {
      readables.push(value);
    }
  });

  if (readables.length === 0) {
    const staticResult = strings.reduce(
      (acc, str, i) =>
        acc + str + (values[i] !== undefined ? String(values[i]) : ""),
      "",
    );

    const readable: Readable<string> = {
      get: Effect.succeed(staticResult),
      changes: Stream.empty,
      values: Stream.make(staticResult),
      map: (f) => mapReadable(readable, f),
    };
    return readable;
  }

  const buildStringWithCurrentValues = (currentValues: unknown[]): string => {
    let result = "";
    let readableIndex = 0;
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < values.length) {
        const value = values[i];
        if (isReadable(value)) {
          result += String(currentValues[readableIndex]);
          readableIndex++;
        } else {
          result += String(value);
        }
      }
    }
    return result;
  };

  const getCurrentValues = (): Effect.Effect<unknown[]> =>
    Effect.all(readables.map((r) => r.get));

  function combineValuesWithData(): Stream.Stream<string> {
    if (readables.length === 0) {
      return Stream.make(buildStringWithCurrentValues([]));
    }

    if (readables.length === 1) {
      return Stream.map(readables[0].values, (v) =>
        buildStringWithCurrentValues([v]),
      );
    }

    const streams = readables.map((r) => r.values);
    let currentVals: unknown[] = new Array(readables.length);

    return streams
      .reduce(
        (acc: Stream.Stream<unknown[]>, stream, idx) => {
          if (idx === 0) {
            return Stream.map(stream, (v) => {
              currentVals[0] = v;
              return currentVals.slice();
            });
          }
          return Stream.zipLatestWith(acc, stream, (arr: unknown[], v) => {
            const newArr = [...arr];
            newArr[idx] = v;
            currentVals = newArr;
            return newArr;
          });
        },
        Stream.never as Stream.Stream<unknown[]>,
      )
      .pipe(
        Stream.map((vals: unknown[]) => buildStringWithCurrentValues(vals)),
      );
  }

  const readable: Readable<string> = {
    get: Effect.map(getCurrentValues(), buildStringWithCurrentValues),
    changes: combineValuesWithData().pipe(Stream.drop(1)),
    values: combineValuesWithData(),
    map: (f) => mapReadable(readable, f),
  };

  return readable;
};
