import { $, type Element } from "@effex/dom";

export const AppLayout = <A extends HTMLElement | SVGElement, E, R>(
  children: Element.Element<A, E, R>,
) => $.div({}, $.main({}, children));
