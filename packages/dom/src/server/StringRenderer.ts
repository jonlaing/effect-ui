import { Effect } from "effect";
import type { Renderer } from "@effex/core";
import {
  vElement,
  vText,
  type VNode,
  type VElement,
  type VText,
} from "./VNode";

/**
 * Renderer implementation that produces VNodes for SSR.
 * VNodes are then serialized to HTML strings via vnodeToString.
 */
export const StringRenderer: Renderer<VNode> = {
  createNode: (type: string) => Effect.sync(() => vElement(type)),

  createTextNode: (text: string) => Effect.sync(() => vText(text)),

  appendChild: (parent: VNode, child: VNode) =>
    Effect.sync(() => {
      if (parent._tag === "VElement") {
        parent.children.push(child);
      }
    }),

  removeChild: (parent: VNode, child: VNode) =>
    Effect.sync(() => {
      if (parent._tag === "VElement") {
        const index = parent.children.indexOf(child);
        if (index > -1) {
          parent.children.splice(index, 1);
        }
      }
    }),

  replaceChild: (parent: VNode, newChild: VNode, oldChild: VNode) =>
    Effect.sync(() => {
      if (parent._tag === "VElement") {
        const index = parent.children.indexOf(oldChild);
        if (index > -1) {
          parent.children[index] = newChild;
        }
      }
    }),

  insertBefore: (parent: VNode, child: VNode, reference: VNode | null) =>
    Effect.sync(() => {
      if (parent._tag === "VElement") {
        if (reference === null) {
          parent.children.push(child);
        } else {
          const index = parent.children.indexOf(reference);
          if (index > -1) {
            parent.children.splice(index, 0, child);
          } else {
            parent.children.push(child);
          }
        }
      }
    }),

  setAttribute: (node: VNode, key: string, value: unknown) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        if (value === null || value === undefined) {
          delete node.attributes[key];
        } else if (typeof value === "boolean") {
          if (value) {
            node.attributes[key] = "";
          } else {
            delete node.attributes[key];
          }
        } else {
          node.attributes[key] = String(value);
        }
      }
    }),

  removeAttribute: (node: VNode, key: string) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        delete node.attributes[key];
      }
    }),

  setClassName: (node: VNode, className: string) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        if (className) {
          node.attributes.class = className;
        } else {
          delete node.attributes.class;
        }
      }
    }),

  setStyleProperty: (node: VNode, property: string, value: string) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        const existing = node.attributes.style ?? "";
        // Convert camelCase to kebab-case for CSS
        const cssProperty = property.replace(
          /[A-Z]/g,
          (m) => `-${m.toLowerCase()}`,
        );
        if (existing) {
          node.attributes.style = `${existing}; ${cssProperty}: ${value}`;
        } else {
          node.attributes.style = `${cssProperty}: ${value}`;
        }
      }
    }),

  setTextContent: (node: VNode, text: string) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        node.children = [vText(text)];
      } else if (node._tag === "VText") {
        (node as VText).content = text;
      }
    }),

  setInnerHTML: (node: VNode, html: string) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        (node as VElement)._innerHTML = html;
        node.children = [];
      }
    }),

  setInputValue: (node: VNode, value: string) =>
    Effect.sync(() => {
      if (node._tag === "VElement") {
        node.attributes.value = value;
      }
    }),

  addEventListener: (_node: VNode, _event: string, _handler: unknown) =>
    // No-op for SSR - events don't run on server
    Effect.void,

  getChildren: (node: VNode) =>
    Effect.sync(() => (node._tag === "VElement" ? node.children : [])),

  isHydrating: Effect.succeed(false),
};
