[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / RouterType

# Interface: RouterType\<Routes\>

Defined in: [src/router/types.ts:100](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L100)

The main Router interface.

## Type Parameters

### Routes

`Routes` _extends_ `Record`\<`string`, [`RouteType`](RouteType.md)\<`string`, `Schema.Schema.AnyNoContext`\>\>

Record of route names to Route definitions

## Properties

### back()

> `readonly` **back**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:124](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L124)

Go back in history

#### Returns

`Effect`\<`void`\>

---

### currentRoute

> `readonly` **currentRoute**: [`Readable`](Readable.md)\<keyof `Routes` \| `null`\>

Defined in: [src/router/types.ts:108](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L108)

The currently matched route name, or null if no match

---

### forward()

> `readonly` **forward**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:126](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L126)

Go forward in history

#### Returns

`Effect`\<`void`\>

---

### pathname

> `readonly` **pathname**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/router/types.ts:104](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L104)

The current pathname

---

### push()

> `readonly` **push**: (`path`, `options?`) => `Effect`\<`void`\>

Defined in: [src/router/types.ts:120](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L120)

Navigate to a path

#### Parameters

##### path

`string`

##### options?

[`NavigateOptions`](NavigateOptions.md)

#### Returns

`Effect`\<`void`\>

---

### replace()

> `readonly` **replace**: (`path`) => `Effect`\<`void`\>

Defined in: [src/router/types.ts:122](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L122)

Replace current path

#### Parameters

##### path

`string`

#### Returns

`Effect`\<`void`\>

---

### routes

> `readonly` **routes**: \{ readonly \[K in string \| number \| symbol\]: RouteState\<Routes\[K\] extends RouteType\<string, P\> ? P extends AnyNoContext ? Type\<P\<P\>\> : Record\<string, never\> : Record\<string, never\>\> \}

Defined in: [src/router/types.ts:110](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L110)

Route-specific state for each defined route

---

### searchParams

> `readonly` **searchParams**: [`Readable`](Readable.md)\<`URLSearchParams`\>

Defined in: [src/router/types.ts:106](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L106)

The current query params
