[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / TabsContext

# Interface: TabsContext

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:13](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L13)

Context shared between Tabs parts.

## Properties

### activationMode

> `readonly` **activationMode**: `"automatic"` \| `"manual"`

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:21](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L21)

Activation mode: automatic (focus selects) or manual (Enter/Space to select)

***

### orientation

> `readonly` **orientation**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`"horizontal"` \| `"vertical"`\>

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:19](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L19)

Tab orientation (affects keyboard navigation)

***

### setValue()

> `readonly` **setValue**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:17](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L17)

Set the active tab

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:15](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L15)

Current active tab value
