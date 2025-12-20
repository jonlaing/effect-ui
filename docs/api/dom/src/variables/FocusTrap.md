[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / FocusTrap

# Variable: FocusTrap

> `const` **FocusTrap**: `object`

Defined in: [packages/dom/src/FocusTrap/FocusTrap.ts:61](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/FocusTrap/FocusTrap.ts#L61)

Create a focus trap that keeps focus within a container element.

The focus trap:
- Focuses the first focusable element (or initialFocus) when activated
- Cycles focus with Tab/Shift+Tab at boundaries
- Restores focus to the previously focused element when deactivated
- Automatically cleans up when the scope closes

## Type Declaration

### make()

> **make**: (`options`) => `Effect`\<`void`, `never`, `Scope`\>

#### Parameters

##### options

[`FocusTrapOptions`](../interfaces/FocusTrapOptions.md)

#### Returns

`Effect`\<`void`, `never`, `Scope`\>

## Example

```ts
// In a dialog component
const element = yield* contentRef.get;
yield* FocusTrap.make({
  container: element,
  returnFocus: triggerElement,
});
// Focus is now trapped within the dialog
// When scope closes, focus returns to triggerElement
```
