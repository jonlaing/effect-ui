[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Reaction

# Variable: Reaction

> `const` **Reaction**: `object`

Defined in: [packages/core/src/Reaction.ts:74](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Reaction.ts#L74)

Reaction module namespace for creating reactive side effects.

## Type Declaration

### make()

> **make**: \<`T`\>(`deps`, `effect`) => `Effect`\<`void`, `never`, `Scope`\>

Create a side effect that runs whenever any of the dependencies change.

#### Type Parameters

##### T

`T` *extends* readonly [`Readable`](../interfaces/Readable.md)\<`unknown`\>[]

#### Parameters

##### deps

`T`

Array of Readable dependencies to observe

##### effect

(`values`) => `Effect`\<`void`\>

Effect to run when dependencies change, receiving current values

#### Returns

`Effect`\<`void`, `never`, `Scope`\>

#### Example

```ts
const count = yield* Signal.make(0)
const name = yield* Signal.make("Alice")

// Log whenever count or name changes
yield* Reaction.make([count, name], ([c, n]) =>
  Effect.log(`Count is ${c}, name is ${n}`)
)

// Sync to localStorage whenever count changes
yield* Reaction.make([count], ([c]) =>
  Effect.sync(() => localStorage.setItem("count", String(c)))
)
```
