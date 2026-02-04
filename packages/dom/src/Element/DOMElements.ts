/**
 * DOM Element factories built on the core Element API.
 * Provides convenient $.div, $.span, etc. syntax for creating elements.
 */

import { Effect, Option, Stream } from "effect";
import { isEffect } from "effect/Effect";

import { MergePropsCtx, Readable, RendererContext } from "@effex/core";

import * as Core from "./core.js";
import type { ElementRef } from "./ref.js";

// =============================================================================
// Types
// =============================================================================

/**
 * Handler for DOM events that must return an Effect.
 * Errors must be handled (E = never) and no requirements allowed (R = never).
 */
export type EventHandler<E extends Event> = (
  event: E,
) => Effect.Effect<void, never, never>;

/**
 * Valid values for inline styles.
 */
export type StyleValue = string | number | Readable.Readable<string | number>;

/**
 * Individual class item.
 */
export type ClassItem = string | Readable.Readable<string>;

/**
 * Valid class value types.
 */
export type ClassValue =
  | string
  | readonly ClassItem[]
  | Readable.Readable<string>
  | Readable.Readable<readonly string[]>;

/**
 * Data/ARIA attribute value.
 */
export type AttributeValue =
  | string
  | boolean
  | number
  | undefined
  | Readable.Readable<string | boolean | number | undefined>;

/**
 * Base attributes available on all elements (HTML and SVG).
 */
export interface BaseElementAttributes<T extends HTMLElement | SVGElement> {
  readonly class?: ClassValue;
  readonly style?:
    | Record<string, StyleValue>
    | Readable.Readable<Record<string, string>>;
  readonly id?: string | Readable.Readable<string>;
  readonly role?: string | Readable.Readable<string>;
  readonly ref?: ElementRef<T>;
  readonly innerHTML?: string | Readable.Readable<string>;
  readonly tabIndex?: number | Readable.Readable<number>;
  readonly hidden?: boolean | Readable.Readable<boolean>;
  readonly title?: string | Readable.Readable<string>;
  // Allow data-* and aria-* attributes
  readonly [key: `data-${string}`]: AttributeValue;
  readonly [key: `aria-${string}`]: AttributeValue;
}

/**
 * Common event handler attributes.
 */
export interface EventAttributes {
  readonly onClick?: EventHandler<MouseEvent>;
  readonly onInput?: EventHandler<InputEvent>;
  readonly onChange?: EventHandler<Event>;
  readonly onSubmit?: EventHandler<SubmitEvent>;
  readonly onKeyDown?: EventHandler<KeyboardEvent>;
  readonly onKeyUp?: EventHandler<KeyboardEvent>;
  readonly onKeyPress?: EventHandler<KeyboardEvent>;
  readonly onFocus?: EventHandler<FocusEvent>;
  readonly onBlur?: EventHandler<FocusEvent>;
  readonly onMouseDown?: EventHandler<MouseEvent>;
  readonly onMouseUp?: EventHandler<MouseEvent>;
  readonly onMouseEnter?: EventHandler<MouseEvent>;
  readonly onMouseLeave?: EventHandler<MouseEvent>;
  readonly onMouseMove?: EventHandler<MouseEvent>;
  readonly onContextMenu?: EventHandler<MouseEvent>;
  readonly onPointerDown?: EventHandler<PointerEvent>;
  readonly onPointerUp?: EventHandler<PointerEvent>;
  readonly onPointerMove?: EventHandler<PointerEvent>;
  readonly onPointerEnter?: EventHandler<PointerEvent>;
  readonly onPointerLeave?: EventHandler<PointerEvent>;
  readonly onPointerCancel?: EventHandler<PointerEvent>;
  readonly onScroll?: EventHandler<Event>;
  readonly onWheel?: EventHandler<WheelEvent>;
  readonly onDragStart?: EventHandler<DragEvent>;
  readonly onDrag?: EventHandler<DragEvent>;
  readonly onDragEnd?: EventHandler<DragEvent>;
  readonly onDrop?: EventHandler<DragEvent>;
  readonly onDragOver?: EventHandler<DragEvent>;
  readonly onDragEnter?: EventHandler<DragEvent>;
  readonly onDragLeave?: EventHandler<DragEvent>;
  readonly onTouchStart?: EventHandler<TouchEvent>;
  readonly onTouchMove?: EventHandler<TouchEvent>;
  readonly onTouchEnd?: EventHandler<TouchEvent>;
  readonly onTouchCancel?: EventHandler<TouchEvent>;
  readonly onAnimationStart?: EventHandler<AnimationEvent>;
  readonly onAnimationEnd?: EventHandler<AnimationEvent>;
  readonly onAnimationIteration?: EventHandler<AnimationEvent>;
  readonly onTransitionEnd?: EventHandler<TransitionEvent>;
}

/**
 * HTML attributes combining base and events.
 */
export type HTMLAttributes<T extends HTMLElement = HTMLElement> =
  BaseElementAttributes<T> &
    EventAttributes & {
      // Common HTML attributes
      readonly disabled?: boolean | Readable.Readable<boolean>;
      readonly name?: string | Readable.Readable<string>;
      readonly value?: string | number | Readable.Readable<string | number>;
      readonly checked?: boolean | Readable.Readable<boolean>;
      readonly selected?: boolean | Readable.Readable<boolean>;
      readonly type?: string | Readable.Readable<string>;
      readonly placeholder?: string | Readable.Readable<string>;
      readonly href?: string | Readable.Readable<string>;
      readonly src?: string | Readable.Readable<string>;
      readonly alt?: string | Readable.Readable<string>;
      readonly for?: string | Readable.Readable<string>;
      readonly action?: string | Readable.Readable<string>;
      readonly method?: string | Readable.Readable<string>;
      readonly target?: string | Readable.Readable<string>;
      readonly rel?: string | Readable.Readable<string>;
      readonly autocomplete?: string | Readable.Readable<string>;
      readonly min?: string | number | Readable.Readable<string | number>;
      readonly max?: string | number | Readable.Readable<string | number>;
      readonly step?: string | number | Readable.Readable<string | number>;
      readonly pattern?: string | Readable.Readable<string>;
      readonly required?: boolean | Readable.Readable<boolean>;
      readonly readonly?: boolean | Readable.Readable<boolean>;
      readonly multiple?: boolean | Readable.Readable<boolean>;
      readonly rows?: number | Readable.Readable<number>;
      readonly cols?: number | Readable.Readable<number>;
      readonly wrap?: string | Readable.Readable<string>;
      readonly width?: string | number | Readable.Readable<string | number>;
      readonly height?: string | number | Readable.Readable<string | number>;
      readonly open?: boolean | Readable.Readable<boolean>;
      // Allow any other string attributes for flexibility
      readonly [key: string]: unknown;
    };

/**
 * SVG attributes.
 */
export type SVGAttributes<T extends SVGElement = SVGElement> =
  BaseElementAttributes<T> &
    EventAttributes & {
      readonly viewBox?: string | Readable.Readable<string>;
      readonly xmlns?: string;
      readonly fill?: string | Readable.Readable<string>;
      readonly stroke?: string | Readable.Readable<string>;
      readonly strokeWidth?:
        | string
        | number
        | Readable.Readable<string | number>;
      readonly d?: string | Readable.Readable<string>;
      readonly x?: string | number | Readable.Readable<string | number>;
      readonly y?: string | number | Readable.Readable<string | number>;
      readonly cx?: string | number | Readable.Readable<string | number>;
      readonly cy?: string | number | Readable.Readable<string | number>;
      readonly r?: string | number | Readable.Readable<string | number>;
      readonly rx?: string | number | Readable.Readable<string | number>;
      readonly ry?: string | number | Readable.Readable<string | number>;
      readonly x1?: string | number | Readable.Readable<string | number>;
      readonly y1?: string | number | Readable.Readable<string | number>;
      readonly x2?: string | number | Readable.Readable<string | number>;
      readonly y2?: string | number | Readable.Readable<string | number>;
      readonly points?: string | Readable.Readable<string>;
      readonly transform?: string | Readable.Readable<string>;
      readonly opacity?: string | number | Readable.Readable<string | number>;
      readonly clipPath?: string | Readable.Readable<string>;
      readonly mask?: string | Readable.Readable<string>;
      readonly preserveAspectRatio?: string | Readable.Readable<string>;
      // Allow any other string attributes
      readonly [key: string]: unknown;
    };

/**
 * Factory function type for HTML elements.
 */
export type ElementFactory<K extends keyof HTMLElementTagNameMap> = {
  <E = never, R = never>(
    attrs: HTMLAttributes<HTMLElementTagNameMap[K]>,
    children: Core.Child<E, R>,
  ): Core.Element<HTMLElementTagNameMap[K], E, R>;
  (
    attrs: HTMLAttributes<HTMLElementTagNameMap[K]>,
  ): Core.Element<HTMLElementTagNameMap[K], never, never>;
  <E = never, R = never>(
    children: Core.Child<E, R>,
  ): Core.Element<HTMLElementTagNameMap[K], E, R>;
  (children: string): Core.Element<HTMLElementTagNameMap[K], never, never>;
  (children: number): Core.Element<HTMLElementTagNameMap[K], never, never>;
  (
    children: Readable.Readable<string | number>,
  ): Core.Element<HTMLElementTagNameMap[K], never, never>;
  (): Core.Element<HTMLElementTagNameMap[K], never, never>;
};

/**
 * Factory function type for SVG elements.
 */
export type SVGElementFactory<K extends keyof SVGElementTagNameMap> = {
  <E = never, R = never>(
    attrs: SVGAttributes<SVGElementTagNameMap[K]>,
    children: Core.Child<E, R>,
  ): Core.Element<SVGElementTagNameMap[K], E, R>;
  (
    attrs: SVGAttributes<SVGElementTagNameMap[K]>,
  ): Core.Element<SVGElementTagNameMap[K], never, never>;
  <E = never, R = never>(
    children: Core.Child<E, R>,
  ): Core.Element<SVGElementTagNameMap[K], E, R>;
  (children: string): Core.Element<SVGElementTagNameMap[K], never, never>;
  (children: number): Core.Element<SVGElementTagNameMap[K], never, never>;
  (
    children: Readable.Readable<string | number>,
  ): Core.Element<SVGElementTagNameMap[K], never, never>;
  (): Core.Element<SVGElementTagNameMap[K], never, never>;
};

// =============================================================================
// Context for asChild pattern
// =============================================================================

// MergePropsCtx is imported from @effex/core
// Re-export it for backwards compatibility
export { MergePropsCtx } from "@effex/core";

// =============================================================================
// Attribute Application using Core functions
// =============================================================================

const classValueToString = (value: string | readonly string[]): string =>
  typeof value === "string" ? value : value.join(" ");

/**
 * Apply class attribute to an element using Core functions.
 */
const applyClass = <A extends HTMLElement | SVGElement>(
  el: Core.Element<A>,
  value: ClassValue,
): Core.Element<A> => {
  if (Readable.isReadable(value)) {
    // For reactive class that's a string/array, we need to handle it specially
    return Effect.gen(function* () {
      const element = yield* el;
      const renderer = yield* RendererContext;
      const readable = value as Readable.Readable<string | readonly string[]>;
      const initial = yield* readable.get;
      yield* renderer.setClassName(element, classValueToString(initial));
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (v) =>
        renderer.setClassName(element, classValueToString(v)),
      ).pipe(Effect.forkIn(scope));
      return element;
    }) as Core.Element<A>;
  } else if (typeof value === "string") {
    return Core.setClass(el, value);
  } else if (Array.isArray(value)) {
    // Array of class items - check if any are reactive
    const hasReactive = value.some(Readable.isReadable);

    if (!hasReactive) {
      return Core.setClass(el, (value as string[]).join(" "));
    } else {
      // Mixed array with reactive items - need custom handling
      return Effect.gen(function* () {
        const element = yield* el;
        const renderer = yield* RendererContext;
        const currentValues: string[] = new Array(value.length).fill("");

        const updateClassName = () =>
          renderer.setClassName(
            element,
            currentValues.filter((s) => s.length > 0).join(" "),
          );

        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (Readable.isReadable(item)) {
            const initial = yield* (item as Readable.Readable<string>).get;
            currentValues[i] = initial;
            const index = i;
            const scope = yield* Effect.scope;
            yield* Stream.runForEach(
              (item as Readable.Readable<string>).changes,
              (v) =>
                Effect.gen(function* () {
                  currentValues[index] = v;
                  yield* updateClassName();
                }),
            ).pipe(Effect.forkIn(scope));
          } else {
            currentValues[i] = item as string;
          }
        }

        yield* updateClassName();
        return element;
      }) as Core.Element<A>;
    }
  }

  return el;
};

/**
 * Apply style attribute to an element using Core functions.
 */
const applyStyle = <A extends HTMLElement | SVGElement>(
  el: Core.Element<A>,
  value: Record<string, StyleValue> | Readable.Readable<Record<string, string>>,
): Core.Element<A> => {
  if (Readable.isReadable(value)) {
    // Entire style object is reactive
    return Effect.gen(function* () {
      const element = yield* el;
      const renderer = yield* RendererContext;
      const readable = value as Readable.Readable<Record<string, string>>;
      const initial = yield* readable.get;
      for (const [prop, val] of Object.entries(initial)) {
        yield* renderer.setStyleProperty(element, prop, val);
      }
      const scope = yield* Effect.scope;
      yield* Stream.runForEach(readable.changes, (styles) =>
        Effect.forEach(
          Object.entries(styles),
          ([prop, val]) => renderer.setStyleProperty(element, prop, val),
          { discard: true },
        ),
      ).pipe(Effect.forkIn(scope));
      return element;
    }) as Core.Element<A>;
  }

  // Object with potentially reactive values
  let result = el;
  for (const [prop, styleVal] of Object.entries(value)) {
    if (Readable.isReadable(styleVal)) {
      result = Core.bindStyle(
        result,
        prop,
        Readable.map(styleVal as Readable.Readable<string | number>, String),
      );
    } else {
      result = Core.setStyle(result, prop, String(styleVal));
    }
  }
  return result;
};

/**
 * Apply an event handler to an element using Core functions.
 */
const applyEventHandler = <A extends HTMLElement>(
  el: Core.Element<A>,
  eventName: string,
  handler: EventHandler<Event>,
): Core.Element<A> =>
  Core.on(
    el,
    eventName as keyof HTMLElementEventMap,
    handler as (e: Event) => Effect.Effect<void, never, never>,
  );

/**
 * Apply innerHTML to an element using Core functions.
 */
const applyInnerHTML = <A extends HTMLElement | SVGElement>(
  el: Core.Element<A>,
  value: string | Readable.Readable<string>,
): Core.Element<A> => {
  if (Readable.isReadable(value)) {
    return Core.bindInnerHTML(el, value);
  }
  return Core.setInnerHTML(el, value);
};

// Boolean attributes that should be added/removed rather than set to "true"/"false"
const BOOLEAN_ATTRIBUTES = new Set([
  "disabled",
  "checked",
  "selected",
  "required",
  "readonly",
  "multiple",
  "hidden",
  "open",
  "autofocus",
  "autoplay",
  "controls",
  "default",
  "defer",
  "ismap",
  "loop",
  "muted",
  "novalidate",
  "reversed",
]);

/**
 * Apply a generic attribute to an element using Core functions.
 */
const applyAttribute = <A extends HTMLElement | SVGElement>(
  el: Core.Element<A>,
  key: string,
  value: unknown,
): Core.Element<A> => {
  if (Readable.isReadable(value)) {
    if (BOOLEAN_ATTRIBUTES.has(key)) {
      return Core.bindBooleanAttribute(
        el,
        key,
        value as Readable.Readable<boolean>,
      );
    }
    return Core.bindAttribute(el, key, value as Readable.Readable<unknown>);
  }
  if (typeof value === "boolean") {
    return value ? Core.setAttribute(el, key, "") : el; // Don't set false boolean attributes
  }
  return Core.setAttribute(el, key, String(value));
};

/**
 * Apply input value (special handling to avoid cursor reset).
 */
const applyInputValue = <A extends HTMLElement | SVGElement>(
  el: Core.Element<A>,
  value: unknown,
): Core.Element<A> => {
  if (Readable.isReadable(value)) {
    return Core.bindInputValue(el, value as Readable.Readable<unknown>);
  }
  return Core.setInputValue(el, String(value));
};

/**
 * Apply all attributes to an element using Core functions.
 */
const applyAttributes = <T extends HTMLElement | SVGElement>(
  el: Core.Element<T>,
  attrs: Record<string, unknown>,
): Core.Element<T> => {
  let result = el;

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined) continue;

    if (key === "ref") {
      result = Core.setRef(result, value as ElementRef<T>);
    } else if (key === "class") {
      result = applyClass(result, value as ClassValue);
    } else if (key === "style") {
      result = applyStyle(
        result,
        value as
          | Record<string, StyleValue>
          | Readable.Readable<Record<string, string>>,
      );
    } else if (key === "innerHTML") {
      result = applyInnerHTML(
        result,
        value as string | Readable.Readable<string>,
      );
    } else if (key.startsWith("on") && key.length > 2) {
      const eventName = key.slice(2).toLowerCase();
      result = applyEventHandler(
        result as Core.Element<HTMLElement>,
        eventName,
        value as EventHandler<Event>,
      ) as Core.Element<T>;
    } else if (key === "value") {
      // Check if this is an input-like element at runtime
      result = applyInputValue(result, value);
    } else {
      result = applyAttribute(result, key, value);
    }
  }

  return result;
};

// =============================================================================
// Element Creation using Core functions
// =============================================================================

/**
 * Create an HTML element with attributes and children using Core functions.
 */
const createElement = <K extends keyof HTMLElementTagNameMap, E, R>(
  tagName: K,
  attrs: HTMLAttributes<HTMLElementTagNameMap[K]>,
  children: Core.Child<E, R>,
): Core.Element<HTMLElementTagNameMap[K], E, R> =>
  Effect.gen(function* () {
    // Check for injected props from asChild pattern
    const mergePropsOption = yield* Effect.serviceOption(MergePropsCtx);
    const finalAttrs = Option.match(mergePropsOption, {
      onSome: (mergeProps) => ({ ...mergeProps, ...attrs }),
      onNone: () => attrs,
    });

    // Create element using Core.make
    let el = Core.make(tagName);

    // Apply attributes
    el = applyAttributes(el, finalAttrs as Record<string, unknown>);

    // Append children (clearing MergePropsCtx so children don't inherit it)
    const childEl = Core.appendChild(el, children);

    return yield* Effect.provideService(childEl, MergePropsCtx, {});
  }) as Core.Element<HTMLElementTagNameMap[K], E, R>;

/**
 * Create an SVG element with attributes and children using Core functions.
 */
const createSVGElement = <K extends keyof SVGElementTagNameMap, E, R>(
  tagName: K,
  attrs: SVGAttributes<SVGElementTagNameMap[K]>,
  children: Core.Child<E, R>,
): Core.Element<SVGElementTagNameMap[K], E, R> =>
  Effect.gen(function* () {
    // Check for injected props from asChild pattern
    const mergePropsOption = yield* Effect.serviceOption(MergePropsCtx);
    const finalAttrs = Option.match(mergePropsOption, {
      onSome: (mergeProps) => ({ ...mergeProps, ...attrs }),
      onNone: () => attrs,
    });

    // Create SVG element using Core.makeSVG
    let el = Core.makeSVG(tagName);

    // Apply attributes
    el = applyAttributes(el, finalAttrs as Record<string, unknown>);

    // Append children (clearing MergePropsCtx so children don't inherit it)
    const childEl = Core.appendChild(el, children);

    return yield* Effect.provideService(childEl, MergePropsCtx, {});
  }) as Core.Element<SVGElementTagNameMap[K], E, R>;

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create an HTML element factory for a specific tag.
 */
const makeElementFactory = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): ElementFactory<K> => {
  return (<E = never, R = never>(...args: unknown[]) => {
    if (args.length === 0) {
      return createElement(tagName, {}, Core.empty);
    }

    if (args.length === 1) {
      const arg = args[0];

      // String or number child
      if (typeof arg === "string" || typeof arg === "number") {
        return createElement(tagName, {}, Core.of(arg));
      }

      // Effect child
      if (isEffect(arg)) {
        return createElement(tagName, {}, arg as Core.Child<E, R>);
      }

      // Readable child
      if (Readable.isReadable(arg)) {
        return createElement(
          tagName,
          {},
          Core.of(arg as Readable.Readable<string | number>),
        );
      }

      // Attributes object
      return createElement(
        tagName,
        arg as HTMLAttributes<HTMLElementTagNameMap[K]>,
        Core.empty,
      );
    }

    // Two arguments: attrs and children
    const [attrs, children] = args as [
      HTMLAttributes<HTMLElementTagNameMap[K]>,
      Core.Child<E, R>,
    ];
    return createElement(tagName, attrs, children);
  }) as ElementFactory<K>;
};

/**
 * Create an SVG element factory for a specific tag.
 */
const makeSVGElementFactory = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
): SVGElementFactory<K> => {
  return (<E = never, R = never>(...args: unknown[]) => {
    if (args.length === 0) {
      return createSVGElement(tagName, {}, Core.empty);
    }

    if (args.length === 1) {
      const arg = args[0];

      if (typeof arg === "string" || typeof arg === "number") {
        return createSVGElement(tagName, {}, Core.of(arg));
      }

      if (isEffect(arg)) {
        return createSVGElement(tagName, {}, arg as Core.Child<E, R>);
      }

      if (Readable.isReadable(arg)) {
        return createSVGElement(
          tagName,
          {},
          Core.of(arg as Readable.Readable<string | number>),
        );
      }

      return createSVGElement(
        tagName,
        arg as SVGAttributes<SVGElementTagNameMap[K]>,
        Core.empty,
      );
    }

    const [attrs, children] = args as [
      SVGAttributes<SVGElementTagNameMap[K]>,
      Core.Child<E, R>,
    ];
    return createSVGElement(tagName, attrs, children);
  }) as SVGElementFactory<K>;
};

// =============================================================================
// HTML Element Exports
// =============================================================================

// Document structure
export const div = makeElementFactory("div");
export const span = makeElementFactory("span");
export const p = makeElementFactory("p");
export const h1 = makeElementFactory("h1");
export const h2 = makeElementFactory("h2");
export const h3 = makeElementFactory("h3");
export const h4 = makeElementFactory("h4");
export const h5 = makeElementFactory("h5");
export const h6 = makeElementFactory("h6");
export const header = makeElementFactory("header");
export const footer = makeElementFactory("footer");
export const main = makeElementFactory("main");
export const nav = makeElementFactory("nav");
export const section = makeElementFactory("section");
export const article = makeElementFactory("article");
export const aside = makeElementFactory("aside");
export const address = makeElementFactory("address");

// Text content
export const blockquote = makeElementFactory("blockquote");
export const cite = makeElementFactory("cite");
export const q = makeElementFactory("q");
export const pre = makeElementFactory("pre");
export const code = makeElementFactory("code");
export const kbd = makeElementFactory("kbd");
export const samp = makeElementFactory("samp");
export const varEl = makeElementFactory("var");
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
export const wbr = makeElementFactory("wbr");
export const bdi = makeElementFactory("bdi");
export const bdo = makeElementFactory("bdo");
export const ruby = makeElementFactory("ruby");
export const rt = makeElementFactory("rt");
export const rp = makeElementFactory("rp");
export const hr = makeElementFactory("hr");
export const br = makeElementFactory("br");

// Lists
export const ul = makeElementFactory("ul");
export const ol = makeElementFactory("ol");
export const li = makeElementFactory("li");
export const dl = makeElementFactory("dl");
export const dt = makeElementFactory("dt");
export const dd = makeElementFactory("dd");

// Links and media
export const a = makeElementFactory("a");
export const img = makeElementFactory("img");
export const figure = makeElementFactory("figure");
export const figcaption = makeElementFactory("figcaption");
export const picture = makeElementFactory("picture");
export const audio = makeElementFactory("audio");
export const video = makeElementFactory("video");
export const source = makeElementFactory("source");
export const track = makeElementFactory("track");
export const canvas = makeElementFactory("canvas");
export const iframe = makeElementFactory("iframe");
export const embed = makeElementFactory("embed");
export const objectEl = makeElementFactory("object");
export const map = makeElementFactory("map");
export const area = makeElementFactory("area");

// Tables
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

// Forms
export const form = makeElementFactory("form");
export const input = makeElementFactory("input");
export const textarea = makeElementFactory("textarea");
export const select = makeElementFactory("select");
export const option = makeElementFactory("option");
export const optgroup = makeElementFactory("optgroup");
export const button = makeElementFactory("button");
export const label = makeElementFactory("label");
export const fieldset = makeElementFactory("fieldset");
export const legend = makeElementFactory("legend");
export const datalist = makeElementFactory("datalist");
export const output = makeElementFactory("output");
export const progress = makeElementFactory("progress");
export const meter = makeElementFactory("meter");

// Interactive
export const details = makeElementFactory("details");
export const summary = makeElementFactory("summary");
export const dialog = makeElementFactory("dialog");
export const menu = makeElementFactory("menu");

// Template and slots
export const template = makeElementFactory("template");
export const slot = makeElementFactory("slot");

// Scripting
export const noscript = makeElementFactory("noscript");
export const script = makeElementFactory("script");
export const style = makeElementFactory("style");

// =============================================================================
// SVG Element Exports
// =============================================================================

// Container and structural
export const svg = makeSVGElementFactory("svg");
export const g = makeSVGElementFactory("g");
export const defs = makeSVGElementFactory("defs");
export const symbol = makeSVGElementFactory("symbol");
export const use = makeSVGElementFactory("use");

// Shapes
export const path = makeSVGElementFactory("path");
export const rect = makeSVGElementFactory("rect");
export const circle = makeSVGElementFactory("circle");
export const ellipse = makeSVGElementFactory("ellipse");
export const line = makeSVGElementFactory("line");
export const polyline = makeSVGElementFactory("polyline");
export const polygon = makeSVGElementFactory("polygon");

// Text
export const svgText = makeSVGElementFactory("text");
export const tspan = makeSVGElementFactory("tspan");
export const textPath = makeSVGElementFactory("textPath");

// Gradients and patterns
export const linearGradient = makeSVGElementFactory("linearGradient");
export const radialGradient = makeSVGElementFactory("radialGradient");
export const stop = makeSVGElementFactory("stop");
export const pattern = makeSVGElementFactory("pattern");

// Clipping and masking
export const clipPath = makeSVGElementFactory("clipPath");
export const mask = makeSVGElementFactory("mask");

// Filters
export const filter = makeSVGElementFactory("filter");
export const feGaussianBlur = makeSVGElementFactory("feGaussianBlur");
export const feColorMatrix = makeSVGElementFactory("feColorMatrix");
export const feBlend = makeSVGElementFactory("feBlend");
export const feOffset = makeSVGElementFactory("feOffset");

// Other
export const image = makeSVGElementFactory("image");
export const foreignObject = makeSVGElementFactory("foreignObject");
export const marker = makeSVGElementFactory("marker");

// =============================================================================
// Helpers
// =============================================================================

/**
 * Lift a primitive value into a Child.
 */
export const of = Core.of;

/**
 * An empty child effect.
 */
export const empty = Core.empty;

// =============================================================================
// $ Namespace
// =============================================================================

/**
 * Namespace containing all HTML and SVG element factories.
 */
export const $ = {
  of,
  empty,
  // HTML - Document structure
  div,
  span,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  footer,
  main,
  nav,
  section,
  article,
  aside,
  address,
  // HTML - Text content
  blockquote,
  cite,
  q,
  pre,
  code,
  kbd,
  samp,
  var: varEl,
  abbr,
  dfn,
  mark,
  del,
  ins,
  s,
  u,
  small,
  strong,
  em,
  b,
  i,
  sub,
  sup,
  time,
  data,
  wbr,
  bdi,
  bdo,
  ruby,
  rt,
  rp,
  hr,
  br,
  // HTML - Lists
  ul,
  ol,
  li,
  dl,
  dt,
  dd,
  // HTML - Links and media
  a,
  img,
  figure,
  figcaption,
  picture,
  audio,
  video,
  source,
  track,
  canvas,
  iframe,
  embed,
  object: objectEl,
  map,
  area,
  // HTML - Tables
  table,
  thead,
  tbody,
  tfoot,
  tr,
  th,
  td,
  caption,
  colgroup,
  col,
  // HTML - Forms
  form,
  input,
  textarea,
  select,
  option,
  optgroup,
  button,
  label,
  fieldset,
  legend,
  datalist,
  output,
  progress,
  meter,
  // HTML - Interactive
  details,
  summary,
  dialog,
  menu,
  // HTML - Template and slots
  template,
  slot,
  // HTML - Scripting
  noscript,
  script,
  style,
  // SVG - Container and structural
  svg,
  g,
  defs,
  symbol,
  use,
  // SVG - Shapes
  path,
  rect,
  circle,
  ellipse,
  line,
  polyline,
  polygon,
  // SVG - Text
  text: svgText,
  tspan,
  textPath,
  // SVG - Gradients and patterns
  linearGradient,
  radialGradient,
  stop,
  pattern,
  // SVG - Clipping and masking
  clipPath,
  mask,
  // SVG - Filters
  filter,
  feGaussianBlur,
  feColorMatrix,
  feBlend,
  feOffset,
  // SVG - Other
  image,
  foreignObject,
  marker,
};
