[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ElementFactory

# Type Alias: ElementFactory()\<K\>

> **ElementFactory**\<`K`\> = \{\<`E`, `R`\>(`attrs`, `children`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; \<`E`, `R`\>(`attrs`, `child`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; (`attrs`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>; \<`E`, `R`\>(`children`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; \<`E`, `R`\>(`child`): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `E`, `Scope` \| `R`\>; (): `Effect`\<`HTMLElementTagNameMap`\[`K`\], `never`, `Scope`\>; \}

Defined in: [src/dom/Element/types.ts:176](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L176)

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
