import { $, Element } from "@stax-ui/dom";

/**
 * Two-column content row used to lay out the homepage sections.
 * Generic over the two children's error/requirement channels so
 * they can carry anything — a `Nav` that needs `NavigationContext`,
 * an interactive `Counter` that requires `Scope`, etc. — without
 * getting narrowed to `Element<HTMLElement, never, never>` at the
 * call site (which was silently widening the outer render's E/R to
 * `unknown` and breaking the Route.static signature).
 */
export const ContentSection = <E1, R1, E2, R2>(
  left: Element.Element<HTMLElement, E1, R1>,
  right: Element.Element<HTMLElement, E2, R2>,
  anchorId?: string,
) =>
  $.div(
    {
      class:
        "flex flex-col md:flex-row gap-8 items-stretch px-8 pt-8 pb-30 border-t relative",
    },
    anchorId ? $.a({ class: "absolute", id: anchorId }) : undefined,
    $.div({ class: "md:flex-1 flex flex-col" }, left),
    $.div({ class: "md:flex-1 flex flex-col overflow-hidden" }, right),
  );
