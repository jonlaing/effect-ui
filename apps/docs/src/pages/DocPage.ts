import { $ } from "@effex/dom";
import { Link } from "@effex/router";

import GithubIcon from "../assets/github.svg?raw";
import { DocToc } from "../components/DocToc.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import type {
  DocPage as DocPageData,
  DocSection,
  PageLink,
  TocEntry,
} from "../content.js";

export const DocPage = (props: {
  readonly page: DocPageData;
  readonly sections: readonly DocSection[];
  readonly prev: PageLink | null;
  readonly next: PageLink | null;
  readonly toc: TocEntry[];
}) => {
  const pagination = $.nav(
    {
      class:
        "flex justify-between items-center mt-12 pt-6 border-t border-base-content/10 max-w-[40rem] mx-auto",
    },
    props.prev
      ? Link(
          {
            href: `/docs/${props.prev.slug}`,
            class:
              "flex flex-col items-start gap-1 text-sm hover:text-primary transition-colors",
          },
          $.span({ class: "text-base-content/50 text-xs" }, "Previous"),
          $.span({}, `← ${props.prev.title}`),
        )
      : $.div({}),
    props.next
      ? Link(
          {
            href: `/docs/${props.next.slug}`,
            class:
              "flex flex-col items-end gap-1 text-sm hover:text-primary transition-colors",
          },
          $.span({ class: "text-base-content/50 text-xs" }, "Next"),
          $.span({}, `${props.next.title} →`),
        )
      : $.div({}),
  );

  return SidebarLayout(
    { sections: props.sections },
    $.div(
      { class: "flex flex-col gap-8" },
      $.div(
        { class: "p-4 flex justify-end" },
        $.a({
          href: "https://github.com/jonlaing/effex",
          class:
            "[&_svg]:fill-base-content/50 [&_svg]:hover:fill-primary [&_svg]:transition-colors [&_svg]:w-8 [&_svg]:h-8",
          target: "_blank",
          rel: "noopener noreferrer",
          innerHTML: GithubIcon,
        }),
      ),
      $.div(
        { class: "flex gap-8" },
        $.div(
          { class: "flex-1" },
          $.article({
            class: "prose max-w-[40rem] mx-auto",
            innerHTML: props.page.html,
          }),
          pagination,
        ),
        DocToc(props.toc),
      ),
    ),
  );
};
