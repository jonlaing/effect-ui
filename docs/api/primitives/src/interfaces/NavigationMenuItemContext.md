[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / NavigationMenuItemContext

# Interface: NavigationMenuItemContext

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:49](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L49)

Context for individual navigation menu items.

## Properties

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:57](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L57)

Content ID for ARIA

***

### isActive

> `readonly` **isActive**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L53)

Whether this item is currently active

***

### itemId

> `readonly` **itemId**: `string`

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L51)

Unique ID for this item

***

### triggerRef

> `readonly` **triggerRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLButtonElement`\>

Defined in: [packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts:55](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/NavigationMenu/NavigationMenu.ts#L55)

Reference to the trigger button
