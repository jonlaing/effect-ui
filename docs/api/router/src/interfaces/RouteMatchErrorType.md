[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / RouteMatchErrorType

# Interface: RouteMatchErrorType

Defined in: [packages/router/src/router/types.ts:48](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L48)

Error when a route doesn't match.

## Properties

### \_tag

> `readonly` **\_tag**: `"RouteMatchError"`

Defined in: [packages/router/src/router/types.ts:49](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L49)

***

### details?

> `readonly` `optional` **details**: `string`

Defined in: [packages/router/src/router/types.ts:52](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L52)

***

### path

> `readonly` **path**: `string`

Defined in: [packages/router/src/router/types.ts:50](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L50)

***

### reason

> `readonly` **reason**: `"no-match"` \| `"validation-failed"`

Defined in: [packages/router/src/router/types.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L51)
