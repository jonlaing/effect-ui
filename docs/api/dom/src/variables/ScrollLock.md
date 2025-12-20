[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / ScrollLock

# Variable: ScrollLock

> `const` **ScrollLock**: `object`

Defined in: [packages/dom/src/ScrollLock/ScrollLock.ts:48](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/ScrollLock/ScrollLock.ts#L48)

ScrollLock utility for preventing body scroll.

Used by dialogs, modals, and other overlay components to prevent
the background from scrolling while the overlay is open.

Features:
- Prevents body scroll by setting overflow: hidden
- Accounts for scrollbar width to prevent layout shift
- Automatically restores original styles when scope closes

## Type Declaration

### lock

> **lock**: `Effect`\<`void`, `never`, `Scope`\>

Lock body scroll. Automatically unlocks when scope closes.

## Example

```ts
// In a dialog component
yield* ScrollLock.lock;
// Body scroll is now prevented
// When scope closes, scroll is automatically restored
```
