import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import { Signal } from "./Signal.js"
import { Derived } from "./Derived.js"

describe("Derived.sync", () => {
  it("should compute derived value from single dependency", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(5)
          const doubled = yield* Derived.sync([count], ([n]) => n * 2)
          return yield* doubled.get
        })
      )
    )
    expect(result).toBe(10)
  })

  it("should compute derived value from multiple dependencies", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const a = yield* Signal.make(3)
          const b = yield* Signal.make(4)
          const sum = yield* Derived.sync([a, b], ([x, y]) => x + y)
          return yield* sum.get
        })
      )
    )
    expect(result).toBe(7)
  })

  it("should chain derived values", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(2)
          const doubled = yield* Derived.sync([count], ([n]) => n * 2)
          const quadrupled = yield* Derived.sync([doubled], ([n]) => n * 2)

          return yield* quadrupled.get
        })
      )
    )
    expect(result).toBe(8)
  })

  it("should map derived values", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const count = yield* Signal.make(5)
          const doubled = yield* Derived.sync([count], ([n]) => n * 2)
          const asString = doubled.map((n) => `Value: ${n}`)

          return yield* asString.get
        })
      )
    )
    expect(result).toBe("Value: 10")
  })

  it("should compute with complex transformation", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const items = yield* Signal.make([1, 2, 3, 4, 5])
          const stats = yield* Derived.sync([items], ([arr]) => ({
            sum: arr.reduce((a, b) => a + b, 0),
            count: arr.length,
            avg: arr.reduce((a, b) => a + b, 0) / arr.length,
          }))

          return yield* stats.get
        })
      )
    )
    expect(result).toEqual({ sum: 15, count: 5, avg: 3 })
  })
})

describe("Derived.async", () => {
  it("should handle async computation", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const userId = yield* Signal.make(1)

          const userData = yield* Derived.async([userId], ([id]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(10)
              return { id, name: `User ${id}` }
            })
          )

          // Wait for initial computation
          yield* Effect.sleep(50)

          const state = yield* userData.get
          return state.value
        })
      )
    )

    expect(result._tag).toBe("Some")
    if (result._tag === "Some") {
      expect(result.value).toEqual({ id: 1, name: "User 1" })
    }
  })

  it("should track loading state", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const userId = yield* Signal.make(1)

          const userData = yield* Derived.async([userId], ([id]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(100)
              return { id, name: `User ${id}` }
            })
          )

          // After computation completes
          yield* Effect.sleep(150)
          const state = yield* userData.get
          return { isLoading: state.isLoading, hasValue: state.value._tag === "Some" }
        })
      )
    )

    expect(result).toEqual({ isLoading: false, hasValue: true })
  })

  it("should map async derived values", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const num = yield* Signal.make(5)

          const asyncDouble = yield* Derived.async([num], ([n]) =>
            Effect.gen(function* () {
              yield* Effect.sleep(10)
              return n * 2
            })
          )

          yield* Effect.sleep(50)

          const mapped = asyncDouble.map((state) =>
            state.value._tag === "Some" ? state.value.value : 0
          )

          return yield* mapped.get
        })
      )
    )

    expect(result).toBe(10)
  })
})
