/**
 * Compile-time HTML nesting validator.
 *
 * Browsers silently normalize invalid HTML nesting — the classic case being
 * `<p>` inside `<p>`, which the parser auto-closes so the inner element ends
 * up as a sibling of the outer, not a child. When Effex's SSR emits a tree
 * the browser then reshapes on parse, the hydration walker finds a DOM shape
 * that doesn't match the virtual tree and reports a confusing "Expected <X>
 * but not found in Y" mismatch.
 *
 * This module checks parent/child pairs against the HTML spec's content-model
 * rules for the categories that actually cause silent browser normalization
 * (paragraphs, anchors, buttons, forms). Wired into every renderer's
 * `appendChild`, it emits a targeted warning the first time each invalid
 * pair is seen so the framework can flag the issue at its source instead of
 * downstream at hydration.
 */

/** Block-level tags that trigger an implicit `</p>` when they appear inside a paragraph. */
const BLOCK_LEVEL_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "dialog",
  "div",
  "dl",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "main",
  "menu",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
]);

/** Interactive tags that can't be nested inside `<button>` (browsers reject or reshape). */
const INTERACTIVE_TAGS = new Set([
  "a",
  "button",
  "embed",
  "iframe",
  "input",
  "label",
  "select",
  "textarea",
]);

/**
 * Return a warning string if `child` is invalid inside `parent`, else null.
 * Both arguments are lowercase tag names.
 */
export const checkNesting = (parent: string, child: string): string | null => {
  if (parent === "p" && BLOCK_LEVEL_TAGS.has(child)) {
    return (
      `<${child}> inside <p> is invalid HTML. Browsers auto-close the ` +
      `<p> when the parser encounters <${child}>, so the live DOM won't ` +
      `match your rendered tree and hydration will fail.`
    );
  }
  if (parent === "a" && child === "a") {
    return (
      `<a> inside <a> is invalid HTML. Browsers reject nested anchors, so ` +
      `the live DOM won't match your rendered tree and hydration will fail.`
    );
  }
  if (parent === "button" && INTERACTIVE_TAGS.has(child)) {
    return (
      `<${child}> inside <button> is invalid HTML — <button> may not contain ` +
      `interactive content. Browsers reshape the DOM and hydration will fail.`
    );
  }
  if (parent === "form" && child === "form") {
    return (
      `<form> inside <form> is invalid HTML. Browsers reject nested forms, ` +
      `so the live DOM won't match your rendered tree and hydration will fail.`
    );
  }
  return null;
};

/**
 * Cache of pair-strings we've already warned about, so a repeated bad nesting
 * (e.g. `<p><p>...</p></p>` rendered inside a loop) doesn't spam the console.
 */
const warned = new Set<string>();

/**
 * Report an invalid nesting via `console.warn`, once per parent-child pair
 * per process. Safe to call unconditionally — the check is cheap and the
 * warning only fires on real bugs. No-ops in environments without `console`.
 */
export const warnIfInvalidNesting = (
  parent: string | undefined,
  child: string | undefined,
): void => {
  if (!parent || !child) return;
  const p = parent.toLowerCase();
  const c = child.toLowerCase();
  const key = `${p}>${c}`;
  if (warned.has(key)) return;
  const message = checkNesting(p, c);
  if (!message) return;
  warned.add(key);
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn(`[@effex/dom] ${message}`);
  }
};
