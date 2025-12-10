[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / RouteState

# Interface: RouteState\<P\>

Defined in: [src/router/types.ts:81](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L81)

State for an individual route within the router.

## Type Parameters

### P

`P` = `unknown`

The params type

## Properties

### isActive

> `readonly` **isActive**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/router/types.ts:83](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L83)

Whether this route is currently active

---

### params

> `readonly` **params**: [`Readable`](Readable.md)\<`P` \| `null`\>

Defined in: [src/router/types.ts:85](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L85)

The current params (only meaningful when active)
