[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / suspense

# Variable: suspense()

> `const` **suspense**: \{\<`N`, `R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`N`, `EF`, `R1`\>; \<`N`, `E`, `R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`N`, `EF`, `R1`\>; \}

Defined in: [packages/core/src/Boundary.ts:66](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Boundary.ts#L66)

Suspense boundary for async rendering with loading states.

Renders the fallback while waiting for the async render to complete.
Optionally delays showing the fallback to avoid loading flashes on fast responses.
Optionally catches errors and renders an error state.

## Call Signature

> \<`N`, `R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`N`, `EF`, `R1`\>

### Type Parameters

#### N

`N`

#### R1

`R1` = `never`

#### EF

`EF` = `never`

### Parameters

#### options

[`SuspenseOptions`](../interfaces/SuspenseOptions.md)\<`N`, `never`, `R1`, `EF`\> & `object`

### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `EF`, `R1`\>

## Call Signature

> \<`N`, `E`, `R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`N`, `EF`, `R1`\>

### Type Parameters

#### N

`N`

#### E

`E`

#### R1

`R1` = `never`

#### EF

`EF` = `never`

### Parameters

#### options

[`SuspenseOptions`](../interfaces/SuspenseOptions.md)\<`N`, `E`, `R1`, `EF`\> & `object`

### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `EF`, `R1`\>

## Examples

```ts
// Simple - show fallback immediately
Boundary.suspense({
  render: () => fetchAndRenderUser(userId),
  fallback: () => div("Loading..."),
})
```

```ts
// With delay - avoid loading flash on fast responses
Boundary.suspense({
  render: () => Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    return yield* UserPage({ user })
  }),
  fallback: () => div("Loading user..."),
  delay: "200 millis",
})
```
