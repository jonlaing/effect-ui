# Coming from Svelte

A guide for Svelte developers learning Effex. This covers the key differences, concept mapping, and side-by-side examples to help you transition.

This guide covers both Svelte 4 (reactive statements, stores) and Svelte 5 (runes).

## Why Switch?

If you're already using [Effect](https://effect.website/) in your application, Effex lets you use the same patterns and mental model across your entire stack. No more context-switching between Svelte's compiler magic and Effect's compositional approach.

### Typed Error Handling

In Svelte, component errors are runtime surprises. There's no built-in error boundary mechanism, and you typically rely on try/catch in event handlers or global error handling.

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

### No Compiler Magic

Svelte's power comes from its compiler - `$:` reactive statements, automatic subscriptions to stores, and runes in Svelte 5. This is elegant but opaque:

```svelte
<!-- Svelte: Compiler transforms this -->
<script>
  let count = 0;        // Becomes reactive
  $: doubled = count * 2;  // Compiler creates derived value
</script>

<!-- Svelte 5 -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

Effex is explicit - what you write is what runs:

```ts
// Effex: No transformation
const count = yield* Signal.make(0);
const doubled = yield* Derived.sync([count], ([c]) => c * 2);
```

Benefits:
- Easier to debug (no compiled output to understand)
- Standard TypeScript tooling works perfectly
- No Svelte-specific IDE plugins needed
- Behavior is predictable and inspectable

### Similar Reactivity Model

Both Svelte and Effex use fine-grained reactivity (not virtual DOM diffing). The concepts map fairly directly:

| Svelte 5 Rune | Svelte 4          | Effex                    |
| ------------- | ----------------- | ------------------------ |
| `$state()`    | `let x = ...`     | `Signal.make()`          |
| `$derived()`  | `$: x = ...`      | `Derived.sync()`         |
| `$effect()`   | `$: { ... }`      | `Reaction`               |
| `$props()`    | `export let`      | Function parameters      |

### Better Async Story

Svelte's `{#await}` block is nice but separate from error handling. Effex unifies them:

```svelte
<!-- Svelte -->
{#await fetchUser(id)}
  <p>Loading...</p>
{:then user}
  <UserProfile {user} />
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

```ts
// Effex
Suspense({
  render: () =>
    Effect.gen(function* () {
      const user = yield* fetchUser(id);
      return yield* UserProfile({ user });
    }),
  fallback: () => $.div("Loading..."),
  catch: (error) => $.div(`Error: ${error.message}`),
  delay: "200 millis", // Avoid loading flash - Svelte can't do this
})
```

The `delay` option prevents flash of loading state for fast responses - something Svelte's `{#await}` can't do without manual work.

### Automatic Resource Cleanup

Svelte's `onDestroy` requires manual cleanup registration. Effex uses Effect's scope system:

```svelte
<!-- Svelte -->
<script>
  import { onDestroy } from 'svelte';

  const subscription = eventSource.subscribe(handler);
  onDestroy(() => subscription.unsubscribe());
</script>
```

```ts
// Effex: Automatic cleanup via scope
yield* eventSource.pipe(
  Stream.runForEach(handler),
  Effect.forkIn(scope), // Cleaned up when scope closes
)
```

## Concept Mapping

| Svelte 5                   | Svelte 4                   | Effex                              | Notes                     |
| -------------------------- | -------------------------- | ---------------------------------- | ------------------------- |
| `$state(initial)`          | `let x = initial`          | `Signal.make(initial)`             | Must `yield*` to create   |
| `$derived(expr)`           | `$: x = expr`              | `Derived.sync([deps], fn)`         | Explicit dependencies     |
| `$effect(() => {})`        | `$: { statement }`         | `Reaction`                         | Automatic cleanup         |
| `$props()`                 | `export let prop`          | Function parameters                | Plain TypeScript          |
| `$bindable()`              | `bind:value`               | Signal + event handler             | Explicit two-way binding  |
| `getContext/setContext`    | `getContext/setContext`    | `yield* ServiceTag`                | Effect services           |
| `bind:this`                | `bind:this`                | `Ref.make()`                       | For DOM refs              |
| `{#if} {:else}`            | `{#if} {:else}`            | `when(cond, truthy, falsy)`        | Always two branches       |
| `{#each}`                  | `{#each}`                  | `each(arr, keyFn, renderFn)`       | Key function required     |
| `{#await}`                 | `{#await}`                 | `Suspense({ render, fallback })`   | With typed `catch`        |
| `on:click`                 | `on:click`                 | `onClick`                          | Camel case handlers       |
| `class:active={isActive}`  | `class:active={isActive}`  | `class` prop with Readable         | Different syntax          |
| `<svelte:component>`       | `<svelte:component>`       | Dynamic function call              | Just call the component   |
| `.svelte` files            | `.svelte` files            | Plain `.ts` files                  | No special file format    |
| Stores (`writable`, etc.)  | Stores                     | `Signal`                           | Similar concept           |

## Side-by-Side Examples

### State and Updates

```svelte
<!-- Svelte 5 -->
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>

<!-- Svelte 4 -->
<script>
  let count = 0;
</script>

<button on:click={() => count++}>{count}</button>
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

### Derived State

```svelte
<!-- Svelte 5 -->
<script>
  let items = $state([]);
  let total = $derived(items.reduce((sum, i) => sum + i.price, 0));
</script>

<div>Total: ${total}</div>

<!-- Svelte 4 -->
<script>
  let items = [];
  $: total = items.reduce((sum, i) => sum + i.price, 0);
</script>

<div>Total: ${total}</div>
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

```svelte
<!-- Svelte -->
<script>
  let isLoggedIn = $state(false);
</script>

{#if isLoggedIn}
  <Dashboard />
{:else}
  <Login />
{/if}
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

```svelte
<!-- Svelte -->
<script>
  let todos = $state([]);
</script>

<ul>
  {#each todos as todo (todo.id)}
    <li>{todo.text}</li>
  {/each}
</ul>
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

### Effects / Reactions

```svelte
<!-- Svelte 5 -->
<script>
  let searchQuery = $state('');

  $effect(() => {
    // Runs when searchQuery changes
    const results = await search(searchQuery);
    // update results...
  });
</script>

<!-- Svelte 4 -->
<script>
  let searchQuery = '';

  $: {
    // Reactive statement
    search(searchQuery).then(results => {
      // update results...
    });
  }
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

### Context (Services)

```svelte
<!-- Svelte Parent -->
<script>
  import { setContext } from 'svelte';
  setContext('theme', 'dark');
</script>

<!-- Svelte Child -->
<script>
  import { getContext } from 'svelte';
  const theme = getContext('theme');
</script>

<div class={theme}>...</div>
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

### Two-Way Binding

```svelte
<!-- Svelte -->
<script>
  let text = $state('');
</script>

<input bind:value={text} />
<p>You typed: {text}</p>
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

### Stores (Svelte 4)

```svelte
<!-- Svelte 4 with stores -->
<script>
  import { writable, derived } from 'svelte/store';

  const count = writable(0);
  const doubled = derived(count, $count => $count * 2);
</script>

<button on:click={() => $count++}>{$count}</button>
<p>Doubled: {$doubled}</p>
```

```ts
// Effex
const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    const doubled = yield* Derived.sync([count], ([c]) => c * 2);

    return yield* $.div([
      $.button({ onClick: () => count.update((c) => c + 1) }, count),
      $.p(doubled.map((d) => `Doubled: ${d}`)),
    ]);
  }),
);
```

### Slots / Children

```svelte
<!-- Svelte -->
<Card>
  <h1 slot="header">Title</h1>
  <p>Card content</p>
</Card>

<!-- Card.svelte -->
<div class="card">
  <slot name="header" />
  <slot />
</div>
```

```ts
// Effex
interface CardProps {
  header?: Element;
  children: Element;
}

const Card = component("Card", (props: CardProps) =>
  $.div({ class: "card" }, [
    props.header ?? $.span(), // Named "slot"
    props.children,           // Default children
  ]),
);

// Usage
Card({
  header: $.h1("Title"),
  children: $.p("Card content"),
})
```

### Async / Await Blocks

```svelte
<!-- Svelte -->
{#await fetchUser(id)}
  <p>Loading...</p>
{:then user}
  <UserProfile {user} />
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

```ts
// Effex
Suspense({
  render: () =>
    Effect.gen(function* () {
      const user = yield* fetchUser(id);
      return yield* UserProfile({ user });
    }),
  fallback: () => $.p("Loading..."),
  catch: (e) => $.p(`Error: ${e}`),
})
```

## Key Mindset Shifts

1. **No compiler magic** - Svelte's `$:`, `$state`, `$derived` are compiler transforms. Effex is plain TypeScript - what you write is what runs.

2. **Explicit dependencies** - Svelte auto-tracks dependencies through compilation. Effex's `Derived.sync` requires explicit dependency arrays (but they're type-checked).

3. **No special file format** - No `.svelte` files with `<script>`, `<style>`, and template sections. Just TypeScript.

4. **Errors are values** - Instead of try/catch everywhere, errors flow through the type system. Handle them explicitly with `ErrorBoundary`.

5. **No bind: directive** - Two-way binding is explicit with a value prop and event handler. More verbose but clearer data flow.

6. **Cleanup is automatic** - Effect's scope system handles resource cleanup. No need to remember `onDestroy`.

7. **Function calls, not templates** - `{#if}` becomes `when()`, `{#each}` becomes `each()`. It's all TypeScript.

## Custom Equality

In Svelte, reactivity is based on assignment. For objects, you often need to reassign to trigger updates, and there's no way to customize equality checking.

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

## Transitions and Animations

Svelte has built-in transition directives. Effex uses CSS-first animations:

```svelte
<!-- Svelte -->
<script>
  import { fade, slide } from 'svelte/transition';
</script>

{#if visible}
  <div transition:fade>Fading content</div>
{/if}
```

```ts
// Effex
when(
  visible,
  () => $.div("Fading content"),
  () => $.span(),
  {
    animate: {
      enter: "fade-in",   // CSS class
      exit: "fade-out",   // CSS class
    },
  },
)
```

Effex's approach:
- Uses standard CSS animations (better performance, GPU-accelerated)
- Works with any CSS framework (Tailwind, etc.)
- Supports staggered list animations
- Respects `prefers-reduced-motion` by default
