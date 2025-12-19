[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / routeSpecificity

# Function: routeSpecificity()

> **routeSpecificity**(`segments`): `number`

Defined in: [src/router/Route.ts:33](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/Route.ts#L33)

Calculate route specificity for sorting.
Higher = more specific.
Static segments worth more than params, params worth more than catch-all.

## Parameters

### segments

readonly [`PathSegment`](../type-aliases/PathSegment.md)[]

## Returns

`number`
