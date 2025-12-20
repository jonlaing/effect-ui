[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ComboboxFilterFn

# Type Alias: ComboboxFilterFn()

> **ComboboxFilterFn** = (`inputValue`, `itemTextValue`) => `boolean`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:25](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L25)

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
