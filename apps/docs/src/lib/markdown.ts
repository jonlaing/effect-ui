import { Marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

// Singleton highlighter instance
let highlighter: Highlighter | null = null;

/**
 * Get or create the Shiki highlighter.
 */
const getHighlighter = async (): Promise<Highlighter> => {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark"],
      langs: ["typescript", "javascript", "tsx", "jsx", "bash", "json", "html", "css"],
    });
  }
  return highlighter;
};

/**
 * Parse markdown to HTML with syntax highlighting.
 */
export const parseMarkdown = async (content: string): Promise<string> => {
  const hl = await getHighlighter();

  const marked = new Marked({
    renderer: {
      code({ text, lang }) {
        // Default to typescript if no language specified
        const language = lang || "typescript";

        try {
          // Check if language is supported
          const loadedLangs = hl.getLoadedLanguages();
          if (!loadedLangs.includes(language as typeof loadedLangs[number])) {
            // Fall back to plain text styling
            return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>`;
          }

          const html = hl.codeToHtml(text, {
            lang: language,
            theme: "github-dark",
          });
          return html;
        } catch {
          // Fallback for unsupported languages
          return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>`;
        }
      },
    },
  });

  return marked.parse(content);
};

/**
 * Escape HTML entities for safe rendering.
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
