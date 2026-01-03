import { Effect } from "effect";
import type { Renderer, Slot } from "@effex/core";
import {
  vElement,
  vText,
  vComment,
  type VNode,
  type VElement,
  type VText,
} from "./VNode";

/**
 * Renderer implementation that produces VNodes for SSR.
 * VNodes are then serialized to HTML strings via vnodeToString.
 */
export const StringRenderer: Renderer<VNode> = {
  createNode: (type: string, _namespace?: string) =>
    Effect.sync(() => vElement(type)),

  createTextNode: (text: string) => Effect.sync(() => vText(text)),

  appendChild: (parent: VNode, child: VNode) =>
    Effect.sync(() => {
      if (parent._tag === "VElement") {
        parent.children.push(child);
        // Track parent reference for slot markers
        if (child._tag === "VComment") {
          (child as unknown as { _parent?: VElement })._parent = parent;
        }
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
        // Track parent reference for slot markers
        if (child._tag === "VComment") {
          (child as unknown as { _parent?: VElement })._parent = parent;
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

  createSlot: () =>
    Effect.sync((): Slot<VNode> => {
      const marker = vComment("effex-slot");
      let currentContent: VNode | null = null;

      // Helper to find parent and index of marker
      const findMarkerContext = (): {
        parent: VElement;
        index: number;
      } | null => {
        // For SSR, we need a way to track the parent.
        // We'll use a simple approach: store parent reference on marker
        const parent = (marker as unknown as { _parent?: VElement })._parent;
        if (!parent) return null;
        const index = parent.children.indexOf(marker);
        if (index === -1) return null;
        return { parent, index };
      };

      return {
        marker,
        setContent: (content: VNode) =>
          Effect.sync(() => {
            const ctx = findMarkerContext();
            if (!ctx) return;

            const { parent, index } = ctx;
            const contentIndex = index + 1;

            if (currentContent) {
              // Replace existing content
              const existingIndex = parent.children.indexOf(currentContent);
              if (existingIndex !== -1) {
                parent.children[existingIndex] = content;
              }
            } else {
              // Insert content after marker
              parent.children.splice(contentIndex, 0, content);
            }
            currentContent = content;
          }),
        clear: () =>
          Effect.sync(() => {
            const ctx = findMarkerContext();
            if (!ctx || !currentContent) return;

            const { parent } = ctx;
            const contentIndex = parent.children.indexOf(currentContent);
            if (contentIndex !== -1) {
              parent.children.splice(contentIndex, 1);
            }
            currentContent = null;
          }),
      };
    }),
};
