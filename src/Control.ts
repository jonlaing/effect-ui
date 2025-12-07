import { Effect, Scope, Stream } from "effect"
import type { Readable } from "./Readable.js"
import { map as mapReadable } from "./Readable.js"
import type { Element } from "./Element"

/**
 * Catches errors from a render function and displays a fallback element.
 * @param tryRender - Function that may fail with an error
 * @param catchRender - Function to render the error fallback
 *
 * @example
 * ```ts
 * ErrorBoundary(
 *   () => riskyComponent(),
 *   (error) => div(["Something went wrong: ", String(error)])
 * )
 * ```
 */
export const ErrorBoundary = <E>(
  tryRender: () => Effect.Effect<HTMLElement, E, Scope.Scope>,
  catchRender: (error: E) => Element
): Element =>
  Effect.gen(function* () {
    const result = yield* tryRender().pipe(Effect.either)

    if (result._tag === "Left") {
      return yield* catchRender(result.left)
    }

    return result.right
  })

/**
 * Renders a fallback while waiting for an async render to complete.
 * @param asyncRender - Async function that returns the final element
 * @param fallbackRender - Function to render the loading state
 *
 * @example
 * ```ts
 * Suspense(
 *   () => fetchAndRenderUserProfile(userId),
 *   () => div(["Loading..."])
 * )
 * ```
 */
export const Suspense = (
  asyncRender: () => Effect.Effect<HTMLElement, never, Scope.Scope>,
  fallbackRender: () => Element
): Element =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    const container = document.createElement("div")
    container.style.display = "contents"

    // Render fallback immediately
    const fallback = yield* fallbackRender()
    container.appendChild(fallback)

    // Start async render in background, then swap when ready
    yield* asyncRender().pipe(
      Effect.tap((element) =>
        Effect.sync(() => {
          container.replaceChild(element, fallback)
        })
      ),
      Effect.forkIn(scope)
    )

    return container as HTMLElement
  })

/**
 * Combines Suspense with ErrorBoundary for async renders that may fail.
 * @param asyncRender - Async function that may fail
 * @param fallbackRender - Function to render the loading state
 * @param catchRender - Function to render the error state
 *
 * @example
 * ```ts
 * SuspenseWithBoundary(
 *   () => fetchAndRenderData(),
 *   () => div(["Loading..."]),
 *   (error) => div(["Failed to load: ", String(error)])
 * )
 * ```
 */
export const SuspenseWithBoundary = <E>(
  asyncRender: () => Effect.Effect<HTMLElement, E, Scope.Scope>,
  fallbackRender: () => Element,
  catchRender: (error: E) => Element
): Element =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    const container = document.createElement("div")
    container.style.display = "contents"

    // Render fallback immediately
    const fallback = yield* fallbackRender()
    container.appendChild(fallback)

    // Start async render in background
    yield* asyncRender().pipe(
      Effect.either,
      Effect.tap((result) =>
        Effect.gen(function* () {
          if (result._tag === "Left") {
            const errorElement = yield* catchRender(result.left)
            container.replaceChild(errorElement, fallback)
          } else {
            container.replaceChild(result.right, fallback)
          }
        })
      ),
      Effect.forkIn(scope)
    )

    return container as HTMLElement
  })

/**
 * Conditionally render one of two elements based on a reactive boolean.
 * @param condition - Reactive boolean value
 * @param onTrue - Element to render when true
 * @param onFalse - Element to render when false
 *
 * @example
 * ```ts
 * const isLoggedIn = yield* Signal.make(false)
 * when(
 *   isLoggedIn,
 *   () => div(["Welcome back!"]),
 *   () => div(["Please log in"])
 * )
 * ```
 */
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

/**
 * A case for pattern matching with {@link match}.
 */
export interface MatchCase<A> {
  /** The value to match against */
  readonly pattern: A
  /** Element to render when matched */
  readonly render: () => Element
}

/**
 * Pattern match on a reactive value and render the corresponding element.
 * @param value - Reactive value to match against
 * @param cases - Array of pattern-render pairs
 * @param fallback - Optional fallback if no pattern matches
 *
 * @example
 * ```ts
 * type Status = "loading" | "success" | "error"
 * const status = yield* Signal.make<Status>("loading")
 *
 * match(status, [
 *   { pattern: "loading", render: () => div(["Loading..."]) },
 *   { pattern: "success", render: () => div(["Done!"]) },
 *   { pattern: "error", render: () => div(["Failed"]) },
 * ])
 * ```
 */
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

/**
 * Render a list of items with efficient updates using keys.
 * @param items - Reactive array of items
 * @param keyFn - Function to extract a unique key from each item
 * @param render - Function to render each item (receives a Readable for the item)
 *
 * @example
 * ```ts
 * interface Todo { id: string; text: string }
 * const todos = yield* Signal.make<Todo[]>([])
 *
 * each(
 *   todos,
 *   (todo) => todo.id,
 *   (todo) => li([todo.map(t => t.text)])
 * )
 * ```
 */
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
