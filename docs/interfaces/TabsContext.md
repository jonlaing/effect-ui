[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / TabsContext

# Interface: TabsContext

Defined in: [src/primitives/Tabs/Tabs.ts:12](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L12)

Context shared between Tabs parts.

## Properties

### activationMode

> `readonly` **activationMode**: `"automatic"` \| `"manual"`

Defined in: [src/primitives/Tabs/Tabs.ts:20](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L20)

Activation mode: automatic (focus selects) or manual (Enter/Space to select)

***

### orientation

> `readonly` **orientation**: `"vertical"` \| `"horizontal"`

Defined in: [src/primitives/Tabs/Tabs.ts:18](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L18)

Tab orientation (affects keyboard navigation)

***

### setValue()

> `readonly` **setValue**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Tabs/Tabs.ts:16](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L16)

Set the active tab

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value

> `readonly` **value**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Tabs/Tabs.ts:14](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L14)

Current active tab value
