[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / RouteType

# Interface: RouteType\<Path, P\>

Defined in: [src/router/types.ts:27](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L27)

A route definition with typed parameters.

## Type Parameters

### Path

`Path` _extends_ `string` = `string`

The path pattern literal type

### P

`P` _extends_ `Schema.Schema.AnyNoContext` = `Schema.Schema.AnyNoContext`

The params schema type

## Properties

### match()

> `readonly` **match**: (`pathname`) => `Effect`\<`Type`\<`P`\> \| `Record`\<`string`, `never`\>, [`RouteMatchErrorType`](../type-aliases/RouteMatchErrorType.md)\>

Defined in: [src/router/types.ts:38](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L38)

Match a pathname against this route, returning params if matched

#### Parameters

##### pathname

`string`

#### Returns

`Effect`\<`Type`\<`P`\> \| `Record`\<`string`, `never`\>, [`RouteMatchErrorType`](../type-aliases/RouteMatchErrorType.md)\>

---

### paramsSchema

> `readonly` **paramsSchema**: `P` \| `undefined`

Defined in: [src/router/types.ts:36](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L36)

Schema for params validation

---

### path

> `readonly` **path**: `Path`

Defined in: [src/router/types.ts:32](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L32)

The original path pattern

---

### segments

> `readonly` **segments**: readonly [`PathSegment`](../type-aliases/PathSegment.md)[]

Defined in: [src/router/types.ts:34](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L34)

Parsed path segments
