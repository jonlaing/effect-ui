---
title: "Animation"
description: "CSS-based enter/exit animations for control flow transitions, with stagger functions for lists."
order: 4
---

# Animation

Effex uses CSS-based animations for enter/exit transitions. Animations are configured on control flow primitives — `when`, `match`, `each` — so they happen automatically when the reactive state changes.

## Enter/Exit Animations

Add an `animate` option to any control flow primitive:

```typescript
import { when } from "@effex/dom";

when(isOpen, {
  onTrue: () => Modal(),
  onFalse: () => $.span(),
  animate: {
    enterFrom: "opacity-0 scale-95",
    enterTo: "opacity-100 scale-100",
    exit: "fade-out",
  },
});
```

When `isOpen` becomes `true`, the entering element starts with the `enterFrom` classes, then transitions to `enterTo`. When it becomes `false`, the `exit` classes are applied and the element is removed after the animation completes.

### Animation Options

| Option | Description |
|--------|-------------|
| `enter` | Classes applied during the entire enter transition |
| `enterFrom` | Classes applied on the first frame, removed on the next |
| `enterTo` | Classes applied after `enterFrom` is removed |
| `exit` | Classes applied during the entire exit transition |
| `exitTo` | Classes applied after `exit`, element removed when transition ends |

This follows the same model as Vue and Alpine.js transitions — you define CSS classes, and Effex manages the timing.

## List Animations

Animate items entering and leaving a list:

```typescript
import { each, stagger } from "@effex/dom";

each(items, {
  key: (item) => item.id,
  render: (item) => ListItem(item),
  animate: {
    enter: "slide-in",
    exit: "slide-out",
    stagger: stagger(50),  // 50ms between items
  },
});
```

When items are added, each one's enter animation starts 50ms after the previous one. When items are removed, the exit animation plays before the DOM node is removed.

## Stagger Functions

Stagger functions control the timing between animated items in a list:

```typescript
import {
  stagger,
  staggerFromCenter,
  staggerEased,
  delay,
  sequence,
  parallel,
} from "@effex/dom";
```

| Function | Description |
|----------|-------------|
| `stagger(delayMs)` | Fixed delay between items — item 0 starts immediately, item 1 at 50ms, item 2 at 100ms, etc. |
| `staggerFromCenter(delayMs)` | Items animate outward from the center of the list |
| `staggerEased(totalDurationMs, easingFn)` | Distribute items across a total duration using an easing curve |
| `delay(delayMs)` | Same fixed delay for all items |
| `sequence(...delays)` | Explicit delay for each item position |
| `parallel()` | All items animate simultaneously (no stagger) |

### Example: Center-Out Stagger

```typescript
each(menuItems, {
  key: (item) => item.id,
  render: (item) => MenuItem(item),
  animate: {
    enter: "scale-in",
    stagger: staggerFromCenter(30),
  },
});
```

Items in the middle of the list animate first, then the animation ripples outward to both ends.

## CSS Setup

Effex applies classes but doesn't include any CSS. Define your transitions in your stylesheet:

```css
/* Fade in */
.fade-in {
  transition: opacity 150ms ease-in;
}

/* Slide in from below */
.slide-in {
  animation: slideIn 200ms ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade out */
.fade-out {
  transition: opacity 150ms ease-out;
  opacity: 0;
}
```

With Tailwind CSS, you can use utility classes directly:

```typescript
animate: {
  enterFrom: "opacity-0 translate-y-2",
  enter: "transition-all duration-150",
  enterTo: "opacity-100 translate-y-0",
  exit: "transition-all duration-150",
  exitTo: "opacity-0",
}
```
