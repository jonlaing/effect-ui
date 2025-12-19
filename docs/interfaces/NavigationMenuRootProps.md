[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / NavigationMenuRootProps

# Interface: NavigationMenuRootProps

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:77](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L77)

## Properties

### aria-label?

> `readonly` `optional` **aria-label**: `string`

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:93](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L93)

ARIA label for the navigation

***

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:91](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L91)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:79](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L79)

Default active item value

***

### delayDuration?

> `readonly` `optional` **delayDuration**: `number`

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:87](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L87)

Delay before opening (ms)

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:83](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L83)

Callback when active item changes

#### Parameters

##### value

`string` | `null`

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: [`NavigationMenuOrientation`](../type-aliases/NavigationMenuOrientation.md)

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:85](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L85)

Menu orientation

***

### skipDelayDuration?

> `readonly` `optional` **skipDelayDuration**: `number`

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:89](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L89)

Reduced delay after first interaction (ms)

***

### value?

> `readonly` `optional` **value**: [`SignalType`](../type-aliases/SignalType.md)\<`string` \| `null`\>

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:81](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L81)

Controlled active item value
