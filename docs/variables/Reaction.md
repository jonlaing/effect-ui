[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Reaction

# Variable: Reaction

> `const` **Reaction**: `object`

Defined in: [src/core/Reaction.ts:74](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Reaction.ts#L74)

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
