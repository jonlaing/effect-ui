[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / CheckboxProps

# Interface: CheckboxProps

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:15](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L15)

Props for Checkbox component.

## Properties

### checked?

> `readonly` `optional` **checked**: [`Signal`](../../../core/src/interfaces/Signal.md)\<[`CheckedState`](../type-aliases/CheckedState.md)\>

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:24](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L24)

The controlled checked state. Pass a Signal for controlled mode.

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:63](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L63)

CSS class name(s) for styling.

***

### defaultChecked?

> `readonly` `optional` **defaultChecked**: [`CheckedState`](../type-aliases/CheckedState.md)

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L30)

The default checked state for uncontrolled mode.

#### Default

```ts
false
```

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:41](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L41)

Whether the checkbox is disabled.

#### Default

```ts
false
```

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:19](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L19)

The id attribute for the checkbox button.

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:52](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L52)

The name attribute for form submission.

***

### onCheckedChange()?

> `readonly` `optional` **onCheckedChange**: (`checked`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:35](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L35)

Callback fired when the checked state changes.

#### Parameters

##### checked

[`CheckedState`](../type-aliases/CheckedState.md)

#### Returns

`Effect`\<`void`\>

***

### required?

> `readonly` `optional` **required**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:47](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L47)

Whether the checkbox is required in a form context.

#### Default

```ts
false
```

***

### value?

> `readonly` `optional` **value**: `string`

Defined in: [packages/primitives/src/primitives/Checkbox/Checkbox.ts:58](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Checkbox/Checkbox.ts#L58)

The value attribute for form submission.

#### Default

```ts
"on"
```
