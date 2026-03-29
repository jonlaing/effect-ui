import { $, collect, Element } from "@effex/dom";

import { TocEntry } from "../content";

const TocItem = (
  entry: TocEntry,
): Element.Element<HTMLLIElement, never, never> =>
  $.li(
    {},
    collect(
      $.a(
        {
          href: `#${entry.id}`,
          class:
            "text-xs text-base-content/60 hover:text-base-content transition-colors",
        },
        $.of(entry.title),
      ),
      entry.children.length > 0
        ? $.ul(
            { class: "pl-4 border-l border-base-content/40 py-0 my-2" },
            collect(...entry.children.map(TocItem)),
          )
        : $.div({}, $.of("")),
    ),
  );

export const DocToc = (toc: TocEntry[]) =>
  $.aside(
    { class: "hidden w-56 lg:block" },
    collect(
      $.h2(
        { class: "font-bold text-lg mb-4 text-base-content/80" },
        $.of("On this page"),
      ),
      $.ul({ class: "flex flex-col gap-2" }, collect(...toc.map(TocItem))),
    ),
  );
