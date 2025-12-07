import { Cause, Chunk, Effect, Fiber, Option, Scope, Stream } from "effect"
import type { Readable } from "./Readable.js"
import { make as makeReadable } from "./Readable.js"

export interface DerivedOptions<A> {
  readonly equals?: (a: A, b: A) => boolean
}

const defaultEquals = <A>(a: A, b: A): boolean => a === b

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

const getCurrentValues = <T extends readonly Readable<unknown>[]>(
  readables: T
): Effect.Effect<ReadableValues<T>> =>
  Effect.all(readables.map((r) => r.get)) as Effect.Effect<ReadableValues<T>>

export const sync = <T extends readonly Readable<unknown>[], B>(
  deps: T,
  compute: (values: ReadableValues<T>) => B,
  options?: DerivedOptions<B>
): Effect.Effect<Readable<B>, never, Scope.Scope> => {
  const equals = options?.equals ?? defaultEquals

  return Effect.gen(function* () {
    const initialValues = yield* getCurrentValues(deps)
    let currentValue = compute(initialValues)

    // Create a fresh stream for each subscriber
    const getChangesStream = () =>
      combineReadables(deps).pipe(
        Stream.drop(1),
        Stream.map(compute),
        Stream.filterMap((next) => {
          if (equals(currentValue, next)) {
            return Option.none()
          }
          currentValue = next
          return Option.some(next)
        })
      )

    return makeReadable(
      Effect.sync(() => currentValue),
      getChangesStream
    )
  })
}

export interface AsyncState<A, E = never> {
  readonly isLoading: boolean
  readonly value: Option.Option<A>
  readonly error: Option.Option<E>
}

export type AsyncStrategy = "abort" | "queue" | "debounce"

export interface AsyncDerivedOptions<A> {
  readonly strategy?: AsyncStrategy
  readonly debounceMs?: number
  readonly equals?: (a: A, b: A) => boolean
}

export interface AsyncDerived<A, E = never> extends Readable<AsyncState<A, E>> {
  readonly await: Effect.Effect<A, E>
}

export const async = <T extends readonly Readable<unknown>[], A, E = never>(
  deps: T,
  compute: (values: ReadableValues<T>) => Effect.Effect<A, E>,
  options?: AsyncDerivedOptions<A>
): Effect.Effect<AsyncDerived<A, E>, never, Scope.Scope> => {
  const strategy = options?.strategy ?? "abort"
  const debounceMs = options?.debounceMs ?? 0
  const equals = options?.equals ?? defaultEquals

  return Effect.gen(function* () {
    let currentState: AsyncState<A, E> = {
      isLoading: true,
      value: Option.none(),
      error: Option.none(),
    }

    let currentFiber: Fiber.RuntimeFiber<A, E> | null = null
    const scope = yield* Effect.scope

    const runComputation = (values: ReadableValues<T>): Effect.Effect<AsyncState<A, E>> =>
      Effect.gen(function* () {
        if (strategy === "abort" && currentFiber !== null) {
          yield* Fiber.interrupt(currentFiber)
          currentFiber = null
        }

        currentState = {
          isLoading: true,
          value: currentState.value,
          error: Option.none(),
        }

        const fiber = yield* Effect.forkIn(compute(values), scope)
        currentFiber = fiber

        const result = yield* Fiber.await(fiber)

        if (result._tag === "Success") {
          const newValue = result.value
          const shouldUpdate =
            Option.isNone(currentState.value) ||
            !equals(Option.getOrThrow(currentState.value), newValue)

          if (shouldUpdate) {
            currentState = {
              isLoading: false,
              value: Option.some(newValue),
              error: Option.none(),
            }
          } else {
            currentState = {
              ...currentState,
              isLoading: false,
            }
          }
        } else {
          const failures = Cause.failures(result.cause)
          const firstFailure = Chunk.head(failures)
          currentState = {
            isLoading: false,
            value: currentState.value,
            error: Option.isSome(firstFailure) ? Option.some(firstFailure.value as E) : Option.none(),
          }
        }

        currentFiber = null
        return currentState
      })

    const initialValues = yield* getCurrentValues(deps)
    const initialState = yield* runComputation(initialValues)
    currentState = initialState

    // Create a fresh stream for each subscriber
    const getChangesStream = () => {
      let stream = combineReadables(deps).pipe(
        Stream.drop(1),
        Stream.mapEffect(runComputation)
      )

      if (strategy === "debounce" && debounceMs > 0) {
        stream = Stream.debounce(stream, debounceMs)
      }

      return stream
    }

    const readable = makeReadable(
      Effect.sync(() => currentState),
      getChangesStream
    )

    const derived: AsyncDerived<A, E> = {
      ...readable,
      await: Effect.gen(function* () {
        const state = currentState
        if (Option.isSome(state.error)) {
          return yield* Effect.fail(Option.getOrThrow(state.error))
        }
        if (Option.isSome(state.value)) {
          return Option.getOrThrow(state.value)
        }
        return yield* Effect.fail(new Error("No value available") as unknown as E)
      }),
    }

    return derived
  })
}

export const Derived = {
  sync,
  async,
}
