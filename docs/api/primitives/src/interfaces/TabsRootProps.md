[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / TabsRootProps

# Interface: TabsRootProps

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:27](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L27)

Props for Tabs.Root

## Properties

### activationMode?

> `readonly` `optional` **activationMode**: `"automatic"` \| `"manual"`

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:37](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L37)

Activation mode (default: "automatic")

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:31](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L31)

Default value for uncontrolled usage

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:33](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L33)

Callback when value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`"horizontal"` \| `"vertical"`\>

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:35](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L35)

Tab orientation (default: "horizontal")

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:29](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L29)

Controlled value - if provided, component is controlled
