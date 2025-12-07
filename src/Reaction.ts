import { Effect, Scope, Stream } from "effect"
import type { Readable } from "./Readable.js"

type ReadableValues<T extends readonly Readable<unknown>[]> = {
  [K in keyof T]: T[K] extends Readable<infer A> ? A : never
}

const combineReadables = <T extends readonly Readable<unknown>[]>(
  readables: T
): Stream.Stream<ReadableValues<T>> => {
  if (readables.length === 0) {
    return Stream.make([] as unknown as ReadableValues<T>)
  }

  if (readables.length === 1) {
    return Stream.map(readables[0].values, (a) => [a] as unknown as ReadableValues<T>)
  }

  const streams = readables.map((r) => r.values)
  return streams.reduce((acc: Stream.Stream<unknown[]>, stream, idx) => {
    if (idx === 0) {
      return Stream.map(stream, (a) => [a])
    }
    return Stream.zipLatestWith(acc, stream, (arr: unknown[], val) => [...arr, val])
  }, Stream.never as Stream.Stream<unknown[]>) as Stream.Stream<ReadableValues<T>>
}

/**
 * Create a side effect that runs whenever any of the dependencies change.
 * @param deps - Array of Readable dependencies to observe
 * @param effect - Effect to run when dependencies change, receiving current values
 */
export const make = <T extends readonly Readable<unknown>[]>(
  deps: T,
  effect: (values: ReadableValues<T>) => Effect.Effect<void>
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope

    yield* combineReadables(deps).pipe(
      Stream.runForEach((values) => effect(values)),
      Effect.forkIn(scope)
    )
  })

/**
 * Reaction module namespace for creating reactive side effects.
 */
export const Reaction = {
  make,
}
