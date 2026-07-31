// Types from DOMElements
export type {
  AttributeValue,
  BaseElementAttributes,
  ChildInputE,
  ChildInputR,
  ClassItem,
  ClassValue,
  ElementFactory,
  EventAttributes,
  EventHandler,
  HTMLAttributes,
  StyleValue,
  SVGAttributes,
  SVGElementFactory,
} from "./DOMElements.js";

export {
  bindElementToRef,
  type ElementRef,
  ElementRefTypeId,
  isElementRef,
  make as ref,
  getUnsafe,
  NoSuchElementException,
  AttributeNotFound,
  DataAttributeNotFound,
} from "./ref.js";

export * from "./core.js";
export type {
  Child,
  ChildInput,
  ChildLeaf,
  ChildNode,
  Element,
} from "./types.js";

export { $, MergePropsCtx } from "./DOMElements.js";
