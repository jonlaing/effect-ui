import { Effect, Scope, Stream } from "effect"
import type { Readable } from "./Readable.js"
import { map as mapReadable } from "./Readable.js"
import type { Element } from "./Element.js"

export const when = (
  condition: Readable<boolean>,
  onTrue: () => Element,
  onFalse: () => Element
): Element =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    const container = document.createElement("div")
    container.style.display = "contents"

    let currentElement: HTMLElement | null = null
    let currentValue: boolean | null = null

    const render = (value: boolean): Effect.Effect<void, never, Scope.Scope> =>
      Effect.gen(function* () {
        if (value === currentValue) return

        currentValue = value
        const element = value ? onTrue() : onFalse()
        const newElement = yield* element

        if (currentElement) {
          container.replaceChild(newElement, currentElement)
        } else {
          container.appendChild(newElement)
        }
        currentElement = newElement
      })

    // Render initial value synchronously
    const initialValue = yield* condition.get
    yield* render(initialValue)

    // Then subscribe to future changes
    yield* condition.changes.pipe(
      Stream.runForEach((value) => Effect.scoped(render(value))),
      Effect.forkIn(scope)
    )

    return container as HTMLElement
  })

export interface MatchCase<A> {
  readonly pattern: A
  readonly render: () => Element
}

export const match = <A>(
  value: Readable<A>,
  cases: readonly MatchCase<A>[],
  fallback?: () => Element
): Element =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    const container = document.createElement("div")
    container.style.display = "contents"

    let currentElement: HTMLElement | null = null
    let currentPattern: A | null = null

    const render = (val: A): Effect.Effect<void, never, Scope.Scope> =>
      Effect.gen(function* () {
        if (val === currentPattern) return

        currentPattern = val
        const matchedCase = cases.find((c) => c.pattern === val)
        const element = matchedCase ? matchedCase.render() : fallback?.()

        if (!element) return

        const newElement = yield* element

        if (currentElement) {
          container.replaceChild(newElement, currentElement)
        } else {
          container.appendChild(newElement)
        }
        currentElement = newElement
      })

    // Render initial value synchronously
    const initialValue = yield* value.get
    yield* render(initialValue)

    // Then subscribe to future changes
    yield* value.changes.pipe(
      Stream.runForEach((val) => Effect.scoped(render(val))),
      Effect.forkIn(scope)
    )

    return container as HTMLElement
  })

export const each = <A>(
  items: Readable<readonly A[]>,
  keyFn: (item: A) => string,
  render: (item: Readable<A>) => Element
): Element =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    const container = document.createElement("div")
    container.style.display = "contents"

    const itemMap = new Map<
      string,
      {
        element: HTMLElement
        readable: {
          get: Effect.Effect<A>
          changes: Stream.Stream<A>
          values: Stream.Stream<A>
          map: <B>(f: (a: A) => B) => Readable<B>
          _update: (value: A) => void
        }
      }
    >()

    const updateList = (newItems: readonly A[]): Effect.Effect<void, never, Scope.Scope> =>
      Effect.gen(function* () {
        const newKeys = new Set(newItems.map(keyFn))

        for (const [key, entry] of itemMap) {
          if (!newKeys.has(key)) {
            container.removeChild(entry.element)
            itemMap.delete(key)
          }
        }

        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i]
          const key = keyFn(item)
          const existing = itemMap.get(key)

          if (existing) {
            existing.readable._update(item)

            const expectedPosition = i
            const currentPosition = Array.from(container.children).indexOf(existing.element)

            if (currentPosition !== expectedPosition) {
              if (expectedPosition >= container.children.length) {
                container.appendChild(existing.element)
              } else {
                container.insertBefore(existing.element, container.children[expectedPosition])
              }
            }
          } else {
            let currentValue = item
            const subscribers = new Set<(value: A) => void>()

            const itemReadable: {
              get: Effect.Effect<A>
              changes: Stream.Stream<A>
              values: Stream.Stream<A>
              map: <B>(f: (a: A) => B) => Readable<B>
              _update: (value: A) => void
            } = {
              get: Effect.sync(() => currentValue),
              get changes(): Stream.Stream<A> {
                return Stream.async<A>((emit) => {
                  const handler = (value: A) => emit.single(value)
                  subscribers.add(handler)
                  return Effect.sync(() => {
                    subscribers.delete(handler)
                  })
                })
              },
              get values(): Stream.Stream<A> {
                return Stream.concat(
                  Stream.make(currentValue),
                  this.changes
                )
              },
              map: function<B>(f: (a: A) => B): Readable<B> {
                return mapReadable(this as Readable<A>, f)
              },
              _update: (value: A) => {
                currentValue = value
                for (const handler of subscribers) {
                  handler(value)
                }
              },
            }

            const element = yield* render(itemReadable)

            if (i >= container.children.length) {
              container.appendChild(element)
            } else {
              container.insertBefore(element, container.children[i])
            }

            itemMap.set(key, { element, readable: itemReadable })
          }
        }
      })

    // Render initial items synchronously
    const initialItems = yield* items.get
    yield* updateList(initialItems)

    // Then subscribe to future changes
    yield* items.changes.pipe(
      Stream.runForEach((newItems) => Effect.scoped(updateList(newItems))),
      Effect.forkIn(scope)
    )

    return container as HTMLElement
  })
