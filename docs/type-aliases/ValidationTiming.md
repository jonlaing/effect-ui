[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ValidationTiming

# Type Alias: ValidationTiming

> **ValidationTiming** = `"hybrid"` \| `"blur"` \| `"change"` \| `"submit"`

Defined in: [src/form/types.ts:12](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L12)

Validation timing strategy for form fields.
- "hybrid" (default) - validate on blur first, then on change after first blur
- "blur" - validate when field loses focus
- "change" - validate on every keystroke
- "submit" - only validate when submitting
