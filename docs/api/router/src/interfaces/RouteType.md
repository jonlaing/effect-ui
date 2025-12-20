[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / RouteType

# Interface: RouteType\<Path, P\>

Defined in: [packages/router/src/router/types.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/types.ts#L26)

A route definition with typed parameters.

## Type Parameters

### Path

`Path` *extends* `string` = `string`

The path pattern literal type

### P

`P` *extends* `Schema.Schema.AnyNoContext` = `Schema.Schema.AnyNoContext`

The params schema type

## Properties

### match()

> `readonly` **match**: (`pathname`) => `Effect`\<`Type`\<`P`\> \| `Record`\<`string`, `never`\>, [`RouteMatchErrorType`](../type-aliases/RouteMatchErrorType.md)\>

Defined in: [packages/router/src/router/types.ts:37](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/types.ts#L37)

Match a pathname against this route, returning params if matched

#### Parameters

##### pathname

`string`

#### Returns

`Effect`\<`Type`\<`P`\> \| `Record`\<`string`, `never`\>, [`RouteMatchErrorType`](../type-aliases/RouteMatchErrorType.md)\>

***

### paramsSchema

> `readonly` **paramsSchema**: `P` \| `undefined`

Defined in: [packages/router/src/router/types.ts:35](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/types.ts#L35)

Schema for params validation

***

### path

> `readonly` **path**: `Path`

Defined in: [packages/router/src/router/types.ts:31](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/types.ts#L31)

The original path pattern

***

### segments

> `readonly` **segments**: readonly [`PathSegment`](../type-aliases/PathSegment.md)[]

Defined in: [packages/router/src/router/types.ts:33](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/router/src/router/types.ts#L33)

Parsed path segments
