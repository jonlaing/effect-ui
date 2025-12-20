[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / RadioGroupRootProps

# Interface: RadioGroupRootProps

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:33](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L33)

Props for RadioGroup.Root

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L51)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:37](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L37)

Default value for uncontrolled usage

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:43](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L43)

Whether the entire group is disabled

***

### loop?

> `readonly` `optional` **loop**: `boolean`

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:49](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L49)

Whether keyboard navigation loops (default: true)

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:41](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L41)

Name attribute for form submission

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L39)

Callback when value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`"horizontal"` \| `"vertical"`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:47](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L47)

Orientation (default: "vertical")

***

### required?

> `readonly` `optional` **required**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:45](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L45)

Whether selection is required

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:35](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L35)

Controlled value - if provided, component is controlled
