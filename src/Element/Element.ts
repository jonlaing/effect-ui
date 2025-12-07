import { Array, Effect, Scope } from "effect";
import type { Readable } from "../Readable.js";
import {
  applyClassName,
  applyEventHandler,
  applyGenericAttribute,
  applyStyle,
  flattenChildren,
  isElement,
  isReadable,
  subscribeToReadable,
} from "./helpers.js";
import type {
  Child,
  ElementFactory,
  EventHandler,
  HTMLAttributes,
  StyleValue,
} from "./types.js";

const applyAttributes = <K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  attrs: HTMLAttributes<K>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) continue;

      if (key === "class") {
        yield* applyClassName(element, value as string | Readable<string>);
      } else if (key === "style") {
        yield* applyStyle(
          element,
          value as
            | Record<string, StyleValue>
            | Readable<Record<string, string>>,
        );
      } else if (key.startsWith("on")) {
        applyEventHandler(element, key, value as EventHandler<Event>);
      } else if (key === "id") {
        element.id = value as string;
      } else {
        yield* applyGenericAttribute(element, key, value);
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
        return createElement(tagName, {} as HTMLAttributes<K>, arg as Child[]);
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
