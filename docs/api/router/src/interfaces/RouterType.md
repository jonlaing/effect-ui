[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [router/src](../README.md) / RouterType

# Interface: RouterType\<Routes\>

Defined in: [packages/router/src/router/types.ts:102](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L102)

The main Router interface.

## Type Parameters

### Routes

`Routes` *extends* `Record`\<`string`, [`RouteType`](RouteType.md)\<`string`, `Schema.Schema.AnyNoContext`\>\>

Record of route names to Route definitions

## Properties

### back()

> `readonly` **back**: () => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:129](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L129)

Go back in history

#### Returns

`Effect`\<`void`\>

***

### currentRoute

> `readonly` **currentRoute**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<keyof `Routes` \| `null`\>

Defined in: [packages/router/src/router/types.ts:110](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L110)

The currently matched route name, or null if no match

***

### forward()

> `readonly` **forward**: () => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:131](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L131)

Go forward in history

#### Returns

`Effect`\<`void`\>

***

### pathname

> `readonly` **pathname**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/router/src/router/types.ts:106](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L106)

The current pathname

***

### push()

> `readonly` **push**: (`path`, `options?`) => `Effect`\<`void`\>

Defined in: [packages/router/src/router/types.ts:122](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L122)

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

Defined in: [packages/router/src/router/types.ts:127](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L127)

Replace current path

#### Parameters

##### path

`string`

#### Returns

`Effect`\<`void`\>

***

### routes

> `readonly` **routes**: \{ readonly \[K in string \| number \| symbol\]: RouteState\<Routes\[K\] extends RouteType\<string, P\> ? P extends AnyNoContext ? Type\<P\<P\>\> : Record\<string, never\> : Record\<string, never\>\> \}

Defined in: [packages/router/src/router/types.ts:112](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L112)

Route-specific state for each defined route

***

### searchParams

> `readonly` **searchParams**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`URLSearchParams`\>

Defined in: [packages/router/src/router/types.ts:108](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/router/src/router/types.ts#L108)

The current query params
