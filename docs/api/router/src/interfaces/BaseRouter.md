[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / BaseRouter

# Interface: BaseRouter

Defined in: [packages/router/src/router/types.ts:146](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L146)

Base router interface for context (without route-specific typing).
Used by Link and other components that need router access.

## Properties

### back()

> `readonly` **back**: () => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:159](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L159)

Go back in history

#### Returns

`Effect`\<`void`\>

***

### forward()

> `readonly` **forward**: () => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:161](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L161)

Go forward in history

#### Returns

`Effect`\<`void`\>

***

### pathname

> `readonly` **pathname**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/router/src/router/types.ts:148](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L148)

The current pathname

***

### push()

> `readonly` **push**: (`path`, `options?`) => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:152](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L152)

Navigate to a path

#### Parameters

##### path

`string`

##### options?

[`NavigateOptions`](NavigateOptions.md)

#### Returns

`Effect`\<`void`\>

***

### replace()

> `readonly` **replace**: (`path`) => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:157](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L157)

Replace current path

#### Parameters

##### path

`string`

#### Returns

`Effect`\<`void`\>

***

### searchParams

> `readonly` **searchParams**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`URLSearchParams`\>

Defined in: [packages/router/src/router/types.ts:150](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L150)

The current query params
