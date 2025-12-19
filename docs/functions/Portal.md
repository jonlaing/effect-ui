[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Portal

# Function: Portal()

## Call Signature

> **Portal**\<`E`, `R`\>(`children`): [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [src/dom/Portal.ts:31](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Portal.ts#L31)

Render children into a different DOM node, outside the normal component hierarchy.
Useful for modals, dropdowns, tooltips that need to escape overflow/z-index issues.

### Type Parameters

#### E

`E` = `never`

#### R

`R` = `never`

### Parameters

#### children

() => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

### Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>

### Example

```ts
// Render to document.body (default)
Portal(() => Modal({ ... }))

// Render to specific element
Portal({ target: "#modal-root" }, () => Dropdown({ ... }))

// Render to element reference
Portal({ target: containerElement }, () => Tooltip({ ... }))
```

## Call Signature

> **Portal**\<`E`, `R`\>(`options`, `children`): [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [src/dom/Portal.ts:34](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Portal.ts#L34)

Render children into a different DOM node, outside the normal component hierarchy.
Useful for modals, dropdowns, tooltips that need to escape overflow/z-index issues.

### Type Parameters

#### E

`E` = `never`

#### R

`R` = `never`

### Parameters

#### options

[`PortalOptions`](../interfaces/PortalOptions.md)

#### children

() => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

### Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>

### Example

```ts
// Render to document.body (default)
Portal(() => Modal({ ... }))

// Render to specific element
Portal({ target: "#modal-root" }, () => Dropdown({ ... }))

// Render to element reference
Portal({ target: containerElement }, () => Tooltip({ ... }))
```
