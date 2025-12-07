import { Effect, Stream } from "effect"

/**
 * A reactive value that can be read and observed for changes.
 * @template A - The type of the value
 */
export interface Readable<A> {
  /** Get the current value */
  readonly get: Effect.Effect<A>
  /** Stream of value changes (does not include current value) */
  readonly changes: Stream.Stream<A>
  /** Stream of all values (current value followed by changes) */
  readonly values: Stream.Stream<A>
  /** Transform the readable value */
  readonly map: <B>(f: (a: A) => B) => Readable<B>
}

/**
 * Create a Readable from a getter effect and a changes stream factory.
 * @param get - Effect that returns the current value
 * @param getChanges - Factory function that returns a stream of changes
 */
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

/**
 * Transform a Readable's value using a mapping function.
 * @param self - The readable to transform
 * @param f - The mapping function
 */
export const map = <A, B>(self: Readable<A>, f: (a: A) => B): Readable<B> =>
  make(
    Effect.map(self.get, f),
    () => Stream.map(self.changes, f),
  )

/**
 * Create a Readable from an initial value and a stream of updates.
 * @param initial - The initial value
 * @param stream - Stream of value updates
 */
export const fromStream = <A>(initial: A, stream: Stream.Stream<A>): Readable<A> => {
  let current = initial
  const tracked = Stream.tap(stream, (a) => Effect.sync(() => { current = a }))

  return make(
    Effect.sync(() => current),
    () => tracked,
  )
}
