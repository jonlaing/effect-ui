[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Suspense

# Variable: Suspense()

> `const` **Suspense**: \{\<`R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`EF`, `R1`\>; \<`E`, `R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`EF`, `R1`\>; \}

Defined in: [src/dom/Control.ts:119](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L119)

Suspense component for async rendering with loading states.

Renders the fallback while waiting for the async render to complete.
Optionally delays showing the fallback to avoid loading flashes on fast responses.
Optionally catches errors and renders an error state.

## Call Signature

> \<`R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`EF`, `R1`\>

### Type Parameters

#### R1

`R1` = `never`

#### EF

`EF` = `never`

### Parameters

#### options

[`SuspenseOptions`](../interfaces/SuspenseOptions.md)\<`never`, `R1`, `EF`\> & `object`

### Returns

[`Element`](../type-aliases/Element.md)\<`EF`, `R1`\>

## Call Signature

> \<`E`, `R1`, `EF`\>(`options`): [`Element`](../type-aliases/Element.md)\<`EF`, `R1`\>

### Type Parameters

#### E

`E`

#### R1

`R1` = `never`

#### EF

`EF` = `never`

### Parameters

#### options

[`SuspenseOptions`](../interfaces/SuspenseOptions.md)\<`E`, `R1`, `EF`\> & `object`

### Returns

[`Element`](../type-aliases/Element.md)\<`EF`, `R1`\>

## Examples

```ts
// Simple - show fallback immediately
Suspense({
  render: () => fetchAndRenderUser(userId),
  fallback: () => div("Loading..."),
})
```

```ts
// With delay - avoid loading flash on fast responses
Suspense({
  render: () => Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    return yield* UserPage({ user })
  }),
  fallback: () => div("Loading user..."),
  delay: "200 millis",
})
```

```ts
// With error handling
Suspense({
  render: () => Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    return yield* UserPage({ user })
  }),
  fallback: () => div("Loading..."),
  catch: (error) => div(["Error: ", String(error)]),
  delay: "200 millis",
})
```
