import { Array, Effect, Scope, Stream } from "effect";
import type { Readable } from "../Readable.js";
import type { Child, Element, EventHandler, StyleValue } from "./types.js";

export const isReadable = (value: unknown): value is Readable<unknown> =>
  value !== null &&
  typeof value === "object" &&
  "get" in value &&
  "changes" in value &&
  "values" in value;

export const isElement = (value: unknown): value is Element =>
  Effect.isEffect(value);

export const flattenChildren = (children: readonly Child[]): Child[] =>
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

    // Then subscribe to future changes
    const scope = yield* Effect.scope;
    yield* readable.changes.pipe(
      Stream.runForEach((value) => Effect.sync(() => onValue(value))),
      Effect.forkIn(scope),
    );
  });

export const applyClassName = (
  element: HTMLElement,
  value: string | Readable<string>,
): Effect.Effect<void, never, Scope.Scope> => {
  if (isReadable(value)) {
    return subscribeToReadable(value, (v) => {
      element.className = v;
    });
  }
  element.className = value;
  return Effect.void;
};

export const applyStyle = (
  element: HTMLElement,
  value: Record<string, StyleValue> | Readable<Record<string, string>>,
): Effect.Effect<void, never, Scope.Scope> => {
  if (isReadable(value)) {
    return subscribeToReadable(value, (styles) => {
      for (const [prop, val] of Object.entries(styles)) {
        element.style.setProperty(prop, val);
      }
    });
  }
  return Effect.forEach(
    Object.entries(value),
    ([prop, styleVal]) => {
      if (isReadable(styleVal)) {
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
  if (isReadable(value)) {
    return subscribeToReadable(value as Readable<unknown>, (v) => {
      setBooleanOrStringAttribute(element, key, v);
    });
  }
  setBooleanOrStringAttribute(element, key, value);
  return Effect.void;
};
