import { Effect, Layer } from "effect";
import { type RendererInterface, RendererContext } from "@effex/core";

/**
 * DOM implementation of the Renderer interface.
 * Uses browser DOM APIs to create and manipulate elements.
 */
export const DOMRenderer: RendererInterface<Node> = {
  createNode: (type: string, namespace?: string) =>
    Effect.sync(() =>
      namespace
        ? document.createElementNS(namespace, type)
        : document.createElement(type),
    ),

  createTextNode: (text: string) =>
    Effect.sync(() => document.createTextNode(text)),

  appendChild: (parent: Node, child: Node) =>
    Effect.sync(() => {
      parent.appendChild(child);
    }),

  removeChild: (parent: Node, child: Node) =>
    Effect.sync(() => {
      parent.removeChild(child);
    }),

  replaceChild: (parent: Node, newChild: Node, oldChild: Node) =>
    Effect.sync(() => {
      parent.replaceChild(newChild, oldChild);
    }),

  insertBefore: (parent: Node, child: Node, reference: Node | null) =>
    Effect.sync(() => {
      parent.insertBefore(child, reference);
    }),

  setAttribute: (node: Node, key: string, value: unknown) =>
    Effect.sync(() => {
      const element = node as HTMLElement;
      if (value === null || value === undefined) {
        element.removeAttribute(key);
      } else if (typeof value === "boolean") {
        if (value) {
          element.setAttribute(key, "");
        } else {
          element.removeAttribute(key);
        }
      } else {
        element.setAttribute(key, String(value));
      }
    }),

  removeAttribute: (node: Node, key: string) =>
    Effect.sync(() => {
      (node as HTMLElement).removeAttribute(key);
    }),

  setClassName: (node: Node, className: string) =>
    Effect.sync(() => {
      (node as HTMLElement).className = className;
    }),

  setStyleProperty: (node: Node, property: string, value: string) =>
    Effect.sync(() => {
      (node as HTMLElement).style.setProperty(property, value);
    }),

  setTextContent: (node: Node, text: string) =>
    Effect.sync(() => {
      node.textContent = text;
    }),

  setInnerHTML: (node: Node, html: string) =>
    Effect.sync(() => {
      (node as HTMLElement).innerHTML = html;
    }),

  setInputValue: (node: Node, value: string) =>
    Effect.sync(() => {
      const element = node as HTMLInputElement;
      // Only update if different to prevent cursor position reset
      if (element.value !== value) {
        element.value = value;
      }
    }),

  addEventListener: (
    node: Node,
    event: string,
    handler: (event: unknown) => void,
  ) =>
    Effect.sync(() => {
      (node as HTMLElement).addEventListener(event, handler);
    }),

  getChildren: (node: Node) => Effect.sync(() => Array.from(node.childNodes)),

  isHydrating: Effect.succeed(false),
};

/**
 * Layer that provides the DOMRenderer to the application.
 */
export const DOMRendererLive = Layer.succeed(
  RendererContext,
  DOMRenderer as RendererInterface<unknown>,
);
