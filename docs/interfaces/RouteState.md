[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RouteState

# Interface: RouteState\<P\>

Defined in: [src/router/types.ts:84](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L84)

State for an individual route within the router.

## Type Parameters

### P

`P` = `unknown`

The params type

## Properties

### isActive

> `readonly` **isActive**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/router/types.ts:86](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L86)

Whether this route is currently active

***

### params

> `readonly` **params**: [`Readable`](Readable.md)\<`P`\>

Defined in: [src/router/types.ts:88](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L88)

The current params (only meaningful when active)
