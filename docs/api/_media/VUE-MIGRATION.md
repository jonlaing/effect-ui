# Coming from Vue

A guide for Vue developers learning Effex. This covers the key differences, concept mapping, and side-by-side examples to help you transition.

## Why Switch?

If you're already using [Effect](https://effect.website/) in your application, Effex lets you use the same patterns and mental model across your entire stack. No more context-switching between Vue's reactivity model and Effect's compositional approach.

### Typed Error Handling

In Vue, component errors are runtime surprises. You catch them with `errorCaptured` hooks or global error handlers, but there's no compile-time visibility into what can fail.

In Effex, every element has type `Element<E>` where `E` is the error channel. Errors propagate through the component tree, and you **must** handle them before mounting:

```ts
// This won't compile - UserProfile might fail with ApiError
mount(UserProfile(), document.body); // Type error!

// Handle the error first
mount(
  ErrorBoundary(
    () => UserProfile(),
    (error) => $.div(`Failed to load: ${error.message}`),
  ),
  document.body,
); // Compiles
```

TypeScript tells you at build time which components can fail and forces you to handle it.

### Similar Reactivity, Different Execution

Vue's Composition API and Effex share similar reactive concepts - both have signals (refs) and derived values (computed). The key difference is *when* things run:

- Vue: Template re-renders when refs change, computed values update lazily
- Effex: DOM nodes subscribe directly to signals, updates are synchronous and targeted

```ts
// Vue: Computed re-evaluates, template re-renders
const count = ref(0)
const doubled = computed(() => count.value * 2)
// Template: {{ doubled }} - entire template function runs

// Effex: Only the text node updates
const count = yield* Signal.make(0)
const doubled = yield* Derived.sync([count], ([c]) => c * 2)
// $.span(doubled) - only this span's text updates
```

### No Template Compilation

Vue uses a custom template syntax that compiles to render functions. Effex uses plain TypeScript function calls:

```ts
// Vue template
<template>
  <div class="card">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Submit</button>
  </div>
</template>

// Effex
$.div({ class: "card" }, [
  $.h1(title),
  $.button({ onClick: handleClick }, "Submit"),
])
```

Benefits:
- Full TypeScript inference everywhere
- No build step required for templates
- Easier to debug (no compiled output to trace through)
- IDE features work perfectly (rename, find references, etc.)

### Automatic Resource Cleanup

Vue's `onUnmounted` and `watchEffect` cleanup are manual. Effex uses Effect's scope system - resources are automatically cleaned up when components unmount:

```ts
// Vue: Manual cleanup registration
onMounted(() => {
  const subscription = eventSource.subscribe(handler)
  onUnmounted(() => subscription.unsubscribe())
})

// Effex: Automatic cleanup via scope
yield* eventSource.pipe(
  Stream.runForEach(handler),
  Effect.forkIn(scope), // Cleaned up when scope closes
)
```

### Better Async Integration

Vue's `<Suspense>` is limited and doesn't integrate well with error handling. Effex unifies loading and error states:

```ts
Suspense({
  render: () =>
    Effect.gen(function* () {
      const user = yield* fetchUser(id); // Can fail!
      return yield* UserProfile({ user });
    }),
  fallback: () => $.div("Loading..."),
  catch: (error) => $.div(`Error: ${error.message}`), // Same place
  delay: "200 millis", // Avoid loading flash
})
```

## Concept Mapping

| Vue (Composition API)      | Effex                              | Notes                        |
| -------------------------- | ---------------------------------- | ---------------------------- |
| `ref(initial)`             | `Signal.make(initial)`             | Must `yield*` to create      |
| `reactive(obj)`            | `Signal.make(obj)`                 | Same as ref for objects      |
| `computed(() => x)`        | `Derived.sync([deps], () => x)`    | Deps are explicit signals    |
| `watch(source, cb)`        | `Reaction`                         | Automatic cleanup            |
| `watchEffect(cb)`          | `Reaction` with immediate          | Explicit dependencies        |
| `provide/inject`           | `yield* ServiceTag`                | Effect services              |
| `ref` (template ref)       | `Ref.make()`                       | For DOM refs                 |
| `v-if / v-else`            | `when(cond, truthy, falsy)`        | Always two branches          |
| `v-show`                   | Signal-based class/style           | No direct equivalent         |
| `v-for`                    | `each(arr, keyFn, renderFn)`       | Key function, not `:key`     |
| `@click` / `v-on`          | `onClick` / event props            | Camel case handlers          |
| `:class` / `v-bind:class`  | `class` prop with Readable         | Reactive by default          |
| `<Teleport>`               | `Portal()`                         | Similar API                  |
| `<Suspense>`               | `Suspense({ render, fallback })`   | With typed `catch`           |
| `defineProps`              | Function parameters                | Plain TypeScript             |
| `defineEmits`              | Callback props                     | Plain functions              |
| SFC `.vue` files           | Plain `.ts` files                  | No special file format       |

## Side-by-Side Examples

### State and Updates

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

```ts
// Effex
const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    return yield* $.button(
      { onClick: () => count.update((c) => c + 1) },
      count,
    );
  }),
);
```

### Computed / Derived State

```vue
<!-- Vue -->
<script setup>
import { ref, computed } from 'vue'

const items = ref([])
const total = computed(() =>
  items.value.reduce((sum, i) => sum + i.price, 0)
)
</script>

<template>
  <div>Total: ${{ total }}</div>
</template>
```

```ts
// Effex
const Cart = component("Cart", (props: { items: Readable<Item[]> }) =>
  Effect.gen(function* () {
    const total = yield* Derived.sync([props.items], ([items]) =>
      items.reduce((sum, i) => sum + i.price, 0),
    );
    return yield* $.div(total.map((t) => `Total: $${t}`));
  }),
);
```

### Conditional Rendering

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'
const isLoggedIn = ref(false)
</script>

<template>
  <Dashboard v-if="isLoggedIn" />
  <Login v-else />
</template>
```

```ts
// Effex
const Auth = component("Auth", (props: { isLoggedIn: Readable<boolean> }) =>
  when(
    props.isLoggedIn,
    () => Dashboard(),
    () => Login(),
  ),
);
```

### Lists

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'
const todos = ref([])
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>
```

```ts
// Effex
const TodoList = component("TodoList", (props: { todos: Readable<Todo[]> }) =>
  $.ul([
    each(
      props.todos,
      (todo) => todo.id, // Key function
      (todo) => $.li(todo.map((t) => t.text)), // Render function
    ),
  ]),
);
```

### Watchers / Reactions

```vue
<!-- Vue -->
<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')

watch(searchQuery, async (newQuery) => {
  const results = await search(newQuery)
  // update results...
})
</script>
```

```ts
// Effex
const Search = component("Search", () =>
  Effect.gen(function* () {
    const query = yield* Signal.make("");
    const scope = yield* Effect.scope;

    yield* Reaction.make(query, (newQuery) =>
      Effect.gen(function* () {
        const results = yield* search(newQuery);
        // update results...
      }),
    );

    // ... rest of component
  }),
);
```

### Provide / Inject (Services)

```vue
<!-- Vue Parent -->
<script setup>
import { provide, ref } from 'vue'
const theme = ref('dark')
provide('theme', theme)
</script>

<!-- Vue Child -->
<script setup>
import { inject } from 'vue'
const theme = inject('theme')
</script>

<template>
  <div :class="theme">...</div>
</template>
```

```ts
// Effex
class ThemeService extends Context.Tag("Theme")<ThemeService, string>() {}

const Page = component("Page", () =>
  Effect.gen(function* () {
    const theme = yield* ThemeService;
    return yield* $.div({ class: theme }, "...");
  }),
);

runApp(mount(Page().pipe(Effect.provideService(ThemeService, "dark")), root));
```

### Two-Way Binding (v-model)

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <input v-model="text" />
  <p>You typed: {{ text }}</p>
</template>
```

```ts
// Effex
const TextInput = component("TextInput", () =>
  Effect.gen(function* () {
    const text = yield* Signal.make("");
    return yield* $.div([
      $.input({
        value: text,
        onInput: (e) => text.set((e.target as HTMLInputElement).value),
      }),
      $.p(text.map((t) => `You typed: ${t}`)),
    ]);
  }),
);
```

### Teleport / Portal

```vue
<!-- Vue -->
<template>
  <Teleport to="body">
    <div class="modal">Modal content</div>
  </Teleport>
</template>
```

```ts
// Effex
const Modal = component("Modal", () =>
  Portal(
    { target: document.body },
    $.div({ class: "modal" }, "Modal content"),
  ),
);
```

## Key Mindset Shifts

1. **No template syntax** - Everything is TypeScript. `v-if` becomes `when()`, `v-for` becomes `each()`, `@click` becomes `onClick`.

2. **Explicit dependencies** - Vue's reactivity auto-tracks. Effex's `Derived.sync` requires explicit dependency arrays (but they're type-checked).

3. **Errors are values** - Instead of `errorCaptured` hooks, errors flow through the type system. Handle them explicitly with `ErrorBoundary`.

4. **Effects are explicit** - Side effects aren't hidden in `watchEffect`. They're Effect values that you compose and run explicitly.

5. **No SFC magic** - No `<script setup>`, no `defineProps`, no compiler macros. Just TypeScript functions.

6. **Cleanup is automatic** - Effect's scope system handles resource cleanup. No more forgotten cleanup in `onUnmounted`.

## Custom Equality

In Vue, `watch` and `computed` use reference equality by default. You can pass `{ deep: true }` for deep comparison, but there's no custom equality.

In Effex, equality is a first-class option on every reactive primitive:

```ts
// Only trigger updates when the user ID changes, ignoring lastSeen timestamps
const currentUser = yield* Signal.make<User>(
  { id: 1, name: "Alice", lastSeen: new Date() },
  { equals: (a, b) => a.id === b.id },
);
```

This gives you fine-grained control over when the UI updates, which is particularly useful for:

- Objects with irrelevant fields (timestamps, metadata)
- Expensive computations that shouldn't re-run on semantically equal inputs
- Normalized data where you want to compare by ID rather than reference
