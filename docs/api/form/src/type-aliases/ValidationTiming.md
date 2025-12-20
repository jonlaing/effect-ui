[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / ValidationTiming

# Type Alias: ValidationTiming

> **ValidationTiming** = `"hybrid"` \| `"blur"` \| `"change"` \| `"submit"`

Defined in: [packages/form/src/form/types.ts:11](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L11)

Validation timing strategy for form fields.
- "hybrid" (default) - validate on blur first, then on change after first blur
- "blur" - validate when field loses focus
- "change" - validate on every keystroke
- "submit" - only validate when submitting
