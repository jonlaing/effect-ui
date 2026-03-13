# Effex API v2 Refactor Status

## Completed Phases

### Phase 1-4: Core Package ✅

All core primitives refactored with TypeId patterns, pipeable APIs, and full test coverage:

- **Readable** - `TypeId`, `isReadable`, pipeable combinators (`map`, `flatMap`, `zip`, `zipWith`, `zipAll`, `filter`, `dedupe`, `lift`, `normalize`)
- **Signal** - `SignalTypeId`, `isSignal`, pipeable `Signal.equals`, reactive collections (`Signal.Array`, `Signal.Map`, `Signal.Set`)
- **AsyncReadable** - `AsyncReadableTypeId`, `isLoading/value/error` Readables, `refetch`, `reset`
- **AsyncCache** - Query-cache service with prefix-based invalidation, seeded readables, auto-provided in SSR and client
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
- **ClientAsyncCacheLayer** - Shared singleton AsyncCache for mount/hydrate

### Phase 6: Update Dependent Packages ✅

#### 6.1 `@effex/form` ✅
All 90 tests passing (Field: 17, Form: 73). Builds clean.

#### 6.2 `@effex/router` ✅
All 119 tests passing (Route: 35, Router: 34, Navigation: 33, Link: 17). Builds clean.

New features:
- `Route.get(loader, render)` — loader on route, data passed to render
- `Route.post/put/delete(key, handler)` — mutation handlers
- `Route.params(schema)` / `Route.searchParams(schema)` — typed validation
- `Route.catchIf/catchTag/catchAll` — error handling combinators
- `Route.withGuard(cond, opts)` — protected routes with redirect/fallback
- `RouteDataContext` + `RouteDataProvider` — data flow abstractions
- `Outlet` — renders matched route with data, handles redirects
- `Link` — navigation component with active state

#### 6.3 `@effex/platform` ✅
Builds clean. Full SSR + hydration pipeline working.

- `Platform.toHttpRoutes(router, options)` — Router → HttpRouter
- `Platform.generateDocument()` — HTML document with hydration data
- `Platform.makeClientLayer(router)` — client-side data provider (hydration + `?_data=1` fetching)
- `RedirectError` — redirect from loaders/handlers (server 302 + client-side nav)
- AsyncCache auto-provided on both server (per-request) and client

#### 6.4 `@effex/vite-plugin` ✅
12 tests passing. Builds clean.

- `effexPlatform()` — combined Vite plugin
  - Server-code stripping: strips `Route.get` loaders and `Route.post/put/del` handlers from client builds
  - SSR dev server with HMR (when `entry` is provided)

### Phase 7 (Partial): Documentation ✅

- `packages/core/README.md` - Updated
- `packages/dom/README.md` - Updated
- `packages/platform/PLATFORM-V2.md` - Complete design doc with all phases done

---

## Remaining Work

### Phase 7 (Remaining): Templates & Examples

- [ ] Update `create-effex` templates
- [ ] Update example apps (chat, kanban, router-demo may need v2 API updates)
- [ ] Migration guide (optional - breaking changes documented in READMEs)

**Example app status:**
- `twitter` ✅ — Full SSR + hydration demo with DaisyUI styling, error handling, redirects
- `todo-app` ✅ — Working with Tailwind + DaisyUI
- `chat` — Needs review
- `kanban` — Needs review
- `router-demo` — Needs review (may be superseded by twitter demo)

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
- `AsyncCache` - Query-cache with prefix-based invalidation, seeded readables
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
