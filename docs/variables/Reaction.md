[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / Reaction

# Variable: Reaction

> `const` **Reaction**: `object`

Defined in: src/Reaction.ts:49

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
