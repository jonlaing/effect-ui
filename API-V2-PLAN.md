# Effex API v2 Refactor Status

## Completed Phases

### Phase 1-4: Core Package ✅

All core primitives refactored with TypeId patterns, pipeable APIs, and full test coverage:

- **Readable** - `TypeId`, `isReadable`, pipeable combinators (`map`, `flatMap`, `zip`, `zipWith`, `zipAll`, `filter`, `dedupe`, `lift`, `normalize`)
- **Signal** - `SignalTypeId`, `isSignal`, pipeable `Signal.equals`, reactive collections (`Signal.Array`, `Signal.Map`, `Signal.Set`)
- **AsyncReadable** - `AsyncReadableTypeId`, `isLoading/value/error` Readables, `refetch`, `reset`
- **Mutation** - `MutationTypeId`, `isLoading/data/error` Readables, `run`, `reset`
- **Transition** - State machines with guarded transitions
- **ControlCtx** - Context pattern for control flow (client/SSR/hydration)
- **SuspenseBoundaryCtx** - Context pattern for suspense boundaries

### Phase 5: DOM Package ✅

All DOM modules refactored:

- **Element** - Pipeable helpers (`addClass`, `setStyles`, `setAttribute`, `focus`, etc.), `Element.ref`, `$` namespace factories
- **Control** - `when`, `match`, `each`, `matchOption`, `matchEither` using `ControlCtx`
  - `ClientControlCtx`, `SSRControlCtx`, `HydrationControlCtx` implementations
- **VirtualList** - `virtualEach` using `VirtualListCtx`
  - `ClientVirtualListCtx`, `SSRVirtualListCtx`, `HydrationVirtualListCtx` implementations
- **Boundary** - `Boundary.suspense`, `Boundary.error` using `SuspenseBoundaryCtx`
- **SSR Safety** - Guards added to `FocusTrap`, `ScrollLock`, `Portal`
- **Render** - `DOMRenderer`, `mount`, `runApp`, `renderToString`, `hydrate`

### Phase 7 (Partial): Documentation ✅

- `packages/core/README.md` - Updated
- `packages/dom/README.md` - Updated

---

## Remaining Work

### Phase 6: Update Dependent Packages

#### 6.1 `@effex/form` - Uses removed `Derived.sync`

```
Error: Derived.sync is not a function
```

**Fix needed:** Replace `Derived.sync([deps], fn)` with `Readable.zipAll([deps]).pipe(Readable.map(fn))` or similar patterns.

#### 6.2 `@effex/router` - Missing ControlCtx

```
Error: Service not found: @effex/core/ControlCtx
```

**Fix needed:** Tests need to provide `ClientControlCtx` layer. Router may also need API updates.

#### 6.3 `@effex/platform`

Needs testing after other packages are fixed.

### Phase 7 (Remaining): Templates & Examples

- [ ] Update `create-effex` templates
- [ ] Update example apps
- [ ] Migration guide (optional - breaking changes documented in READMEs)

---

## Key API Changes Summary

### Removed
- `Derived.sync` - Use `Readable.map`, `Readable.zipWith`, or `Readable.zipAll` + `map`
- `Derived.async` - Use `AsyncReadable.make`
- Inline `.map()` on Readables - Use `Readable.map(readable, fn)` or `readable.pipe(Readable.map(fn))`

### Added
- `Readable.normalize(value)` - Normalizes `T | Readable<T>` to `Readable<T>`
- `Readable.lift(fn)` - Makes functions accept reactive props
- `AsyncReadable` - Async state with `isLoading`, `value`, `error`
- `Mutation` - Explicit mutations with state tracking
- `ControlCtx` - Abstraction for control flow across environments
- `VirtualListCtx` - Abstraction for virtual lists across environments
- `SuspenseBoundaryCtx` - Abstraction for suspense across environments

### Context Layers Required

Control flow functions (`when`, `match`, `each`, etc.) now require `ControlCtx`:

```ts
// In tests
Effect.provide(ClientControlCtx)

// At app entry points (mount, hydrate, renderToString)
// Layers are provided automatically
```

---

## Migration Pattern for Primitives

Before (old API):
```ts
const MyPrimitive = (props: { disabled?: Reactive<boolean> }) =>
  Effect.gen(function* () {
    const disabled = Readable.normalize(props.disabled ?? false);
    const ariaDisabled = disabled.map(d => d ? "true" : undefined);
    //                          ^^^^ old inline method
  });
```

After (new API):
```ts
const MyPrimitive = (props: { disabled?: Reactive<boolean> }) =>
  Effect.gen(function* () {
    const disabled = Readable.normalize(props.disabled ?? false);
    const ariaDisabled = Readable.map(disabled, d => d ? "true" : undefined);
    //                   ^^^^^^^^^^^^ use Readable.map
  });
```

Or with pipe:
```ts
const ariaDisabled = disabled.pipe(Readable.map(d => d ? "true" : undefined));
```
