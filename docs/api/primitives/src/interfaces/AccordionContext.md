[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / AccordionContext

# Interface: AccordionContext

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:13](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L13)

Context shared between Accordion parts.

## Properties

### collapsible

> `readonly` **collapsible**: `boolean`

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:23](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L23)

Whether single-type accordion can collapse all items

***

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:19](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L19)

Whether the accordion is disabled

***

### toggle()

> `readonly` **toggle**: (`itemValue`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:17](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L17)

Toggle an item by value

#### Parameters

##### itemValue

`string`

#### Returns

`Effect`\<`void`\>

***

### type

> `readonly` **type**: `"single"` \| `"multiple"`

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:21](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L21)

Accordion type

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string` \| `string`[] \| `null`\>

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:15](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L15)

Current open value(s)
