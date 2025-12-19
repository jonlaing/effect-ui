[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / MatchedRoute

# Interface: MatchedRoute\<P\>

Defined in: [src/router/types.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L73)

A matched route with its parsed params.

## Type Parameters

### P

`P` = `unknown`

## Properties

### params

> `readonly` **params**: `P`

Defined in: [src/router/types.ts:77](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L77)

The parsed and validated params

***

### route

> `readonly` **route**: [`RouteType`](RouteType.md)\<`string`, `AnyNoContext`\>

Defined in: [src/router/types.ts:75](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L75)

The route that matched
