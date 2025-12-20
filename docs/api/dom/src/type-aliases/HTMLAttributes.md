[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / HTMLAttributes

# Type Alias: HTMLAttributes\<K\>

> **HTMLAttributes**\<`K`\> = [`BaseAttributes`](../interfaces/BaseAttributes.md)\<`HTMLElementTagNameMap`\[`K`\]\> & [`EventAttributes`](../interfaces/EventAttributes.md) & `HTMLAttributeAliases`\<`K`\> & \{ readonly \[P in ElementAttributeKeys\<K\>\]?: HTMLElementTagNameMap\[K\]\[P\] extends string ? string \| Readable\<string\> : HTMLElementTagNameMap\[K\]\[P\] extends number ? number \| Readable\<number\> : HTMLElementTagNameMap\[K\]\[P\] extends boolean ? boolean \| Readable\<boolean\> : never \}

Defined in: [packages/dom/src/Element/types.ts:273](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L273)

Full HTML attributes for a specific element type, including base, events, and element-specific attributes.

## Type Parameters

### K

`K` *extends* keyof `HTMLElementTagNameMap`

The HTML element tag name
