import * as fs from "node:fs";
import * as path from "node:path";

import { globSync } from "glob";
import matter from "gray-matter";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly order: number;
  readonly children?: readonly NavItem[];
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}

/**
 * Get navigation structure from the docs content directory.
 */
export const getNavigation = (): readonly NavSection[] => {
  const contentDir = path.resolve(process.cwd(), "content/docs");

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = globSync("**/*.md", { cwd: contentDir });

  // Parse all markdown files for frontmatter
  const docs = files.map((file) => {
    const filePath = path.join(contentDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const slug = file.replace(/\.md$/, "");
    const segments = slug.split("/");
    const isNested = segments.length > 1;

    return {
      slug,
      href: `/docs/${slug}`,
      label: (data.title as string) ?? formatLabel(segments[segments.length - 1] ?? ""),
      order: (data.order as number) ?? 999,
      section: isNested ? segments[0] : null,
    };
  });

  // Separate top-level docs from nested docs
  const topLevel = docs
    .filter((d) => !d.section)
    .sort((a, b) => a.order - b.order)
    .map(({ href, label, order }) => ({ href, label, order }));

  // Group nested docs by section
  const sections = new Map<string, typeof docs>();
  for (const doc of docs) {
    if (doc.section) {
      const existing = sections.get(doc.section) ?? [];
      sections.set(doc.section, [...existing, doc]);
    }
  }

  // Build navigation structure
  const navigation: NavSection[] = [];

  // Add getting started section
  if (topLevel.length > 0) {
    navigation.push({
      title: "Overview",
      items: topLevel,
    });
  }

  // Add section-based navigation
  for (const [section, sectionDocs] of sections) {
    navigation.push({
      title: formatLabel(section),
      items: sectionDocs
        .sort((a, b) => a.order - b.order)
        .map(({ href, label, order }) => ({ href, label, order })),
    });
  }

  return navigation;
};

/**
 * Format a slug segment as a readable label.
 */
const formatLabel = (segment: string): string => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
