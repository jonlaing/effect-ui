[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / VirtualListControl

# Interface: VirtualListControl

Defined in: [packages/dom/src/VirtualList/types.ts:17](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/VirtualList/types.ts#L17)

Control interface for a virtual list, accessible via ref.

## Properties

### scrollTo()

> `readonly` **scrollTo**: (`index`, `behavior?`) => `Effect`\<`void`\>

Defined in: [packages/dom/src/VirtualList/types.ts:19](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/VirtualList/types.ts#L19)

Scroll to bring a specific item index into view

#### Parameters

##### index

`number`

##### behavior?

`ScrollBehavior`

#### Returns

`Effect`\<`void`\>

***

### scrollToBottom()

> `readonly` **scrollToBottom**: (`behavior?`) => `Effect`\<`void`\>

Defined in: [packages/dom/src/VirtualList/types.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/VirtualList/types.ts#L26)

Scroll to the bottom of the list

#### Parameters

##### behavior?

`ScrollBehavior`

#### Returns

`Effect`\<`void`\>

***

### scrollToTop()

> `readonly` **scrollToTop**: (`behavior?`) => `Effect`\<`void`\>

Defined in: [packages/dom/src/VirtualList/types.ts:24](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/VirtualList/types.ts#L24)

Scroll to the top of the list

#### Parameters

##### behavior?

`ScrollBehavior`

#### Returns

`Effect`\<`void`\>

***

### totalItems

> `readonly` **totalItems**: [`Readable`](../../../core/src/interfaces/Readable.md)\<`number`\>

Defined in: [packages/dom/src/VirtualList/types.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/VirtualList/types.ts#L30)

Total number of items

***

### visibleRange

> `readonly` **visibleRange**: [`Readable`](../../../core/src/interfaces/Readable.md)\<[`VisibleRange`](VisibleRange.md)\>

Defined in: [packages/dom/src/VirtualList/types.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/VirtualList/types.ts#L28)

Currently visible range of items
