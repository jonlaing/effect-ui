[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / RefType

# Type Alias: RefType

> **RefType** = `object`

Defined in: src/Ref.ts:7

Ref module namespace for creating element references.

## Properties

### make()

> **make**: \<`A`\>() => `Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

Defined in: src/Ref.ts:52

Create a Ref to hold a reference to a DOM element.

#### Type Parameters

##### A

`A` *extends* `HTMLElement`

#### Returns

`Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

#### Example

```ts
const inputRef = yield* Ref.make<HTMLInputElement>()

// Later, focus the input
yield* inputRef.element.pipe(
  Effect.tap((el) => Effect.sync(() => el.focus()))
)
```
