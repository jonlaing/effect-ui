[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / RadioGroupContext

# Interface: RadioGroupContext

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:13](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L13)

Context shared between RadioGroup parts.

## Properties

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:21](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L21)

Whether the entire group is disabled

***

### loop

> `readonly` **loop**: `boolean`

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:27](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L27)

Whether keyboard navigation loops

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:19](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L19)

Name attribute for form submission

***

### orientation

> `readonly` **orientation**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`"horizontal"` \| `"vertical"`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:25](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L25)

Orientation (affects keyboard navigation)

***

### required

> `readonly` **required**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:23](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L23)

Whether selection is required

***

### setValue()

> `readonly` **setValue**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:17](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L17)

Set the selected value

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:15](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L15)

Current selected value
