[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Toast

# Variable: Toast

> `const` **Toast**: `object`

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:668](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/Toast.ts#L668)

Headless Toast primitive for building notification systems.

Features:
- Multiple positions (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
- Auto-dismiss with pause on hover
- Swipe to dismiss on touch devices
- Configurable max visible toasts
- ARIA live regions for accessibility
- Action buttons with callbacks

## Type Declaration

### Action

> **Action**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ToastAction"`, [`ToastActionProps`](../interfaces/ToastActionProps.md), `never`, [`ToastItemCtx`](../classes/ToastItemCtx.md)\>

Toast action button.

### Close

> **Close**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ToastClose"`, [`ToastCloseProps`](../interfaces/ToastCloseProps.md), `never`, [`ToastItemCtx`](../classes/ToastItemCtx.md)\>

Toast close/dismiss button.

### Description

> **Description**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ToastDescription"`, [`ToastDescriptionProps`](../interfaces/ToastDescriptionProps.md), `never`, `Scope`\>

Toast description text.

### Provider()

> **Provider**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Toast provider that manages toast state and provides context.
Wrap your app with this component.

#### Parameters

##### props

[`ToastProviderProps`](../interfaces/ToastProviderProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ToastCtx`](../classes/ToastCtx.md)\> | readonly [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ToastCtx`](../classes/ToastCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

### Root

> **Root**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ToastRoot"`, [`ToastRootProps`](../interfaces/ToastRootProps.md), `never`, [`ToastCtx`](../classes/ToastCtx.md)\>

Individual toast container with auto-dismiss and swipe support.

### Title

> **Title**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ToastTitle"`, [`ToastTitleProps`](../interfaces/ToastTitleProps.md), `never`, `Scope`\>

Toast title text.

### Viewport

> **Viewport**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ToastViewport"`, [`ToastViewportProps`](../interfaces/ToastViewportProps.md), `never`, [`ToastCtx`](../classes/ToastCtx.md)\>

Toast viewport that renders all visible toasts via Portal.
When no children are provided, automatically renders toasts from context.

## Example

```ts
// Wrap app in Provider
Toast.Provider({ position: "bottom-right" }, [
  App(),
  Toast.Viewport({}),
])

// In a component, add a toast
const ctx = yield* ToastCtx;
yield* ctx.add({
  title: "Success!",
  description: "Your changes have been saved.",
  type: "success",
});
```
