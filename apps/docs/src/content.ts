/**
 * Content loading utilities for the docs site.
 *
 * At build time (SSG), these read markdown files from the content/ directory,
 * parse frontmatter, and convert to HTML using markdown-it.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { Effect } from "effect";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DocPage {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly section: string;
  readonly html: string;
}

export interface DocSection {
  readonly name: string;
  readonly slug: string;
  readonly pages: readonly DocPage[];
}

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
  Effect.sync(() => {
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
  Effect.sync(() => {
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

/**
 * Group pages into sections for navigation.
 */
export const getSections = (pages: DocPage[]): DocSection[] => {
  const sectionMap = new Map<string, DocPage[]>();

  for (const page of pages) {
    const key = page.section || "_root";
    const existing = sectionMap.get(key) ?? [];
    existing.push(page);
    sectionMap.set(key, existing);
  }

  const sections: DocSection[] = [];

  // Root pages first
  const rootPages = sectionMap.get("_root");
  if (rootPages) {
    sections.push({
      name: "Guide",
      slug: "",
      pages: rootPages.sort((a, b) => a.order - b.order),
    });
  }

  // Then section directories
  for (const [key, sectionPages] of sectionMap) {
    if (key === "_root") continue;
    const sorted = sectionPages.sort((a, b) => a.order - b.order);
    sections.push({
      name: sectionDisplayName(key),
      slug: key,
      pages: sorted,
    });
  }

  return sections;
};

const sectionDisplayName = (slug: string): string => {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
