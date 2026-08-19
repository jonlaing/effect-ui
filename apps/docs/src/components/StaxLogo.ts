import { $, stagger } from "@stax-ui/dom";

import aSvg from "../assets/stax-logo-dark/a.svg?raw";
import iconSvg from "../assets/stax-logo-dark/icon.svg?raw";
import sSvg from "../assets/stax-logo-dark/s.svg?raw";
import tSvg from "../assets/stax-logo-dark/t.svg?raw";
import xSvg from "../assets/stax-logo-dark/x.svg?raw";
import { StaggerElements } from "./StaggerElements.js";

export interface StaxLogoProps {
  readonly class?: string;
  readonly intro?: boolean;
}

/**
 * Animated Stax logo — each of the 5 SVG pieces (icon + S + T + A + X)
 * hops in with a 100ms stagger, assembling the full mark piece by piece.
 *
 * All 5 SVGs share the original 333×104 viewBox, so absolutely
 * positioning them inside a relative container overlays them at the
 * same coordinates and reproduces the composed logo pixel-for-pixel.
 * The wrapper's own aspect-ratio pins the layout height without needing
 * an explicit size on every consumer.
 */
export const StaxLogo = (props: StaxLogoProps = {}) => {
  const pieces = [iconSvg, sSvg, tSvg, aSvg, xSvg].map((svg) =>
    $.div(
      $.div({
        class: "absolute top-0 [&_svg]:w-full [&_svg]:h-full",
        innerHTML: svg,
      }),
    ),
  );

  return $.div(
    {
      class: ["relative h-[104px]", props.class ?? ""],
      "aria-label": "Stax",
    },
    StaggerElements({
      items: pieces,
      animate: {
        enterFrom: "opacity-0 hidden",
        enter: "opacity-100 block",
        enterTo: "block animate-hop-in",
        stagger: stagger(100),
      },
      intro: props.intro,
    }),
  );
};
