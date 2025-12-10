import { describe, it, expect } from "vitest"
import { Effect, Fiber } from "effect"
import { Ref } from "./Ref"

describe("Ref", () => {
  it("should create a ref with null current initially", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLDivElement>()

          expect(ref.current).toBeNull()
        })
      )
    )
  })

  it("should update current when _set is called", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLDivElement>()
          const div = document.createElement("div")

          ref._set(div)

          expect(ref.current).toBe(div)
        })
      )
    )
  })

  it("should resolve element Effect when _set is called", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLDivElement>()
          const div = document.createElement("div")

          // Set the element
          ref._set(div)

          // Now element should resolve immediately
          const element = yield* ref.element

          expect(element).toBe(div)
        })
      )
    )
  })

  it("should wait for element when accessed before _set", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* Ref.make<HTMLInputElement>()
          const input = document.createElement("input")

          let resolved = false

          // Start waiting for element in background
          const fiber = yield* Effect.fork(
            ref.element.pipe(
              Effect.tap(() =>
                Effect.sync(() => {
                  resolved = true
                })
              )
            )
          )

          // Not resolved yet
          expect(resolved).toBe(false)

          // Set the element
          ref._set(input)

          // Wait for the fiber to complete
          const element = yield* Fiber.join(fiber)

          expect(resolved).toBe(true)
          expect(element).toBe(input)
        })
      )
    )
  })

  it("should work with specific element types", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const inputRef = yield* Ref.make<HTMLInputElement>()
          const buttonRef = yield* Ref.make<HTMLButtonElement>()

          const input = document.createElement("input")
          const button = document.createElement("button")

          inputRef._set(input)
          buttonRef._set(button)

          expect(inputRef.current).toBe(input)
          expect(buttonRef.current).toBe(button)

          const inputEl = yield* inputRef.element
          const buttonEl = yield* buttonRef.element

          expect(inputEl.tagName).toBe("INPUT")
          expect(buttonEl.tagName).toBe("BUTTON")
        })
      )
    )
  })
})
