[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / SwitchProps

# Interface: SwitchProps

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:10](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L10)

Props for Switch component.

## Properties

### checked?

> `readonly` `optional` **checked**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:19](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L19)

The controlled checked state. Pass a Signal for controlled mode.

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:58](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L58)

CSS class name(s) for styling.

***

### defaultChecked?

> `readonly` `optional` **defaultChecked**: `boolean`

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:25](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L25)

The default checked state for uncontrolled mode.

#### Default

```ts
false
```

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:36](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L36)

Whether the switch is disabled.

#### Default

```ts
false
```

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:14](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L14)

The id attribute for the switch button.

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:47](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L47)

The name attribute for form submission.

***

### onCheckedChange()?

> `readonly` `optional` **onCheckedChange**: (`checked`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:30](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L30)

Callback fired when the checked state changes.

#### Parameters

##### checked

`boolean`

#### Returns

`Effect`\<`void`\>

***

### required?

> `readonly` `optional` **required**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:42](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L42)

Whether the switch is required in a form context.

#### Default

```ts
false
```

***

### value?

> `readonly` `optional` **value**: `string`

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L53)

The value attribute for form submission.

#### Default

```ts
"on"
```
