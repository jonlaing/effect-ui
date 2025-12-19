[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / SelectContext

# Interface: SelectContext

Defined in: [src/primitives/Select/Select.ts:16](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L16)

Context shared between Select parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Select/Select.ts:24](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L24)

Close the select

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/Select/Select.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L39)

Unique ID for the content

***

### disabled

> `readonly` **disabled**: `boolean`

Defined in: [src/primitives/Select/Select.ts:43](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L43)

Whether the select is disabled

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Select/Select.ts:18](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L18)

Whether the select is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Select/Select.ts:22](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L22)

Open the select

#### Returns

`Effect`\<`void`\>

***

### placeholder

> `readonly` **placeholder**: `string`

Defined in: [src/primitives/Select/Select.ts:45](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L45)

Placeholder text when no value selected

***

### registerItem()

> `readonly` **registerItem**: (`value`, `textValue`) => `Effect`\<`void`\>

Defined in: [src/primitives/Select/Select.ts:30](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L30)

Register an item's display text

#### Parameters

##### value

`string`

##### textValue

`string`

#### Returns

`Effect`\<`void`\>

***

### selectValue()

> `readonly` **selectValue**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Select/Select.ts:28](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L28)

Select a value

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Select/Select.ts:26](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L26)

Toggle the select open state

#### Returns

`Effect`\<`void`\>

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [src/primitives/Select/Select.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L41)

Unique ID for the trigger

***

### triggerRef

> `readonly` **triggerRef**: [`SignalType`](../type-aliases/SignalType.md)\<`HTMLElement` \| `null`\>

Defined in: [src/primitives/Select/Select.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L37)

Reference to the trigger element

***

### value

> `readonly` **value**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Select/Select.ts:20](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L20)

Current selected value

***

### valueLabels

> `readonly` **valueLabels**: [`SignalType`](../type-aliases/SignalType.md)\<`Map`\<`string`, `string`\>\>

Defined in: [src/primitives/Select/Select.ts:35](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L35)

Map of value to display text
