import { Context, Effect, Schema } from "effect";
import {
  $,
  Signal,
  Derived,
  Form,
  component,
  mount,
  runApp,
  when,
  each,
  match,
  Suspense,
  Route,
  Router,
  Link,
  makeTypedRouterLayer,
  t,
  stagger,
  type RouterInfer,
} from "../index.js";
import "./style.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    const doubled = yield* Derived.sync([count], ([n]) => n * 2);

    return yield* $.div({ class: "card" }, [
      $.p(count.map((c) => `Count: ${c}`)),
      $.p(doubled.map((d) => `Doubled: ${d}`)),
      $.div({ class: "button-group" }, [
        $.button(
          {
            onClick: () => count.update((n) => n - 1),
          },
          "-",
        ),
        $.button({ onClick: () => count.update((n) => n + 1) }, "+"),
      ]),
    ]);
  }),
);

// Schema for the new todo form
const NewTodoSchema = Schema.Struct({
  text: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Todo text is required" }),
  ),
});

const TodoApp = component("TodoApp", () =>
  Effect.gen(function* () {
    const todos = yield* Signal.make<Todo[]>([
      { id: 1, text: "Learn Effect.ts", completed: true },
      { id: 2, text: "Build Effect UI", completed: false },
      { id: 3, text: "Write tests", completed: false },
    ]);
    let nextId = 4;

    // Create a form for adding new todos
    const form = yield* Form.make({
      schema: NewTodoSchema,
      initial: { text: "" },
    });

    const stats = yield* Derived.sync([todos], ([items]) => ({
      total: items.length,
      completed: items.filter((t) => t.completed).length,
      remaining: items.filter((t) => !t.completed).length,
    }));

    const addTodo = () =>
      form.submit((values) =>
        Effect.gen(function* () {
          yield* todos.update((items) => [
            ...items,
            { id: nextId++, text: values.text.trim(), completed: false },
          ]);
          yield* form.reset();
        }),
      );

    const toggleTodo = (id: number) =>
      todos.update((items) =>
        items.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );

    const removeTodo = (id: number) =>
      todos.update((items) => items.filter((t) => t.id !== id));

    return yield* $.div({ class: "todo-app" }, [
      $.h1("Todo List"),
      $.div({ class: "todo-input" }, [
        $.input({
          type: "text",
          placeholder: "What needs to be done?",
          value: form.fields.text.value,
          onInput: (e) =>
            form.fields.text.value.set((e.target as HTMLInputElement).value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              return addTodo();
            }
          },
        }),
        $.button({ onClick: () => addTodo() }, "Add"),
      ]),
      // Show validation errors
      when(
        form.fields.text.errors.map((errs) => errs.length > 0),
        () =>
          $.div(
            { class: "error-message" },
            form.fields.text.errors.map((errs) => errs[0] ?? ""),
          ),
        () => $.span(),
      ),
      $.ul({ class: "todo-list" }, [
        each(
          todos,
          (todo) => String(todo.id),
          (todoReadable) =>
            Effect.gen(function* () {
              const todo = yield* todoReadable.get;
              return yield* $.li(
                {
                  class: todoReadable.map((t) =>
                    t.completed ? "todo-item completed" : "todo-item",
                  ),
                },
                [
                  $.span(
                    {
                      onClick: () => toggleTodo(todo.id),
                      class: "todo-text",
                    },
                    todoReadable.map((t) => t.text),
                  ),
                  $.button(
                    {
                      onClick: () => removeTodo(todo.id),
                      class: "delete-btn",
                    },
                    "×",
                  ),
                ],
              );
            }),
          {
            animate: {
              enter: "slide-in",
              exit: "slide-out",
              stagger: stagger(50),
            },
          },
        ),
      ]),
      $.div({ class: "todo-stats" }, [
        $.span(stats.map((s) => `Total: ${s.total}`)),
        $.span(stats.map((s) => ` | Completed: ${s.completed}`)),
        $.span(stats.map((s) => ` | Remaining: ${s.remaining}`)),
      ]),
      when(
        stats.map((s) => s.remaining === 0 && s.total > 0),
        () => $.p({ class: "success-message" }, "All done! 🎉"),
        () => $.span(),
        { animate: { enter: "scale-in", exit: "fade-out" } },
      ),
    ]);
  }),
);

// Define routes
const HomeRoute = Route.make("/");
const CounterRoute = Route.make("/counter");
const TodoRoute = Route.make("/todos");
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String }),
});

// Routes record for type inference
const routes = {
  home: HomeRoute,
  counter: CounterRoute,
  todos: TodoRoute,
  user: UserRoute,
};

// Infer the typed router type from routes, then create a typed context
type AppRouter = RouterInfer<typeof routes>;
class AppRouterContext extends Context.Tag("AppRouterContext")<
  AppRouterContext,
  AppRouter
>() {}

// Home page component - simple components can return elements directly
const HomePage = component("HomePage", () =>
  $.div({ class: "page" }, [
    $.h2("Welcome to Effect UI"),
    $.p("A reactive UI framework built on Effect.ts primitives."),
    $.ul([
      $.li("Fine-grained reactivity with Signals and Derived values"),
      $.li("Automatic resource cleanup via Effect scopes"),
      $.li("Full type safety with TypeScript"),
      $.li("Router with typed params via Effect Schema"),
    ]),
  ]),
);

// User profile page component
interface User {
  id: string;
  name: string;
  email: string;
}

const UserPage = component("UserPage", (props: { user: User }) =>
  $.div({ class: "page" }, [
    $.h2(t`User Profile: ${props.user.name}`),
    $.div({ class: "card" }, [
      $.p(t`ID: ${props.user.id}`),
      $.p(t`Name: ${props.user.name}`),
      $.p(t`Email: ${props.user.email}`),
    ]),
  ]),
);

// Simulate fetching user data from an API
const fetchUser = (id: string): Effect.Effect<User, Error> =>
  Effect.gen(function* () {
    // Simulate network delay
    yield* Effect.sleep("500 millis");
    // Return mock user data
    return {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
    };
  });

// Not found page
const NotFoundPage = component("NotFoundPage", () =>
  $.div({ class: "page not-found" }, [
    $.h2("404 - Not Found"),
    $.p("The page you're looking for doesn't exist."),
  ]),
);

// App component - gets the fully typed router from AppRouterContext
const App = component("App", () =>
  Effect.gen(function* () {
    // Get the typed router from context - has full typing for currentRoute and params
    const router = yield* AppRouterContext;

    return yield* $.div({ class: "app" }, [
      $.h1("Effect UI Demo"),

      // Navigation using Link component (uses RouterContext internally for push/replace)
      $.nav({ class: "nav" }, [
        Link({ href: "/", class: "nav-link" }, "Home"),
        Link({ href: "/counter", class: "nav-link" }, "Counter"),
        Link({ href: "/todos", class: "nav-link" }, "Todos"),
        Link({ href: "/users/123", class: "nav-link" }, "User 123"),
        Link({ href: "/users/456", class: "nav-link" }, "User 456"),
      ]),

      // Current route indicator
      $.div(
        { class: "route-info" },
        router.pathname.map((p) => `Current path: ${p}`),
      ),

      // Route content using match - router.currentRoute is typed as "home" | "counter" | "todos" | "user" | null
      $.div({ class: "content" }, [
        match(
          router.currentRoute,
          [
            {
              pattern: "home" as const,
              render: () => HomePage(),
            },
            {
              pattern: "counter" as const,
              render: () =>
                $.div({ class: "page" }, [$.h2("Counter"), Counter()]),
            },
            {
              pattern: "todos" as const,
              render: () =>
                $.div({ class: "page" }, [$.h2("Todo App"), TodoApp()]),
            },
            {
              pattern: "user" as const,
              render: () =>
                Suspense({
                  render: () =>
                    Effect.gen(function* () {
                      // router.routes.user.params is typed as Readable<{ id: string } | null>
                      const params = yield* router.routes.user.params.get;
                      if (
                        params &&
                        typeof params === "object" &&
                        "id" in params
                      ) {
                        const user = yield* fetchUser(
                          (params as { id: string }).id,
                        );
                        return yield* UserPage({ user });
                      }
                      return yield* Effect.fail(new Error("No user ID"));
                    }),
                  fallback: () =>
                    $.div({ class: "loading" }, "Loading user..."),
                  catch: (error) =>
                    $.div({ class: "error" }, `Error: ${String(error)}`),
                  delay: "200 millis",
                }),
            },
          ],
          () => NotFoundPage(),
          { animate: { enter: "fade-in", exit: "fade-out" } },
        ),
      ]),
    ]);
  }),
);

const appElement = document.getElementById("app")!;

// Run the app - handles scoping, SignalRegistry, and keeping alive
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);
    const routerLayer = makeTypedRouterLayer(router, AppRouterContext);
    yield* mount(App().pipe(Effect.provide(routerLayer)), appElement);
  }),
);
