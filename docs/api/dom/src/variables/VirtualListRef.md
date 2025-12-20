[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / VirtualListRef

# Variable: VirtualListRef

> `const` **VirtualListRef**: `object`

Defined in: [packages/dom/src/VirtualList/VirtualList.ts:465](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/VirtualList.ts#L465)

VirtualListRef module for creating refs to access scroll control.

## Type Declaration

### make()

> **make**: () => `Effect`\<[`VirtualListRefType`](../interfaces/VirtualListRefType.md), `never`, `Scope`\> = `makeVirtualListRef`

Create a VirtualListRef to access scroll control methods.

#### Returns

`Effect`\<[`VirtualListRefType`](../interfaces/VirtualListRefType.md), `never`, `Scope`\>

#### Example

```ts
const listRef = yield* VirtualListRef.make()

yield* virtualEach(items, {
  key: (item) => item.id,
  itemHeight: 48,
  ref: listRef,
  render: (item) => $.li(item.map(i => i.text)),
})

// Later, scroll to a specific item
yield* listRef.ready.pipe(
  Effect.flatMap((control) => control.scrollTo(50))
)
```
