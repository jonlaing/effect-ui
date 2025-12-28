/**
 * Hydration renderer that attaches to existing DOM using tree walking.
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
 * finds existing elements via tree walking and attaches handlers.
 *
 * The renderer uses a stack-based approach to track the current parent
 * and child index, properly handling nested element structures.
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

  // Stack to track parent context during hydration
  // Each entry is [parent, childIndex]
  const parentStack: Array<{ parent: Node; childIndex: number }> = [
    { parent: container, childIndex: 0 },
  ];

  const getCurrentContext = () => parentStack[parentStack.length - 1];

  const renderer: Renderer<Node> = {
    createNode: (type: string, namespace?: string) =>
      Effect.sync(() => {
        const ctx = getCurrentContext();
        const children = ctx.parent.childNodes;
        let node: Node | null = null;

        // Find the next element node of the expected type
        while (ctx.childIndex < children.length) {
          const child = children[ctx.childIndex];
          if (
            child.nodeType === Node.ELEMENT_NODE &&
            (child as Element).tagName.toLowerCase() === type
          ) {
            node = child;
            ctx.childIndex++;
            break;
          } else if (child.nodeType === Node.TEXT_NODE) {
            // Skip whitespace text nodes
            if (child.textContent?.trim() === "") {
              ctx.childIndex++;
              continue;
            }
          }
          ctx.childIndex++;
        }

        if (!node) {
          console.log(
            "[Hydration] createNode MISS:",
            type,
            "in",
            (ctx.parent as Element).tagName || "root",
          );
          onMismatch(
            `Expected <${type}> but not found in ${(ctx.parent as Element).tagName || "root"}`,
            ctx.parent,
          );
          // Fallback: create the element (hydration failure recovery)
          return namespace
            ? document.createElementNS(namespace, type)
            : document.createElement(type);
        }

        console.log(
          "[Hydration] createNode HIT:",
          type,
          "->",
          (node as Element).className || "(no class)",
        );

        // Push a new context for this element's children
        parentStack.push({ parent: node, childIndex: 0 });

        return node;
      }),

    createTextNode: (text: string) =>
      Effect.sync(() => {
        const ctx = getCurrentContext();
        const children = ctx.parent.childNodes;
        let node: Node | null = null;

        // Find the next text node
        while (ctx.childIndex < children.length) {
          const child = children[ctx.childIndex];
          if (child.nodeType === Node.TEXT_NODE) {
            node = child;
            ctx.childIndex++;
            break;
          } else if (
            child.nodeType === Node.ELEMENT_NODE &&
            (child as Element).tagName.toLowerCase() === "span" &&
            (child as Element).hasAttribute("data-effex-text")
          ) {
            // Reactive text is wrapped in a span
            node = child.firstChild ?? document.createTextNode(text);
            ctx.childIndex++;
            break;
          }
          ctx.childIndex++;
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

    appendChild: (_parent: Node, child: Node) =>
      Effect.sync(() => {
        // During hydration, children are already in place.
        // But we need to pop the child's context from the stack.
        // The child was pushed when createNode was called for it.
        if (
          parentStack.length > 1 &&
          parentStack[parentStack.length - 1].parent === child
        ) {
          parentStack.pop();
        }
      }),

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
        console.log(
          "[Hydration] addEventListener:",
          event,
          "on",
          (node as HTMLElement).tagName,
          (node as HTMLElement).className,
        );
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
