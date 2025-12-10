[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / BaseRouter

# Interface: BaseRouter

Defined in: [src/router/types.ts:141](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L141)

Base router interface for context (without route-specific typing).
Used by Link and other components that need router access.

## Properties

### back()

> `readonly` **back**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:151](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L151)

Go back in history

#### Returns

`Effect`\<`void`\>

---

### forward()

> `readonly` **forward**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:153](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L153)

Go forward in history

#### Returns

`Effect`\<`void`\>

---

### pathname

> `readonly` **pathname**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/router/types.ts:143](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L143)

The current pathname

---

### push()

> `readonly` **push**: (`path`, `options?`) => `Effect`\<`void`\>

Defined in: [src/router/types.ts:147](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L147)

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

Defined in: [src/router/types.ts:149](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L149)

Replace current path

#### Parameters

##### path

`string`

#### Returns

`Effect`\<`void`\>

---

### searchParams

> `readonly` **searchParams**: [`Readable`](Readable.md)\<`URLSearchParams`\>

Defined in: [src/router/types.ts:145](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/types.ts#L145)

The current query params
