# Coming from React

A guide for React developers learning Effex. This covers the key differences, concept mapping, and side-by-side examples to help you transition.

## Why Switch?

If you're already using [Effect](https://effect.website/) in your application, Effex lets you use the same patterns and mental model across your entire stack. No more context-switching between React's hooks model and Effect's compositional approach.

### Typed Error Handling

In React, component errors are runtime surprises. You catch them with error boundaries, but there's no compile-time visibility into what can fail.

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

### Fine-Grained Reactivity (No Virtual DOM)

React re-renders entire component subtrees when state changes, then diffs a virtual DOM to find what actually changed. This works, but it's wasteful.

Effex uses signals. When a signal updates, only the DOM nodes that actually depend on that signal update. No diffing, no wasted renders:

```ts
// React: Changing count re-renders the entire component
function Counter() {
  const [count, setCount] = useState(0)
  console.log("render")  // Logs on every click
  return <div>{count}</div>
}

// Effex: Only the text node updates
const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0)
    console.log("render")  // Logs once, on mount
    return yield* $.div(count)  // count changes update only this text
  })
)
```

### No Rules of Hooks

React hooks have rules you must memorize:

- Don't call hooks conditionally
- Exhaustive dependency arrays (with lint rules that don't always help)
- Stale closure bugs when you forget a dependency
- `useCallback` and `useMemo` everywhere for performance

Effex has none of this. Create signals wherever you want. Use them wherever you want. The reactivity system tracks dependencies automatically:

```ts
// React: Must memoize, manage deps, avoid stale closures
const [items, setItems] = useState([]);
const handleAdd = useCallback(() => {
  setItems((prev) => [...prev, newItem]); // Must use prev, not items!
}, []); // Stale closure if you use items directly

// Effex: Just write code
const items = yield* Signal.make([]);
const handleAdd = () => items.update((current) => [...current, newItem]); // Always fresh
```

### Automatic Resource Cleanup

React's `useEffect` cleanup is manual and easy to get wrong. Forget to clean up a subscription? Memory leak. Return a non-function? Runtime error.

Effex uses Effect's scope system. Resources are automatically cleaned up when components unmount:

```ts
// React: Manual cleanup, easy to forget
useEffect(() => {
  const subscription = eventSource.subscribe(handler);
  return () => subscription.unsubscribe(); // Don't forget!
}, []);

// Effex: Automatic cleanup via scope
yield* eventSource.pipe(
  Stream.runForEach(handler),
  Effect.forkIn(scope), // Cleaned up when scope closes
);
```

### No Re-render Cascades

In React, when a parent re-renders, all children re-render too (unless wrapped in `React.memo`). This leads to prop drilling `memo` everywhere or using context for everything.

In Effex, signal updates only notify actual subscribers. Parent "re-renders" don't exist:

```ts
// React: Parent re-render causes child re-render
function Parent() {
  const [count, setCount] = useState(0)  // Child re-renders too!
  return <Child />  // Unless wrapped in memo()
}

// Effex: Parent signal doesn't affect unrelated children
const Parent = component("Parent", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0)  // Child doesn't care
    return yield* $.div([Child()])  // Child never "re-renders"
  })
)
```

### Better Async

React's Suspense requires experimental features for data fetching, and error handling is separate from loading states. In Effex, it's unified:

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
});
```

## Concept Mapping

| React                          | Effex                                    | Notes                     |
| ------------------------------ | ---------------------------------------- | ------------------------- |
| `useState(initial)`            | `Signal.make(initial)`                   | Must `yield*` to create   |
| `useMemo(() => x, deps)`       | `Derived.sync([deps], () => x)`          | Deps are explicit signals |
| `useEffect(() => {...}, deps)` | `Reaction` or scope finalizers           | Automatic cleanup         |
| `useCallback(fn, deps)`        | Just use the function                    | No stale closures         |
| `useContext(Ctx)`              | `yield* ServiceTag`                      | Effect services           |
| `useRef(initial)`              | `Ref.make(initial)`                      | For DOM refs              |
| `<Component prop={x} />`       | `Component({ prop: x })`                 | Function calls            |
| `{cond && <El/>}`              | `when(cond, () => El(), () => $.span())` | Always two branches       |
| `{arr.map(x => <El key/>)}`    | `each(arr, keyFn, renderFn)`             | Key function, not prop    |
| `<ErrorBoundary>`              | `ErrorBoundary(try, catch)`              | Typed errors!             |
| `<Suspense>`                   | `Suspense({ render, fallback })`         | With typed `catch`        |
| Component re-render            | Doesn't exist                            | Only signals update DOM   |
| Virtual DOM diff               | Doesn't exist                            | Direct DOM updates        |
| `React.memo()`                 | Not needed                               | Fine-grained by default   |

## Side-by-Side Examples

### State and Updates

```tsx
// React
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

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

```tsx
// React
function Cart({ items }) {
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price, 0),
    [items],
  );
  return <div>Total: ${total}</div>;
}

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

```tsx
// React
function Auth({ isLoggedIn }) {
  return isLoggedIn ? <Dashboard /> : <Login />;
}

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

```tsx
// React
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

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

### Data Fetching

```tsx
// React (with Suspense + error boundary)
function UserProfile({ id }) {
  const user = use(fetchUser(id)); // Experimental
  return <div>{user.name}</div>;
}

// Wrapped in error boundary + suspense elsewhere...

// Effex (all-in-one)
const UserProfile = component("UserProfile", (props: { id: string }) =>
  Suspense({
    render: () =>
      Effect.gen(function* () {
        const user = yield* fetchUser(props.id);
        return yield* $.div(user.name);
      }),
    fallback: () => $.div("Loading..."),
    catch: (e) => $.div(`Error: ${e}`),
  }),
);
```

### Context / Services

```tsx
// React
const ThemeContext = createContext("light");
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}
function Page() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}

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

## Key Mindset Shifts

1. **Components don't re-render** - There's no render cycle. Signals update, and only their subscribers react.

2. **Errors are values** - Instead of try/catch around everything, errors flow through the type system. Handle them explicitly with `ErrorBoundary` or Effect combinators.

3. **Effects are explicit** - Side effects aren't hidden in `useEffect`. They're Effect values that you compose and run explicitly.

4. **No dependency arrays** - The reactive system tracks dependencies automatically. You never list them manually.

5. **Cleanup is automatic** - Effect's scope system handles resource cleanup. No more forgotten unsubscribes.

## Custom Equality

In React, `useMemo` and `useEffect` use dependency arrays with shallow comparison, and there's no built-in way to customize equality. You'd need external libraries or manual `useRef` tracking.

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
