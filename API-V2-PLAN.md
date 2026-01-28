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

### 5.1 Refactor ElementRef

Add TypeId pattern to ElementRef (like Readable/Signal):

```ts
export const ElementRefTypeId: unique symbol = Symbol.for("effex/dom/ElementRef")
export type ElementRefTypeId = typeof ElementRefTypeId

export interface ElementRef<T extends Element = HTMLElement | SVGElement> extends Effect.Effect<T, NoSuchElementException> {
  readonly [ElementRefTypeId]: ElementRefTypeId
  readonly isConnected: Readable<boolean>
}

export const isElementRef = (value: unknown): value is ElementRef =>
  Predicate.hasProperty(value, ElementRefTypeId)
```

**Note:** The current `isConnected` Readable has an inline `.map` method that is never used. Remove it and use standard `Readable.make()` constructor instead.

### 5.2 Update Element internals

Refactor to use `Element.make`, `Element.setAttribute`, `Element.bindAttribute`, `Element.appendChild`, etc.

Each pipeable function follows the pattern (using Renderer, NOT direct DOM manipulation):
```ts
const setAttribute = (name: string, value: string) => <A extends HTMLElement | SVGElement, E, R>(
  self: Element<A, E, R>
): Element<A, E, R> =>
  Effect.gen(function* () {
    const el = yield* self
    const renderer = yield* RendererContext
    yield* renderer.setAttribute(el, name, value)
    return el
  })
```

**Important:** All DOM operations must go through the Renderer interface to support SSR, SSG, and hydration.

### 5.3 Create DOMElements.ts for factory functions

Move `$.div`, `$.span`, etc. to a dedicated `DOMElements.ts` file.

These factories:
- Use the new Element API internally (`Element.make`, `Element.setAttribute`, etc.)
- Handle reactive children (`Child` can contain `Readable<string | number>`)
- Support the props + children signature: `$.div({ class: "foo" }, children)`

Export as `$` namespace at the top level:
```ts
// index.ts
export { $ } from "./DOMElements.js"
```

### 5.4 Refactor Control flow (`when`, `match`, `each`)

#### Key Insight: Keyed Slot Reconciliation

All control flow functions are variations of the same pattern:
- `when` = 0-1 slots, key is `"true"` or `"false"`
- `matchOption` = 0-1 slots, key is `"some"` or `"none"`
- `matchEither` = 0-1 slots, key is `"left"` or `"right"`
- `match` = 0-1 slots, key is matched pattern string
- `each` = 0-N slots, key from `keyFn`

They're ALL keyed slot reconciliation. The differences are just configuration.

#### ControlCtx Interface

Single service that abstracts SSR/Hydration/Client differences.

**Package split:**
- `packages/core`: `IControlCtx<A>`, `SlotEntry<A>`, `ControlCtx` tag, `reconcile`, all thin wrappers (`when`, `match`, `each`, etc.)
- `packages/dom`: Live implementations (`ClientControlCtx`, `HydrationControlCtx`, `SSRControlCtx`)

The interface is generic over the element type `A` so core stays DOM-agnostic:

```ts
// Defined in packages/core
export interface SlotEntry<A> {
  readonly key: string;
  readonly element: A;
  readonly scope: Scope.CloseableScope;
  readonly item?: Signal.Signal<unknown>;   // For `each`
  readonly index?: Signal.Signal<number>;   // For `each`
}

// Defined in packages/core - generic over element type A
export interface IControlCtx<A> {
  // Default container - provided by each environment's live implementation
  // e.g., DOM uses $.div({ style: "display: contents" })
  readonly defaultContainer: Element<A, never, never>;

  // Container
  // - SSR: calls create(), adds hydration markers to result
  // - Hydration: finds existing container by hydration ID, ignores create (falls back if not found)
  // - Client: calls create()
  // Uses defaultContainer if create is not provided
  readonly getContainer: <E, R>(
    create?: () => Element<A, E, R>
  ) => Element<A, E, R>;

  // Slot management - all environment differences are internal
  // addSlot creates signals internally and passes them to the render callback
  readonly addSlot: <E, R>(
    key: string,
    render: (ctx: { item: Signal.Signal<unknown>; index: Signal.Signal<number> }) =>
      Element<A, E, R>,
    options?: { atIndex?: number; initialItem?: unknown; initialIndex?: number },
  ) => Effect.Effect<SlotEntry<A>, E, R>;  // Handles enter animations in client
  readonly removeSlot: (key: string) => Effect.Effect<void>;      // Noop in SSR, handles exit animations in client
  readonly getSlot: (key: string) => Effect.Effect<SlotEntry<A> | undefined>;
  readonly getSlotKeys: () => Effect.Effect<readonly string[]>;   // Reads DOM in hydration
  readonly moveSlot: (key: string, toIndex: number) => Effect.Effect<void>;  // Noop in SSR

  // Reactivity - noop in SSR, forks stream subscription in client/hydration
  readonly subscribe: <A, E, R>(
    readable: Readable.Readable<A>,
    handler: (value: A) => Effect.Effect<void, E, R>,
  ) => Effect.Effect<void, E, R>;
}

// Defined in packages/core - uses unknown as base type
// Live implementations in packages/dom narrow to HTMLElement | SVGElement
export class ControlCtx extends Context.Tag("@effex/core/ControlCtx")<
  ControlCtx,
  IControlCtx<unknown>
>() {}

// In packages/dom - narrowed type for DOM implementations
export type DOMControlCtx = IControlCtx<HTMLElement | SVGElement>;
```

#### Core Reconcile Function

```ts
// Defined in packages/core
interface ReconcileConfig<A, E = never, R = never> {
  readonly container?: () => Element<unknown, E, R>;
  readonly getTargetKeys: (value: A) => readonly string[];
  readonly renderSlot: (
    key: string,
    value: A,
    ctx: { item: Signal.Signal<unknown>; index: Signal.Signal<number> },
  ) => Element<unknown, E, R>;
  readonly getItemForKey?: (key: string, value: A) => unknown;
  readonly ordered?: boolean;  // true for `each`
}

// Defined in packages/core
const reconcile = <A, E, R>(
  readable: Readable.Readable<A>,
  config: ReconcileConfig<A>,
): Element<unknown, E, R | ControlCtx> =>
  Effect.gen(function* () {
    const ctx = yield* ControlCtx;
    // getContainer uses ctx.defaultContainer if config.container is not provided
    const container = yield* ctx.getContainer(config.container);

    const sync = (value: A) => Effect.gen(function* () {
      const currentKeys = yield* ctx.getSlotKeys();
      const targetKeys = config.getTargetKeys(value);
      const targetSet = new Set(targetKeys);

      // Step 1: Remove slots not in target
      for (const key of currentKeys) {
        if (!targetSet.has(key)) {
          yield* ctx.removeSlot(key);
        }
      }

      // Step 2: Add/update slots in target order
      // `i` is the TARGET position where this key should end up
      for (let i = 0; i < targetKeys.length; i++) {
        const key = targetKeys[i];
        const existing = yield* ctx.getSlot(key);

        if (existing) {
          // Update existing slot's reactive values
          if (existing.item && config.getItemForKey) {
            yield* existing.item.set(config.getItemForKey(key, value));
          }
          if (existing.index) {
            yield* existing.index.set(i);
          }
          // Reorder DOM if needed
          if (config.ordered) {
            yield* ctx.moveSlot(key, i);
          }
        } else {
          // Create new slot
          const itemValue = config.getItemForKey?.(key, value);
          yield* ctx.addSlot(
            key,
            ({ item, index }) => config.renderSlot(key, value, { item, index }),
            { atIndex: i, initialItem: itemValue, initialIndex: i }
          );
        }
      }
    });

    // Initial sync
    yield* sync(yield* readable.get);

    // Subscribe to future changes
    yield* ctx.subscribe(readable, sync);

    return container;
  });
```

#### Performance Notes

The old `each` implementation had memory issues around 500+ items, likely due to:
- Creating heavy custom mutable readables per item (now using lightweight Signals)
- Improper scope cleanup on removal (now each slot has explicit scope lifecycle)
- O(n²) diffing (now O(n) with Set lookups)

This design should handle 500+ items better, but for truly large lists (1000+),
`virtualEach` remains the right choice since it only renders visible items.

Potential optimizations if needed:
- Maintain internal Set instead of recreating each sync
- Batch DOM operations with `requestAnimationFrame`
- Skip `moveSlot` calls when position unchanged (check before calling)

#### Thin Wrappers

All control functions become configuration:

```ts
// all of these functions defined in packages/core
export const when = (condition, { onTrue, onFalse, container }) =>
  reconcile(condition, {
    container,
    getTargetKeys: (v) => v ? (onTrue ? ["true"] : []) : (onFalse ? ["false"] : []),
    renderSlot: (key) => key === "true" ? onTrue!() : onFalse!(),
  });

export const matchOption = (option, { onSome, onNone, container }) =>
  reconcile(option, {
    container,
    getTargetKeys: (opt) => [Option.isSome(opt) ? "some" : "none"],
    renderSlot: (key, opt) => key === "some" ? onSome(opt.value) : onNone(),
  });

// additionally matchEither and match follow similar patterns

export const each = (items, { key: keyFn, render, container }) =>
  reconcile(items, {
    container,
    getTargetKeys: (arr) => arr.map(keyFn),
    renderSlot: (_, __, ctx) => render(ctx.item, ctx.index),
    getItemForKey: (key, arr) => arr.find(item => keyFn(item) === key),
    ordered: true,
  });

// Example: rendering a list with custom container
each(todos, {
  key: (todo) => todo.id,
  render: (todo, index) => $.li({}, todo.map(t => t.text)),
  container: () => $.ul({ class: "todo-list" }),
})
```

#### Migration Notes

- Replace `createItemReadable` / `createIndexReadable` with `Signal.make()`
- Remove SSR/Hydration/Client branching from each function - use `ControlCtx` layer
- All reconciliation logic lives in `@effex/core` (environment-agnostic)
- Live `ControlCtx` implementations live in `@effex/dom` and are provided at mount/hydrate/renderToString entry points

### 5.5 Update remaining dom modules

Mount, Template, Animation, etc.

### 5.6 Verify dom tests pass

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

Also, we're avoiding pluralized functions like setAttributes or setStyles for now, as
they complicate type inferrence. We can come back to them later using composition.

```ts
import { Element as CoreElement } from "@effex/core"

// core Element type  is alias for Effect.Effect<A, E, R | Scope.Scope | Renderer>
// we alias it again in dom to narrow the success channel to HTMLElement | SVGElement
export type Element<A extends HTMLElement | SVGElement, E = never, R = never> = CoreElement<A ,E, R>

export type ChildNode = string | number | Readable<string | number> | HTMLElement | SVGElement

export type Child<E = never, R = never> = Effect.Effect<ChildNode | ChildNode[], E, R>

// Core creation (requires Renderer Context)
export const make: <K extends keyof HTMLElementTagNameMap>(
  tagName: K
) => Element<HTMLElementTagNameMap[K], never, never>

export const makeSVG: <K extends keyof SVGElementTagNameMap>(
  tagName: K
) => Element<SVGElementTagNameMap[K], never, never>

export const of: (value: string | number | Readable<string | number>) => Child<never, never>

export const empty: Child<never, never>

// =============================================================================
// Attributes
// =============================================================================

export const setAttribute: {
  (name: string, value: string | number | boolean): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, name: string, value: string | number | boolean): Element<A, E, R>
}

export const getAttribute: {
  (name: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<string, AttributeNotFound | E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, name: string): Effect.Effect<string, AttributeNotFound | E, R>
}

export const hasAttribute: {
  (name: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<boolean, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, name: string): Effect.Effect<boolean, E, R>
}

export const removeAttribute: {
  (name: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, name: string): Element<A, E, R>
}

export const toggleAttribute: {
  (name: string, force?: boolean): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, name: string, force?: boolean): Element<A, E, R>
}

// =============================================================================
// Classes
// =============================================================================

export const setClass: {
  (className: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, className: string): Element<A, E, R>
}

export const addClass: {
  (...classes: string[]): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, ...classes: string[]): Element<A, E, R>
}

export const removeClass: {
  (...classes: string[]): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, ...classes: string[]): Element<A, E, R>
}

export const toggleClass: {
  (className: string, force?: boolean): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, className: string, force?: boolean): Element<A, E, R>
}

export const replaceClass: {
  (oldClass: string, newClass: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, oldClass: string, newClass: string): Element<A, E, R>
}

// =============================================================================
// Styles
// =============================================================================

export const setStyle: {
  (property: string, value: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, property: string, value: string): Element<A, E, R>
}

export const removeStyle: {
  (property: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, property: string): Element<A, E, R>
}

// =============================================================================
// Data Attributes
// =============================================================================

export const setData: {
  (key: string, value: string): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement, E, R>(self: Element<A, E, R>, key: string, value: string): Element<A, E, R>
}

export const getData: {
  (key: string): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Effect.Effect<string, DataAttributeNotFound | E, R>
  <A extends HTMLElement, E, R>(self: Element<A, E, R>, key: string): Effect.Effect<string, DataAttributeNotFound | E, R>
}

export const removeData: {
  (key: string): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement, E, R>(self: Element<A, E, R>, key: string): Element<A, E, R>
}

// =============================================================================
// Reactive Bindings (subscribe to Readable changes)
// =============================================================================

export const bindAttribute: {
  <V>(name: string, readable: Readable<V>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R, V>(self: Element<A, E, R>, name: string, readable: Readable<V>): Element<A, E, R | Scope.Scope>
}

export const bindClass: {
  (className: string, readable: Readable<boolean>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, className: string, readable: Readable<boolean>): Element<A, E, R | Scope.Scope>
}

export const bindStyle: {
  (property: string, readable: Readable<string>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, property: string, readable: Readable<string>): Element<A, E, R | Scope.Scope>
}

export const bindData: {
  (key: string, readable: Readable<string>): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement, E, R>(self: Element<A, E, R>, key: string, readable: Readable<string>): Element<A, E, R | Scope.Scope>
}

export const bindTextContent: {
  (readable: Readable<string>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, readable: Readable<string>): Element<A, E, R | Scope.Scope>
}

export const bindToggleClass: {
  (className: string, readable: Readable<boolean>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, className: string, readable: Readable<boolean>): Element<A, E, R | Scope.Scope>
}

// =============================================================================
// Element Reference
// =============================================================================

export const setRef: {
  <A extends HTMLElement | SVGElement>(ref: ElementRef<A>): <E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, ref: ElementRef<A>): Element<A, E, R>
}

// =============================================================================
// Content
// =============================================================================

export const setTextContent: {
  (text: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, text: string): Element<A, E, R>
}

export const setInnerHTML: {
  (html: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, html: string): Element<A, E, R>
}

// =============================================================================
// Children
// =============================================================================

export const appendChild: {
  <E2, R2>(child: Child<E2, R2>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Element<A, E, R>, child: Child<E2, R2>): Element<A, E | E2, R | R2>
}

export const prependChild: {
  <E2, R2>(child: Child<E2, R2>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Element<A, E, R>, child: Child<E2, R2>): Element<A, E | E2, R | R2>
}

export const insertBefore: {
  <E2, R2>(newChild: Child<E2, R2>, refChild: Node | null): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Element<A, E, R>, newChild: Child<E2, R2>, refChild: Node | null): Element<A, E | E2, R | R2>
}

export const removeChild: {
  (child: Node): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, child: Node): Element<A, E, R>
}

export const replaceChild: {
  <E2, R2>(oldChild: Node, newChild: Child<E2, R2>): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Element<A, E, R>, oldChild: Node, newChild: Child<E2, R2>): Element<A, E | E2, R | R2>
}

export const clearChildren: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>

// =============================================================================
// Traversal & Querying
// =============================================================================

export const getId: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<string, E, R>

export const getParent: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<HTMLElement | SVGElement, NoSuchElementException | E, R>

export const querySelector: {
  (selector: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<HTMLElement | SVGElement, NoSuchElementException | E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, selector: string): Effect.Effect<HTMLElement | SVGElement, NoSuchElementException | E, R>
}

export const querySelectorAll: {
  (selector: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<(HTMLElement | SVGElement)[], E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, selector: string): Effect.Effect<(HTMLElement | SVGElement)[], E, R>
}

export const closest: {
  (selector: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<HTMLElement | SVGElement, NoSuchElementException | E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, selector: string): Effect.Effect<HTMLElement | SVGElement, NoSuchElementException | E, R>
}

export const matches: {
  (selector: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<boolean, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, selector: string): Effect.Effect<boolean, E, R>
}

export const contains: {
  (element: Node | null): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<boolean, NoSuchElementException | E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, element: Node | null): Effect.Effect<boolean, NoSuchElementException | E, R>
}

// =============================================================================
// Dimensions & Position
// =============================================================================

export const getBoundingClientRect: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<DOMRect, E, R>
export const getClientRects: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<DOMRectList, E, R>
export const getOffsetHeight: <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Effect.Effect<number, E, R>
export const getOffsetWidth: <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Effect.Effect<number, E, R>
export const getScrollHeight: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<number, E, R>
export const getScrollWidth: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Effect.Effect<number, E, R>

// =============================================================================
// Focus
// =============================================================================

export const focus: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>

export const focusWithOptions: {
  (options: FocusOptions): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, options: FocusOptions): Element<A, E, R>
}

export const blur: <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>

export const focusFirst: {
  (selector: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, selector: string): Element<A, E, R>
}

export const focusLast: {
  (selector: string): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, selector: string): Element<A, E, R>
}

// =============================================================================
// Scrolling
// =============================================================================

export const scrollIntoView: {
  (options?: ScrollIntoViewOptions): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, options?: ScrollIntoViewOptions): Element<A, E, R>
}

export const scrollTo: {
  (options: ScrollToOptions): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, options: ScrollToOptions): Element<A, E, R>
}

export const scrollBy: {
  (options: ScrollToOptions): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, options: ScrollToOptions): Element<A, E, R>
}

// =============================================================================
// Events
// =============================================================================

export const on: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>
  ): Element<A, E, R | Scope.Scope>
}

export const once: {
  <K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>
  ): <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R | Scope.Scope>
  <A extends HTMLElement, E, R, K extends keyof HTMLElementEventMap>(
    self: Element<A, E, R>,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => Effect.Effect<void, never, never>
  ): Element<A, E, R | Scope.Scope>
}

export const click: <A extends HTMLElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>

export const dispatchEvent: {
  (event: Event): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, event: Event): Element<A, E, R>
}

// =============================================================================
// Animation
// =============================================================================

export const animate: {
  (keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Element<A, E, R>
}

// =============================================================================
// Input-specific
// =============================================================================

export const select: <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>

export const setSelectionRange: {
  (start: number, end: number, direction?: "forward" | "backward" | "none"): <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLInputElement | HTMLTextAreaElement, E, R>(self: Element<A, E, R>, start: number, end: number, direction?: "forward" | "backward" | "none"): Element<A, E, R>
}

// =============================================================================
// Custom Taps
// =============================================================================

export const tap: {
  <A extends HTMLElement | SVGElement>(fn: (el: A) => void): <E, R>(self: Element<A, E, R>) => Element<A, E, R>
  <A extends HTMLElement | SVGElement, E, R>(self: Element<A, E, R>, fn: (el: A) => void): Element<A, E, R>
}

export const tapEffect: {
  <A extends HTMLElement | SVGElement, E2, R2>(fn: (el: A) => Effect.Effect<unknown, E2, R2>): <E, R>(self: Element<A, E, R>) => Element<A, E | E2, R | R2>
  <A extends HTMLElement | SVGElement, E, R, E2, R2>(self: Element<A, E, R>, fn: (el: A) => Effect.Effect<unknown, E2, R2>): Element<A, E | E2, R | R2>
}

// =============================================================================
// Convenience: $ namespace provides tag-specific constructors
// $.div(...), $.span(...), $.button(...), etc.
// These are sugar over Element.make that accept props and children directly
// =============================================================================
```

## ElementRef (dom package)

```ts
// TypeId
export const ElementRefTypeId: unique symbol = Symbol.for("effex/dom/ElementRef")
export type ElementRefTypeId = typeof ElementRefTypeId

// Type guard
export const isElementRef: (value: unknown) => value is ElementRef

// Interface - extends Effect so it can be yielded to get the element
export interface ElementRef<T extends Element = HTMLElement | SVGElement>
  extends Effect.Effect<T, NoSuchElementException> {
  readonly [ElementRefTypeId]: ElementRefTypeId
  /** Readable that tracks whether the element is connected to the DOM */
  readonly isConnected: Readable<boolean>
}

// Constructor
export const ref: <T extends Element = HTMLElement | SVGElement>() => Effect.Effect<ElementRef<T>>

// Synchronous access (returns null if not mounted)
export const getUnsafe: <T extends Element>(ref: ElementRef<T>) => T | null

// Internal binding (used by element creation)
export const bindElementToRef: <T extends Element>(ref: ElementRef<T>, element: T) => void
export const unbindElementFromRef: <T extends Element>(ref: ElementRef<T>) => void
```

**Usage:**
```ts
const buttonRef = yield* Element.ref<HTMLButtonElement>()

// Yield to get element in Effect context
const handleClick = () =>
  buttonRef.pipe(
    Element.addClass("clicked"),
    Element.focus,
    Effect.asVoid
  )

// Pass to element via setRef
yield* Element.make("button").pipe(
  Element.setRef(buttonRef),
  Element.on("click", handleClick),
  Element.appendChild(Element.of("Click me"))
)

// Or via $.button factory
yield* $.button({ ref: buttonRef, onClick: handleClick }, "Click me")
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
