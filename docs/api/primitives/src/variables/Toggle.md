[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Toggle

# Variable: Toggle

> `const` **Toggle**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"Toggle"`, [`ToggleProps`](../interfaces/ToggleProps.md), `never`, `Scope`\>

Defined in: [packages/primitives/src/primitives/Toggle/Toggle.ts:72](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toggle/Toggle.ts#L72)

A two-state button that can be toggled on or off.

Features:
- Controlled and uncontrolled modes
- Proper ARIA attributes (aria-pressed)
- Disabled state support
- CSS styling via data-state attribute

## Example

```ts
// Uncontrolled - manages its own state
Toggle({ defaultPressed: false }, "Bold")

// Controlled - external state management
const isBold = yield* Signal.make(false)
Toggle({ pressed: isBold }, "Bold")

// With callback
Toggle({
  defaultPressed: false,
  onPressedChange: (pressed) => Effect.log(`Toggled: ${pressed}`)
}, "Italic")

// Disabled
Toggle({ disabled: true }, "Disabled Toggle")
```
