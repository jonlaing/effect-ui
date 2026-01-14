import { Array, Context, Effect, Option, Scope, Stream } from "effect";

import { Readable, type RendererInterface } from "@effex/core";

import type {
  Child,
  ClassItem,
  ClassValue,
  Element,
  EventHandler,
  StyleValue,
} from "./types";

export const isElement = (value: unknown): value is Element<unknown, unknown> =>
  Effect.isEffect(value);

export const flattenChildren = <E, R>(
  children: readonly Child<E, R>[],
): Child<E, R>[] =>
  Array.flatMap(children, (child) =>
    globalThis.Array.isArray(child) ? flattenChildren(child) : [child],
  );

export const subscribeToReadable = <A>(
  readable: Readable<A>,
  onValue: (value: A) => void,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Get and apply initial value synchronously
    const initial = yield* readable.get;
    onValue(initial);

    // During SSR, we don't need to subscribe to changes - just use initial value
    // Check if we're in SSR by looking for SSRContext
    const ssrContext = yield* Effect.serviceOption(
      // Import SSRContext lazily to avoid circular dependency
      Context.GenericTag<{ isSSR: true }>("@effex/SSRContext"),
    );
    if (Option.isSome(ssrContext)) {
      // SSR mode - don't set up stream subscription
      return;
    }

    // Client-side: subscribe to future changes
    const scope = yield* Effect.scope;
    yield* readable.changes.pipe(
      Stream.runForEach((value) => Effect.sync(() => onValue(value))),
      Effect.forkIn(scope),
    );
  });

const classValueToString = (value: string | readonly string[]): string =>
  typeof value === "string" ? value : value.join(" ");

const hasReactiveItems = (items: readonly ClassItem[]): boolean =>
  items.some(Readable.isReadable);

// ============================================================
// Renderer-aware helper functions
// ============================================================

export const applyClassWithRenderer = (
  renderer: RendererInterface<Node>,
  element: Node,
  value: ClassValue,
): Effect.Effect<void, never, Scope.Scope> => {
  // Single reactive value (string or string[])
  if (Readable.isReadable(value)) {
    return subscribeToReadable(
      value as Readable<string | readonly string[]>,
      (v) => {
        Effect.runSync(renderer.setClassName(element, classValueToString(v)));
      },
    );
  }

  // Plain string
  if (typeof value === "string") {
    return renderer.setClassName(element, value);
  }

  // Array of class items - check if any are reactive
  if (!hasReactiveItems(value)) {
    // All static strings - just join them
    return renderer.setClassName(
      element,
      (value as readonly string[]).join(" "),
    );
  }

  // Mixed array with some reactive items - need to subscribe to each
  return Effect.gen(function* () {
    const currentValues: string[] = new globalThis.Array(value.length).fill("");

    const updateClassName = () => {
      Effect.runSync(
        renderer.setClassName(
          element,
          currentValues.filter((s) => s.length > 0).join(" "),
        ),
      );
    };

    yield* Effect.forEach(
      value,
      (item, index) => {
        if (Readable.isReadable(item)) {
          return subscribeToReadable(item as Readable<string>, (v) => {
            currentValues[index] = v;
            updateClassName();
          });
        }
        currentValues[index] = item as string;
        return Effect.void;
      },
      { discard: true },
    );

    updateClassName();
  });
};

export const applyStyleWithRenderer = (
  renderer: RendererInterface<Node>,
  element: Node,
  value: Record<string, StyleValue> | Readable<Record<string, string>>,
): Effect.Effect<void, never, Scope.Scope> => {
  if (Readable.isReadable(value)) {
    return subscribeToReadable(value, (styles) => {
      for (const [prop, val] of Object.entries(styles)) {
        Effect.runSync(renderer.setStyleProperty(element, prop, val));
      }
    });
  }
  return Effect.forEach(
    Object.entries(value),
    ([prop, styleVal]) => {
      if (Readable.isReadable(styleVal)) {
        return subscribeToReadable(
          styleVal as Readable<string | number>,
          (v) => {
            Effect.runSync(renderer.setStyleProperty(element, prop, String(v)));
          },
        );
      }
      return renderer.setStyleProperty(element, prop, String(styleVal));
    },
    { discard: true },
  );
};

export const applyEventHandlerWithRenderer = (
  renderer: RendererInterface<Node>,
  element: Node,
  key: string,
  handler: EventHandler<Event>,
): Effect.Effect<void> => {
  const eventName = key.slice(2).toLowerCase();
  return renderer.addEventListener(element, eventName, (event) => {
    const result = handler(event as Event);
    if (Effect.isEffect(result)) {
      Effect.runPromise(result as Effect.Effect<void>);
    }
  });
};

export const applyGenericAttributeWithRenderer = (
  renderer: RendererInterface<Node>,
  element: Node,
  key: string,
  value: unknown,
): Effect.Effect<void, never, Scope.Scope> => {
  if (Readable.isReadable(value)) {
    return subscribeToReadable(value as Readable<unknown>, (v) => {
      Effect.runSync(renderer.setAttribute(element, key, v));
    });
  }
  return renderer.setAttribute(element, key, value);
};

export const applyInputValueWithRenderer = (
  renderer: RendererInterface<Node>,
  element: Node,
  value: unknown,
): Effect.Effect<void, never, Scope.Scope> => {
  if (Readable.isReadable(value)) {
    return subscribeToReadable(value as Readable<unknown>, (v) => {
      Effect.runSync(renderer.setInputValue(element, String(v)));
    });
  }
  return renderer.setInputValue(element, String(value));
};

// ============================================================
// Legacy helper functions (for backwards compatibility with tests)
// These use direct DOM manipulation without a renderer
// ============================================================

export const applyClass = (
  element: HTMLElement,
  value: ClassValue,
): Effect.Effect<void, never, Scope.Scope> => {
  // Single reactive value (string or string[])
  if (Readable.isReadable(value)) {
    return subscribeToReadable(
      value as Readable<string | readonly string[]>,
      (v) => {
        element.className = classValueToString(v);
      },
    );
  }

  // Plain string
  if (typeof value === "string") {
    element.className = value;
    return Effect.void;
  }

  // Array of class items - check if any are reactive
  if (!hasReactiveItems(value)) {
    // All static strings - just join them
    element.className = (value as readonly string[]).join(" ");
    return Effect.void;
  }

  // Mixed array with some reactive items - need to subscribe to each
  return Effect.gen(function* () {
    const currentValues: string[] = new globalThis.Array(value.length).fill("");

    const updateClassName = () => {
      element.className = currentValues.filter((s) => s.length > 0).join(" ");
    };

    yield* Effect.forEach(
      value,
      (item, index) => {
        if (Readable.isReadable(item)) {
          return subscribeToReadable(item as Readable<string>, (v) => {
            currentValues[index] = v;
            updateClassName();
          });
        }
        currentValues[index] = item as string;
        return Effect.void;
      },
      { discard: true },
    );

    updateClassName();
  });
};

export const applyStyle = (
  element: HTMLElement,
  value: Record<string, StyleValue> | Readable<Record<string, string>>,
): Effect.Effect<void, never, Scope.Scope> => {
  if (Readable.isReadable(value)) {
    return subscribeToReadable(value, (styles) => {
      for (const [prop, val] of Object.entries(styles)) {
        element.style.setProperty(prop, val);
      }
    });
  }
  return Effect.forEach(
    Object.entries(value),
    ([prop, styleVal]) => {
      if (Readable.isReadable(styleVal)) {
        return subscribeToReadable(
          styleVal as Readable<string | number>,
          (v) => {
            element.style.setProperty(prop, String(v));
          },
        );
      }
      element.style.setProperty(prop, String(styleVal));
      return Effect.void;
    },
    { discard: true },
  );
};

export const applyEventHandler = (
  element: HTMLElement,
  key: string,
  handler: EventHandler<Event>,
): void => {
  const eventName = key.slice(2).toLowerCase();
  element.addEventListener(eventName, (event) => {
    const result = handler(event);
    if (Effect.isEffect(result)) {
      Effect.runPromise(result as Effect.Effect<void>);
    }
  });
};

export const setBooleanOrStringAttribute = (
  element: HTMLElement,
  key: string,
  value: unknown,
): void => {
  if (typeof value === "boolean") {
    if (value) {
      element.setAttribute(key, "");
    } else {
      element.removeAttribute(key);
    }
  } else {
    element.setAttribute(key, String(value));
  }
};

export const applyGenericAttribute = (
  element: HTMLElement,
  key: string,
  value: unknown,
): Effect.Effect<void, never, Scope.Scope> => {
  if (Readable.isReadable(value)) {
    return subscribeToReadable(value as Readable<unknown>, (v) => {
      setBooleanOrStringAttribute(element, key, v);
    });
  }
  setBooleanOrStringAttribute(element, key, value);
  return Effect.void;
};

export const applyInputValue = (
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: unknown,
): Effect.Effect<void, never, Scope.Scope> => {
  if (Readable.isReadable(value)) {
    return subscribeToReadable(value as Readable<unknown>, (v) => {
      const stringValue = String(v);
      // Only update if different - prevents cursor position reset
      if (element.value !== stringValue) {
        element.value = stringValue;
      }
    });
  }
  element.value = String(value);
  return Effect.void;
};
