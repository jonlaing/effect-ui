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
  Boundary.error(
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

Vue's `<Suspense>` is limited and doesn't integrate well with error handling. Effex has two approaches:

```ts
// Option 1: Boundary.suspense (one-shot)
Boundary.suspense({
  render: () =>
    Effect.gen(function* () {
      const user = yield* fetchUser(id); // Can fail!
      return yield* UserProfile({ user });
    }),
  fallback: () => $.div("Loading..."),
  catch: (error) => $.div(`Error: ${error.message}`), // Same place
  delay: "200 millis", // Avoid loading flash
})

// Option 2: Derived.async (reactive, refetches when deps change)
const userData = yield* Derived.async([userId], ([id]) => fetchUser(id));

// AsyncState has separate Readables for fine-grained reactivity
$.div([
  when(userData.isLoading, {
    onTrue: () => $.div("Loading..."),
    onFalse: () => $.span(),
  }),
  matchOption(userData.error, {
    onSome: (err) => $.div({ class: "error" }, err.map((e) => e.message)),
    onNone: () => $.span(),
  }),
  matchOption(userData.value, {
    onSome: (user) => UserProfile({ user }), // user is Readable<User>
    onNone: () => $.span(),
  }),
])
```

## Concept Mapping

| Vue (Composition API)      | Effex                                            | Notes                        |
| -------------------------- | ------------------------------------------------ | ---------------------------- |
| `ref(initial)`             | `Signal.make(initial)`                           | Must `yield*` to create      |
| `reactive(obj)`            | `Signal.make(obj)`                               | Same as ref for objects      |
| `computed(() => x)`        | `Derived.sync([deps], () => x)`                  | Deps are explicit signals    |
| `watch(source, cb)`        | `Reaction`                                       | Automatic cleanup            |
| `watchEffect(cb)`          | `Reaction` with immediate                        | Explicit dependencies        |
| `provide/inject`           | `yield* ServiceTag`                              | Effect services              |
| `ref` (template ref)       | `Ref.make()`                                     | For DOM refs                 |
| `v-if / v-else`            | `when(cond, { onTrue, onFalse })`                | Object config                |
| `v-if="x != null"`         | `matchOption(optX, { onSome, onNone })`          | Unwraps Option               |
| `v-show`                   | Signal-based class/style                         | No direct equivalent         |
| `v-for`                    | `each(arr, { key, render })`                     | Key function, not `:key`     |
| `@click` / `v-on`          | `onClick` / event props                          | Camel case handlers          |
| `:class` / `v-bind:class`  | `class` prop with Readable                       | Reactive by default          |
| `<Teleport>`               | `Portal()`                                       | Similar API                  |
| `<Suspense>`               | `Boundary.suspense` or `Derived.async`           | Multiple options             |
| `defineProps`              | Function parameters                              | Plain TypeScript             |
| `defineEmits`              | Callback props                                   | Plain functions              |
| SFC `.vue` files           | Plain `.ts` files                                | No special file format       |

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
const Counter = Component.gen(function* () {
  const count = yield* Signal.make(0);
  return yield* $.button(
    { onClick: () => count.update((c) => c + 1) },
    count,
  );
});
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
const Cart = Component.gen(function* (props: { items: Readable<Item[]> }) {
  const total = yield* Derived.sync([props.items], ([items]) =>
    items.reduce((sum, i) => sum + i.price, 0),
  );
  return yield* $.div(total.map((t) => `Total: $${t}`));
});
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
const Auth = (props: { isLoggedIn: Readable<boolean> }) =>
  when(props.isLoggedIn, {
    onTrue: () => Dashboard(),
    onFalse: () => Login(),
  });
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
const TodoList = (props: { todos: Readable<Todo[]> }) =>
  each(props.todos, {
    container: () => $.ul(),
    key: (todo) => todo.id,
    render: (todo) => $.li(todo.map((t) => t.text)),
  });
```

### Watchers / Reactions

```vue
<!-- Vue -->
<script setup>
import { ref, watch } from 'vue'

const title = ref('My App')
const unreadCount = ref(0)

watch([title, unreadCount], ([newTitle, count]) => {
  document.title = count > 0 ? `(${count}) ${newTitle}` : newTitle
})

watch(title, (newTitle) => {
  localStorage.setItem('lastTitle', newTitle)
})
</script>

<template>
  <h1>{{ title }}</h1>
</template>
```

```ts
// Effex
const DocumentTitle = Component.gen(function* (props: { title: Readable<string>; unreadCount: Readable<number> }) {
  // Runs whenever title or unreadCount changes
  yield* Reaction.make([props.title, props.unreadCount], ([title, count]) =>
    Effect.sync(() => {
      document.title = count > 0 ? `(${count}) ${title}` : title;
    }),
  );

  // Runs whenever title changes
  yield* Reaction.make([props.title], ([title]) =>
    Effect.sync(() => localStorage.setItem("lastTitle", title)),
  );

  return yield* $.h1(props.title);
});
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

const Page = Component.gen(function* () {
  const theme = yield* ThemeService;
  return yield* $.div({ class: theme }, "...");
});

// Provide at mount (like wrapping the root)
runApp(mount(Page().pipe(Effect.provideService(ThemeService, "dark")), root));

// Or provide inline with the provide helper
$.div(
  { class: "app" },
  provide(ThemeService, "dark", [
    Page(),
    AnotherComponent(),
  ]),
);
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
const TextInput = Component.gen(function* () {
  const text = yield* Signal.make("");
  return yield* $.div([
    $.input({
      value: text,
      onInput: (e) => text.set((e.target as HTMLInputElement).value),
    }),
    $.p(t`You typed: ${text}`),
  ]);
});
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
const Modal = () =>
  Portal(
    { target: document.body },
    $.div({ class: "modal" }, "Modal content"),
  );
```

## Key Mindset Shifts

1. **No template syntax** - Everything is TypeScript. `v-if` becomes `when()`, `v-for` becomes `each()`, `@click` becomes `onClick`.

2. **Explicit dependencies** - Vue's reactivity auto-tracks. Effex's `Derived.sync` requires explicit dependency arrays (but they're type-checked).

3. **Errors are values** - Instead of `errorCaptured` hooks, errors flow through the type system. Handle them explicitly with `Boundary.error`.

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

## Imperative DOM Access

In Vue, you use template refs to get DOM element references:

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)

const handleFocus = () => {
  inputRef.value?.focus()
  inputRef.value?.scrollIntoView({ behavior: 'smooth' })
  inputRef.value?.classList.add('focused')
}
</script>

<template>
  <input ref="inputRef" @click="handleFocus" />
</template>
```

In Effex, the `Element` namespace provides pipeable helpers for DOM manipulation:

```ts
// Effex
const FocusInput = Component.gen(function* () {
  const inputRef = yield* Element.ref<HTMLInputElement>();

  const handleFocus = () =>
    inputRef.pipe(
      Element.focus,
      Element.scrollIntoView({ behavior: "smooth" }),
      Element.addClass("focused"),
      Effect.runPromise,
    );

  return yield* $.input({ ref: inputRef, onClick: handleFocus });
});
```

### Common Vue DOM Patterns

| Vue Pattern | Effex Equivalent |
|-------------|------------------|
| `ref.value?.focus()` | `el.pipe(Element.focus)` |
| `ref.value?.blur()` | `el.pipe(Element.blur)` |
| `ref.value?.click()` | `el.pipe(Element.click)` |
| `ref.value?.scrollIntoView()` | `el.pipe(Element.scrollIntoView())` |
| `ref.value?.classList.add("x")` | `el.pipe(Element.addClass("x"))` |
| `ref.value?.classList.remove("x")` | `el.pipe(Element.removeClass("x"))` |
| `ref.value?.classList.toggle("x")` | `el.pipe(Element.toggleClass("x"))` |
| `ref.value?.setAttribute("k", "v")` | `el.pipe(Element.setAttribute("k", "v"))` |
| `ref.value?.dataset.state = "x"` | `el.pipe(Element.setData("state", "x"))` |
| `ref.value?.style.color = "red"` | `el.pipe(Element.setStyle("color", "red"))` |
| `ref.value?.querySelector(".x")` | `el.pipe(Element.querySelector(".x"))` |

### Animation Hooks

Effex's animation system passes elements to lifecycle hooks as `Effect<HTMLElement>`, letting you use Element helpers:

```ts
when(isModalOpen, {
  onTrue: () => Modal(),
  onFalse: () => $.span(),
  animate: {
    enter: "fade-in",
    exit: "fade-out",
    onEnter: (el) => el.pipe(Element.focusFirst("[data-autofocus]")),
    onBeforeExit: (el) => el.pipe(Element.blur),
  },
});
```

This is similar to Vue's `<Transition>` hooks but with pipeable operations instead of imperative code.
