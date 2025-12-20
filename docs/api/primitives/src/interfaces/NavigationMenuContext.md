[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / NavigationMenuContext

# Interface: NavigationMenuContext

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:25](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L25)

Context shared between NavigationMenu parts.

## Properties

### activeItem

> `readonly` **activeItem**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string` \| `null`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:27](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L27)

Currently active/open item ID

***

### cancelClose()

> `readonly` **cancelClose**: () => `void`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:37](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L37)

Cancel any pending close

#### Returns

`void`

***

### cancelOpen()

> `readonly` **cancelOpen**: () => `void`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:35](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L35)

Cancel any pending open

#### Returns

`void`

***

### orientation

> `readonly` **orientation**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<[`NavigationMenuOrientation`](../type-aliases/NavigationMenuOrientation.md)\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L39)

Menu orientation

***

### scheduleClose()

> `readonly` **scheduleClose**: () => `void`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:33](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L33)

Schedule closing with delay

#### Returns

`void`

***

### scheduleOpen()

> `readonly` **scheduleOpen**: (`id`) => `void`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:31](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L31)

Schedule opening an item with delay

#### Parameters

##### id

`string`

#### Returns

`void`

***

### setActiveItem()

> `readonly` **setActiveItem**: (`id`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:29](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L29)

Set the active item

#### Parameters

##### id

`string` | `null`

#### Returns

`Effect`\<`void`\>

***

### triggerRefs

> `readonly` **triggerRefs**: `Map`\<`string`, `HTMLButtonElement`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:43](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L43)

Map of item IDs to their trigger elements

***

### viewportRef

> `readonly` **viewportRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLDivElement`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:41](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L41)

Reference to viewport element
