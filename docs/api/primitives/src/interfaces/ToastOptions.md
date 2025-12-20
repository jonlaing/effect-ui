[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ToastOptions

# Interface: ToastOptions

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L51)

Options for creating a new toast (id is auto-generated, type defaults to "default").

## Properties

### action?

> `readonly` `optional` **action**: `object`

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:56](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L56)

#### label

> `readonly` **label**: `string`

#### onClick()

> `readonly` **onClick**: () => `Effect`\<`void`\>

##### Returns

`Effect`\<`void`\>

***

### description?

> `readonly` `optional` **description**: `string`

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L53)

***

### duration?

> `readonly` `optional` **duration**: `number`

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:55](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L55)

***

### onDismiss()?

> `readonly` `optional` **onDismiss**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:60](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L60)

#### Returns

`Effect`\<`void`\>

***

### title?

> `readonly` `optional` **title**: `string`

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:52](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L52)

***

### type?

> `readonly` `optional` **type**: [`ToastType`](../type-aliases/ToastType.md)

Defined in: [packages/primitives/src/primitives/Toast/helpers.ts:54](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/helpers.ts#L54)
