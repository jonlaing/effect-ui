[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / MatchedRoute

# Interface: MatchedRoute\<P\>

Defined in: [packages/router/src/router/types.ts:72](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L72)

A matched route with its parsed params.

## Type Parameters

### P

`P` = `unknown`

## Properties

### params

> `readonly` **params**: `P`

Defined in: [packages/router/src/router/types.ts:76](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L76)

The parsed and validated params

***

### route

> `readonly` **route**: [`RouteType`](RouteType.md)\<`string`, `AnyNoContext`\>

Defined in: [packages/router/src/router/types.ts:74](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L74)

The route that matched
