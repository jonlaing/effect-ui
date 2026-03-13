/**
 * HTML escaping utilities for SSR.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

const ATTR_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

/**
 * Escape HTML text content.
 * Escapes &, <, > to prevent XSS.
 */
export const escapeHtml = (text: string): string =>
  text.replace(/[&<>]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);

/**
 * Escape HTML attribute values.
 * Escapes &, <, >, " to prevent XSS and attribute breakout.
 */
export const escapeAttr = (value: string): string =>
  value.replace(/[&<>"]/g, (char) => ATTR_ESCAPE_MAP[char] ?? char);
