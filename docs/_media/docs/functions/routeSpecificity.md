[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / routeSpecificity

# Function: routeSpecificity()

> **routeSpecificity**(`segments`): `number`

Defined in: [src/router/Route.ts:33](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/Route.ts#L33)

Calculate route specificity for sorting.
Higher = more specific.
Static segments worth more than params, params worth more than catch-all.

## Parameters

### segments

readonly [`PathSegment`](../type-aliases/PathSegment.md)[]

## Returns

`number`
