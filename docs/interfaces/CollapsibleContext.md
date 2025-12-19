[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / CollapsibleContext

# Interface: CollapsibleContext

Defined in: [src/primitives/Collapsible/Collapsible.ts:13](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L13)

Context shared between Collapsible parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:21](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L21)

Close the collapsible

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/Collapsible/Collapsible.ts:23](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L23)

Unique ID for ARIA attributes

***

### disabled

> `readonly` **disabled**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:25](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L25)

Whether the collapsible is disabled

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:15](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L15)

Whether the collapsible is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:19](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L19)

Open the collapsible

#### Returns

`Effect`\<`void`\>

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:17](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L17)

Toggle the open state

#### Returns

`Effect`\<`void`\>
