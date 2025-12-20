/**
 * Convert VNode tree to HTML string.
 */

import type { VNode, VElement } from "./VNode";
import { escapeHtml, escapeAttr } from "./escapeHtml";

/**
 * HTML void elements that don't have closing tags.
 */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Render attributes to an HTML string.
 */
const renderAttributes = (attrs: Record<string, string>): string => {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") {
      // Boolean attribute
      parts.push(key);
    } else {
      parts.push(`${key}="${escapeAttr(value)}"`);
    }
  }

  return parts.length > 0 ? " " + parts.join(" ") : "";
};

/**
 * Render a VNode to an HTML string.
 */
const renderVNode = (node: VNode): string => {
  switch (node._tag) {
    case "VText":
      return escapeHtml(node.content);

    case "VElement": {
      const elem = node as VElement;
      const attrs = renderAttributes(elem.attributes);

      // Void elements don't have closing tags
      if (VOID_ELEMENTS.has(elem.type)) {
        return `<${elem.type}${attrs}>`;
      }

      // If innerHTML is set, use it directly (already trusted HTML)
      if (elem._innerHTML !== undefined) {
        return `<${elem.type}${attrs}>${elem._innerHTML}</${elem.type}>`;
      }

      // Render children
      const children = elem.children.map(renderVNode).join("");
      return `<${elem.type}${attrs}>${children}</${elem.type}>`;
    }
  }
};

/**
 * Convert a VNode tree to an HTML string.
 */
export const vnodeToString = (node: VNode): string => renderVNode(node);
