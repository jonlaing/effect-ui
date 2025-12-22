/**
 * Hydration renderer that attaches to existing DOM using querySelector lookups.
 */

import { Effect } from "effect";
import type { Renderer } from "@effex/core";
import type { HydrateOptions } from "./index";

/**
 * Context for tracking current hydration state.
 * Used by control flow components to find their containers.
 */
export interface HydrationState {
  readonly root: HTMLElement;
  readonly onMismatch: (message: string, node: Node | null) => void;
}

/**
 * Create a hydration renderer that attaches to existing DOM.
 *
 * Unlike DOMRenderer which creates new elements, HydrationRenderer
 * finds existing elements via data attributes and attaches handlers.
 */
export const createHydrationRenderer = (
  container: HTMLElement,
  options: HydrateOptions = {},
): Renderer<Node> => {
  const onMismatch =
    options.onMismatch ??
    ((message, _node) => {
      if (typeof console !== "undefined") {
        console.warn(`[Effex Hydration] ${message}`);
      }
    });

  // Stack to track current parent during hydration
  let currentParent: Node = container;
  let childIndex = 0;

  const renderer: Renderer<Node> = {
    createNode: (type: string, namespace?: string) =>
      Effect.sync(() => {
        // During hydration, we expect the element to already exist
        const children = currentParent.childNodes;
        let node: Node | null = null;

        // Find the next element node of the expected type
        while (childIndex < children.length) {
          const child = children[childIndex];
          if (
            child.nodeType === Node.ELEMENT_NODE &&
            (child as Element).tagName.toLowerCase() === type
          ) {
            node = child;
            childIndex++;
            break;
          } else if (child.nodeType === Node.TEXT_NODE) {
            // Skip whitespace text nodes
            if (child.textContent?.trim() === "") {
              childIndex++;
              continue;
            }
          }
          childIndex++;
        }

        if (!node) {
          onMismatch(`Expected <${type}> but not found`, currentParent);
          // Fallback: create the element (hydration failure recovery)
          return namespace
            ? document.createElementNS(namespace, type)
            : document.createElement(type);
        }

        return node;
      }),

    createTextNode: (text: string) =>
      Effect.sync(() => {
        const children = currentParent.childNodes;
        let node: Node | null = null;

        // Find the next text node
        while (childIndex < children.length) {
          const child = children[childIndex];
          if (child.nodeType === Node.TEXT_NODE) {
            node = child;
            childIndex++;
            break;
          } else if (
            child.nodeType === Node.ELEMENT_NODE &&
            (child as Element).tagName.toLowerCase() === "span" &&
            (child as Element).hasAttribute("data-effex-text")
          ) {
            // Reactive text is wrapped in a span
            node = child.firstChild ?? document.createTextNode(text);
            childIndex++;
            break;
          }
          childIndex++;
        }

        if (!node) {
          // Fallback: create the text node
          return document.createTextNode(text);
        }

        // Verify content matches
        if (node.textContent !== text) {
          onMismatch(
            `Text mismatch: expected "${text}", got "${node.textContent}"`,
            node,
          );
          node.textContent = text;
        }

        return node;
      }),

    appendChild: (_parent: Node, _child: Node) =>
      // During hydration, children are already in place
      Effect.void,

    removeChild: (parent: Node, child: Node) =>
      Effect.sync(() => {
        if (parent.contains(child)) {
          parent.removeChild(child);
        }
      }),

    replaceChild: (parent: Node, newChild: Node, oldChild: Node) =>
      Effect.sync(() => {
        if (parent.contains(oldChild)) {
          parent.replaceChild(newChild, oldChild);
        }
      }),

    insertBefore: (parent: Node, child: Node, reference: Node | null) =>
      Effect.sync(() => {
        if (!parent.contains(child)) {
          parent.insertBefore(child, reference);
        }
      }),

    setAttribute: (node: Node, key: string, value: unknown) =>
      Effect.sync(() => {
        const el = node as HTMLElement;
        if (value === null || value === undefined) {
          el.removeAttribute(key);
        } else if (typeof value === "boolean") {
          if (value) {
            el.setAttribute(key, "");
          } else {
            el.removeAttribute(key);
          }
        } else {
          el.setAttribute(key, String(value));
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
        const el = node as HTMLInputElement;
        if (el.value !== value) {
          el.value = value;
        }
      }),

    addEventListener: (
      node: Node,
      event: string,
      handler: (event: unknown) => void,
    ) =>
      Effect.sync(() => {
        // This is where we attach event handlers during hydration
        (node as HTMLElement).addEventListener(event, handler);
      }),

    getChildren: (node: Node) => Effect.sync(() => Array.from(node.childNodes)),

    isHydrating: Effect.succeed(true),
  };

  return renderer;
};

/**
 * Type alias for the hydration renderer.
 */
export type HydrationRenderer = Renderer<Node>;
