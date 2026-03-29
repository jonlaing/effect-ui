/**
 * Server-only content loading utilities.
 *
 * Reads markdown files from the content/ directory,
 * parses frontmatter, and converts to HTML using markdown-it + Shiki.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import shikiPlugin from "@shikijs/markdown-it";
import { Effect } from "effect";
import MarkdownIt from "markdown-it";

import type { DocPage, TocEntry } from "./content.js";

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const headingAnchorPlugin = (md: MarkdownIt): void => {
  md.core.ruler.push("heading_anchors", (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === "heading_open") {
        const inlineToken = state.tokens[i + 1];
        if (inlineToken?.type === "inline" && inlineToken.content) {
          const id = slugify(inlineToken.content);
          token.attrSet("id", id);
        }
      }
    }
  });
};

const mdPromise = (async () => {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  md.use(
    await shikiPlugin({
      theme: "one-dark-pro",
    }),
  );

  md.use(headingAnchorPlugin);

  return md;
})();

/**
 * Render a fenced code block with Shiki syntax highlighting.
 */
export const renderCode = (code: string, lang: string): Effect.Effect<string> =>
  Effect.promise(async () => {
    const md = await mdPromise;
    return md.render(`\`\`\`${lang}\n${code}\n\`\`\``);
  });

/**
 * Extract a nested table of contents from rendered HTML.
 */
export const extractToc = (html: string): TocEntry[] => {
  const headingRe = /<h([2-4])\s[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;
  const flat: { level: number; id: string; title: string }[] = [];

  let match;
  while ((match = headingRe.exec(html)) !== null) {
    const title = match[3].replace(/<[^>]*>/g, "").trim();
    flat.push({ level: parseInt(match[1], 10), id: match[2], title });
  }

  const root: TocEntry[] = [];
  const stack: { level: number; children: TocEntry[] }[] = [
    { level: 1, children: root },
  ];

  for (const { level, id, title } of flat) {
    const entry: TocEntry = { id, title, level, children: [] };

    // Pop stack until we find a parent with a lower level
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(entry);
    stack.push({ level, children: entry.children });
  }

  return root;
};

// ─── Frontmatter parsing ─────────────────────────────────────────────────────

const parseFrontmatter = (
  content: string,
): { meta: Record<string, string>; body: string } => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line
      .slice(colonIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    meta[key] = value;
  }

  return { meta, body: match[2] };
};

// ─── Content directory discovery ─────────────────────────────────────────────

const CONTENT_DIR = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "..",
  "content",
);

/**
 * Load a single markdown file and return a DocPage.
 */
export const loadPage = (
  section: string,
  filename: string,
): Effect.Effect<DocPage> =>
  Effect.promise(async () => {
    const md = await mdPromise;
    const filePath = section
      ? path.join(CONTENT_DIR, section, filename)
      : path.join(CONTENT_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    const html = md.render(body);

    const slug = filename.replace(/\.md$/, "");

    return {
      slug: section ? `${section}/${slug}` : slug,
      title: meta.title ?? slug,
      description: meta.description ?? "",
      order: parseInt(meta.order ?? "0", 10),
      section,
      html,
    };
  });

/**
 * Discover all doc pages and their sections.
 */
export const discoverPages = (): Effect.Effect<DocPage[]> =>
  Effect.promise(async () => {
    const md = await mdPromise;
    const pages: DocPage[] = [];

    const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        // Top-level page
        const raw = fs.readFileSync(
          path.join(CONTENT_DIR, entry.name),
          "utf-8",
        );
        const { meta, body } = parseFrontmatter(raw);
        const slug = entry.name.replace(/\.md$/, "");
        pages.push({
          slug,
          title: meta.title ?? slug,
          description: meta.description ?? "",
          order: parseInt(meta.order ?? "0", 10),
          section: "",
          html: md.render(body),
        });
      } else if (entry.isDirectory()) {
        // Section directory
        const sectionDir = path.join(CONTENT_DIR, entry.name);
        const files = fs
          .readdirSync(sectionDir)
          .filter((f) => f.endsWith(".md"))
          .sort();

        for (const file of files) {
          const raw = fs.readFileSync(path.join(sectionDir, file), "utf-8");
          const { meta, body } = parseFrontmatter(raw);
          const slug = file.replace(/\.md$/, "");
          pages.push({
            slug: `${entry.name}/${slug}`,
            title: meta.title ?? slug,
            description: meta.description ?? "",
            order: parseInt(meta.order ?? "0", 10),
            section: entry.name,
            html: md.render(body),
          });
        }
      }
    }

    return pages;
  });
