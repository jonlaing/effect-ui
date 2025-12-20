[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ToggleProps

# Interface: ToggleProps

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:10](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L10)

Props for Toggle.Root component.

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:41](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L41)

CSS class name(s) for styling.

***

### defaultPressed?

> `readonly` `optional` **defaultPressed**: `boolean`

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:25](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L25)

The default pressed state for uncontrolled mode.

#### Default

```ts
false
```

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:36](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L36)

Whether the toggle is disabled.

#### Default

```ts
false
```

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:14](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L14)

The id attribute for the toggle button.

***

### onPressedChange()?

> `readonly` `optional` **onPressedChange**: (`pressed`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L30)

Callback fired when the pressed state changes.

#### Parameters

##### pressed

`boolean`

#### Returns

`Effect`\<`void`\>

***

### pressed?

> `readonly` `optional` **pressed**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:19](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toggle/Toggle.ts#L19)

The controlled pressed state. Pass a Signal for controlled mode.
