import * as fs from "node:fs";
import * as path from "node:path";

import { Effect } from "effect";
import { globSync } from "glob";
import matter from "gray-matter";

import { $, Component, Route } from "@effex/platform";

import { parseMarkdown } from "../lib/markdown.js";

// Resolve docs content directory
const contentDir = path.resolve(process.cwd(), "content/docs");

// Find all markdown files and generate static paths
const getMarkdownFiles = (): string[] => {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  return globSync("**/*.md", { cwd: contentDir });
};

// Export static paths for SSG
export const staticPaths = getMarkdownFiles().map((file) => ({
  // Remove .md extension and split into path segments
  // e.g., "getting-started.md" -> ["getting-started"]
  // e.g., "concepts/signals.md" -> ["concepts", "signals"]
  $: file.replace(/\.md$/, ""),
}));

// Route definition with loader
export const route = Route.define({
  static: true,
  loader: ({ params }) =>
    Effect.gen(function* () {
      // The catch-all param is accessed via params["$"] or similar
      const slug = params["$"] ?? "getting-started";
      const filePath = path.join(contentDir, `${slug}.md`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          html: "<p>Page not found</p>",
          title: "Not Found",
          description: "",
        };
      }

      // Read and parse the markdown file
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data: frontmatter, content } = matter(raw);

      // Convert markdown to HTML with syntax highlighting
      const html = yield* Effect.promise(() => parseMarkdown(content));

      return {
        html,
        title: (frontmatter.title as string) ?? slug,
        description: (frontmatter.description as string) ?? "",
      };
    }),
});

/**
 * Documentation page component.
 * Renders markdown content as HTML.
 */
export default Component.gen(function* () {
  const { html, title } = yield* Route.useLoaderData<typeof route>();

  return yield* $.article({ class: "docs-content" }, [
    $.div({ innerHTML: html }),
  ]);
});
