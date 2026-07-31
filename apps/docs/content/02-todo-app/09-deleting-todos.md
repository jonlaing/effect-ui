---
title: "Chapter 9: Deleting Todos"
description: "Add delete buttons to remove individual todos"
order: 9
---

# Chapter 9: Deleting Todos

Let's add a delete button to each todo so users can remove items one at a time.

## Adding the Delete Handler

First, create the delete function in `App`:

```typescript
const deleteTodo = (id: number) =>
  todos.update(items => items.filter(t => t.id !== id));
```

This filters out the todo with the matching ID, effectively removing it. The function returns an Effect.

## Updating TodoItem Props

Update `src/components/TodoItem.ts` to accept an `onDelete` callback:

```typescript
import { $, Readable } from "@effex/dom";
import { Effect } from "effect";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Readable<Todo>;
  onToggle: (id: number) => Effect.Effect<void>;
  onDelete: (id: number) => Effect.Effect<void>;
}

export const TodoItem = (props: TodoItemProps) =>
  Effect.gen(function* () {
    const { todo, onToggle, onDelete } = props;
    const todoId = yield* Readable.map(todo, t => t.id).get;

    return yield* $.li(
      {
        class: Readable.map(todo, t =>
          t.completed ? "todo-item completed" : "todo-item"
        ),
      },
      $.input({
        type: "checkbox",
        class: "toggle",
        checked: Readable.map(todo, t => t.completed),
        onChange: () => onToggle(todoId),
      }),
      $.span({ class: "todo-text" }, Readable.map(todo, t => t.text)),
      $.button(
        {
          class: "delete-btn",
          onClick: () => onDelete(todoId),
        },
        "×",
      ),
    );
  });
```

We added:
- `onDelete` prop
- A delete button with an × character

## Passing onDelete to TodoItem

Update the `each` in `main.ts`:

```typescript
each(filteredTodos, {
  key: (todo) => todo.id,
  render: (todo) => TodoItem({
    todo,
    onToggle: toggleTodo,
    onDelete: deleteTodo,
  }),
})
```

## Styling the Delete Button

Add styles to show the button on hover:

```css
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.delete-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #cc9a9a;
  font-size: 24px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #af5b5e;
}
```

The delete button is hidden by default and appears when hovering over the todo item.

## Try It Out

1. Hover over a todo item
2. Click the × button
3. The todo disappears instantly
4. The count updates automatically

## How It Works

The flow is simple:

1. User clicks delete button → `onDelete(todoId)` called
2. `deleteTodo` runs → `todos.update(items => items.filter(...))`
3. `todos` Signal updates with the item removed
4. `each` detects the change and removes the DOM element
5. All derived values (count, hasCompleted, etc.) update automatically

## Key Takeaways

1. **Delete** by filtering the item out of the array
2. **Pass handlers down** just like toggle
3. **CSS hover states** work great for revealing actions
4. The **DOM updates automatically** when items are removed
