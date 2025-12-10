[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / MatchedRoute

# Interface: MatchedRoute\<P\>

Defined in: [src/router/types.ts:70](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L70)

A matched route with its parsed params.

## Type Parameters

### P

`P` = `unknown`

## Properties

### params

> `readonly` **params**: `P`

Defined in: [src/router/types.ts:74](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L74)

The parsed and validated params

---

### route

> `readonly` **route**: [`RouteType`](RouteType.md)\<`string`, `AnyNoContext`\>

Defined in: [src/router/types.ts:72](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L72)

The route that matched
