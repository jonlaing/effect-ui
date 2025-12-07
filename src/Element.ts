import { Effect, Scope, Stream } from "effect";
import type { Readable } from "./Readable.ts";

export type Element = Effect.Effect<HTMLElement, never, Scope.Scope>;

export type Child =
  | string
  | number
  | Element
  | Readable<string>
  | Readable<number>
  | readonly Child[];

export type EventHandler<E extends Event> = (
  event: E,
) => Effect.Effect<void> | void;

type StyleValue = string | number | Readable<string> | Readable<number>;

export interface BaseAttributes {
  readonly class?: string | Readable<string>;
  readonly style?:
    | Record<string, StyleValue>
    | Readable<Record<string, string>>;
  readonly id?: string;
}

export interface EventAttributes {
  readonly onClick?: EventHandler<MouseEvent>;
  readonly onInput?: EventHandler<InputEvent>;
  readonly onChange?: EventHandler<Event>;
  readonly onSubmit?: EventHandler<SubmitEvent>;
  readonly onKeyDown?: EventHandler<KeyboardEvent>;
  readonly onKeyUp?: EventHandler<KeyboardEvent>;
  readonly onFocus?: EventHandler<FocusEvent>;
  readonly onBlur?: EventHandler<FocusEvent>;
  readonly onMouseEnter?: EventHandler<MouseEvent>;
  readonly onMouseLeave?: EventHandler<MouseEvent>;
}

type HTMLAttributes<K extends keyof HTMLElementTagNameMap> = BaseAttributes &
  EventAttributes & {
    readonly [P in keyof HTMLElementTagNameMap[K]]?: HTMLElementTagNameMap[K][P] extends string
      ? string | Readable<string>
      : HTMLElementTagNameMap[K][P] extends number
        ? number | Readable<number>
        : HTMLElementTagNameMap[K][P] extends boolean
          ? boolean | Readable<boolean>
          : never;
  };

const isReadable = (value: unknown): value is Readable<unknown> =>
  value !== null &&
  typeof value === "object" &&
  "get" in value &&
  "changes" in value &&
  "values" in value;

const isElement = (value: unknown): value is Element => Effect.isEffect(value);

const flattenChildren = (children: readonly Child[]): Child[] => {
  const result: Child[] = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }
  return result;
};

const subscribeToReadable = <A>(
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

const applyAttributes = <K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  attrs: HTMLAttributes<K>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) continue;

      if (key === "class") {
        if (isReadable(value)) {
          yield* subscribeToReadable(value as Readable<string>, (v) => {
            element.className = v;
          });
        } else {
          element.className = value as string;
        }
      } else if (key === "style") {
        if (isReadable(value)) {
          yield* subscribeToReadable(
            value as Readable<Record<string, string>>,
            (styles) => {
              for (const [prop, val] of Object.entries(styles)) {
                element.style.setProperty(prop, val);
              }
            },
          );
        } else {
          const styles = value as Record<string, StyleValue>;
          for (const [prop, styleVal] of Object.entries(styles)) {
            if (isReadable(styleVal)) {
              yield* subscribeToReadable(
                styleVal as Readable<string | number>,
                (v) => {
                  element.style.setProperty(prop, String(v));
                },
              );
            } else {
              element.style.setProperty(prop, String(styleVal));
            }
          }
        }
      } else if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        const handler = value as EventHandler<Event>;
        element.addEventListener(eventName, (event) => {
          const result = handler(event);
          if (Effect.isEffect(result)) {
            Effect.runPromise(result as Effect.Effect<void>);
          }
        });
      } else if (key === "id") {
        element.id = value as string;
      } else {
        if (isReadable(value)) {
          yield* subscribeToReadable(value as Readable<unknown>, (v) => {
            if (typeof v === "boolean") {
              if (v) {
                element.setAttribute(key, "");
              } else {
                element.removeAttribute(key);
              }
            } else {
              element.setAttribute(key, String(v));
            }
          });
        } else {
          if (typeof value === "boolean") {
            if (value) {
              element.setAttribute(key, "");
            } else {
              element.removeAttribute(key);
            }
          } else {
            element.setAttribute(key, String(value));
          }
        }
      }
    }
  });

const appendChildren = (
  parent: HTMLElement,
  children: readonly Child[],
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const flattened = flattenChildren(children);

    for (const child of flattened) {
      if (typeof child === "string" || typeof child === "number") {
        parent.appendChild(document.createTextNode(String(child)));
      } else if (isElement(child)) {
        const childElement = yield* child;
        parent.appendChild(childElement);
      } else if (isReadable(child)) {
        const textNode = document.createTextNode("");
        parent.appendChild(textNode);
        yield* subscribeToReadable(
          child as Readable<string | number>,
          (value) => {
            textNode.textContent = String(value);
          },
        );
      }
    }
  });

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attrs: HTMLAttributes<K>,
  children: readonly Child[],
): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope> =>
  Effect.gen(function* () {
    const element = document.createElement(tagName);
    yield* applyAttributes(element, attrs);
    yield* appendChildren(element, children);
    return element;
  });

type ElementFactory<K extends keyof HTMLElementTagNameMap> = {
  (
    attrs: HTMLAttributes<K>,
    children: readonly Child[],
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (
    attrs: HTMLAttributes<K>,
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (
    children: readonly Child[],
  ): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (child: Child): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
  (): Effect.Effect<HTMLElementTagNameMap[K], never, Scope.Scope>;
};

const makeElementFactory = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): ElementFactory<K> => {
  return ((...args: unknown[]) => {
    if (args.length === 0) {
      return createElement(tagName, {} as HTMLAttributes<K>, []);
    }

    if (args.length === 1) {
      const arg = args[0];
      if (Array.isArray(arg)) {
        return createElement(tagName, {} as HTMLAttributes<K>, arg);
      }
      if (typeof arg === "string" || typeof arg === "number") {
        return createElement(tagName, {} as HTMLAttributes<K>, [arg]);
      }
      if (isElement(arg) || isReadable(arg)) {
        return createElement(tagName, {} as HTMLAttributes<K>, [arg as Child]);
      }
      return createElement(tagName, arg as HTMLAttributes<K>, []);
    }

    const [attrs, children] = args as [HTMLAttributes<K>, readonly Child[]];
    return createElement(
      tagName,
      attrs,
      Array.isArray(children) ? children : [children],
    );
  }) as ElementFactory<K>;
};

export const div = makeElementFactory("div");
export const span = makeElementFactory("span");
export const p = makeElementFactory("p");
export const h1 = makeElementFactory("h1");
export const h2 = makeElementFactory("h2");
export const h3 = makeElementFactory("h3");
export const h4 = makeElementFactory("h4");
export const h5 = makeElementFactory("h5");
export const h6 = makeElementFactory("h6");
export const button = makeElementFactory("button");
export const input = makeElementFactory("input");
export const form = makeElementFactory("form");
export const label = makeElementFactory("label");
export const ul = makeElementFactory("ul");
export const ol = makeElementFactory("ol");
export const li = makeElementFactory("li");
export const a = makeElementFactory("a");
export const img = makeElementFactory("img");
export const nav = makeElementFactory("nav");
export const header = makeElementFactory("header");
export const footer = makeElementFactory("footer");
export const main = makeElementFactory("main");
export const section = makeElementFactory("section");
export const article = makeElementFactory("article");
export const aside = makeElementFactory("aside");
export const textarea = makeElementFactory("textarea");
export const select = makeElementFactory("select");
export const option = makeElementFactory("option");
export const table = makeElementFactory("table");
export const thead = makeElementFactory("thead");
export const tbody = makeElementFactory("tbody");
export const tr = makeElementFactory("tr");
export const th = makeElementFactory("th");
export const td = makeElementFactory("td");
