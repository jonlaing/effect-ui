[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / ElementFactory

# Type Alias: ElementFactory()\<K\>

> **ElementFactory**\<`K`\> = \{\<`E`, `R`\>(`attrs`, `children`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; \<`E`, `R`\>(`attrs`, `child`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; (`attrs`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>; \<`E`, `R`\>(`children`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; \<`E`, `R`\>(`child`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; (): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>; \}

Defined in: [packages/dom/src/Element/types.ts:292](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Element/types.ts#L292)

Factory function for creating a specific HTML element type.
Supports multiple call signatures for convenience.
The error and requirements types are inferred from children.

## Type Parameters

### K

`K` *extends* keyof `HTMLElementTagNameMap`

The HTML element tag name

## Call Signature

> \<`E`, `R`\>(`attrs`, `children`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

### Type Parameters

#### E

`E` = `never`

#### R

`R` = `never`

### Parameters

#### attrs

[`HTMLAttributes`](HTMLAttributes.md)\<`K`\>

#### children

readonly [`Child`](Child.md)\<`E`, `R`\>[]

### Returns

`Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

## Call Signature

> \<`E`, `R`\>(`attrs`, `child`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

### Type Parameters

#### E

`E` = `never`

#### R

`R` = `never`

### Parameters

#### attrs

[`HTMLAttributes`](HTMLAttributes.md)\<`K`\>

#### child

[`Child`](Child.md)\<`E`, `R`\>

### Returns

`Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

## Call Signature

> (`attrs`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>

### Parameters

#### attrs

[`HTMLAttributes`](HTMLAttributes.md)\<`K`\>

### Returns

`Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>

## Call Signature

> \<`E`, `R`\>(`children`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

### Type Parameters

#### E

`E` = `never`

#### R

`R` = `never`

### Parameters

#### children

readonly [`Child`](Child.md)\<`E`, `R`\>[]

### Returns

`Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

## Call Signature

> \<`E`, `R`\>(`child`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

### Type Parameters

#### E

`E` = `never`

#### R

`R` = `never`

### Parameters

#### child

[`Child`](Child.md)\<`E`, `R`\>

### Returns

`Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>

## Call Signature

> (): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>

### Returns

`Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>
