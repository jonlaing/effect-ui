[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Switch

# Variable: Switch

> `const` **Switch**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"Switch"`, [`SwitchProps`](../interfaces/SwitchProps.md), `never`, `Scope`\>

Defined in: [packages/primitives/src/primitives/Switch/Switch.ts:85](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Switch/Switch.ts#L85)

A control that toggles between on and off states.

Uses `role="switch"` for proper accessibility semantics.
Renders a button with a thumb element for styling.

## Example

```ts
// Uncontrolled
Switch({ defaultChecked: false, class: "switch" })

// Controlled
const enabled = yield* Signal.make(false)
Switch({ checked: enabled, class: "switch" })

// With callback
Switch({
  onCheckedChange: (checked) => Effect.log(`Switched: ${checked}`)
})

// In a form
Switch({ name: "notifications", value: "enabled" })
```
