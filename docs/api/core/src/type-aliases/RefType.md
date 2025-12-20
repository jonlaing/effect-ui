[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / RefType

# Type Alias: RefType

> **RefType** = `object`

Defined in: [packages/core/src/Ref.ts:8](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Ref.ts#L8)

Ref module namespace for creating mutable references.

## Properties

### make()

> **make**: \<`A`\>() => `Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

Defined in: [packages/core/src/Ref.ts:69](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Ref.ts#L69)

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
