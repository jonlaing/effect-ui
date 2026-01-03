import type { Effect, Option } from "effect";
import type { Readable } from "../Readable";

/**
 * Options for creating a synchronous Derived value.
 * @template A - The type of the derived value
 */
export interface DerivedOptions<A> {
  /** Custom equality function to determine if the value has changed */
  readonly equals?: (a: A, b: A) => boolean;
}

/**
 * State of an asynchronous derived value.
 * Each property is a Readable for fine-grained reactivity.
 * @template A - The type of the successful value
 * @template E - The type of the error
 */
export interface AsyncState<A, E = never> {
  /** Whether a computation is currently in progress */
  readonly isLoading: Readable<boolean>;
  /** The most recent successful value, if any */
  readonly value: Readable<Option.Option<A>>;
  /** The most recent error, if any */
  readonly error: Readable<Option.Option<E>>;
}

/**
 * Strategy for handling concurrent async computations.
 * - "abort": Cancel the previous computation when a new one starts
 * - "queue": Wait for the previous computation to complete
 * - "debounce": Delay computation and reset timer on new triggers
 */
export type AsyncStrategy = "abort" | "queue" | "debounce";

/**
 * Options for creating an asynchronous Derived value.
 * @template A - The type of the derived value
 */
export interface AsyncDerivedOptions<A> {
  /** Strategy for handling concurrent computations (default: "abort") */
  readonly strategy?: AsyncStrategy;
  /** Debounce delay in milliseconds (only used with "debounce" strategy) */
  readonly debounceMs?: number;
  /** Custom equality function to determine if the value has changed */
  readonly equals?: (a: A, b: A) => boolean;
}

/**
 * An asynchronous derived value that tracks loading and error states.
 * @template A - The type of the successful value
 * @template E - The type of the error
 */
export interface AsyncDerived<A, E = never> extends AsyncState<A, E> {
  /** Effect that resolves to the current value or fails with the current error */
  readonly await: Effect.Effect<A, E>;
}

/**
 * Extracts the value types from an array of Readables.
 * @template T - Tuple of Readable types
 */
export type ReadableValues<T extends readonly Readable<unknown>[]> = {
  [K in keyof T]: T[K] extends Readable<infer A> ? A : never;
};
