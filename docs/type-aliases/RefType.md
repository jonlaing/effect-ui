[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RefType

# Type Alias: RefType

> **RefType** = `object`

Defined in: [src/dom/Ref.ts:7](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Ref.ts#L7)

Ref module namespace for creating element references.

## Properties

### make()

> **make**: \<`A`\>() => `Effect`\<`Ref`\<`A`\>, `never`, `Scope`\>

Defined in: [src/dom/Ref.ts:56](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Ref.ts#L56)

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
