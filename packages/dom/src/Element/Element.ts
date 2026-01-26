import { Context, Effect, Option, Scope } from "effect";
import { isEffect } from "effect/Effect";

import {
  isReadable,
  RendererContext,
  type Readable,
  type RendererInterface,
} from "@effex/core";

import {
  applyClassWithRenderer,
  applyEventHandlerWithRenderer,
  applyGenericAttributeWithRenderer,
  applyInputValueWithRenderer,
  applyStyleWithRenderer,
  flattenChildren,
  subscribeToReadable,
} from "./helpers";
import { bindElementToRef, type ElementRef } from "./ref.js";
import type {
  ChildEffect,
  ChildNode,
  ClassValue,
  ElementFactory,
  EventHandler,
  HTMLAttributes,
  StyleValue,
  SVGAttributes,
  SVGElementFactory,
} from "./types";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * Context for merging props into child elements.
 * Used by primitives with `asChild` to inject their props into user-provided elements.
 */
export class MergePropsCtx extends Context.Tag("MergePropsCtx")<
  MergePropsCtx,
  Record<string, unknown>
>() {}

const applyRef = <K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  ref: ElementRef<HTMLElementTagNameMap[K]>,
): void => {
  bindElementToRef(ref, element);
};

const applyRefSVG = <K extends keyof SVGElementTagNameMap>(
  element: SVGElementTagNameMap[K],
  ref: ElementRef<SVGElementTagNameMap[K]>,
): void => {
  bindElementToRef(ref, element);
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
          value as ElementRef<HTMLElementTagNameMap[K]>,
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
        typeof HTMLInputElement !== "undefined" &&
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

const appendChildren = <E = never, R = never>(
  renderer: RendererInterface<Node>,
  parent: Node,
  children: ChildEffect<E, R>,
): Effect.Effect<void, E, Scope.Scope | RendererContext | R> =>
  Effect.gen(function* () {
    const flattened = yield* flattenChildren(children);

    for (const child of flattened) {
      if (typeof child === "string" || typeof child === "number") {
        const textNode = yield* renderer.createTextNode(String(child));
        yield* renderer.appendChild(parent, textNode);
      } else if (isReadable(child)) {
        const textNode = yield* renderer.createTextNode("");
        yield* renderer.appendChild(parent, textNode);
        yield* subscribeToReadable(
          child as Readable<string | number>,
          (value) => {
            Effect.runSync(renderer.setTextContent(textNode, String(value)));
          },
        );
      } else {
        yield* renderer.appendChild(parent, child as Node);
      }
    }
  });

const createElement = <
  K extends keyof HTMLElementTagNameMap,
  E = never,
  R = never,
>(
  tagName: K,
  attrs: HTMLAttributes<K>,
  children: ChildEffect<E, R>,
): Effect.Effect<
  HTMLElementTagNameMap[K],
  E,
  Scope.Scope | RendererContext | R
> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const element = yield* renderer.createNode(tagName);

    // Check for injected props from asChild pattern
    const mergePropsOption = yield* Effect.serviceOption(MergePropsCtx);
    const finalAttrs = Option.match(mergePropsOption, {
      onSome: (mergeProps) =>
        ({ ...mergeProps, ...attrs }) as HTMLAttributes<K>,
      onNone: () => attrs,
    });

    yield* applyAttributes(renderer, element, finalAttrs);
    // Clear MergePropsCtx for children so they don't inherit injected props
    yield* Effect.provideService(
      appendChildren(renderer, element, children),
      MergePropsCtx,
      {},
    );
    return element as HTMLElementTagNameMap[K];
  });

const makeElementFactory = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): ElementFactory<K> => {
  return (<E = never, R = never>(...args: unknown[]) => {
    if (args.length === 0) {
      return createElement(
        tagName,
        {} as HTMLAttributes<K>,
        Effect.succeed([]),
      );
    }

    if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === "string" || typeof arg === "number") {
        return createElement(
          tagName,
          {} as HTMLAttributes<K>,
          Effect.succeed(arg),
        );
      }
      if (isEffect(arg)) {
        return createElement(
          tagName,
          {} as HTMLAttributes<K>,
          arg as Effect.Effect<HTMLElement, E, R>,
        );
      }
      if (isReadable(arg)) {
        return createElement(
          tagName,
          {} as HTMLAttributes<K>,
          Effect.succeed(arg as Readable<string>),
        );
      }
      return createElement(
        tagName,
        arg as HTMLAttributes<K>,
        Effect.succeed([]),
      );
    }

    const [attrs, children] = args as [HTMLAttributes<K>, ChildEffect<E, R>];
    return createElement(tagName, attrs, children);
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
export const tfoot = makeElementFactory("tfoot");
export const tr = makeElementFactory("tr");
export const th = makeElementFactory("th");
export const td = makeElementFactory("td");
export const caption = makeElementFactory("caption");
export const colgroup = makeElementFactory("colgroup");
export const col = makeElementFactory("col");

// Text content
export const blockquote = makeElementFactory("blockquote");
export const cite = makeElementFactory("cite");
export const q = makeElementFactory("q");
export const pre = makeElementFactory("pre");
export const code = makeElementFactory("code");
export const kbd = makeElementFactory("kbd");
export const samp = makeElementFactory("samp");
export const address = makeElementFactory("address");
export const hr = makeElementFactory("hr");
export const br = makeElementFactory("br");
export const figure = makeElementFactory("figure");
export const figcaption = makeElementFactory("figcaption");
export const dl = makeElementFactory("dl");
export const dt = makeElementFactory("dt");
export const dd = makeElementFactory("dd");
export const abbr = makeElementFactory("abbr");
export const dfn = makeElementFactory("dfn");
export const mark = makeElementFactory("mark");
export const del = makeElementFactory("del");
export const ins = makeElementFactory("ins");
export const s = makeElementFactory("s");
export const u = makeElementFactory("u");
export const small = makeElementFactory("small");
export const strong = makeElementFactory("strong");
export const em = makeElementFactory("em");
export const b = makeElementFactory("b");
export const i = makeElementFactory("i");
export const sub = makeElementFactory("sub");
export const sup = makeElementFactory("sup");
export const time = makeElementFactory("time");
export const data = makeElementFactory("data");
export const varEl = makeElementFactory("var");
export const wbr = makeElementFactory("wbr");
export const bdi = makeElementFactory("bdi");
export const bdo = makeElementFactory("bdo");
export const ruby = makeElementFactory("ruby");
export const rt = makeElementFactory("rt");
export const rp = makeElementFactory("rp");

// Interactive elements
export const details = makeElementFactory("details");
export const summary = makeElementFactory("summary");
export const dialog = makeElementFactory("dialog");
export const menu = makeElementFactory("menu");

// Form elements
export const fieldset = makeElementFactory("fieldset");
export const legend = makeElementFactory("legend");
export const datalist = makeElementFactory("datalist");
export const optgroup = makeElementFactory("optgroup");
export const output = makeElementFactory("output");
export const progress = makeElementFactory("progress");
export const meter = makeElementFactory("meter");

// Media elements
export const audio = makeElementFactory("audio");
export const video = makeElementFactory("video");
export const source = makeElementFactory("source");
export const track = makeElementFactory("track");
export const picture = makeElementFactory("picture");
export const canvas = makeElementFactory("canvas");
export const iframe = makeElementFactory("iframe");
export const embed = makeElementFactory("embed");
export const objectEl = makeElementFactory("object");
export const map = makeElementFactory("map");
export const area = makeElementFactory("area");

// Template and slots
export const template = makeElementFactory("template");
export const slot = makeElementFactory("slot");

// Scripting (included for completeness)
export const noscript = makeElementFactory("noscript");
export const script = makeElementFactory("script");
export const style = makeElementFactory("style");

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
          value as ElementRef<SVGElementTagNameMap[K]>,
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
  children: ChildEffect<E, R>,
): Effect.Effect<
  SVGElementTagNameMap[K],
  E,
  Scope.Scope | R | RendererContext
> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const element = yield* renderer.createNode(tagName, SVG_NAMESPACE);

    // Check for injected props from asChild pattern
    const mergePropsOption = yield* Effect.serviceOption(MergePropsCtx);
    const finalAttrs = Option.match(mergePropsOption, {
      onSome: (mergeProps) => ({ ...mergeProps, ...attrs }) as SVGAttributes<K>,
      onNone: () => attrs,
    });

    yield* applyAttributesSVG(renderer, element, finalAttrs);
    // Clear MergePropsCtx for children so they don't inherit injected props
    yield* Effect.provideService(
      appendChildren(renderer, element, children),
      MergePropsCtx,
      {},
    );
    return element as SVGElementTagNameMap[K];
  });

const makeSVGElementFactory = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
): SVGElementFactory<K> => {
  return (<E, R>(...args: unknown[]) => {
    if (args.length === 0) {
      return createSVGElement(
        tagName,
        {} as SVGAttributes<K>,
        Effect.succeed([]),
      );
    }

    if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === "string" || typeof arg === "number") {
        return createSVGElement(
          tagName,
          {} as SVGAttributes<K>,
          Effect.succeed(arg),
        );
      }
      if (isEffect(arg)) {
        return createSVGElement(
          tagName,
          {} as SVGAttributes<K>,
          arg as Effect.Effect<SVGElement, E, R>,
        );
      }
      if (isReadable(arg)) {
        return createSVGElement(
          tagName,
          {} as SVGAttributes<K>,
          Effect.succeed(arg as Readable<string>),
        );
      }
      return createSVGElement(
        tagName,
        arg as SVGAttributes<K>,
        Effect.succeed([]),
      );
    }

    const [attrs, children] = args as [SVGAttributes<K>, ChildEffect<E, R>];
    return createSVGElement(tagName, attrs, children);
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
 * Lift a primitive value into a ChildEffect.
 * Use this to pass strings, numbers, or other ChildNode values to elements.
 *
 * @example
 * ```ts
 * // Lift a string
 * div({}, $.of("Hello, world!"))
 *
 * // Lift a variable
 * div({}, $.of(props.title))
 *
 * // Combine with collect for multiple children
 * div({}, collect(
 *   $.of("Hello"),
 *   $.of(someNumber),
 *   span({}, $.of("nested"))
 * ))
 * ```
 */
export const of = <A extends ChildNode>(value: A) => Effect.succeed(value);

/**
 * Namespace containing all HTML and SVG element factories, plus the `of` helper.
 * Provides a convenient way to access elements without individual imports.
 *
 * Use `$.of()` to lift primitives into ChildEffect, and `collect()` to combine
 * multiple children.
 *
 * @example
 * ```ts
 * import { $, collect } from "@effex/dom"
 *
 * const MyComponent = () =>
 *   Effect.gen(function* () {
 *     return yield* $.div({ class: "card" }, collect(
 *       $.h1({}, $.of("Title")),
 *       $.p({}, $.of("Content")),
 *       $.button({ onClick: handleClick }, $.of("Submit")),
 *     ))
 *   })
 *
 * // SVG example
 * const Icon = () =>
 *   Effect.gen(function* () {
 *     return yield* $.svg({ viewBox: "0 0 24 24" },
 *       $.path({ d: "M12 2L2 7l10 5 10-5-10-5z" })
 *     )
 *   })
 * ```
 */
export const $ = {
  of,
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
