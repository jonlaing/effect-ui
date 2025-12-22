import { Array, Effect, Scope } from "effect";
import type { Readable, RendererInterface } from "@effex/core";
import { RendererContext } from "@effex/core";
import {
  applyClassWithRenderer,
  applyEventHandlerWithRenderer,
  applyGenericAttributeWithRenderer,
  applyInputValueWithRenderer,
  applyStyleWithRenderer,
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
  SVGAttributes,
  SVGElementFactory,
} from "./types";
import type { Ref } from "@effex/core";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const applyRef = <K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  ref: Ref<HTMLElementTagNameMap[K]>,
): void => {
  ref.set(element);
};

const applyRefSVG = <K extends keyof SVGElementTagNameMap>(
  element: SVGElementTagNameMap[K],
  ref: Ref<SVGElementTagNameMap[K]>,
): void => {
  ref.set(element);
};

const applyInnerHTML = (
  renderer: RendererInterface<Node>,
  element: Node,
  value: string | Readable<string>,
): Effect.Effect<void, never, Scope.Scope> => {
  if (isReadable(value)) {
    return subscribeToReadable(value as Readable<string>, (html) =>
      Effect.runSync(renderer.setInnerHTML(element, html)),
    );
  }
  return renderer.setInnerHTML(element, value as string);
};

const applyAttributes = <K extends keyof HTMLElementTagNameMap>(
  renderer: RendererInterface<Node>,
  element: Node,
  attrs: HTMLAttributes<K>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) continue;

      if (key === "ref") {
        applyRef(
          element as HTMLElementTagNameMap[K],
          value as Ref<HTMLElementTagNameMap[K]>,
        );
      } else if (key === "class") {
        yield* applyClassWithRenderer(renderer, element, value as ClassValue);
      } else if (key === "style") {
        yield* applyStyleWithRenderer(
          renderer,
          element,
          value as
            | Record<string, StyleValue>
            | Readable<Record<string, string>>,
        );
      } else if (key === "innerHTML") {
        yield* applyInnerHTML(
          renderer,
          element,
          value as string | Readable<string>,
        );
      } else if (key.startsWith("on")) {
        yield* applyEventHandlerWithRenderer(
          renderer,
          element,
          key,
          value as EventHandler<Event>,
        );
      } else if (key === "id") {
        yield* renderer.setAttribute(element, "id", value as string);
      } else if (
        key === "value" &&
        ((element as HTMLElement) instanceof HTMLInputElement ||
          (element as HTMLElement) instanceof HTMLTextAreaElement ||
          (element as HTMLElement) instanceof HTMLSelectElement)
      ) {
        yield* applyInputValueWithRenderer(renderer, element, value);
      } else {
        yield* applyGenericAttributeWithRenderer(renderer, element, key, value);
      }
    }
  });

const appendChildren = <E, R>(
  renderer: RendererInterface<Node>,
  parent: Node,
  children: readonly Child<E, R>[],
): Effect.Effect<void, E, Scope.Scope | RendererContext | R> =>
  Effect.gen(function* () {
    const flattened = flattenChildren(children);

    for (const child of flattened) {
      if (typeof child === "string" || typeof child === "number") {
        const textNode = yield* renderer.createTextNode(String(child));
        yield* renderer.appendChild(parent, textNode);
      } else if (isElement(child)) {
        const childElement = yield* child;
        yield* renderer.appendChild(parent, childElement as Node);
      } else if (isReadable(child)) {
        const textNode = yield* renderer.createTextNode("");
        yield* renderer.appendChild(parent, textNode);
        yield* subscribeToReadable(
          child as Readable<string | number>,
          (value) => {
            Effect.runSync(renderer.setTextContent(textNode, String(value)));
          },
        );
      }
    }
  });

const createElement = <K extends keyof HTMLElementTagNameMap, E, R>(
  tagName: K,
  attrs: HTMLAttributes<K>,
  children: readonly Child<E, R>[],
): Effect.Effect<
  HTMLElementTagNameMap[K],
  E,
  Scope.Scope | R | RendererContext
> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const element = yield* renderer.createNode(tagName);
    yield* applyAttributes(renderer, element, attrs);
    yield* appendChildren(renderer, element, children);
    return element as HTMLElementTagNameMap[K];
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

// === SVG Elements ===

const applyAttributesSVG = <K extends keyof SVGElementTagNameMap>(
  renderer: RendererInterface<Node>,
  element: Node,
  attrs: SVGAttributes<K>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) continue;

      if (key === "ref") {
        applyRefSVG(
          element as SVGElementTagNameMap[K],
          value as Ref<SVGElementTagNameMap[K]>,
        );
      } else if (key === "class") {
        yield* applyClassWithRenderer(renderer, element, value as ClassValue);
      } else if (key === "style") {
        yield* applyStyleWithRenderer(
          renderer,
          element,
          value as
            | Record<string, StyleValue>
            | Readable<Record<string, string>>,
        );
      } else if (key.startsWith("on")) {
        yield* applyEventHandlerWithRenderer(
          renderer,
          element,
          key,
          value as EventHandler<Event>,
        );
      } else if (key === "id") {
        yield* renderer.setAttribute(element, "id", value as string);
      } else {
        yield* applyGenericAttributeWithRenderer(renderer, element, key, value);
      }
    }
  });

const createSVGElement = <K extends keyof SVGElementTagNameMap, E, R>(
  tagName: K,
  attrs: SVGAttributes<K>,
  children: readonly Child<E, R>[],
): Effect.Effect<
  SVGElementTagNameMap[K],
  E,
  Scope.Scope | R | RendererContext
> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const element = yield* renderer.createNode(tagName, SVG_NAMESPACE);
    yield* applyAttributesSVG(renderer, element, attrs);
    yield* appendChildren(renderer, element, children);
    return element as SVGElementTagNameMap[K];
  });

const makeSVGElementFactory = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
): SVGElementFactory<K> => {
  return ((...args: unknown[]) => {
    if (args.length === 0) {
      return createSVGElement(tagName, {} as SVGAttributes<K>, []);
    }

    if (args.length === 1) {
      const arg = args[0];
      if (Array.isArray(arg)) {
        return createSVGElement(
          tagName,
          {} as SVGAttributes<K>,
          arg as Child<unknown>[],
        );
      }
      if (typeof arg === "string" || typeof arg === "number") {
        return createSVGElement(tagName, {} as SVGAttributes<K>, [arg]);
      }
      if (isElement(arg) || isReadable(arg)) {
        return createSVGElement(tagName, {} as SVGAttributes<K>, [
          arg as Child<unknown>,
        ]);
      }
      return createSVGElement(tagName, arg as SVGAttributes<K>, []);
    }

    const [attrs, children] = args as [
      SVGAttributes<K>,
      readonly Child<unknown>[],
    ];
    return createSVGElement(
      tagName,
      attrs,
      Array.isArray(children) ? children : [children],
    );
  }) as SVGElementFactory<K>;
};

// SVG container and structural elements
export const svg = makeSVGElementFactory("svg");
export const g = makeSVGElementFactory("g");
export const defs = makeSVGElementFactory("defs");
export const symbol = makeSVGElementFactory("symbol");
export const use = makeSVGElementFactory("use");

// SVG shape elements
export const path = makeSVGElementFactory("path");
export const rect = makeSVGElementFactory("rect");
export const circle = makeSVGElementFactory("circle");
export const ellipse = makeSVGElementFactory("ellipse");
export const line = makeSVGElementFactory("line");
export const polyline = makeSVGElementFactory("polyline");
export const polygon = makeSVGElementFactory("polygon");

// SVG text elements
export const svgText = makeSVGElementFactory("text");
export const tspan = makeSVGElementFactory("tspan");
export const textPath = makeSVGElementFactory("textPath");

// SVG gradient and pattern elements
export const linearGradient = makeSVGElementFactory("linearGradient");
export const radialGradient = makeSVGElementFactory("radialGradient");
export const stop = makeSVGElementFactory("stop");
export const pattern = makeSVGElementFactory("pattern");

// SVG clipping and masking
export const clipPath = makeSVGElementFactory("clipPath");
export const mask = makeSVGElementFactory("mask");

// SVG filter elements
export const filter = makeSVGElementFactory("filter");
export const feGaussianBlur = makeSVGElementFactory("feGaussianBlur");
export const feColorMatrix = makeSVGElementFactory("feColorMatrix");
export const feBlend = makeSVGElementFactory("feBlend");
export const feOffset = makeSVGElementFactory("feOffset");

// Other SVG elements
export const image = makeSVGElementFactory("image");
export const foreignObject = makeSVGElementFactory("foreignObject");
export const marker = makeSVGElementFactory("marker");

/**
 * Namespace containing all HTML and SVG element factories.
 * Provides a convenient way to access elements without individual imports.
 *
 * @example
 * ```ts
 * import { $ } from "@effex/dom"
 *
 * const MyComponent = Effect.gen(function* () {
 *   return yield* $.div({ class: "card" }, [
 *     $.h1("Title"),
 *     $.p("Content"),
 *     $.button({ onClick: handleClick }, "Submit"),
 *   ])
 * })
 *
 * // SVG example
 * const Icon = Effect.gen(function* () {
 *   return yield* $.svg({ viewBox: "0 0 24 24" }, [
 *     $.path({ d: "M12 2L2 7l10 5 10-5-10-5z" }),
 *   ])
 * })
 * ```
 */
export const $ = {
  // HTML elements
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
  // SVG container and structural elements
  svg,
  g,
  defs,
  symbol,
  use,
  // SVG shape elements
  path,
  rect,
  circle,
  ellipse,
  line,
  polyline,
  polygon,
  // SVG text elements
  text: svgText,
  tspan,
  textPath,
  // SVG gradient and pattern elements
  linearGradient,
  radialGradient,
  stop,
  pattern,
  // SVG clipping and masking
  clipPath,
  mask,
  // SVG filter elements
  filter,
  feGaussianBlur,
  feColorMatrix,
  feBlend,
  feOffset,
  // Other SVG elements
  image,
  foreignObject,
  marker,
};
