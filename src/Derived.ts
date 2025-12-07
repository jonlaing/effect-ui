import { Cause, Chunk, Effect, Fiber, Option, Scope, Stream } from "effect"
import type { Readable } from "./Readable.js"
import { make as makeReadable } from "./Readable.js"

/**
 * Options for creating a synchronous Derived value.
 * @template A - The type of the derived value
 */
export interface DerivedOptions<A> {
  /** Custom equality function to determine if the value has changed */
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

/**
 * Create a synchronous derived value that recomputes when dependencies change.
 * @param deps - Array of Readable dependencies
 * @param compute - Function to compute the derived value from dependency values
 * @param options - Optional configuration
 */
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

/**
 * State of an asynchronous derived value.
 * @template A - The type of the successful value
 * @template E - The type of the error
 */
export interface AsyncState<A, E = never> {
  /** Whether a computation is currently in progress */
  readonly isLoading: boolean
  /** The most recent successful value, if any */
  readonly value: Option.Option<A>
  /** The most recent error, if any */
  readonly error: Option.Option<E>
}

/**
 * Strategy for handling concurrent async computations.
 * - "abort": Cancel the previous computation when a new one starts
 * - "queue": Wait for the previous computation to complete
 * - "debounce": Delay computation and reset timer on new triggers
 */
export type AsyncStrategy = "abort" | "queue" | "debounce"

/**
 * Options for creating an asynchronous Derived value.
 * @template A - The type of the derived value
 */
export interface AsyncDerivedOptions<A> {
  /** Strategy for handling concurrent computations (default: "abort") */
  readonly strategy?: AsyncStrategy
  /** Debounce delay in milliseconds (only used with "debounce" strategy) */
  readonly debounceMs?: number
  /** Custom equality function to determine if the value has changed */
  readonly equals?: (a: A, b: A) => boolean
}

/**
 * An asynchronous derived value that tracks loading and error states.
 * @template A - The type of the successful value
 * @template E - The type of the error
 */
export interface AsyncDerived<A, E = never> extends Readable<AsyncState<A, E>> {
  /** Effect that resolves to the current value or fails with the current error */
  readonly await: Effect.Effect<A, E>
}

/**
 * Create an asynchronous derived value that recomputes when dependencies change.
 * @param deps - Array of Readable dependencies
 * @param compute - Effect-returning function to compute the derived value
 * @param options - Optional configuration including concurrency strategy
 */
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

/**
 * Derived module namespace for creating computed reactive values.
 */
export const Derived = {
  sync,
  async,
}
