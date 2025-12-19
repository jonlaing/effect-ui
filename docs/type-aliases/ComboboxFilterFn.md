[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ComboboxFilterFn

# Type Alias: ComboboxFilterFn()

> **ComboboxFilterFn** = (`inputValue`, `itemTextValue`) => `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:23](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L23)

Filter function type for filtering items based on input.

## Parameters

### inputValue

`string`

The current input value

### itemTextValue

`string`

The text value of the item being filtered

## Returns

`boolean`

true if the item should be shown
