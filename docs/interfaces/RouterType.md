[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RouterType

# Interface: RouterType\<Routes\>

Defined in: [src/router/types.ts:103](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L103)

The main Router interface.

## Type Parameters

### Routes

`Routes` *extends* `Record`\<`string`, [`RouteType`](RouteType.md)\<`string`, `Schema.Schema.AnyNoContext`\>\>

Record of route names to Route definitions

## Properties

### back()

> `readonly` **back**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:130](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L130)

Go back in history

#### Returns

`Effect`\<`void`\>

***

### currentRoute

> `readonly` **currentRoute**: [`Readable`](Readable.md)\<keyof `Routes` \| `null`\>

Defined in: [src/router/types.ts:111](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L111)

The currently matched route name, or null if no match

***

### forward()

> `readonly` **forward**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:132](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L132)

Go forward in history

#### Returns

`Effect`\<`void`\>

***

### pathname

> `readonly` **pathname**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/router/types.ts:107](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L107)

The current pathname

***

### push()

> `readonly` **push**: (`path`, `options?`) => `Effect`\<`void`\>

Defined in: [src/router/types.ts:123](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L123)

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

Defined in: [src/router/types.ts:128](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L128)

Replace current path

#### Parameters

##### path

`string`

#### Returns

`Effect`\<`void`\>

***

### routes

> `readonly` **routes**: \{ readonly \[K in string \| number \| symbol\]: RouteState\<Routes\[K\] extends RouteType\<string, P\> ? P extends AnyNoContext ? Type\<P\<P\>\> : Record\<string, never\> : Record\<string, never\>\> \}

Defined in: [src/router/types.ts:113](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L113)

Route-specific state for each defined route

***

### searchParams

> `readonly` **searchParams**: [`Readable`](Readable.md)\<`URLSearchParams`\>

Defined in: [src/router/types.ts:109](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L109)

The current query params
