import { Deferred, Effect, Scope } from "effect"

export interface Ref<A extends HTMLElement> {
  readonly current: A | null
  readonly element: Effect.Effect<A>
  readonly _set: (element: A) => void
}

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

export const Ref = {
  make,
}
