---
title: "Utilities"
description: "Portal, FocusTrap, ScrollLock, UniqueId, and other DOM utilities."
order: 6
---

# Utilities

Stax includes several DOM utilities for common UI patterns: rendering into portals, trapping focus in modals, locking scroll, and generating unique IDs.

## Portal

Render children into a different DOM node, outside the current component tree. Useful for modals, tooltips, and dropdowns that need to escape `overflow: hidden` or `z-index` stacking contexts:

```typescript
import { Portal } from "@stax-ui/dom";

// Render into document.body (default)
Portal(() => Modal({ title: "Hello" }));

// Render into a specific element by selector
Portal({ target: "#modal-root" }, () => Dropdown());

// Render into a specific element by reference
Portal({ target: existingElement }, () => Tooltip());
```

The portaled content participates in the same Effect scope as the parent — context, signals, and cleanup all work as expected.

## FocusTrap

Trap keyboard focus within a container. When the user presses Tab at the last focusable element, focus wraps to the first one. Essential for accessible modals and dialogs:

```typescript
import { FocusTrap } from "@stax-ui/dom";

yield* FocusTrap.make({
  container: dialogElement,
  initialFocus: firstInput,      // Optional: focus this element on activation
  returnFocus: triggerElement,   // Optional: return focus here when released
});
// Focus is trapped until the scope closes
```

When the scope finalizes (e.g., the modal unmounts), the focus trap is released and focus returns to `returnFocus` if specified.

## ScrollLock

Prevent body scrolling while a modal or overlay is open. Handles scrollbar width compensation to prevent layout shift:

```typescript
import { ScrollLock } from "@stax-ui/dom";

yield* ScrollLock.lock;
// Body scroll is locked until the scope closes
```

When locked, the body gets `overflow: hidden` and a padding-right equal to the scrollbar width, so the page doesn't shift when the scrollbar disappears.

## UniqueId

Generate unique IDs for linking related elements — labels to inputs, ARIA attributes, etc.:

```typescript
import { UniqueId } from "@stax-ui/dom";

const labelId = yield* UniqueId.make("label");
const inputId = yield* UniqueId.make("input");

yield* $.div({},
  $.label({ id: labelId, htmlFor: inputId }, "Name"),
  $.input({ id: inputId, "aria-labelledby": labelId }),
);
```

IDs are unique within the application and include the optional prefix for readability in the DOM inspector.

## Ref

Create a reference to a DOM element for later imperative access:

```typescript
import { ref } from "@stax-ui/dom";

const inputRef = yield* ref<HTMLInputElement>();

// Pass to an element
yield* $.input({ ref: inputRef, type: "text" });

// Use later — waits until the element is mounted
yield* inputRef.pipe(Element.focus);

// Check connection status reactively
inputRef.isConnected;  // Readable<boolean>
```

`ref` is built on `Ref` from `@stax-ui/core` — it's a deferred value that resolves when the element mounts. Accessing `inputRef.pipe(...)` before the element exists will wait until it's available.
