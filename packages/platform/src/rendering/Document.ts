import type { SSRResult } from "./SSR.js";

/**
 * Options for HTML document generation
 */
export interface DocumentOptions {
  title?: string;
  scripts?: string[];
  styles?: string[];
  head?: string;
  bodyAttributes?: string;
  rootId?: string;
}

/**
 * Generate a full HTML document from SSR result
 */
export const generateDocument = (
  result: SSRResult,
  options: DocumentOptions = {},
): string => {
  const {
    title = "Effex App",
    scripts = [],
    styles = [],
    head = "",
    bodyAttributes = "",
    rootId = "root",
  } = options;

  const styleLinks = styles
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("\n    ");

  const scriptTags = scripts
    .map((src) => `<script type="module" src="${escapeHtml(src)}"></script>`)
    .join("\n    ");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    ${styleLinks}
    ${head}
  </head>
  <body${bodyAttributes ? ` ${bodyAttributes}` : ""}>
    <div id="${escapeHtml(rootId)}">${result.html}</div>
    <script>
      window.__EFFEX_LOADER_DATA__ = ${result.loaderDataScript};
      window.__EFFEX_ACTION_DATA__ = ${result.actionDataScript};
    </script>
    ${scriptTags}
  </body>
</html>`;
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
