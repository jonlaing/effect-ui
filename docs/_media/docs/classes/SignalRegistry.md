[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / SignalRegistry

# Class: SignalRegistry

Defined in: [src/core/Signal.ts:78](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Signal.ts#L78)

Context service for creating and managing Signals within a scope.

## Extends

- `TagClassShape`\<`"effect-ui/SignalRegistry"`, \{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}, `this`\>

## Constructors

### Constructor

> **new SignalRegistry**(`_`): `SignalRegistry`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:109

#### Parameters

##### \_

`never`

#### Returns

`SignalRegistry`

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().constructor`

## Properties

### \[TagTypeId\]

> `readonly` **\[TagTypeId\]**: _typeof_ `TagTypeId`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:100

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[TagTypeId]`

---

### Id

> **Id**: `"effect-ui/SignalRegistry"`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:99

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().Id`

---

### Type

> `readonly` **Type**: `object`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:101

#### make()

> `readonly` **make**: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

##### Type Parameters

###### A

`A`

##### Parameters

###### initial

`A`

###### options?

[`SignalOptions`](../interfaces/SignalOptions.md)\<`A`\>

##### Returns

`Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

#### scoped()

> `readonly` **scoped**: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

##### Type Parameters

###### A

`A`

###### E

`E`

###### R

`R`

##### Parameters

###### effect

`Effect`\<`A`, `E`, `R`\>

##### Returns

`Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().Type`

---

### \_op

> `readonly` `static` **\_op**: `"Tag"`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:33

#### Inherited from

[`RouterContext`](RouterContext.md).[`_op`](RouterContext.md#_op)

---

### \[ChannelTypeId\]

> `readonly` `static` **\[ChannelTypeId\]**: `VarianceStruct`\<`never`, `unknown`, `never`, `unknown`, \{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}, `unknown`, `SignalRegistry`\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Channel.d.ts:108

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[ChannelTypeId]`

---

### \[EffectTypeId\]

> `readonly` `static` **\[EffectTypeId\]**: `VarianceStruct`\<\{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}, `never`, `SignalRegistry`\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Effect.d.ts:195

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[EffectTypeId]`

---

### \[ignoreSymbol\]?

> `static` `optional` **\[ignoreSymbol\]**: `TagUnifyIgnore`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:46

#### Inherited from

[`RouterContext`](RouterContext.md).[`[ignoreSymbol]`](RouterContext.md#ignoresymbol)

---

### \[SinkTypeId\]

> `readonly` `static` **\[SinkTypeId\]**: `VarianceStruct`\<\{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}, `unknown`, `never`, `never`, `SignalRegistry`\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Sink.d.ts:82

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[SinkTypeId]`

---

### \[STMTypeId\]

> `readonly` `static` **\[STMTypeId\]**: `object`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/STM.d.ts:136

#### \_A

> `readonly` **\_A**: `Covariant`\<\{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}\>

#### \_E

> `readonly` **\_E**: `Covariant`\<`never`\>

#### \_R

> `readonly` **\_R**: `Covariant`\<`SignalRegistry`\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[STMTypeId]`

---

### \[StreamTypeId\]

> `readonly` `static` **\[StreamTypeId\]**: `VarianceStruct`\<\{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}, `never`, `SignalRegistry`\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Stream.d.ts:111

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[StreamTypeId]`

---

### \[TagTypeId\]

> `readonly` `static` **\[TagTypeId\]**: `object`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:36

#### \_Identifier

> `readonly` **\_Identifier**: `Invariant`\<`SignalRegistry`\>

#### \_Service

> `readonly` **\_Service**: `Invariant`\<\{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[TagTypeId]`

---

### \[typeSymbol\]?

> `static` `optional` **\[typeSymbol\]**: `unknown`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:44

#### Inherited from

[`RouterContext`](RouterContext.md).[`[typeSymbol]`](RouterContext.md#typesymbol)

---

### \[unifySymbol\]?

> `static` `optional` **\[unifySymbol\]**: `TagUnify`\<`TagClass`\<`SignalRegistry`, `"effect-ui/SignalRegistry"`, \{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}\>\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:45

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[unifySymbol]`

---

### Identifier

> `readonly` `static` **Identifier**: `SignalRegistry`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:35

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().Identifier`

---

### key

> `readonly` `static` **key**: `"effect-ui/SignalRegistry"`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:110

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().key`

---

### Live

> `static` **Live**: `Layer`\<`SignalRegistry`, `never`, `never`\>

Defined in: [src/core/Signal.ts:90](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Signal.ts#L90)

---

### Service

> `readonly` `static` **Service**: `object`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:34

#### make()

> `readonly` **make**: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

##### Type Parameters

###### A

`A`

##### Parameters

###### initial

`A`

###### options?

[`SignalOptions`](../interfaces/SignalOptions.md)\<`A`\>

##### Returns

`Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

#### scoped()

> `readonly` **scoped**: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

##### Type Parameters

###### A

`A`

###### E

`E`

###### R

`R`

##### Parameters

###### effect

`Effect`\<`A`, `E`, `R`\>

##### Returns

`Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().Service`

---

### stack?

> `readonly` `static` `optional` **stack**: `string`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:42

#### Inherited from

[`RouterContext`](RouterContext.md).[`stack`](RouterContext.md#stack)

## Methods

### \[iterator\]()

> `static` **\[iterator\]**(): `EffectGenerator`\<`Tag`\<`SignalRegistry`, \{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}\>\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Effect.d.ts:137

#### Returns

`EffectGenerator`\<`Tag`\<`SignalRegistry`, \{ `make`: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>; `scoped`: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>; \}\>\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[iterator]`

---

### \[NodeInspectSymbol\]()

> `static` **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Inspectable.d.ts:22

#### Returns

`unknown`

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().[NodeInspectSymbol]`

---

### context()

> `static` **context**(`self`): `Context`\<`SignalRegistry`\>

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:41

#### Parameters

##### self

###### make

\<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

###### scoped

\<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

#### Returns

`Context`\<`SignalRegistry`\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().context`

---

### of()

> `static` **of**(`self`): `object`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Context.d.ts:40

#### Parameters

##### self

###### make

\<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

###### scoped

\<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

#### Returns

`object`

##### make()

> `readonly` **make**: \<`A`\>(`initial`, `options?`) => `Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

###### Type Parameters

###### A

`A`

###### Parameters

###### initial

`A`

###### options?

[`SignalOptions`](../interfaces/SignalOptions.md)\<`A`\>

###### Returns

`Effect`\<[`SignalType`](../type-aliases/SignalType.md)\<`A`\>, `never`, `Scope`\>

##### scoped()

> `readonly` **scoped**: \<`A`, `E`, `R`\>(`effect`) => `Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

###### Type Parameters

###### A

`A`

###### E

`E`

###### R

`R`

###### Parameters

###### effect

`Effect`\<`A`, `E`, `R`\>

###### Returns

`Effect`\<`A`, `E`, `Exclude`\<`R`, `Scope`\>\>

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().of`

---

### pipe()

#### Call Signature

> `static` **pipe**\<`A`\>(`this`): `A`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:10

##### Type Parameters

###### A

`A`

##### Parameters

###### this

`A`

##### Returns

`A`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`\>(`this`, `ab`): `B`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:11

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

##### Returns

`B`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`\>(`this`, `ab`, `bc`): `C`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:12

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

##### Returns

`C`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`\>(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:13

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

##### Returns

`D`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`\>(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:14

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

##### Returns

`E`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:15

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

##### Returns

`F`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:16

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

##### Returns

`G`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:17

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

##### Returns

`H`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:18

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

##### Returns

`I`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:19

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

##### Returns

`J`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:20

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

##### Returns

`K`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:21

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

##### Returns

`L`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:22

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

##### Returns

`M`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:23

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

##### Returns

`N`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:24

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

##### Returns

`O`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:25

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

##### Returns

`P`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:26

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

##### Returns

`Q`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:27

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

##### Returns

`R`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:28

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

##### Returns

`S`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:29

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

##### Returns

`T`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:30

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

##### Returns

`U`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

#### Call Signature

> `static` **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`\>(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Pipeable.d.ts:31

##### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

##### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

##### Returns

`U`

##### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().pipe`

---

### toJSON()

> `static` **toJSON**(): `unknown`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Inspectable.d.ts:21

#### Returns

`unknown`

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().toJSON`

---

### toString()

> `static` **toString**(): `string`

Defined in: node_modules/.pnpm/effect@3.19.9/node_modules/effect/dist/dts/Inspectable.d.ts:20

#### Returns

`string`

#### Inherited from

`Context.Tag("effect-ui/SignalRegistry")< SignalRegistry, { readonly make: <A>( initial: A, options?: SignalOptions<A>, ) => Effect.Effect<Signal<A>, never, Scope.Scope>; readonly scoped: <A, E, R>( effect: Effect.Effect<A, E, R>, ) => Effect.Effect<A, E, Exclude<R, Scope.Scope>>; } >().toString`
