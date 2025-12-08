[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RefType

# Type Alias: RefType

> **RefType** = `object`

Defined in: [src/dom/Ref.ts:7](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Ref.ts#L7)

Ref module namespace for creating element references.

## Properties

### make()

> **make**: \<`A`\>() => `Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

Defined in: [src/dom/Ref.ts:52](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Ref.ts#L52)

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
