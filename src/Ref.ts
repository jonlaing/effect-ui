import { Deferred, Effect, Scope } from "effect"

/**
 * A reference to a DOM element that may not exist yet.
 * @template A - The specific HTMLElement type
 */
export interface Ref<A extends HTMLElement> {
  /** The current element, or null if not yet set */
  readonly current: A | null
  /** Effect that resolves when the element is available */
  readonly element: Effect.Effect<A>
  /** Internal setter - do not use directly */
  readonly _set: (element: A) => void
}

/**
 * Create a Ref to hold a reference to a DOM element.
 *
 * @example
 * ```ts
 * const inputRef = yield* Ref.make<HTMLInputElement>()
 *
 * // Later, focus the input
 * yield* inputRef.element.pipe(
 *   Effect.tap((el) => Effect.sync(() => el.focus()))
 * )
 * ```
 */
export const make = <A extends HTMLElement>(): Effect.Effect<Ref<A>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const deferred = yield* Deferred.make<A>()
    let current: A | null = null

    const ref: Ref<A> = {
      get current() {
        return current
      },
      element: Deferred.await(deferred),
      _set: (element: A) => {
        current = element
        Effect.runSync(Deferred.succeed(deferred, element))
      },
    }

    return ref
  })

/**
 * Ref module namespace for creating element references.
 */
export const Ref = {
  make,
}
