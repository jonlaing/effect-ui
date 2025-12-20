[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / NavigationMenuRootProps

# Interface: NavigationMenuRootProps

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:77](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L77)

## Properties

### aria-label?

> `readonly` `optional` **aria-label**: `string`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:93](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L93)

ARIA label for the navigation

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:91](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L91)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:79](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L79)

Default active item value

***

### delayDuration?

> `readonly` `optional` **delayDuration**: `number`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:87](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L87)

Delay before opening (ms)

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:83](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L83)

Callback when active item changes

#### Parameters

##### value

`string` | `null`

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<[`NavigationMenuOrientation`](../type-aliases/NavigationMenuOrientation.md)\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:85](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L85)

Menu orientation (can be reactive for responsive layouts)

***

### skipDelayDuration?

> `readonly` `optional` **skipDelayDuration**: `number`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:89](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L89)

Reduced delay after first interaction (ms)

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string` \| `null`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:81](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L81)

Controlled active item value
