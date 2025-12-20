[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / AccordionRootProps

# Interface: AccordionRootProps

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:44](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L44)

Props for Accordion.Root

## Properties

### collapsible?

> `readonly` `optional` **collapsible**: `boolean`

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:66](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L66)

When type="single", whether clicking the open item closes it.

#### Default

```ts
false
```

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string` \| `string`[] \| `null`

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:59](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L59)

Default value for uncontrolled usage.
String for single type, string[] for multiple type.

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:61](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L61)

Whether the accordion is disabled

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:68](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L68)

Callback when value changes

#### Parameters

##### value

`string` | `string`[] | `null`

#### Returns

`Effect`\<`void`\>

***

### type?

> `readonly` `optional` **type**: `"single"` \| `"multiple"`

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:49](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L49)

Whether single or multiple items can be open at once.

#### Default

```ts
"single"
```

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string` \| `null`\> \| [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`[]\>

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:54](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L54)

Controlled value - string for single, string[] for multiple.
If provided, component is controlled.
