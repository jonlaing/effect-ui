import { Deferred, Effect, Predicate, Scope } from "effect";

export const TypeId = Symbol.for("@effex/Ref");
export type TypeId = typeof TypeId;

/**
 * A mutable reference that may not have a value yet.
 * Similar to React's useRef but with Effect integration.
 * @template A - The type of value held by the ref
 */
export interface Ref<A> {
  [TypeId]: TypeId;
  /** The current value, or null if not yet set */
  current: A | null;
  /** Effect that resolves when the value is available */
  readonly value: Effect.Effect<A>;
  /** Set the value (also completes the deferred) */
  readonly set: (value: A) => void;
}

export const isRef = (value: unknown): value is Ref<unknown> =>
  Predicate.hasProperty(value, TypeId);

/**
 * Create a Ref to hold a mutable reference to a value.
 *
 * @example
 * ```ts
 * // For DOM elements
 * const inputRef = yield* Ref.make<HTMLInputElement>()
 *
 * // Later, focus the input
 * yield* inputRef.value.pipe(
 *   Effect.tap((el) => Effect.sync(() => el.focus()))
 * )
 *
 * // For any value
 * const cleanupRef = yield* Ref.make<() => void>()
 * cleanupRef.current = () => console.log("cleanup")
 * ```
 */
export const make = <A>(): Effect.Effect<Ref<A>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const deferred = yield* Deferred.make<A>();
    let _current: A | null = null;
    let _resolved = false;

    const ref: Ref<A> = {
      [TypeId]: TypeId,
      get current() {
        return _current;
      },
      set current(value: A | null) {
        _current = value;
        if (value !== null && !_resolved) {
          _resolved = true;
          Effect.runSync(Deferred.succeed(deferred, value));
        }
      },
      value: Deferred.await(deferred),
      set: (value: A) => {
        _current = value;
        if (!_resolved) {
          _resolved = true;
          Effect.runSync(Deferred.succeed(deferred, value));
        }
      },
    };

    return ref;
  });

/**
 * Ref module namespace for creating mutable references.
 */
export const Ref = {
  make,
};
