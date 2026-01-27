# Effex API v2 Refactor Plan

## BEFORE STARTING: CUT A NEW BRANCH!

```bash
git checkout -b api-v2-refactor
```

**Claude: Run `git branch` and REFUSE to continue if on `main`.**

---

## Phase 1: Refactor `@effex/core` - Readable

### 1.1 Add TypeId pattern to Readable

```ts
export const TypeId: unique symbol = Symbol.for("effex/Readable")
export type TypeId = typeof TypeId

export interface Readable<A> extends Pipeable {
  readonly [TypeId]: TypeId
  // ...
}

export const isReadable = (value: unknown): value is Readable<unknown> =>
  Predicate.hasProperty(value, TypeId)
```

### 1.2 Refactor Readable source to new API

Add pipeable combinators, keep existing functionality working.

### 1.3 Refactor Readable tests to new API

Update tests to use new combinators. Verify all tests pass.

### 1.4 Add new tests for new Readable combinators

Test `zip`, `map`, `tap`, `normalize`, etc.

---

## Phase 2: Refactor `@effex/core` - Signal

### 2.1 Add TypeId pattern to Signal

```ts
export const SignalTypeId: unique symbol = Symbol.for("effex/Signal")
export type SignalTypeId = typeof SignalTypeId

export interface Signal<A> extends Readable<A> {
  readonly [SignalTypeId]: SignalTypeId
  // ...
}

export const isSignal = (value: unknown): value is Signal<unknown> =>
  Predicate.hasProperty(value, SignalTypeId)
```

### 2.2 Refactor Signal source to new API

Pipeable configuration (e.g., `Signal.equals`).

### 2.3 Refactor Signal tests to new API

### 2.4 Add new tests for new Signal combinators

---

## Phase 3: Add new types to `@effex/core`

### 3.1 Implement AsyncReadable

New type with TypeId, full implementation, tests.

### 3.2 Implement Mutation

New type with TypeId, full implementation, tests.

---

## Phase 4: Verify `@effex/core` in isolation

```bash
cd packages/core
pnpm test
pnpm typecheck
```

All tests and type checks must pass before proceeding.

---

## Phase 5: Refactor `@effex/dom`

### Strategy

**Do NOT fix dom before refactor.** Type errors will serve as a roadmap.

1. Update imports and types to use new core API
2. Follow type errors methodically
3. Refactor Element internals to pipeable pattern
4. Keep `$.div`, `$.span`, etc. as user-facing sugar
5. Update tests as we go

### 5.1 Update Element internals

Refactor to use `Element.make`, `Element.setAttribute`, `Element.bindAttribute`, `Element.addChildren`, etc.

### 5.2 Update Control flow (`when`, `match`, `each`)

These consume Readables - update to new patterns.

### 5.3 Update remaining dom modules

Mount, Template, Animation, etc.

### 5.4 Verify dom tests pass

```bash
cd packages/dom
pnpm test
pnpm typecheck
```

---

## Phase 6: Update dependent packages

- `@effex/router`
- `@effex/form`
- `@effex/primitives`
- `@effex/platform`

Follow type errors, update to new APIs.

---

## Phase 7: Update documentation and examples

- Update README files
- Update migration guides
- Update create-effex templates
- Update example apps

---

# API Sketches

## Readable<A>

```ts
// TypeId
export const TypeId: unique symbol = Symbol.for("effex/Readable")
export type TypeId = typeof TypeId

// Type guard
export const isReadable: (value: unknown) => value is Readable<unknown>

// Interface
export interface Readable<A> extends Pipeable {
  readonly [TypeId]: TypeId
  readonly get: Effect.Effect<A>
  readonly changes: Stream.Stream<A>
  readonly values: Stream.Stream<A>
}

// Constructors
export const make: <A>(get: Effect.Effect<A>, changes: Stream.Stream<A>) => Readable<A>
export const of: <A>(value: A) => Readable<A>  // constant Readable
export const fromEffect: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<Readable<A>, E, R>
export const fromStream: <A>(stream: Stream.Stream<A>) => Effect.Effect<Readable<A>, never, Scope.Scope>

// Normalize A | Readable<A> to Readable<A>
export const normalize: <A>(value: A | Readable<A>) => Readable<A>

// Combinators (pipeable)
export const map: {
  <A, B>(f: (a: A) => B): (self: Readable<A>) => Readable<B>
  <A, B>(self: Readable<A>, f: (a: A) => B): Readable<B>
}

export const flatMap: {
  <A, B>(f: (a: A) => Readable<B>): (self: Readable<A>) => Readable<B>
  <A, B>(self: Readable<A>, f: (a: A) => Readable<B>): Readable<B>
}

export const zip: {
  <B>(that: Readable<B>): <A>(self: Readable<A>) => Readable<[A, B]>
  <A, B>(self: Readable<A>, that: Readable<B>): Readable<[A, B]>
}

export const zipWith: {
  <A, B, C>(that: Readable<B>, f: (a: A, b: B) => C): (self: Readable<A>) => Readable<C>
  <A, B, C>(self: Readable<A>, that: Readable<B>, f: (a: A, b: B) => C): Readable<C>
}

export const zipAll: <T extends ReadonlyArray<Readable<any>>>(
  readables: T
) => Readable<{ [K in keyof T]: T[K] extends Readable<infer A> ? A : never }>

// Side effects (runs effect on each value, returns void)
export const tap: {
  <A, E, R>(f: (a: A) => Effect.Effect<void, E, R>): (self: Readable<A>) => Effect.Effect<void, E, Scope.Scope | R>
  <A, E, R>(self: Readable<A>, f: (a: A) => Effect.Effect<void, E, R>): Effect.Effect<void, E, Scope.Scope | R>
}

export const filter: {
  <A>(predicate: (a: A) => boolean): (self: Readable<A>) => Readable<A>
  <A>(self: Readable<A>, predicate: (a: A) => boolean): Readable<A>
}

export const dedupe: <A>(self: Readable<A>) => Readable<A>

export const dedupeWith: {
  <A>(equals: (a: A, b: A) => boolean): (self: Readable<A>) => Readable<A>
  <A>(self: Readable<A>, equals: (a: A, b: A) => boolean): Readable<A>
}
```

## Signal<A>

```ts
// TypeId
export const SignalTypeId: unique symbol = Symbol.for("effex/Signal")
export type SignalTypeId = typeof SignalTypeId

// Type guard
export const isSignal: (value: unknown) => value is Signal<unknown>

// Interface (extends Readable)
export interface Signal<A> extends Readable<A> {
  readonly [SignalTypeId]: SignalTypeId
  readonly set: (value: A) => Effect.Effect<void>
  readonly update: (f: (a: A) => A) => Effect.Effect<void>
}

// Constructor
export const make: <A>(initial: A) => Effect.Effect<Signal<A>, never, Scope.Scope>

// Pipeable configuration (applied to the Effect that creates the Signal)
export const equals: {
  <A>(f: (a: A, b: A) => boolean): (self: Effect.Effect<Signal<A>, never, Scope.Scope>) => Effect.Effect<Signal<A>, never, Scope.Scope>
  <A>(self: Effect.Effect<Signal<A>, never, Scope.Scope>, f: (a: A, b: A) => boolean): Effect.Effect<Signal<A>, never, Scope.Scope>
}

// Reactive collections (return Effect<Signal.Array<A>> etc.)
export namespace Array {
  export const make: <A>(initial: A[]) => Effect.Effect<Signal.Array<A>, never, Scope.Scope>
  // push, pop, splice, etc. as methods on Signal.Array
}

export namespace Map {
  export const make: <K, V>(initial?: Iterable<[K, V]>) => Effect.Effect<Signal.Map<K, V>, never, Scope.Scope>
}

export namespace Set {
  export const make: <A>(initial?: Iterable<A>) => Effect.Effect<Signal.Set<A>, never, Scope.Scope>
}
```

## AsyncReadable<A, E>

```ts
// TypeId
export const AsyncReadableTypeId: unique symbol = Symbol.for("effex/AsyncReadable")
export type AsyncReadableTypeId = typeof AsyncReadableTypeId

// Type guard
export const isAsyncReadable: (value: unknown) => value is AsyncReadable<unknown, unknown>

// Interface
export interface AsyncReadable<A, E> {
  readonly [AsyncReadableTypeId]: AsyncReadableTypeId
  readonly isLoading: Readable<boolean>
  readonly value: Readable<Option.Option<A>>
  readonly error: Readable<Option.Option<E>>
  readonly refetch: () => Effect.Effect<void>
  readonly reset: () => Effect.Effect<void>  // Sets: isLoading=false, value=None, error=None
}

// Constructors
export const make: <A, E, R>(
  fetch: () => Effect.Effect<A, E, R>
) => Effect.Effect<AsyncReadable<A, E>, never, Scope.Scope | R>

export const promise: <A>(
  fetch: () => Promise<A>,
) => Effect.Effect<AsyncReadable<A, never>, never, Scope.Scope>

export const tryPromise: <A, E>(
  fetch: () => Promise<A>,
  onError: (error: unknown) => E
) => Effect.Effect<AsyncReadable<A, E>, never, Scope.Scope>

export const fromReadable: {
  <A, B, E, R>(
    f: (a: A) => Effect.Effect<B, E, R>
  ): (self: Readable<A>) => Effect.Effect<AsyncReadable<B, E>, never, Scope.Scope | R>
  <A, B, E, R>(
    self: Readable<A>,
    f: (a: A) => Effect.Effect<B, E, R>
  ): Effect.Effect<AsyncReadable<B, E>, never, Scope.Scope | R>
}

// Combinators (pipeable)
export const map: {
  <A, B>(f: (a: A) => B): <E>(self: AsyncReadable<A, E>) => AsyncReadable<B, E>
  <A, E, B>(self: AsyncReadable<A, E>, f: (a: A) => B): AsyncReadable<B, E>
}

export const flatMap: {
  <A, B, E2>(f: (a: A) => AsyncReadable<B, E2>): <E>(self: AsyncReadable<A, E>) => AsyncReadable<B, E | E2>
  <A, E, B, E2>(self: AsyncReadable<A, E>, f: (a: A) => AsyncReadable<B, E2>): AsyncReadable<B, E | E2>
}
```

## Mutation<I, O, E>

```ts
// TypeId
export const MutationTypeId: unique symbol = Symbol.for("effex/Mutation")
export type MutationTypeId = typeof MutationTypeId

// Type guard
export const isMutation: (value: unknown) => value is Mutation<unknown, unknown, unknown>

// Interface
export interface Mutation<I, O, E> {
  readonly [MutationTypeId]: MutationTypeId
  readonly isLoading: Readable<boolean>
  readonly data: Readable<Option.Option<O>>
  readonly error: Readable<Option.Option<E>>
  readonly run: (input: I) => Effect.Effect<O, E>
  readonly reset: () => Effect.Effect<void>  // Sets: isLoading=false, data=None, error=None
}

// Constructors
export const make: <I, O, E, R>(
  execute: (input: I) => Effect.Effect<O, E, R>
) => Effect.Effect<Mutation<I, O, E>, never, Scope.Scope | R>

export const promise: <I, O>(
  execute: (input: I) => Promise<O>,
) => Effect.Effect<Mutation<I, O, never>, never, Scope.Scope>

export const tryPromise: <I, O, E>(
  execute: (input: I) => Promise<O>,
  onError: (error: unknown) => E
) => Effect.Effect<Mutation<I, O, E>, never, Scope.Scope>

// Combinators (pipeable)
export const map: {
  <O, O2>(f: (o: O) => O2): <I, E>(self: Mutation<I, O, E>) => Mutation<I, O2, E>
  <I, O, E, O2>(self: Mutation<I, O, E>, f: (o: O) => O2): Mutation<I, O2, E>
}

export const flatMap: {
  <O, I2, O2, E2>(f: (o: O) => Mutation<I2, O2, E2>): <I, E>(self: Mutation<I, O, E>) => Mutation<I, O2, E | E2>
  <I, O, E, I2, O2, E2>(self: Mutation<I, O, E>, f: (o: O) => Mutation<I2, O2, E2>): Mutation<I, O2, E | E2>
}
```

## Element (dom package)

**Note:** Element creation requires a Renderer Context to be in scope.

```ts
// TypeId (for Element refs, not the Effect itself)
export const ElementTypeId: unique symbol = Symbol.for("effex/Element")

// Core creation (requires Renderer Context)
export const make: <K extends keyof HTMLElementTagNameMap>(
  tagName: K
) => Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope | Renderer>

export const makeSVG: <K extends keyof SVGElementTagNameMap>(
  tagName: K
) => Effect.Effect<SVGElementTagNameMap[K], never, Scope.Scope | Renderer>

export const of: (value: string | number | Readable<string | number>) => ChildEffect<never, Renderer>

export const empty: ChildEffect<never, never>

// Static attributes (set once)
export const setAttribute: {
  (name: string, value: string | number | boolean): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>, name: string, value: string | number | boolean): Effect.Effect<A, E, R>
}

export const setClass: {
  (className: string): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>, className: string): Effect.Effect<A, E, R>
}

export const setStyle: {
  (property: string, value: string): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>, property: string, value: string): Effect.Effect<A, E, R>
}

// Reactive bindings (subscribe to Readable changes)
export const bindAttribute: {
  <V>(name: string, readable: Readable<V>): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R, V>(self: Effect.Effect<A, E, R>, name: string, readable: Readable<V>): Effect.Effect<A, E, R | Scope.Scope>
}

export const bindClass: {
  (className: string, readable: Readable<boolean>): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>, className: string, readable: Readable<boolean>): Effect.Effect<A, E, R | Scope.Scope>
}

export const bindStyle: {
  (property: string, readable: Readable<string>): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>, property: string, readable: Readable<string>): Effect.Effect<A, E, R | Scope.Scope>
}

// Children
export const addChild: {
  <E2, R2>(child: ChildEffect<E2, R2>): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Effect.Effect<A, E, R>, child: ChildEffect<E2, R2>): Effect.Effect<A, E | E2, R | R2>
}

export const addChildren: {
  <E2, R2>(...children: ChildEffect<E2, R2>[]): <A extends HTMLElement | SVGElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Effect.Effect<A, E, R>, ...children: ChildEffect<E2, R2>[]): Effect.Effect<A, E | E2, R | R2>
}

// Events
export const on: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>
  ): <A extends HTMLElement, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | Scope.Scope>
  // ... data-first overload
}

// Existing helpers remain (focus, setStyles, addClass, etc.)
// ... all the helpers from namespace.ts
```

---

# Resolved Questions

1. **Should `Readable.zip` accept a rest parameter `(...readables)` or just two at a time?**
   - Align with `Effect.zip` - two at a time, pipeable. Use `zipAll` for multiple.

2. **For `Element.setProperties`, how do we type the props object?**
   - Drop `setProperties` entirely. Use explicit `setAttribute` for static values and `bindAttribute` for Readable values.

3. **Should `AsyncReadable` and `Mutation` have a way to reset their state?**
   - Yes. Both have `reset: () => Effect.Effect<void>` that clears to initial state (isLoading=false, value/data=None, error=None). Use cases: logout cleanup, error acknowledgment, context changes, re-using mutations.

4. **Do we need `Readable.tap` (side effect without transforming)?**
   - Yes, `tap` makes more sense than `forEach` for side effects. This replaces `Reaction`.
