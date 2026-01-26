import { Array, Context, Effect, Option, Scope, Stream } from "effect";

import { Readable, type RendererInterface } from "@effex/core";

import type {
  ChildEffect,
  ClassItem,
  ClassValue,
  Element,
  EventHandler,
  StyleValue,
} from "./types";

export const isElement = (
  value: unknown,
): value is Element<HTMLElement | SVGElement, unknown, unknown> =>
  Effect.isEffect(value);

export const flattenChildren = <E = never, R = never>(
  children: ChildEffect<E, R>,
) =>
  children.pipe(
    Effect.map((elements) => (Array.isArray(elements) ? elements : [elements])),
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
