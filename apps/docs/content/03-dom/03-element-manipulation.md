---
title: "Element Manipulation"
description: "Imperative DOM operations via the Element namespace — attributes, classes, styles, focus, and more."
order: 3
---

# Element Manipulation

The `Element` namespace provides pipeable functions for imperative DOM operations. While most of the time you'll set attributes declaratively when creating elements, these functions are useful for refs, post-mount operations, and dynamic manipulation.

## Getting a Reference

Use `ref` to create a reference you can manipulate later:

```typescript
import { ref, Element } from "@stax-ui/dom";

const buttonRef = yield* ref<HTMLButtonElement>();

// Pass to an element
yield* $.button({ ref: buttonRef }, "Click me");

// Manipulate later — waits until the element is mounted
yield* buttonRef.pipe(Element.focus);

// Check connection status
buttonRef.isConnected;  // Readable<boolean>
```

## Attributes

```typescript
yield* el.pipe(Element.setAttribute("aria-expanded", "true"));
yield* el.pipe(Element.removeAttribute("disabled"));
yield* el.pipe(Element.toggleAttribute("hidden"));
yield* el.pipe(Element.hasAttribute("disabled"));  // Effect<boolean>

// Reactive binding — attribute updates when Readable changes
yield* el.pipe(Element.bindAttribute("aria-label", labelReadable));
yield* el.pipe(Element.bindBooleanAttribute("disabled", isDisabled));
```

## Classes

```typescript
yield* el.pipe(Element.addClass("active", "highlighted"));
yield* el.pipe(Element.removeClass("loading"));
yield* el.pipe(Element.toggleClass("expanded"));
yield* el.pipe(Element.replaceClass("old-class", "new-class"));
yield* el.pipe(Element.setClass("entirely-new-class"));

// Reactive binding
yield* el.pipe(Element.bindClass(classNameReadable));
```

## Styles

```typescript
yield* el.pipe(Element.setStyle("backgroundColor", "red"));
yield* el.pipe(Element.setStyles({ opacity: "1", fontSize: "16px" }));
yield* el.pipe(Element.removeStyle("color"));

// Reactive binding
yield* el.pipe(Element.bindStyle("color", colorReadable));
```

## Data Attributes

```typescript
yield* el.pipe(Element.setData("state", "open"));    // data-state="open"
yield* el.pipe(Element.removeData("state"));
yield* el.pipe(Element.getData("state"));             // Effect<string, DataAttributeNotFound>

// Reactive binding
yield* el.pipe(Element.bindData("state", stateReadable));
```

## Content

```typescript
yield* el.pipe(Element.setTextContent("Hello"));
yield* el.pipe(Element.setInnerHTML("<em>bold</em>"));
yield* el.pipe(Element.setInputValue("new value"));  // Without cursor reset

// Reactive bindings
yield* el.pipe(Element.bindTextContent(textReadable));
yield* el.pipe(Element.bindInputValue(valueReadable));
```

## Focus & Interaction

```typescript
yield* el.pipe(Element.focus);
yield* el.pipe(Element.blur);
yield* el.pipe(Element.click);
yield* el.pipe(Element.focusFirst("[data-item]"));  // First matching descendant
yield* el.pipe(Element.focusLast("[data-item]"));

yield* el.pipe(Element.getBoundingClientRect);  // Effect<DOMRect>
yield* el.pipe(Element.getId);                   // Effect<string>
yield* el.pipe(Element.contains(childNode));     // Effect<boolean>
```

## Event Listeners

For adding listeners imperatively (usually you'd use `onClick` etc. on the element instead):

```typescript
yield* el.pipe(Element.on("click", (e) => handleClick(e)));
yield* el.pipe(Element.once("transitionend", (e) => afterTransition()));
```

## Debugging

```typescript
yield* el.pipe(Element.tap((node) => console.log(node)));
yield* el.pipe(Element.tapEffect((node) => Effect.log("mounted")));
```
