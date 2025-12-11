[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RouteState

# Interface: RouteState\<P\>

Defined in: [src/router/types.ts:84](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/router/types.ts#L84)

State for an individual route within the router.

## Type Parameters

### P

`P` = `unknown`

The params type

## Properties

### isActive

> `readonly` **isActive**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/router/types.ts:86](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/router/types.ts#L86)

Whether this route is currently active

***

### params

> `readonly` **params**: [`Readable`](Readable.md)\<`P`\>

Defined in: [src/router/types.ts:88](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/router/types.ts#L88)

The current params (only meaningful when active)
