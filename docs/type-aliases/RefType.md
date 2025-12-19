[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RefType

# Type Alias: RefType

> **RefType** = `object`

Defined in: [src/core/Ref.ts:8](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Ref.ts#L8)

Ref module namespace for creating mutable references.

## Properties

### make()

> **make**: \<`A`\>() => `Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

Defined in: [src/core/Ref.ts:69](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Ref.ts#L69)

Create a Ref to hold a mutable reference to a value.

#### Type Parameters

##### A

`A`

#### Returns

`Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

#### Example

```ts
// For DOM elements
const inputRef = yield* Ref.make<HTMLInputElement>()

// Later, focus the input
yield* inputRef.value.pipe(
  Effect.tap((el) => Effect.sync(() => el.focus()))
)

// For any value
const cleanupRef = yield* Ref.make<() => void>()
cleanupRef.current = () => console.log("cleanup")
```
