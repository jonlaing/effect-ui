import { $ } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

import { SidebarLayout } from "../components/SidebarLayout.js";
import type { DocPage, DocSection } from "../content.js";

/**
 * `/docs` — the top-level index. Renders every section as a card
 * with its pages inside. Uses the same SidebarLayout as individual
 * doc pages so navigation feels continuous. The sidebar itself
 * duplicates the same content in more compact form; this page is
 * for people who land on `/docs` from Nav and want an at-a-glance
 * overview.
 */
export const DocsIndexPage = (props: {
  readonly sections: readonly DocSection[];
}) =>
  SidebarLayout(
    { sections: props.sections },
    $.div(
      { class: "max-w-5xl mx-auto py-18" },
      $.header(
        { class: "mb-12 max-w-2xl" },
        $.h1(
          { class: "text-heading tracking-tight mb-4 font-thin" },
          $.span("Documentation"),
        ),
        $.p(
          { class: "text-paragraph text-base-content/75" },
          "Everything you need to build with Stax, grouped by topic. New here? Start with the tutorial, then dip into the reference sections as questions come up.",
        ),
      ),
      $.div(
        { class: "grid grid-cols-1 md:grid-cols-2 gap-6" },
        props.sections.map((section) => SectionCard(section)),
      ),
    ),
  );

const SectionCard = (section: DocSection) =>
  $.div(
    {
      class: ["p-6 rounded-lg border bg-base-100", "flex flex-col gap-4"],
    },
    $.h2({ class: "text-heading-3 font-semibold text-primary" }, section.name),
    $.ul(
      { class: "flex flex-col gap-2" },
      section.pages.map((page) => PageLine(page)),
    ),
  );

const PageLine = (page: DocPage) =>
  $.li(
    {},
    Link(
      {
        href: `/docs/${page.slug}`,
        class: [
          "block text-paragraph text-base-content/75",
          "hover:text-primary transition-colors",
        ],
      },
      $.span({ class: "font-medium" }, page.title),
      page.description
        ? $.span(
            { class: "block text-caption-2 text-base-content/50 mt-0.5" },
            page.description,
          )
        : undefined,
    ),
  );
