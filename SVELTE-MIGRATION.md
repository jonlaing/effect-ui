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
  Boundary.error(
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

### Async Story

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
// Effex - Option 1: Boundary.suspense (one-shot)
Boundary.suspense({
  render: () =>
    Effect.gen(function* () {
      const user = yield* fetchUser(id);
      return yield* UserProfile({ user });
    }),
  fallback: () => $.div("Loading..."),
  catch: (error) => $.div(`Error: ${error.message}`),
  delay: "200 millis", // Avoid loading flash - Svelte can't do this
})

// Effex - Option 2: Derived.async (reactive, refetches when deps change)
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

The `delay` option on `Boundary.suspense` prevents flash of loading state for fast responses - something Svelte's `{#await}` can't do without manual work. `Derived.async` is better when you need the data to reactively refetch when dependencies change.

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

| Svelte 5                   | Svelte 4                   | Effex                                    | Notes                     |
| -------------------------- | -------------------------- | ---------------------------------------- | ------------------------- |
| `$state(initial)`          | `let x = initial`          | `Signal.make(initial)`                   | Must `yield*` to create   |
| `$derived(expr)`           | `$: x = expr`              | `Derived.sync([deps], fn)`               | Explicit dependencies     |
| `$effect(() => {})`        | `$: { statement }`         | `Reaction`                               | Automatic cleanup         |
| `$props()`                 | `export let prop`          | Function parameters                      | Plain TypeScript          |
| `$bindable()`              | `bind:value`               | Signal + event handler                   | Explicit two-way binding  |
| `getContext/setContext`    | `getContext/setContext`    | `yield* ServiceTag`                      | Effect services           |
| `bind:this`                | `bind:this`                | `Ref.make()`                             | For DOM refs              |
| `{#if} {:else}`            | `{#if} {:else}`            | `when(cond, { onTrue, onFalse })`        | Object config             |
| `{#if x != null}`          | `{#if x != null}`          | `matchOption(optX, { onSome, onNone })`  | Unwraps Option            |
| `{#each}`                  | `{#each}`                  | `each(arr, { key, render })`             | Key function required     |
| `{#await}`                 | `{#await}`                 | `Boundary.suspense` or `Derived.async`   | Multiple options          |
| `on:click`                 | `on:click`                 | `onClick`                                | Camel case handlers       |
| `class:active={isActive}`  | `class:active={isActive}`  | `class` prop with Readable               | Different syntax          |
| `<svelte:component>`       | `<svelte:component>`       | Dynamic function call                    | Just call the component   |
| `.svelte` files            | `.svelte` files            | Plain `.ts` files                        | No special file format    |
| Stores (`writable`, etc.)  | Stores                     | `Signal`                                 | Similar concept           |

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
const Counter = Component.gen(function* () {
  const count = yield* Signal.make(0);
  return yield* $.button(
    { onClick: () => count.update((c) => c + 1) },
    count,
  );
});
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
const Cart = Component.gen(function* (props: { items: Readable<Item[]> }) {
  const total = yield* Derived.sync([props.items], ([items]) =>
    items.reduce((sum, i) => sum + i.price, 0),
  );
  return yield* $.div(total.map((t) => `Total: $${t}`));
});
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
const Auth = (props: { isLoggedIn: Readable<boolean> }) =>
  when(props.isLoggedIn, {
    onTrue: () => Dashboard(),
    onFalse: () => Login(),
  });
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
const TodoList = (props: { todos: Readable<Todo[]> }) =>
  each(props.todos, {
    container: () => $.ul(),
    key: (todo) => todo.id,
    render: (todo) => $.li(todo.map((t) => t.text)),
  });
```

### Effects / Reactions

```svelte
<!-- Svelte 5 -->
<script>
  let title = $state('My App');
  let unreadCount = $state(0);

  $effect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) ${title}` : title;
  });

  $effect(() => {
    localStorage.setItem('lastTitle', title);
  });
</script>

<h1>{title}</h1>

<!-- Svelte 4 -->
<script>
  let title = 'My App';
  let unreadCount = 0;

  $: document.title = unreadCount > 0 ? `(${unreadCount}) ${title}` : title;
  $: localStorage.setItem('lastTitle', title);
</script>

<h1>{title}</h1>
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
const Counter = Component.gen(function* () {
  const count = yield* Signal.make(0);
  const doubled = yield* Derived.sync([count], ([c]) => c * 2);

  return yield* $.div([
    $.button({ onClick: () => count.update((c) => c + 1) }, count),
    $.p(t`Doubled: ${doubled}`),
  ]);
});
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

const Card = (props: CardProps) =>
  $.div({ class: "card" }, [
    props.header ?? $.span(), // Named "slot"
    props.children,           // Default children
  ]);

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
Boundary.suspense({
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

4. **Errors are values** - Instead of try/catch everywhere, errors flow through the type system. Handle them explicitly with `Boundary.error`.

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
when(visible, {
  onTrue: () => $.div("Fading content"),
  onFalse: () => $.span(),
  animate: {
    enter: "fade-in",   // CSS class
    exit: "fade-out",   // CSS class
  },
})
```

Effex's approach:
- Uses standard CSS animations (better performance, GPU-accelerated)
- Works with any CSS framework (Tailwind, etc.)
- Supports staggered list animations
- Respects `prefers-reduced-motion` by default

## Imperative DOM Access

In Svelte, you use `bind:this` to get DOM element references:

```svelte
<!-- Svelte -->
<script>
  let inputEl;

  function handleFocus() {
    inputEl?.focus();
    inputEl?.scrollIntoView({ behavior: 'smooth' });
    inputEl?.classList.add('focused');
  }
</script>

<input bind:this={inputEl} on:click={handleFocus} />
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

### Common Svelte DOM Patterns

| Svelte Pattern | Effex Equivalent |
|----------------|------------------|
| `el?.focus()` | `el.pipe(Element.focus)` |
| `el?.blur()` | `el.pipe(Element.blur)` |
| `el?.click()` | `el.pipe(Element.click)` |
| `el?.scrollIntoView()` | `el.pipe(Element.scrollIntoView())` |
| `el?.classList.add("x")` | `el.pipe(Element.addClass("x"))` |
| `el?.classList.remove("x")` | `el.pipe(Element.removeClass("x"))` |
| `el?.classList.toggle("x")` | `el.pipe(Element.toggleClass("x"))` |
| `el?.setAttribute("k", "v")` | `el.pipe(Element.setAttribute("k", "v"))` |
| `el?.dataset.state = "x"` | `el.pipe(Element.setData("state", "x"))` |
| `el?.style.color = "red"` | `el.pipe(Element.setStyle("color", "red"))` |
| `el?.querySelector(".x")` | `el.pipe(Element.querySelector(".x"))` |

### Animation Hooks with Element Helpers

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

This is similar to Svelte's `in:`, `out:` transition directive hooks but uses pipeable operations for composability.
