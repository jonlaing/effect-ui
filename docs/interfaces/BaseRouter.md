[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / BaseRouter

# Interface: BaseRouter

Defined in: [src/router/types.ts:147](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L147)

Base router interface for context (without route-specific typing).
Used by Link and other components that need router access.

## Properties

### back()

> `readonly` **back**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:160](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L160)

Go back in history

#### Returns

`Effect`\<`void`\>

***

### forward()

> `readonly` **forward**: () => `Effect`\<`void`\>

Defined in: [src/router/types.ts:162](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L162)

Go forward in history

#### Returns

`Effect`\<`void`\>

***

### pathname

> `readonly` **pathname**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/router/types.ts:149](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L149)

The current pathname

***

### push()

> `readonly` **push**: (`path`, `options?`) => `Effect`\<`void`\>

Defined in: [src/router/types.ts:153](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L153)

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

Defined in: [src/router/types.ts:158](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L158)

Replace current path

#### Parameters

##### path

`string`

#### Returns

`Effect`\<`void`\>

***

### searchParams

> `readonly` **searchParams**: [`Readable`](Readable.md)\<`URLSearchParams`\>

Defined in: [src/router/types.ts:151](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/router/types.ts#L151)

The current query params
