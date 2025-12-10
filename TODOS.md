# Effect UI - TODO List

## High Priority

- [x] **Unit Tests for Everything** - Comprehensive test coverage
  - [x] Signal.ts
  - [x] Derived/
  - [x] Readable.ts
  - [x] Reaction.ts
  - [x] Element/
  - [x] Control.ts (when, match, each, ErrorBoundary, Suspense)
  - [x] Component.ts
  - [x] Mount.ts
  - [x] Ref.ts
  - [x] Template.ts

## Medium Priority

- [ ] **Storybook Support** - Visual component development and documentation
  - Set up Storybook
  - Create stories for built-in components
  - Document component patterns

- [ ] **Clean up unused Scope imports** - Build warning shows Scope imported but unused in several files

- [ ] **Improve error messages** - Better developer experience when things go wrong

- [ ] **Performance testing** - Benchmark reactive updates, large lists, etc.

## Future Considerations

- [ ] **SSR Support** - Server-side rendering capability

- [ ] **DevTools** - Browser extension or integration for debugging reactive state

- [ ] **Animation primitives** - Built-in support for transitions and animations

- [x] **Form handling utilities** - Validation, form state management (see Design Decisions below)
  - [x] Schema-based validation with Effect Schema
  - [x] Field-level state (value, errors, touched, dirty)
  - [x] Validation timing (hybrid, blur, change, submit)
  - [x] Form-level state (isValid, isSubmitting, errors)
  - [x] Async validators support
  - [x] Array/dynamic fields (FieldArray)
  - [x] README documentation

- [x] **Router V1** - Basic routing system implemented (see Design Decisions below)
  - [x] Flat routes with path params
  - [x] Effect Schema validation for params
  - [x] History API navigation
  - [x] Route-specific readables (isActive, params)
  - [x] RouterContext and typed router layers
  - [x] Link component
  - [ ] V2: Nested routes, hash routing, route guards, query param schemas

- [ ] **Documentation site** - Full documentation with examples (TypeDoc is set up)

- [ ] **Table helpers** - TanStack Table-inspired utilities for building data tables with sorting, filtering, pagination, etc.

- [ ] **Streaming async data** - Support for streaming data (e.g., AI chatbot responses). Consider how Effect Streams integrate with reactive UI updates.

- [ ] **Map and Set as reactive state** - Better ergonomics for using Map and Set as state. React makes this painful because of reference equality checks. Explore reactive Map/Set primitives that trigger updates on mutations.

## Design Decisions

### JSX (Decided Against)

**Decision:** No JSX support. Use function-based DSL only.

**Reasons:**
1. **Error type preservation**: `Element<E>` carries error types through the component tree. TypeScript's `JSX.Element` is not generic, so JSX would erase error information to `Element<unknown>`.

2. **No build complexity**: Function calls work with any TypeScript setup. JSX would require custom jsx-runtime configuration, tsconfig changes, and bundler setup.

3. **Consistent syntax**: With JSX, we'd need mixed syntax anyway - `<div>` for intrinsics but `{Component({})}` for components that can fail. Function calls are uniform.

4. **Explicit Effects**: Elements are Effects that must be yielded. The function syntax makes this clear; JSX would hide it.

The function-based DSL is clean and idiomatic:
```ts
div({ className: "card" }, [
  h1(title),
  p(description),
  Button({ onClick: handleClick }, "Submit"),
])
```

### Router

**Approach:** TanStack Router-style with Effect Schema integration

Routes are defined declaratively with typed params:

```ts
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String })
})

const PostRoute = Route.make("/posts/:postId/comments/:commentId?", {
  params: Schema.Struct({
    postId: Schema.String,
    commentId: Schema.optional(Schema.String)
  })
})

const router = yield* Router.make({
  home: HomeRoute,
  user: UserRoute,
  post: PostRoute,
})
```

#### V1 Scope (MVP)

**Included:**
- Flat routes (no nesting)
- History API only
- Path params with Effect Schema validation
- Query params as simple `Readable<URLSearchParams>` on router
- Most-specific-wins route matching (static segments before dynamic)
- Optional catch-all/fallback route
- Route-specific readables: `router.routes.user.params`, `router.routes.user.isActive`
- Navigation as Effects: `router.push(...)`, `router.replace(...)`, `router.back()`

**Deferred to V2:**
- Nested routes with accumulated params
- Hash-based routing (`/#/path`)
- Route guards via Effect error channel
- Query params with Schema validation (currently just `URLSearchParams`)
- Code splitting / lazy route loading

#### Full Feature Set (Future)

**Key features:**
- Type-safe params per route (inferred from Schema)
- Effect Schema for runtime validation
- Support both History API and hash-based routing
- Nested routes with accumulated params:
  ```ts
  const UserRoute = Route.make("/users/:id", {
    params: Schema.Struct({ id: Schema.String }),
    children: {
      profile: Route.make("/profile"),
      settings: Route.make("/settings"),
      posts: Route.make("/posts/:postId", {
        params: Schema.Struct({ postId: Schema.String })
      }),
    }
  })
  // /users/:id/posts/:postId -> { id: string, postId: string }
  ```
- Route-specific readables: `router.routes.user.params`, `router.routes.user.isActive`
- Navigation as Effects: `router.push(...)`, `router.replace(...)`, `router.back()`
- Route guards via Effect error channel for auth checks, etc.

**Why this approach:**
- Fits naturally with Effect-UI's reactive primitives (routes as Readables)
- Full type safety without manual type annotations
- Familiar to TanStack Router users
- Routes as values enables composition and code splitting

### Forms

**Approach:** Effect Schema integration, headless, TanStack Form-style API

```ts
const form = yield* Form.make({
  schema: Schema.Struct({
    email: Schema.String.pipe(Schema.nonEmpty(), Schema.pattern(emailRegex)),
    password: Schema.String.pipe(Schema.minLength(8)),
    rememberMe: Schema.Boolean,
  }),
  initial: { email: "", password: "", rememberMe: false },
})
```

**Field access - each field is a Signal with metadata:**
```ts
form.fields.email.value      // Signal<string>
form.fields.email.errors     // Readable<string[]>
form.fields.email.touched    // Readable<boolean>
form.fields.email.dirty      // Readable<boolean>
```

**Form-level state:**
```ts
form.isValid                 // Readable<boolean>
form.isSubmitting            // Readable<boolean>
form.errors                  // Readable<Record<string, string[]>>
```

**Actions:**
```ts
form.submit(onSubmit)        // Effect that validates then calls handler
form.reset()                 // Reset to initial values
form.setErrors(...)          // Set server-side errors
```

**Validation timing options:**
- `"hybrid"` (default) - blur for first validation, then change after
- `"blur"` - validate when field loses focus
- `"change"` - validate on every keystroke
- `"submit"` - only validate when submitting

**Async validation:**
```ts
Form.make({
  schema: ...,
  validators: {
    username: (value) =>
      Effect.gen(function* () {
        const available = yield* api.checkUsername(value)
        return available ? [] : ["Username already taken"]
      }).pipe(Effect.debounce(300)),
  },
})
```

**Array/dynamic fields:**
```ts
form.fields.phoneNumbers.append("")
form.fields.phoneNumbers.remove(index)
form.fields.phoneNumbers.move(fromIndex, toIndex)
form.fields.phoneNumbers.items // Readable<FieldArray<string>>
```

**Key decisions:**
- Headless - no UI opinions, just state management
- Effect Schema only (no adapters for Zod, etc.) - users of Effect-UI are already in Effect ecosystem
- Field-level subscriptions - only re-render what changed
- Provide primitives + common helpers, let users handle styling

### Animation

**Approach:** Simple built-in primitives, extensible for advanced libraries

**Core (built-in):**
- CSS-first transitions - className/style changes just work
- Basic enter/exit lifecycle for `each()` and `when()`
- Simple timing utilities - stagger, delay, sequence

```ts
// Built-in: simple and declarative
each(items, keyFn, render, {
  enter: "fade-in",
  exit: "fade-out",
})

when(isOpen,
  () => Modal({}),
  () => span(),
  { enter: "slide-up", exit: "slide-down" }
)
```

**Extension points for libraries:**
- Animation Effect type - `Effect<void>` that resolves when animation completes
- Element lifecycle hooks - `onBeforeEnter`, `onEnter`, `onBeforeExit`, `onExit`
- Access to underlying DOM for direct element manipulation

```ts
// Third-party library (e.g., "effect-ui-motion")
import { spring, Motion } from "effect-ui-motion"

const scale = yield* Signal.make(1)
const animatedScale = yield* spring(scale, { stiffness: 300, damping: 30 })

// Or take full control of enter/exit
each(items, keyFn, render, {
  enter: Motion.staggeredFadeIn({ delay: 50 }),
  exit: Motion.collapse({ duration: 300 }),
})
```

**Why this approach:**
- Core stays lean, covers 80% of use cases
- CSS handles performance (GPU-accelerated)
- Exit animations work naturally with Effect (wait for Effect to complete before DOM removal)
- Enables ecosystem libraries like "effect-ui-framer" or "effect-ui-motion-one"

### Element Error Channel

- `Element<E = never>` - generic over error type
- `Child<E = never>` - children propagate errors
- `mount()` requires `Element<never>` - all errors must be handled before mounting
- Use `ErrorBoundary` or Effect combinators to handle errors

### className vs class

Using `class` directly since we're not using JSX. No reserved word issues with function calls.

### Suspense API

Unified all Suspense variants into a single `Suspense` component with options:

```ts
Suspense({
  render: () => asyncEffect,
  fallback: () => loadingElement,
  catch: (error) => errorElement,  // optional
  delay: "200 millis",              // optional - delays fallback to avoid flash
})
```

The `delay` option accepts Effect Duration strings. If the render completes before the delay, no fallback is shown - great for route transitions.

### Class arrays for Tailwind

The `class` attribute accepts multiple formats for Tailwind-friendly ergonomics:

```ts
div({ class: "flex items-center" })                     // string
div({ class: ["flex", "items-center", "gap-4"] })       // string[]
div({ class: isActive.map(a => a ? "on" : "off") })     // Readable<string>
div({ class: ["btn", variant.map(v => `btn-${v}`)] })   // mixed with reactives
```

## Notes

- TypeDoc is configured for Markdown output (`pnpm docs:gen`)

## Development Guidelines

- **NEVER disable TypeScript or ESLint** - If types are difficult to get right, stop and ask for help rather than using `// @ts-ignore`, `// eslint-disable`, or `any` types. Proper typing is essential for this library.
