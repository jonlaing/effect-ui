import { Array, Effect, Scope } from "effect";
import type { Readable } from "@core/Readable";
import {
  applyClass,
  applyEventHandler,
  applyGenericAttribute,
  applyInputValue,
  applyStyle,
  flattenChildren,
  isElement,
  isReadable,
  subscribeToReadable,
} from "./helpers";
import type {
  Child,
  ClassValue,
  ElementFactory,
  EventHandler,
  HTMLAttributes,
  StyleValue,
} from "./types";
import type { Ref } from "@dom/Ref";

const applyRef = <K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  ref: Ref<HTMLElementTagNameMap[K]>,
): void => {
  ref.set(element);
};

const applyInnerHTML = (
  element: HTMLElement,
  value: string | Readable<string>,
): Effect.Effect<void, never, Scope.Scope> => {
  if (isReadable(value)) {
    return subscribeToReadable(value as Readable<string>, (html) => {
      element.innerHTML = html;
    });
  }
  element.innerHTML = value as string;
  return Effect.void;
};

const applyAttributes = <K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  attrs: HTMLAttributes<K>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) continue;

      if (key === "ref") {
        applyRef(element, value as Ref<HTMLElementTagNameMap[K]>);
      } else if (key === "class") {
        yield* applyClass(element, value as ClassValue);
      } else if (key === "style") {
        yield* applyStyle(
          element,
          value as
            | Record<string, StyleValue>
            | Readable<Record<string, string>>,
        );
      } else if (key === "innerHTML") {
        yield* applyInnerHTML(element, value as string | Readable<string>);
      } else if (key.startsWith("on")) {
        applyEventHandler(element, key, value as EventHandler<Event>);
      } else if (key === "id") {
        element.id = value as string;
      } else if (
        key === "value" &&
        (element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement)
      ) {
        yield* applyInputValue(element, value);
      } else {
        yield* applyGenericAttribute(element, key, value);
      }
    }
  });

const appendChildren = <E, R>(
  parent: HTMLElement,
  children: readonly Child<E, R>[],
): Effect.Effect<void, E, Scope.Scope | R> =>
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

const createElement = <K extends keyof HTMLElementTagNameMap, E, R>(
  tagName: K,
  attrs: HTMLAttributes<K>,
  children: readonly Child<E, R>[],
): Effect.Effect<HTMLElementTagNameMap[K], E, Scope.Scope | R> =>
  Effect.gen(function* () {
    const element = document.createElement(tagName);
    yield* applyAttributes(element, attrs);
    yield* appendChildren(element, children);
    return element;
  });

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
        return createElement(
          tagName,
          {} as HTMLAttributes<K>,
          arg as Child<unknown>[],
        );
      }
      if (typeof arg === "string" || typeof arg === "number") {
        return createElement(tagName, {} as HTMLAttributes<K>, [arg]);
      }
      if (isElement(arg) || isReadable(arg)) {
        return createElement(tagName, {} as HTMLAttributes<K>, [
          arg as Child<unknown>,
        ]);
      }
      return createElement(tagName, arg as HTMLAttributes<K>, []);
    }

    const [attrs, children] = args as [
      HTMLAttributes<K>,
      readonly Child<unknown>[],
    ];
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

/**
 * Namespace containing all HTML element factories.
 * Provides a convenient way to access elements without individual imports.
 *
 * @example
 * ```ts
 * import { $ } from "@jonlaing/effect-ui"
 *
 * const MyComponent = Effect.gen(function* () {
 *   return yield* $.div({ class: "card" }, [
 *     $.h1("Title"),
 *     $.p("Content"),
 *     $.button({ onClick: handleClick }, "Submit"),
 *   ])
 * })
 * ```
 */
export const $ = {
  div,
  span,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  button,
  input,
  form,
  label,
  ul,
  ol,
  li,
  a,
  img,
  nav,
  header,
  footer,
  main,
  section,
  article,
  aside,
  textarea,
  select,
  option,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
};
