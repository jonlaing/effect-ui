import { Effect, Stream } from "effect"

export interface Readable<A> {
  readonly get: Effect.Effect<A>
  readonly changes: Stream.Stream<A>
  readonly values: Stream.Stream<A>
  readonly map: <B>(f: (a: A) => B) => Readable<B>
}

export const make = <A>(
  get: Effect.Effect<A>,
  getChanges: () => Stream.Stream<A>,
): Readable<A> => {
  const readable: Readable<A> = {
    get,
    get changes() {
      return getChanges()
    },
    get values() {
      return Stream.concat(Stream.fromEffect(get), getChanges())
    },
    map: <B>(f: (a: A) => B) => make(
      Effect.map(get, f),
      () => Stream.map(getChanges(), f),
    ),
  }
  return readable
}

export const map = <A, B>(self: Readable<A>, f: (a: A) => B): Readable<B> =>
  make(
    Effect.map(self.get, f),
    () => Stream.map(self.changes, f),
  )

export const fromStream = <A>(initial: A, stream: Stream.Stream<A>): Readable<A> => {
  let current = initial
  const tracked = Stream.tap(stream, (a) => Effect.sync(() => { current = a }))

  return make(
    Effect.sync(() => current),
    () => tracked,
  )
}
