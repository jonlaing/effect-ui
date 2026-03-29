/**
 * Client-safe content types and utilities.
 */

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

export interface PageLink {
  readonly slug: string;
  readonly title: string;
}

export interface TocEntry {
  readonly id: string;
  readonly title: string;
  readonly level: number;
  readonly children: TocEntry[];
}

// ─── Pure utilities ──────────────────────────────────────────────────────────

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

  return sections.sort((a, b) => a.slug.localeCompare(b.slug));
};

const sectionDisplayName = (slug: string): string => {
  return slug
    .split("-")
    .filter((w) => !/\d+/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/**
 * Given a page slug and the full sections list, return the previous and next pages.
 */
export const getAdjacentPages = (
  slug: string,
  sections: DocSection[],
): { prev: PageLink | null; next: PageLink | null } => {
  const allPages = sections.flatMap((s) => s.pages);
  const idx = allPages.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? allPages[idx - 1] : null,
    next: idx < allPages.length - 1 ? allPages[idx + 1] : null,
  };
};
