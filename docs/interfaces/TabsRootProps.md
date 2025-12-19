[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / TabsRootProps

# Interface: TabsRootProps

Defined in: [src/primitives/Tabs/Tabs.ts:26](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L26)

Props for Tabs.Root

## Properties

### activationMode?

> `readonly` `optional` **activationMode**: `"automatic"` \| `"manual"`

Defined in: [src/primitives/Tabs/Tabs.ts:36](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L36)

Activation mode (default: "automatic")

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [src/primitives/Tabs/Tabs.ts:30](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L30)

Default value for uncontrolled usage

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Tabs/Tabs.ts:32](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L32)

Callback when value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: `"vertical"` \| `"horizontal"`

Defined in: [src/primitives/Tabs/Tabs.ts:34](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L34)

Tab orientation (default: "horizontal")

***

### value?

> `readonly` `optional` **value**: [`SignalType`](../type-aliases/SignalType.md)\<`string`\>

Defined in: [src/primitives/Tabs/Tabs.ts:28](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tabs/Tabs.ts#L28)

Controlled value - if provided, component is controlled
