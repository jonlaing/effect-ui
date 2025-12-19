[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / HTMLAttributes

# Type Alias: HTMLAttributes\<K\>

> **HTMLAttributes**\<`K`\> = [`BaseAttributes`](../interfaces/BaseAttributes.md)\<`HTMLElementTagNameMap`\[`K`\]\> & [`EventAttributes`](../interfaces/EventAttributes.md) & `HTMLAttributeAliases`\<`K`\> & \{ readonly \[P in ElementAttributeKeys\<K\>\]?: HTMLElementTagNameMap\[K\]\[P\] extends string ? string \| Readable\<string\> : HTMLElementTagNameMap\[K\]\[P\] extends number ? number \| Readable\<number\> : HTMLElementTagNameMap\[K\]\[P\] extends boolean ? boolean \| Readable\<boolean\> : never \}

Defined in: [src/dom/Element/types.ts:256](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L256)

Full HTML attributes for a specific element type, including base, events, and element-specific attributes.

## Type Parameters

### K

`K` *extends* keyof `HTMLElementTagNameMap`

The HTML element tag name
